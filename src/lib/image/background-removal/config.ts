import type { ImglyModel, QualityPreset, SegmentationProvider } from "./types";

export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_FILE_MB = 20;
export const INFERENCE_SIZE = 1024;

const PROVIDERS: SegmentationProvider[] = ["imgly", "clipdrop", "removebg", "auto"];
const MODELS: ImglyModel[] = ["isnet", "isnet_fp16", "isnet_quint8"];

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function normalizeProvider(value: string | undefined): SegmentationProvider {
  const key = (value ?? "imgly").toLowerCase() as SegmentationProvider;
  return PROVIDERS.includes(key) ? key : "imgly";
}

function normalizeModel(value: string | undefined): ImglyModel {
  const key = (value ?? "isnet_fp16").toLowerCase() as ImglyModel;
  return MODELS.includes(key) ? key : "isnet_fp16";
}

export function getBackgroundRemovalConfig() {
  return {
    provider: normalizeProvider(
      readEnv("NEXT_PUBLIC_BACKGROUND_REMOVAL_PROVIDER") ?? readEnv("BACKGROUND_REMOVAL_PROVIDER"),
    ),
    model: normalizeModel(readEnv("NEXT_PUBLIC_BACKGROUND_REMOVAL_MODEL") ?? readEnv("BACKGROUND_REMOVAL_MODEL")),
    maxFileBytes: MAX_FILE_BYTES,
  };
}

export function modelForPreset(preset: QualityPreset, configured?: ImglyModel): ImglyModel {
  if (preset === "standard") return "isnet_quint8";
  if (preset === "maximum") return "isnet";
  return configured ?? "isnet_fp16";
}

export function refinementStrength(preset: QualityPreset) {
  if (preset === "standard") {
    return { band: 2, iterations: 1, window: 5, bilateral: 1, workMaxSide: 2048 };
  }
  if (preset === "maximum") {
    return { band: 4, iterations: 3, window: 9, bilateral: 2, workMaxSide: 8192 };
  }
  return { band: 3, iterations: 2, window: 7, bilateral: 2, workMaxSide: 4096 };
}

export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

export const DROPZONE_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
].join(",");
