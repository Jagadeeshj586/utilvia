import { INFERENCE_SIZE } from "./config";
import { BackgroundRemovalError, classifyUnknownError } from "./errors";
import { blobToImageData, imageDataToPngBlob, letterboxImage, unletterboxAlpha } from "./canvas";
import type { ImglyModel } from "./types";

type ImglyApi = {
  preload: (config?: ImglyConfig) => Promise<void>;
  segmentForeground: (image: Blob | ImageData | ImageBitmap | HTMLImageElement, config?: ImglyConfig) => Promise<Blob>;
  removeBackground: (image: Blob | ImageData | ImageBitmap | HTMLImageElement, config?: ImglyConfig) => Promise<Blob>;
};

type ImglyConfig = {
  debug?: boolean;
  device?: "cpu" | "gpu";
  proxyToWorker?: boolean;
  model?: ImglyModel;
  rescale?: boolean;
  output?: { format?: "image/png" | "image/x-alpha8"; quality?: number };
  progress?: (key: string, current: number, total: number) => void;
};

let imglyPromise: Promise<ImglyApi> | null = null;
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function loadImgly(): Promise<ImglyApi> {
  if (!imglyPromise) {
    imglyPromise = (Function(
      "return import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm')",
    ) as () => Promise<ImglyApi | { default: ImglyApi }>)()
      .then((mod) => {
        const api = "removeBackground" in mod ? (mod as ImglyApi) : (mod as { default: ImglyApi }).default;
        if (!api?.removeBackground || !api?.segmentForeground) {
          throw new Error("Background-removal module missing expected APIs");
        }
        return api;
      })
      .catch((error) => {
        imglyPromise = null;
        throw new BackgroundRemovalError("unavailable", "Could not load the segmentation model", error);
      });
  }
  return imglyPromise;
}

function preferredDevice(): "cpu" | "gpu" {
  const env =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_BACKGROUND_REMOVAL_DEVICE?.toLowerCase()
      : undefined;
  if (env === "gpu" || env === "cpu") return env;
  return "cpu";
}

function buildConfig(model: ImglyModel, onDownloadProgress?: (loaded: number, total: number) => void): ImglyConfig {
  return {
    device: preferredDevice(),
    proxyToWorker: true,
    rescale: true,
    model,
    output: { format: "image/png", quality: 1 },
    progress: (key, current, total) => {
      if (!onDownloadProgress || !total) return;
      if (key.startsWith("fetch:") || key.includes("download") || key.includes("onnx") || key.includes("wasm")) {
        onDownloadProgress(current, total);
      }
    },
  };
}

export async function preloadSegmentation(model: ImglyModel = "isnet_fp16"): Promise<void> {
  try {
    await enqueue(async () => {
      const api = await loadImgly();
      await api.preload(buildConfig(model));
    });
  } catch {
    /* preload is best-effort */
  }
}

export async function segmentWithImgly(
  original: ImageData,
  model: ImglyModel,
  onDownloadProgress?: (loaded: number, total: number) => void,
): Promise<Uint8ClampedArray> {
  return enqueue(async () => {
    try {
      const api = await loadImgly();
      const { image, layout } = letterboxImage(original, INFERENCE_SIZE);
      const source = await imageDataToPngBlob(image);
      const config = buildConfig(model, onDownloadProgress);
      let maskBlob: Blob;
      try {
        maskBlob = await api.segmentForeground(source, config);
      } catch {
        const cutout = await api.removeBackground(source, config);
        maskBlob = cutout;
      }
      const mask = await blobToImageData(maskBlob);
      return unletterboxAlpha(mask, layout);
    } catch (error) {
      throw new BackgroundRemovalError(classifyUnknownError(error), "Segmentation failed", error);
    }
  });
}

export async function segmentViaServer(
  file: File,
  signal?: AbortSignal,
): Promise<{ alpha: Uint8ClampedArray; width: number; height: number; png: Blob; provider: string }> {
  const body = new FormData();
  body.set("file", file);
  let response: Response;
  try {
    response = await fetch("/api/background-remove", { method: "POST", body, signal });
  } catch (error) {
    throw new BackgroundRemovalError("network", "Network error", error);
  }

  if (response.status === 429) throw new BackgroundRemovalError("rate_limit", "Rate limited");
  if (response.status === 413) throw new BackgroundRemovalError("too_large", "Image too large");
  if (response.status === 501 || response.status === 503) {
    throw new BackgroundRemovalError("unavailable", "Server provider unavailable");
  }
  if (!response.ok) {
    throw new BackgroundRemovalError("failed", "Server background removal failed");
  }

  const provider = response.headers.get("x-bg-provider") || "server";
  const png = await response.blob();
  if (!png.type.includes("png") && png.type && png.type !== "application/octet-stream") {
    throw new BackgroundRemovalError("failed", "Unexpected server response");
  }
  const image = await blobToImageData(png);
  const alpha = new Uint8ClampedArray(image.width * image.height);
  for (let i = 0, p = 0; i < image.data.length; i += 4, p += 1) alpha[p] = image.data[i + 3];
  return { alpha, width: image.width, height: image.height, png, provider };
}

export async function serverProviderAvailable(): Promise<{ available: boolean; provider: string | null }> {
  try {
    const response = await fetch("/api/background-remove", { method: "GET" });
    if (!response.ok) return { available: false, provider: null };
    const data = (await response.json()) as { available?: boolean; provider?: string | null };
    return { available: Boolean(data.available), provider: data.provider ?? null };
  } catch {
    return { available: false, provider: null };
  }
}
