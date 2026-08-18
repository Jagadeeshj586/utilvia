import type { CMYK, ColorFormats, HSL, HSV, RGB } from "./types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeHex(input: string): string | null {
  let raw = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(raw)) raw = raw.split("").map((ch) => ch + ch).join("");
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`;
  if (/^[0-9a-fA-F]{8}$/.test(raw)) return `#${raw.toLowerCase()}`;
  return null;
}

export function hexToRgb(hex: string): RGB | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const body = normalized.slice(1, 7);
  return {
    r: parseInt(body.slice(0, 2), 16),
    g: parseInt(body.slice(2, 4), 16),
    b: parseInt(body.slice(4, 6), 16),
  };
}

export function hexAlpha(hex: string): number | null {
  const normalized = normalizeHex(hex);
  if (!normalized || normalized.length !== 9) return null;
  return parseInt(normalized.slice(7, 9), 16) / 255;
}

export function rgbToHex(r: number, g: number, b: number, alpha = 1): string {
  const ch = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  const base = `#${ch(r)}${ch(g)}${ch(b)}`;
  if (alpha < 1) return `${base}${ch(alpha * 255)}`;
  return base;
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [chroma, x, 0];
  else if (hue < 120) [r, g, b] = [x, chroma, 0];
  else if (hue < 180) [r, g, b] = [0, chroma, x];
  else if (hue < 240) [r, g, b] = [0, x, chroma];
  else if (hue < 300) [r, g, b] = [x, 0, chroma];
  else [r, g, b] = [chroma, 0, x];
  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  };
}

export function rgbToHsv(r: number, g: number, b: number): HSV {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  const s = max === 0 ? 0 : d / max;
  return { h: h * 360, s: s * 100, v: max * 100 };
}

export function hsvToRgb(h: number, s: number, v: number): RGB {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const value = clamp(v, 0, 100) / 100;
  const chroma = value * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = value - chroma;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [chroma, x, 0];
  else if (hue < 120) [r, g, b] = [x, chroma, 0];
  else if (hue < 180) [r, g, b] = [0, chroma, x];
  else if (hue < 240) [r, g, b] = [0, x, chroma];
  else if (hue < 300) [r, g, b] = [x, 0, chroma];
  else [r, g, b] = [chroma, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export function rgbToCmyk(r: number, g: number, b: number): CMYK {
  const rn = clamp(r, 0, 255) / 255;
  const gn = clamp(g, 0, 255) / 255;
  const bn = clamp(b, 0, 255) / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  return { c: c * 100, m: m * 100, y: y * 100, k: k * 100 };
}

export function cmykToRgb(c: number, m: number, y: number, k: number): RGB {
  const cn = clamp(c, 0, 100) / 100;
  const mn = clamp(m, 0, 100) / 100;
  const yn = clamp(y, 0, 100) / 100;
  const kn = clamp(k, 0, 100) / 100;
  return {
    r: 255 * (1 - cn) * (1 - kn),
    g: 255 * (1 - mn) * (1 - kn),
    b: 255 * (1 - yn) * (1 - kn),
  };
}

export function formatsFromHsv(h: number, s: number, v: number, alpha = 1): ColorFormats {
  const rgb = hsvToRgb(h, s, v);
  return {
    hex: rgbToHex(rgb.r, rgb.g, rgb.b, alpha),
    rgb,
    hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
    hsv: { h, s, v },
    cmyk: rgbToCmyk(rgb.r, rgb.g, rgb.b),
    alpha: clamp(alpha, 0, 1),
  };
}

export function formatsFromHex(hex: string, alpha?: number): ColorFormats | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const parsedAlpha = alpha ?? hexAlpha(hex) ?? 1;
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  return formatsFromHsv(hsv.h, hsv.s, hsv.v, parsedAlpha);
}

export function validateHex(input: string) {
  return normalizeHex(input) !== null;
}

export function cssRgba(rgb: RGB, alpha: number) {
  const a = Math.round(alpha * 1000) / 1000;
  return a < 1 ? `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${a})` : `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
}

export function cssHsla(hsl: HSL, alpha: number) {
  const h = Math.round(hsl.h);
  const s = Math.round(hsl.s);
  const l = Math.round(hsl.l);
  const a = Math.round(alpha * 1000) / 1000;
  return a < 1 ? `hsla(${h}, ${s}%, ${l}%, ${a})` : `hsl(${h}, ${s}%, ${l}%)`;
}
