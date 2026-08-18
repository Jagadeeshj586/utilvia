export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    const sched = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (sched?.yield) {
      void sched.yield().then(resolve);
      return;
    }
    setTimeout(resolve, 0);
  });
}

export async function forEachRowChunk(
  height: number,
  chunk: number,
  fn: (y0: number, y1: number) => void,
): Promise<void> {
  for (let y = 0; y < height; y += chunk) {
    fn(y, Math.min(height, y + chunk));
    if (y + chunk < height) await yieldToMain();
  }
}

export function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available");
  return { canvas, ctx };
}

export function imageDataFromCanvas(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available");
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function putImageData(data: ImageData): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(data.width, data.height);
  ctx.putImageData(data, 0, 0);
  return canvas;
}

export function imageDataToPngBlob(data: ImageData): Promise<Blob> {
  const canvas = putImageData(data);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode PNG"))), "image/png");
  });
}

export function cloneImageData(data: ImageData): ImageData {
  return new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
}

export function extractAlpha(data: ImageData): Uint8ClampedArray {
  const alpha = new Uint8ClampedArray(data.width * data.height);
  const src = data.data;
  for (let i = 0, p = 0; i < src.length; i += 4, p += 1) alpha[p] = src[i + 3];
  return alpha;
}

export function resizeImageData(data: ImageData, width: number, height: number): ImageData {
  if (data.width === width && data.height === height) return cloneImageData(data);
  const src = putImageData(data);
  const { ctx } = createCanvas(width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

export function resizeAlpha(
  alpha: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  destW: number,
  destH: number,
): Uint8ClampedArray {
  if (srcW === destW && srcH === destH) return new Uint8ClampedArray(alpha);
  const { canvas, ctx } = createCanvas(srcW, srcH);
  const img = ctx.createImageData(srcW, srcH);
  for (let i = 0; i < alpha.length; i += 1) {
    const o = i * 4;
    const a = alpha[i];
    img.data[o] = 255;
    img.data[o + 1] = 255;
    img.data[o + 2] = 255;
    img.data[o + 3] = a;
  }
  ctx.putImageData(img, 0, 0);
  const { ctx: outCtx } = createCanvas(destW, destH);
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";
  outCtx.drawImage(canvas, 0, 0, destW, destH);
  return extractAlpha(outCtx.getImageData(0, 0, destW, destH));
}

export function composeRgba(rgb: ImageData, alpha: Uint8ClampedArray): ImageData {
  const out = new ImageData(rgb.width, rgb.height);
  const src = rgb.data;
  const dst = out.data;
  for (let i = 0, p = 0; i < src.length; i += 4, p += 1) {
    const a = alpha[p];
    if (a === 0) {
      dst[i] = 0;
      dst[i + 1] = 0;
      dst[i + 2] = 0;
      dst[i + 3] = 0;
    } else {
      dst[i] = src[i];
      dst[i + 1] = src[i + 1];
      dst[i + 2] = src[i + 2];
      dst[i + 3] = a;
    }
  }
  return out;
}

export function compositeOntoColor(rgba: ImageData, color: { r: number; g: number; b: number }): ImageData {
  const out = new ImageData(rgba.width, rgba.height);
  const src = rgba.data;
  const dst = out.data;
  for (let i = 0; i < src.length; i += 4) {
    const a = src[i + 3] / 255;
    dst[i] = Math.round(src[i] * a + color.r * (1 - a));
    dst[i + 1] = Math.round(src[i + 1] * a + color.g * (1 - a));
    dst[i + 2] = Math.round(src[i + 2] * a + color.b * (1 - a));
    dst[i + 3] = 255;
  }
  return out;
}

export type LetterboxLayout = {
  size: number;
  contentX: number;
  contentY: number;
  contentW: number;
  contentH: number;
  sourceW: number;
  sourceH: number;
};

export function letterboxImage(src: ImageData, size: number): { image: ImageData; layout: LetterboxLayout } {
  const scale = Math.min(size / src.width, size / src.height);
  const contentW = Math.max(1, Math.round(src.width * scale));
  const contentH = Math.max(1, Math.round(src.height * scale));
  const contentX = Math.floor((size - contentW) / 2);
  const contentY = Math.floor((size - contentH) / 2);
  const source = putImageData(src);
  const { ctx } = createCanvas(size, size);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.filter = "blur(28px)";
  ctx.drawImage(source, 0, 0, size, size);
  ctx.filter = "none";
  ctx.drawImage(source, contentX, contentY, contentW, contentH);

  return {
    image: ctx.getImageData(0, 0, size, size),
    layout: { size, contentX, contentY, contentW, contentH, sourceW: src.width, sourceH: src.height },
  };
}

export function unletterboxAlpha(mask: ImageData, layout: LetterboxLayout): Uint8ClampedArray {
  const alpha = extractAlpha(mask);
  const { canvas, ctx } = createCanvas(layout.size, layout.size);
  const img = ctx.createImageData(layout.size, layout.size);
  for (let i = 0; i < alpha.length; i += 1) {
    const o = i * 4;
    img.data[o] = 255;
    img.data[o + 1] = 255;
    img.data[o + 2] = 255;
    img.data[o + 3] = alpha[i];
  }
  ctx.putImageData(img, 0, 0);
  const { ctx: cropCtx } = createCanvas(layout.contentW, layout.contentH);
  cropCtx.drawImage(
    canvas,
    layout.contentX,
    layout.contentY,
    layout.contentW,
    layout.contentH,
    0,
    0,
    layout.contentW,
    layout.contentH,
  );
  const cropped = extractAlpha(cropCtx.getImageData(0, 0, layout.contentW, layout.contentH));
  return resizeAlpha(cropped, layout.contentW, layout.contentH, layout.sourceW, layout.sourceH);
}

export async function blobToImageData(blob: Blob): Promise<ImageData> {
  const bitmap = await createImageBitmap(blob);
  try {
    const { ctx } = createCanvas(bitmap.width, bitmap.height);
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}
