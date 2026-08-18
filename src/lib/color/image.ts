import { rgbToHex } from "./conversion";

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload PNG, JPG, or WebP."));
      return;
    }
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to read image."));
    image.src = URL.createObjectURL(file);
  });
}

export function sampleColorFromImage(image: HTMLImageElement, x: number, y: number, canvas?: HTMLCanvasElement) {
  const target = canvas ?? document.createElement("canvas");
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  target.width = width;
  target.height = height;
  const ctx = target.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0);
  const px = clamp(Math.floor(x * width), 0, width - 1);
  const py = clamp(Math.floor(y * height), 0, height - 1);
  const data = ctx.getImageData(px, py, 1, 1).data;
  return {
    hex: rgbToHex(data[0], data[1], data[2], data[3] / 255),
    rgb: { r: data[0], g: data[1], b: data[2] },
    alpha: data[3] / 255,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function extractDominantColors(image: HTMLImageElement, count = 5) {
  const canvas = document.createElement("canvas");
  const maxSide = 120;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  canvas.width = Math.max(1, Math.floor((image.naturalWidth || image.width) * scale));
  canvas.height = Math.max(1, Math.floor((image.naturalHeight || image.height) * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buckets = new Map<string, number>();
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 128) continue;
      const key = `${Math.round(r / 16)}-${Math.round(g / 16)}-${Math.round(b / 16)}`;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }
  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const [r, g, b] = key.split("-").map((part) => Number(part) * 16 + 8);
      return rgbToHex(r, g, b);
    });
}
