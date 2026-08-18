import { forEachRowChunk } from "./canvas";

function luminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function subjectBounds(alpha: Uint8ClampedArray, width: number, height: number) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (alpha[y * width + x] < 40) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX) return null;
  return { minX, minY, maxX, maxY };
}

function isShadowLike(r: number, g: number, b: number, subjectLum: number) {
  const lum = luminance(r, g, b);
  const sat = saturation(r, g, b);
  return sat < 0.28 && lum < subjectLum * 0.72 && lum < 90;
}

export async function adjustShadows(
  original: ImageData,
  alpha: Uint8ClampedArray,
  keepShadow: boolean,
): Promise<Uint8ClampedArray> {
  const { width, height, data } = original;
  const out = new Uint8ClampedArray(alpha);
  const bounds = subjectBounds(alpha, width, height);
  if (!bounds) return out;

  const boxH = Math.max(1, bounds.maxY - bounds.minY + 1);
  const lowerY = bounds.minY + Math.floor(boxH * 0.55);
  let subjectLumSum = 0;
  let subjectCount = 0;
  for (let y = bounds.minY; y <= Math.min(bounds.maxY, lowerY); y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const i = y * width + x;
      if (alpha[i] < 200) continue;
      const o = i * 4;
      subjectLumSum += luminance(data[o], data[o + 1], data[o + 2]);
      subjectCount += 1;
    }
  }
  const subjectLum = subjectCount ? subjectLumSum / subjectCount : 120;
  const footY = Math.min(height - 1, bounds.maxY + Math.round(boxH * 0.18));

  await forEachRowChunk(height, 64, (y0, y1) => {
    for (let y = y0; y < y1; y += 1) {
      if (y < lowerY || y > footY) continue;
      for (let x = Math.max(0, bounds.minX - 8); x <= Math.min(width - 1, bounds.maxX + 8); x += 1) {
        const i = y * width + x;
        const o = i * 4;
        const r = data[o];
        const g = data[o + 1];
        const b = data[o + 2];
        if (!isShadowLike(r, g, b, subjectLum)) continue;

        if (keepShadow) {
          if (out[i] >= 40) continue;
          const nearFg =
            (x > 0 && alpha[i - 1] > 80) ||
            (x + 1 < width && alpha[i + 1] > 80) ||
            (y > 0 && alpha[i - width] > 80) ||
            (y + 1 < height && alpha[i + width] > 80);
          if (!nearFg && y > bounds.maxY + 2) continue;
          const darkness = 1 - luminance(r, g, b) / Math.max(subjectLum, 1);
          out[i] = Math.max(out[i], Math.round(Math.min(0.55, 0.15 + darkness * 0.5) * 255));
        } else if (out[i] > 8 && out[i] < 220) {
          const darkness = 1 - luminance(r, g, b) / Math.max(subjectLum, 1);
          if (darkness > 0.35) {
            out[i] = Math.round(out[i] * Math.max(0, 1 - darkness * 0.85));
          }
        }
      }
    }
  });

  return out;
}
