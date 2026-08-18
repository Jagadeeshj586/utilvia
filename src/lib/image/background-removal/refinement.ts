import { forEachRowChunk, resizeAlpha, yieldToMain } from "./canvas";
import type { QualityPreset } from "./types";
import { refinementStrength } from "./config";

function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value;
}

function workingSize(width: number, height: number, maxSide: number) {
  const side = Math.max(width, height);
  if (side <= maxSide) return { width, height, scale: 1 };
  const scale = maxSide / side;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
}

function resizeRgb(data: ImageData, width: number, height: number): ImageData {
  if (data.width === width && data.height === height) {
    return new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
  }
  const src = document.createElement("canvas");
  src.width = data.width;
  src.height = data.height;
  src.getContext("2d")!.putImageData(data, 0, 0);
  const dest = document.createElement("canvas");
  dest.width = width;
  dest.height = height;
  const ctx = dest.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

function colorDist2(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

/**
 * Local color-unmixing matting on the uncertain band only.
 * Does not globally blur or morphologically erode (protects hair / thin structures).
 */
export async function refineAlpha(
  original: ImageData,
  alphaIn: Uint8ClampedArray,
  quality: QualityPreset,
): Promise<Uint8ClampedArray> {
  const { band, iterations, window, bilateral, workMaxSide } = refinementStrength(quality);
  const work = workingSize(original.width, original.height, workMaxSide);
  const rgb = resizeRgb(original, work.width, work.height);
  let alpha =
    work.width === original.width && work.height === original.height
      ? new Uint8ClampedArray(alphaIn)
      : resizeAlpha(alphaIn, original.width, original.height, work.width, work.height);

  const { width, height } = work;
  const pixels = width * height;
  const radius = Math.max(1, Math.floor(window / 2));
  const uncertain = new Uint8Array(pixels);

  const markUncertain = () => {
    uncertain.fill(0);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const i = y * width + x;
        const a = alpha[i];
        if (a > 18 && a < 237) {
          uncertain[i] = 1;
          continue;
        }
        let minA = a;
        let maxA = a;
        for (let oy = -1; oy <= 1; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            const n = alpha[(y + oy) * width + (x + ox)];
            if (n < minA) minA = n;
            if (n > maxA) maxA = n;
          }
        }
        if (maxA - minA > 40) uncertain[i] = 1;
      }
    }
    if (band <= 1) return;
    const copy = uncertain.slice();
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        if (copy[y * width + x]) continue;
        let hit = false;
        for (let oy = -1; oy <= 1 && !hit; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            if (copy[(y + oy) * width + (x + ox)]) {
              hit = true;
              break;
            }
          }
        }
        if (hit) uncertain[y * width + x] = 1;
      }
    }
  };

  for (let pass = 0; pass < iterations; pass += 1) {
    markUncertain();
    const next = new Uint8ClampedArray(alpha);
    await forEachRowChunk(height, 48, (y0, y1) => {
      for (let y = y0; y < y1; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const i = y * width + x;
          if (!uncertain[i]) continue;
          const o = i * 4;
          const cr = rgb.data[o];
          const cg = rgb.data[o + 1];
          const cb = rgb.data[o + 2];

          let fgR = 0;
          let fgG = 0;
          let fgB = 0;
          let fgW = 0;
          let bgR = 0;
          let bgG = 0;
          let bgB = 0;
          let bgW = 0;

          const yMin = Math.max(0, y - radius);
          const yMax = Math.min(height - 1, y + radius);
          const xMin = Math.max(0, x - radius);
          const xMax = Math.min(width - 1, x + radius);

          for (let ny = yMin; ny <= yMax; ny += 1) {
            for (let nx = xMin; nx <= xMax; nx += 1) {
              const ni = ny * width + nx;
              const a = alpha[ni];
              const no = ni * 4;
              const wr = rgb.data[no];
              const wg = rgb.data[no + 1];
              const wb = rgb.data[no + 2];
              if (a >= 230) {
                const w = (a - 220) / 35;
                fgR += wr * w;
                fgG += wg * w;
                fgB += wb * w;
                fgW += w;
              } else if (a <= 25) {
                const w = (30 - a) / 30;
                bgR += wr * w;
                bgG += wg * w;
                bgB += wb * w;
                bgW += w;
              }
            }
          }

          if (fgW < 0.35 || bgW < 0.35) continue;

          fgR /= fgW;
          fgG /= fgW;
          fgB /= fgW;
          bgR /= bgW;
          bgG /= bgW;
          bgB /= bgW;

          const fbr = fgR - bgR;
          const fbg = fgG - bgG;
          const fbb = fgB - bgB;
          const denom = fbr * fbr + fbg * fbg + fbb * fbb;
          let aHat: number;
          if (denom < 80) {
            const dFg = Math.sqrt(colorDist2(cr, cg, cb, fgR, fgG, fgB));
            const dBg = Math.sqrt(colorDist2(cr, cg, cb, bgR, bgG, bgB));
            aHat = dBg / (dFg + dBg + 1e-4);
          } else {
            aHat = ((cr - bgR) * fbr + (cg - bgG) * fbg + (cb - bgB) * fbb) / denom;
          }
          aHat = clamp(aHat, 0, 1);
          const blended = alpha[i] / 255 * 0.35 + aHat * 0.65;
          next[i] = Math.round(clamp(blended, 0, 1) * 255);
        }
      }
    });
    alpha = next;
    await yieldToMain();
  }

  for (let b = 0; b < bilateral; b += 1) {
    markUncertain();
    const next = new Uint8ClampedArray(alpha);
    const spatial = 1.6;
    const colorSigma = 28;
    await forEachRowChunk(height, 48, (y0, y1) => {
      for (let y = y0; y < y1; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const i = y * width + x;
          if (!uncertain[i]) continue;
          const o = i * 4;
          const cr = rgb.data[o];
          const cg = rgb.data[o + 1];
          const cb = rgb.data[o + 2];
          let sum = 0;
          let wsum = 0;
          for (let oy = -2; oy <= 2; oy += 1) {
            const ny = y + oy;
            if (ny < 0 || ny >= height) continue;
            for (let ox = -2; ox <= 2; ox += 1) {
              const nx = x + ox;
              if (nx < 0 || nx >= width) continue;
              const ni = ny * width + nx;
              const no = ni * 4;
              const dc = Math.sqrt(colorDist2(cr, cg, cb, rgb.data[no], rgb.data[no + 1], rgb.data[no + 2]));
              const ds = Math.hypot(ox, oy);
              const w = Math.exp(-(ds * ds) / (2 * spatial * spatial) - (dc * dc) / (2 * colorSigma * colorSigma));
              sum += alpha[ni] * w;
              wsum += w;
            }
          }
          if (wsum > 0) next[i] = Math.round(sum / wsum);
        }
      }
    });
    alpha = next;
    await yieldToMain();
  }

  for (let i = 0; i < alpha.length; i += 1) {
    const a = alpha[i];
    if (a < 6) alpha[i] = 0;
    else if (a > 249) alpha[i] = 255;
  }

  if (work.width === original.width && work.height === original.height) return alpha;
  return resizeAlpha(alpha, work.width, work.height, original.width, original.height);
}
