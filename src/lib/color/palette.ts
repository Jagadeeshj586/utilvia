import { formatsFromHsv, hslToRgb, rgbToHex } from "./conversion";
import type { ColorFormats } from "./types";

export type PaletteSwatch = { label: string; formats: ColorFormats };

function swatch(h: number, s: number, v: number, label: string, alpha = 1): PaletteSwatch {
  return { label, formats: formatsFromHsv(h, s, v, alpha) };
}

export function complementaryPalette(base: ColorFormats): PaletteSwatch[] {
  const { h, s, v } = base.hsv;
  return [
    swatch(h, s, v, "Primary"),
    swatch((h + 180) % 360, s, v, "Complement"),
  ];
}

export function analogousPalette(base: ColorFormats): PaletteSwatch[] {
  const { h, s, v } = base.hsv;
  return [-30, 0, 30].map((offset) => swatch((h + offset + 360) % 360, s, v, offset === 0 ? "Base" : `${offset > 0 ? "+" : ""}${offset}°`));
}

export function triadicPalette(base: ColorFormats): PaletteSwatch[] {
  const { h, s, v } = base.hsv;
  return [0, 120, 240].map((offset) => swatch((h + offset) % 360, s, v, offset === 0 ? "Base" : `+${offset}°`));
}

export function splitComplementaryPalette(base: ColorFormats): PaletteSwatch[] {
  const { h, s, v } = base.hsv;
  return [swatch(h, s, v, "Base"), swatch((h + 150) % 360, s, v, "+150°"), swatch((h + 210) % 360, s, v, "+210°")];
}

export function tetradicPalette(base: ColorFormats): PaletteSwatch[] {
  const { h, s, v } = base.hsv;
  return [0, 90, 180, 270].map((offset) => swatch((h + offset) % 360, s, v, offset === 0 ? "Base" : `+${offset}°`));
}

export function monochromaticPalette(base: ColorFormats): PaletteSwatch[] {
  const { h, s } = base.hsv;
  return [20, 35, 50, 65, 80, 95].map((value) => swatch(h, s, value, `${Math.round(value)}%`));
}

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const SHADE_LIGHTNESS: Record<number, number | "base"> = {
  50: 97,
  100: 94,
  200: 86,
  300: 77,
  400: 66,
  500: "base",
  600: 54,
  700: 46,
  800: 38,
  900: 30,
};

export function shadeScale(base: ColorFormats): PaletteSwatch[] {
  const { h, s, l } = base.hsl;
  return SHADE_STEPS.map((step) => {
    const target = SHADE_LIGHTNESS[step];
    const lightness = target === "base" ? l : target;
    const sat = target === "base" ? s : Math.min(100, s * (step <= 500 ? 1.05 : 0.92));
    const rgb = hslToRgb(h, sat, lightness);
    return {
      label: String(step),
      formats: {
        ...base,
        hex: rgbToHex(rgb.r, rgb.g, rgb.b, base.alpha),
        rgb,
        hsl: { h, s: sat, l: lightness },
        hsv: base.hsv,
        cmyk: base.cmyk,
      },
    };
  });
}

export function tintScale(base: ColorFormats): PaletteSwatch[] {
  const { h, s, l } = base.hsl;
  return [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((mix) => {
    const lightness = l + (100 - l) * (mix / 100);
    const sat = s * (1 - mix / 120);
    const rgb = hslToRgb(h, sat, lightness);
    return {
      label: `${mix}%`,
      formats: {
        ...base,
        hex: rgbToHex(rgb.r, rgb.g, rgb.b, base.alpha),
        rgb,
        hsl: { h, s: sat, l: lightness },
        hsv: base.hsv,
        cmyk: base.cmyk,
      },
    };
  });
}
