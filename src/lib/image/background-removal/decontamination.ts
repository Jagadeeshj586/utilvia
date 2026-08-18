import { forEachRowChunk } from "./canvas";

/**
 * Remove background color spill / halos around semi-transparent edges
 * without shifting solid foreground colors.
 */
export async function decontaminateForeground(
  original: ImageData,
  alpha: Uint8ClampedArray,
): Promise<ImageData> {
  const { width, height, data } = original;
  const out = new ImageData(new Uint8ClampedArray(data), width, height);
  const dst = out.data;
  const radius = 3;

  await forEachRowChunk(height, 40, (y0, y1) => {
    for (let y = y0; y < y1; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = y * width + x;
        const a = alpha[i];
        if (a < 4 || a > 248) continue;

        const o = i * 4;
        const af = a / 255;

        let bgR = 0;
        let bgG = 0;
        let bgB = 0;
        let bgW = 0;
        let fgR = 0;
        let fgG = 0;
        let fgB = 0;
        let fgW = 0;

        const yMin = Math.max(0, y - radius);
        const yMax = Math.min(height - 1, y + radius);
        const xMin = Math.max(0, x - radius);
        const xMax = Math.min(width - 1, x + radius);

        for (let ny = yMin; ny <= yMax; ny += 1) {
          for (let nx = xMin; nx <= xMax; nx += 1) {
            const ni = ny * width + nx;
            const na = alpha[ni];
            const no = ni * 4;
            if (na <= 12) {
              const w = (18 - na) / 18;
              bgR += data[no] * w;
              bgG += data[no + 1] * w;
              bgB += data[no + 2] * w;
              bgW += w;
            } else if (na >= 240) {
              const w = (na - 230) / 25;
              fgR += data[no] * w;
              fgG += data[no + 1] * w;
              fgB += data[no + 2] * w;
              fgW += w;
            }
          }
        }

        if (bgW < 0.2) continue;
        bgR /= bgW;
        bgG /= bgW;
        bgB /= bgW;

        let r = (data[o] - bgR * (1 - af)) / Math.max(af, 0.08);
        let g = (data[o + 1] - bgG * (1 - af)) / Math.max(af, 0.08);
        let b = (data[o + 2] - bgB * (1 - af)) / Math.max(af, 0.08);

        if (fgW > 0.2) {
          fgR /= fgW;
          fgG /= fgW;
          fgB /= fgW;
          const t = (1 - af) * 0.55;
          r = r * (1 - t) + fgR * t;
          g = g * (1 - t) + fgG * t;
          b = b * (1 - t) + fgB * t;
        }

        dst[o] = r < 0 ? 0 : r > 255 ? 255 : r;
        dst[o + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
        dst[o + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
      }
    }
  });

  return out;
}
