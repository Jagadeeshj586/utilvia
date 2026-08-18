import type { ValidationResult } from "./types";

export function validateMask(alpha: Uint8ClampedArray, width: number, height: number): ValidationResult {
  const total = width * height;
  if (!total) {
    return { ok: false, score: 0, reasons: ["empty"], foregroundRatio: 0, backgroundRatio: 0, uncertainRatio: 0 };
  }

  let fg = 0;
  let bg = 0;
  let mid = 0;
  let transitions = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const a = alpha[y * width + x];
      if (a < 12) bg += 1;
      else if (a > 243) fg += 1;
      else mid += 1;
      if (x + 1 < width) {
        const n = alpha[y * width + x + 1];
        if ((a < 40 && n > 200) || (a > 200 && n < 40)) transitions += 1;
      }
      if (y + 1 < height) {
        const n = alpha[(y + 1) * width + x];
        if ((a < 40 && n > 200) || (a > 200 && n < 40)) transitions += 1;
      }
    }
  }

  const foregroundRatio = fg / total;
  const backgroundRatio = bg / total;
  const uncertainRatio = mid / total;
  const reasons: string[] = [];

  if (fg < 80) reasons.push("empty");
  if (bg < 80) reasons.push("fully_opaque");
  if (foregroundRatio < 0.002) reasons.push("missing_foreground");
  if (foregroundRatio > 0.985) reasons.push("missing_background");
  if (uncertainRatio > 0.45) reasons.push("excessive_uncertainty");

  const perimeterish = transitions / total;
  if (perimeterish > 0.18) reasons.push("jagged");

  let holeScore = 0;
  const visited = new Uint8Array(total);
  const qx = new Int32Array(Math.min(total, 65536));
  const qy = new Int32Array(Math.min(total, 65536));
  let holeCount = 0;
  let holePixels = 0;

  const flood = (sx: number, sy: number) => {
    let qh = 0;
    let qt = 0;
    qx[qt] = sx;
    qy[qt] = sy;
    qt += 1;
    visited[sy * width + sx] = 1;
    let count = 1;
    let touchesBorder = sx === 0 || sy === 0 || sx === width - 1 || sy === height - 1;
    while (qh < qt) {
      const x = qx[qh];
      const y = qy[qh];
      qh += 1;
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (visited[ni] || alpha[ni] >= 40) continue;
        visited[ni] = 1;
        if (qt < qx.length) {
          qx[qt] = nx;
          qy[qt] = ny;
          qt += 1;
        }
        count += 1;
        if (nx === 0 || ny === 0 || nx === width - 1 || ny === height - 1) touchesBorder = true;
      }
    }
    return { count, touchesBorder };
  };

  const step = Math.max(1, Math.floor(Math.min(width, height) / 180));
  for (let y = 1; y < height - 1; y += step) {
    for (let x = 1; x < width - 1; x += step) {
      const i = y * width + x;
      if (visited[i] || alpha[i] >= 40) continue;
      const region = flood(x, y);
      if (!region.touchesBorder && region.count > 4 && region.count < total * 0.08) {
        holeCount += 1;
        holePixels += region.count;
      }
    }
  }

  if (holeCount > 40 || holePixels / total > 0.06) {
    reasons.push("excessive_holes");
    holeScore = Math.min(0.35, holeCount / 200 + holePixels / total);
  }

  let score = 1;
  if (reasons.includes("empty") || reasons.includes("fully_opaque")) score = 0;
  else {
    if (foregroundRatio < 0.01 || foregroundRatio > 0.96) score -= 0.25;
    if (uncertainRatio > 0.25) score -= (uncertainRatio - 0.25) * 1.2;
    if (reasons.includes("jagged")) score -= 0.2;
    score -= holeScore;
    score -= Math.max(0, 0.08 - backgroundRatio) * 2;
  }
  score = Math.max(0, Math.min(1, score));

  return {
    ok: score >= 0.42 && !reasons.includes("empty") && !reasons.includes("fully_opaque"),
    score,
    reasons,
    foregroundRatio,
    backgroundRatio,
    uncertainRatio,
  };
}

export function pickBestAlpha(
  candidates: Array<{ alpha: Uint8ClampedArray; validation: ValidationResult; label: string }>,
) {
  return candidates.reduce((best, current) => (current.validation.score > best.validation.score ? current : best));
}
