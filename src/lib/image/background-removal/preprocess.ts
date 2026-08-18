import { ACCEPTED_EXTENSIONS, ACCEPTED_TYPES, MAX_FILE_BYTES } from "./config";
import { BackgroundRemovalError } from "./errors";
import { createCanvas } from "./canvas";
import type { DecodedImage } from "./types";

export function isSupportedImage(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  if (ACCEPTED_TYPES.includes(type)) return true;
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function isHeic(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  return type === "image/heic" || type === "image/heif" || name.endsWith(".heic") || name.endsWith(".heif");
}

export function validateImageFile(file: File) {
  if (!isSupportedImage(file)) {
    throw new BackgroundRemovalError("unsupported", "Unsupported image type");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new BackgroundRemovalError("too_large", "Image exceeds 20 MB");
  }
}

async function loadHeic2Any(): Promise<(options: { blob: Blob; toType?: string; quality?: number }) => Promise<Blob | Blob[]>> {
  const urls = [
    "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js",
    "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/+esm",
  ];
  for (const url of urls) {
    try {
      const mod = (await Function(`return import(${JSON.stringify(url)})`)()) as
        | ((options: { blob: Blob; toType?: string; quality?: number }) => Promise<Blob | Blob[]>)
        | { default?: (options: { blob: Blob; toType?: string; quality?: number }) => Promise<Blob | Blob[]> };
      const fn = typeof mod === "function" ? mod : mod.default;
      if (typeof fn === "function") return fn;
    } catch {
      /* try next */
    }
  }
  throw new BackgroundRemovalError("unsupported", "HEIC is not supported in this browser");
}

async function toDecodableBlob(file: File): Promise<Blob> {
  if (!isHeic(file)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    bitmap.close();
    return file;
  } catch {
    const heic2any = await loadHeic2Any();
    const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.95 });
    const blob = Array.isArray(result) ? result[0] : result;
    if (!blob) throw new BackgroundRemovalError("corrupt", "Could not decode HEIC image");
    return blob;
  }
}

async function decodeWithOrientation(blob: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(blob, { imageOrientation: "from-image" } as unknown as ImageBitmapOptions);
  } catch {
    return createImageBitmap(blob);
  }
}

export async function decodeImage(file: File): Promise<DecodedImage> {
  validateImageFile(file);
  try {
    const blob = await toDecodableBlob(file);
    const bitmap = await decodeWithOrientation(blob);
    try {
      if (!bitmap.width || !bitmap.height) {
        throw new BackgroundRemovalError("corrupt", "Image has no dimensions");
      }
      const { canvas, ctx } = createCanvas(bitmap.width, bitmap.height);
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return { imageData, width: canvas.width, height: canvas.height };
    } finally {
      bitmap.close();
    }
  } catch (error) {
    if (error instanceof BackgroundRemovalError) throw error;
    throw new BackgroundRemovalError("corrupt", "Could not decode image", error);
  }
}

export function downloadStem(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "").trim() || "image";
  return base.replace(/[^\w\-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "image";
}
