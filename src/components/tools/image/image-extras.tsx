"use client";

import { useMemo, useState, type ComponentType } from "react";
import { toast } from "sonner";
import { Dropzone } from "@/components/tools/dropzone";
import { PhotoCropper } from "@/components/tools/image/photo-cropper";
import { SvgToPng } from "@/components/tools/image/svg-to-png";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { downloadBlob } from "@/lib/utils";

type RasterFormat = "image/jpeg" | "image/png" | "image/webp";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality = 0.92) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))), type, quality);
  });
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = src;
  });
}

async function drawFileToCanvas(file: File, fillWhite = false) {
  const url = URL.createObjectURL(file);
  try {
    let width = 0;
    let height = 0;
    let source: CanvasImageSource | null = null;
    try {
      const bitmap = await createImageBitmap(file);
      width = bitmap.width;
      height = bitmap.height;
      source = bitmap;
    } catch {
      const img = await loadImageElement(url);
      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;
      source = img;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    const ctx = canvas.getContext("2d");
    if (!ctx || !source) throw new Error("Canvas is not available");
    if (fillWhite) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(source, 0, 0);
    if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) source.close();
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function extensionFor(type: RasterFormat) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function ImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<RasterFormat>("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [busy, setBusy] = useState(false);
  const file = files[0] ?? null;

  const convert = async () => {
    if (!file) {
      toast.error("Add an image first");
      return;
    }
    setBusy(true);
    try {
      const canvas = await drawFileToCanvas(file, format === "image/jpeg");
      const blob = await canvasToBlob(canvas, format, quality);
      downloadBlob(blob, file.name.replace(/\.[^.]+$/, "") + "." + extensionFor(format));
      toast.success("Converted image downloaded");
    } catch (error) {
      toast.error(errorMessage(error, "Could not convert image"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Dropzone
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        maxSizeMB={10}
        files={files}
        onFiles={setFiles}
        onRemove={() => setFiles([])}
        label="Drop your image here"
        hint="JPG, PNG, or WebP - max 10MB"
      />
      <div className="space-y-2">
        <Label>Target format</Label>
        <div className="flex flex-wrap gap-2">
          {([
            ["image/jpeg", "JPG"],
            ["image/png", "PNG"],
            ["image/webp", "WebP"],
          ] as const).map(([value, label]) => (
            <Button key={value} size="sm" variant={format === value ? "default" : "outline"} onClick={() => setFormat(value)}>
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <Label>Output quality</Label>
          <span className="tabular-nums text-[var(--muted-ink)]">{Math.round(quality * 100)}%</span>
        </div>
        <Slider min={0.2} max={1} step={0.05} value={[quality]} onValueChange={([value]) => setQuality(value)} />
        <p className="text-xs text-[var(--muted-ink)]">Smaller file ← → Higher quality</p>
        {quality < 0.7 ? (
          <p className="text-xs text-amber-700">⚠️ Below 70% quality - compression artifacts may be visible</p>
        ) : null}
      </div>
      <Button onClick={convert} disabled={!file || busy} className="w-full">
        {busy ? "Converting…" : "Download Converted Image"}
      </Button>
    </div>
  );
}

type Heic2Any = (options: { blob: Blob; toType?: string; quality?: number }) => Promise<Blob | Blob[]>;

async function loadHeic2Any(): Promise<Heic2Any> {
  const urls = [
    "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js",
    "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/+esm",
  ];
  for (const url of urls) {
    try {
      const mod = (await Function(`return import(${JSON.stringify(url)})`)()) as Heic2Any | { default?: Heic2Any };
      const fn = typeof mod === "function" ? mod : mod.default;
      if (typeof fn === "function") return fn;
    } catch {
      /* try next */
    }
  }
  throw new Error("heic2any unavailable");
}

export function HeicToJpg() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const file = files[0] ?? null;

  const convert = async () => {
    if (!file) {
      toast.error("Add a HEIC photo first");
      return;
    }
    setBusy(true);
    try {
      try {
        const canvas = await drawFileToCanvas(file, true);
        const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
        downloadBlob(blob, file.name.replace(/\.[^.]+$/, "") + ".jpg");
        toast.success("JPEG downloaded");
        return;
      } catch {
        /* native decode failed */
      }

      try {
        const heic2any = await loadHeic2Any();
        const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
        const blob = Array.isArray(result) ? result[0] : result;
        if (!blob) throw new Error("HEIC conversion returned no data");
        downloadBlob(blob, file.name.replace(/\.[^.]+$/, "") + ".jpg");
        toast.success("JPEG downloaded");
        return;
      } catch {
        toast.error("Could not decode HEIC here. Safari/iOS can decode HEIC natively - try opening this page in Safari.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Dropzone
        accept="image/heic,image/heif,.heic,.heif"
        maxSizeMB={20}
        files={files}
        onFiles={setFiles}
        onRemove={() => setFiles([])}
        label="Drop your HEIC file here"
        hint="iPhone photos (.heic) - max 20MB"
      />
      <Button onClick={convert} disabled={!file || busy} className="w-full">
        {busy ? "Converting…" : "Convert to JPG"}
      </Button>
    </div>
  );
}

export function WebpToJpg() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const file = files[0] ?? null;

  const convert = async () => {
    if (!file) {
      toast.error("Add an image first");
      return;
    }
    setBusy(true);
    try {
      const canvas = await drawFileToCanvas(file, true);
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
      downloadBlob(blob, file.name.replace(/\.[^.]+$/, "") + ".jpg");
      toast.success("JPEG downloaded");
    } catch (error) {
      toast.error(errorMessage(error, "Could not convert to JPEG"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Dropzone
        accept="image/webp,.webp"
        maxSizeMB={10}
        files={files}
        onFiles={setFiles}
        onRemove={() => setFiles([])}
        label="Drop your WebP file here"
        hint="WebP images only - max 10MB"
      />
      <Button onClick={convert} disabled={!file || busy} className="w-full">
        {busy ? "Converting…" : "Convert to JPG"}
      </Button>
    </div>
  );
}

export function PhotoResizer() {
  return <PhotoCropper />;
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0")).join("")}`;
}

function extractPalette(imageData: ImageData, k = 6) {
  const pixels: [number, number, number][] = [];
  const data = imageData.data;
  const step = Math.max(1, Math.floor(data.length / 4 / 5000)) * 4;
  for (let i = 0; i < data.length; i += step) {
    if (data[i + 3] < 128) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (!pixels.length) return ["#000000"];

  const stride = Math.max(1, Math.floor(pixels.length / k));
  let centroids = Array.from({ length: k }, (_, i) => pixels[Math.min(pixels.length - 1, i * stride)]);

  for (let iter = 0; iter < 8; iter += 1) {
    const buckets: [number, number, number][][] = Array.from({ length: k }, () => []);
    for (const pixel of pixels) {
      let best = 0;
      let bestDist = Infinity;
      for (let c = 0; c < k; c += 1) {
        const d =
          (pixel[0] - centroids[c][0]) ** 2 + (pixel[1] - centroids[c][1]) ** 2 + (pixel[2] - centroids[c][2]) ** 2;
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      buckets[best].push(pixel);
    }
    centroids = buckets.map((bucket, index) => {
      if (!bucket.length) return centroids[index];
      const sum = bucket.reduce(
        (acc, pixel) => [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]] as [number, number, number],
        [0, 0, 0],
      );
      return [sum[0] / bucket.length, sum[1] / bucket.length, sum[2] / bucket.length];
    });
  }

  const unique = Array.from(new Set(centroids.map(([r, g, b]) => rgbToHex(r, g, b))));
  return unique.slice(0, k);
}

export function ColorPaletteExtractor() {
  const [files, setFiles] = useState<File[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const file = files[0] ?? null;
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const extract = async () => {
    if (!file) {
      toast.error("Add an image first");
      return;
    }
    setBusy(true);
    try {
      const source = await drawFileToCanvas(file);
      const sample = document.createElement("canvas");
      const max = 160;
      const scale = Math.min(1, max / Math.max(source.width, source.height));
      sample.width = Math.max(1, Math.round(source.width * scale));
      sample.height = Math.max(1, Math.round(source.height * scale));
      const ctx = sample.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available");
      ctx.drawImage(source, 0, 0, sample.width, sample.height);
      const palette = extractPalette(ctx.getImageData(0, 0, sample.width, sample.height), 6);
      setColors(palette);
      toast.success(`Found ${palette.length} colors`);
    } catch (error) {
      toast.error(errorMessage(error, "Could not extract colors"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Dropzone
        accept="image/*"
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setColors([]);
        }}
        onRemove={() => {
          setFiles([]);
          setColors([]);
        }}
        label="Drop an image to sample"
      />
      <Button onClick={extract} disabled={!file || busy}>
        {busy ? "Sampling…" : "Extract palette"}
      </Button>
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Source" className="max-h-64 w-full rounded-lg border border-[var(--hairline)] object-contain" />
      ) : null}
      {colors.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {colors.map((hex) => (
            <button
              key={hex}
              type="button"
              className="flex items-center gap-3 rounded-lg border border-[var(--hairline)] bg-canvas px-3 py-2 text-left text-sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(hex);
                  toast.success(`Copied ${hex}`);
                } catch {
                  toast.error("Could not copy hex");
                }
              }}
            >
              <span className="h-10 w-10 shrink-0 rounded-md border border-[var(--hairline)]" style={{ backgroundColor: hex }} />
              <span className="font-mono uppercase">{hex}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const IMAGE_EXTRA_MAP: Record<string, ComponentType> = {
  "image-converter": ImageConverter,
  "heic-to-jpg": HeicToJpg,
  "webp-to-jpg": WebpToJpg,
  "photo-resizer": PhotoResizer,
  "svg-to-png": SvgToPng,
  "color-palette-extractor": ColorPaletteExtractor,
};

export function ImageExtrasRouter({ slug }: { slug: string }) {
  const Component = IMAGE_EXTRA_MAP[slug];
  if (!Component) {
    return <p className="text-sm text-[var(--muted-ink)]">This image tool is not available yet.</p>;
  }
  return <Component />;
}
