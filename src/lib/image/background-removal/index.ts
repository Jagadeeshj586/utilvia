import { getBackgroundRemovalConfig, modelForPreset } from "./config";
import { composeRgba, compositeOntoColor, imageDataToPngBlob, resizeAlpha } from "./canvas";
import { decontaminateForeground } from "./decontamination";
import { BackgroundRemovalError } from "./errors";
import { decodeImage } from "./preprocess";
import { refineAlpha } from "./refinement";
import { segmentViaServer, segmentWithImgly, serverProviderAvailable } from "./segmentation";
import { adjustShadows } from "./shadow";
import type {
  BackgroundRemovalOptions,
  BackgroundRemovalResult,
  ImglyModel,
  ProcessingStage,
  RgbColor,
} from "./types";
import { validateMask } from "./validation";

export { MAX_FILE_BYTES, MAX_FILE_MB, DROPZONE_ACCEPT, getBackgroundRemovalConfig, modelForPreset } from "./config";
export { toUserMessage, BackgroundRemovalError, USER_MESSAGES } from "./errors";
export { decodeImage, downloadStem, isSupportedImage, validateImageFile } from "./preprocess";
export { preloadSegmentation, serverProviderAvailable } from "./segmentation";
export { composeRgba, compositeOntoColor, imageDataToPngBlob } from "./canvas";
export type {
  BackgroundFill,
  BackgroundRemovalOptions,
  BackgroundRemovalResult,
  BrushMode,
  BrushSizePreset,
  ImglyModel,
  ProcessingStage,
  QualityPreset,
  RgbColor,
  SegmentationProvider,
  StageStatus,
  ValidationResult,
} from "./types";

function emit(options: BackgroundRemovalOptions | undefined, stage: ProcessingStage, detail?: string) {
  options?.onStage?.(stage, detail);
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
}

async function runLocalPipeline(
  original: ImageData,
  model: ImglyModel,
  keepShadow: boolean,
  quality: BackgroundRemovalOptions["quality"],
  options?: BackgroundRemovalOptions,
): Promise<{ alpha: Uint8ClampedArray; rgb: ImageData; model: string }> {
  throwIfAborted(options?.signal);
  emit(options, "segment", "Detecting foreground");
  let alpha = await segmentWithImgly(original, model, options?.onDownloadProgress);

  throwIfAborted(options?.signal);
  emit(options, "refine", "Refining edges");
  alpha = await refineAlpha(original, alpha, quality);
  alpha = await adjustShadows(original, alpha, keepShadow);

  throwIfAborted(options?.signal);
  emit(options, "decontaminate", "Cleaning edge color");
  const rgb = await decontaminateForeground(original, alpha);
  return { alpha, rgb, model };
}

export async function removeBackgroundFromFile(
  file: File,
  options: BackgroundRemovalOptions,
): Promise<BackgroundRemovalResult> {
  const config = getBackgroundRemovalConfig();
  const quality = options.quality ?? "high";
  const keepShadow = options.keepShadow ?? true;
  const provider = options.provider ?? config.provider;
  const preferredModel = modelForPreset(quality, options.model ?? config.model);

  emit(options, "validate");
  const decoded = await decodeImage(file);
  emit(options, "analyze", `${decoded.width}×${decoded.height}`);

  const candidates: Array<{
    alpha: Uint8ClampedArray;
    rgb: ImageData;
    validation: ReturnType<typeof validateMask>;
    provider: string;
    model: string;
  }> = [];

  const tryLocal = async (model: ImglyModel) => {
    const local = await runLocalPipeline(decoded.imageData, model, keepShadow, quality, options);
    const validation = validateMask(local.alpha, decoded.width, decoded.height);
    candidates.push({
      alpha: local.alpha,
      rgb: local.rgb,
      validation,
      provider: "imgly",
      model: local.model,
    });
    return validation;
  };

  const tryServer = async () => {
    emit(options, "segment", "Using cloud segmentation");
    const server = await segmentViaServer(file, options.signal);
    let alpha = server.alpha;
    if (server.width !== decoded.width || server.height !== decoded.height) {
      alpha = resizeAlpha(alpha, server.width, server.height, decoded.width, decoded.height);
    }
    emit(options, "refine", "Refining edges");
    alpha = await refineAlpha(decoded.imageData, alpha, quality);
    alpha = await adjustShadows(decoded.imageData, alpha, keepShadow);
    emit(options, "decontaminate", "Cleaning edge color");
    const rgb = await decontaminateForeground(decoded.imageData, alpha);
    const validation = validateMask(alpha, decoded.width, decoded.height);
    candidates.push({
      alpha,
      rgb,
      validation,
      provider: server.provider,
      model: "cloud",
    });
    return validation;
  };

  let usedFallback = false;
  const serverMeta = provider === "imgly" ? { available: false, provider: null } : await serverProviderAvailable();

  try {
    if (provider === "clipdrop" || provider === "removebg") {
      await tryServer();
    } else {
      const first = await tryLocal(preferredModel);
      if (!first.ok) {
        emit(options, "retry", "Trying a higher-accuracy model");
        usedFallback = true;
        const fallbackModel: ImglyModel =
          preferredModel === "isnet" ? "isnet_fp16" : preferredModel === "isnet_fp16" ? "isnet" : "isnet_fp16";
        if (fallbackModel !== preferredModel) {
          try {
            await tryLocal(fallbackModel);
          } catch {
            /* keep first candidate */
          }
        }
      }
      const bestSoFar = candidates.length
        ? candidates.reduce((a, b) => (b.validation.score > a.validation.score ? b : a))
        : null;
      if ((!bestSoFar || !bestSoFar.validation.ok) && (provider === "auto" || serverMeta.available)) {
        emit(options, "retry", "Trying an alternate engine");
        usedFallback = true;
        try {
          await tryServer();
        } catch {
          /* keep local */
        }
      }
    }
  } catch (error) {
    if (provider !== "imgly" && candidates.length === 0) {
      try {
        emit(options, "retry", "Falling back to on-device AI");
        usedFallback = true;
        await tryLocal(preferredModel);
      } catch {
        throw error;
      }
    } else if (candidates.length === 0) {
      throw error;
    }
  }

  if (!candidates.length) {
    throw new BackgroundRemovalError("failed", "No segmentation result");
  }

  const best = candidates.reduce((a, b) => (b.validation.score > a.validation.score ? b : a));
  if (best.validation.reasons.includes("empty") || best.validation.score < 0.12) {
    throw new BackgroundRemovalError("empty", "Empty segmentation");
  }

  emit(options, "compose", "Preparing transparent PNG");
  const rgba = composeRgba(best.rgb, best.alpha);
  const png = await imageDataToPngBlob(rgba);
  emit(options, "done");

  return {
    png,
    width: decoded.width,
    height: decoded.height,
    original: decoded.imageData,
    alpha: best.alpha,
    validation: best.validation,
    usedFallback,
    provider: best.provider,
    model: best.model,
  };
}

export async function exportTransparentPng(original: ImageData, alpha: Uint8ClampedArray): Promise<Blob> {
  return imageDataToPngBlob(composeRgba(original, alpha));
}

export async function exportWithBackground(
  original: ImageData,
  alpha: Uint8ClampedArray,
  fill: RgbColor | null,
): Promise<Blob> {
  const rgba = composeRgba(original, alpha);
  if (!fill) return imageDataToPngBlob(rgba);
  return imageDataToPngBlob(compositeOntoColor(rgba, fill));
}
