import { contrastRatio } from "@/lib/color/contrast";
import { hexToRgb, hslToRgb, normalizeHex, rgbToHex, rgbToHsl } from "@/lib/color/conversion";

export const PALETTE_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type PaletteShade = (typeof PALETTE_SHADES)[number];

export type ColorDisplayFormat = "hex" | "rgb" | "hsl";
export type PaletteCodeFormat = "tailwind" | "css";
export type ContrastText = "W" | "B";

export type PaletteSwatch = {
  shade: PaletteShade;
  hex: string;
  rgb: string;
  hsl: string;
  contrastLabel: ContrastText;
};

/** WorkUtilities default brand color — anchored at shade 500. */
export const DEFAULT_BRAND_HEX = "#4f8ef7";

/**
 * HSL tint/shade curve used by WorkUtilities.
 * Shade 500 keeps the brand hex. Other stops fix lightness and scale saturation.
 */
const LIGHTNESS: Record<PaletteShade, number | "base"> = {
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
  950: 14,
};

const SATURATION: Record<PaletteShade, number | "base"> = {
  50: 0.55,
  100: 0.65,
  200: 0.75,
  300: 0.85,
  400: 0.92,
  500: "base",
  600: 0.95,
  700: 0.9,
  800: 0.85,
  900: 0.8,
  950: 0.75,
};

const WCAG_AA = 4.5;

export function parseBrandHex(input: string): string | null {
  const normalized = normalizeHex(input);
  if (!normalized) return null;
  return normalized.slice(0, 7);
}

function shadeHex(baseHex: string, shade: PaletteShade): string {
  if (shade === 500) return baseHex;
  const rgb = hexToRgb(baseHex);
  if (!rgb) return baseHex;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const lightness = LIGHTNESS[shade];
  const satMul = SATURATION[shade];
  const l = lightness === "base" ? hsl.l : lightness;
  const s = satMul === "base" ? hsl.s : Math.min(100, hsl.s * satMul);
  const next = hslToRgb(hsl.h, s, l);
  return rgbToHex(next.r, next.g, next.b);
}

function contrastLabelFor(hex: string): ContrastText {
  const onWhite = contrastRatio(hex, "#ffffff");
  return onWhite !== null && onWhite >= WCAG_AA ? "W" : "B";
}

function formatRgb(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "rgb(0, 0, 0)";
  return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
}

function formatHsl(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "hsl(0, 0%, 0%)";
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
}

export function buildPaletteScale(input: string): PaletteSwatch[] | null {
  const baseHex = parseBrandHex(input);
  if (!baseHex) return null;
  return PALETTE_SHADES.map((shade) => {
    const hex = shadeHex(baseHex, shade);
    return {
      shade,
      hex,
      rgb: formatRgb(hex),
      hsl: formatHsl(hex),
      contrastLabel: contrastLabelFor(hex),
    };
  });
}

export function formatSwatchValue(swatch: PaletteSwatch, format: ColorDisplayFormat) {
  if (format === "rgb") return swatch.rgb;
  if (format === "hsl") return swatch.hsl;
  return swatch.hex;
}

export function tailwindConfigSnippet(swatches: PaletteSwatch[], name = "brand") {
  const rows = swatches.map((item) => `          ${item.shade}: '${item.hex}',`).join("\n");
  return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        ${name}: {
${rows}
        }
      }
    }
  }
}`;
}

export function cssVariablesSnippet(swatches: PaletteSwatch[], name = "brand") {
  const rows = swatches.map((item) => `  --color-${name}-${item.shade}: ${item.hex};`).join("\n");
  return `:root {\n${rows}\n}`;
}

export function paletteCode(swatches: PaletteSwatch[], format: PaletteCodeFormat, name = "brand") {
  return format === "css" ? cssVariablesSnippet(swatches, name) : tailwindConfigSnippet(swatches, name);
}

export const COLOR_PALETTE_FAQS = [
  {
    question: "What is a Tailwind color scale?",
    answer:
      "A Tailwind color scale is eleven named stops from 50 (near-white) to 950 (near-black). Shade 500 is your brand color. Lighter stops work for backgrounds and borders; darker stops work for hover, text, and high-contrast UI.",
  },
  {
    question: "How do I add a custom color palette to Tailwind?",
    answer:
      "Copy the Tailwind Config output and paste it under theme.extend.colors in tailwind.config.js. You can then use classes such as bg-brand-500, text-brand-700, and border-brand-200.",
  },
  {
    question: "What is WCAG contrast ratio and why does it matter?",
    answer:
      "WCAG AA needs a 4.5:1 contrast ratio for normal text. Each shade shows ✅ B if black text passes on that color, or ✅ W if white text passes. Use that badge when picking text color for buttons and chips.",
  },
  {
    question: "Can I use this palette in non-Tailwind projects?",
    answer:
      "Yes. Switch to CSS Variables and copy --color-brand-50 through --color-brand-950. Those custom properties work in any stylesheet, design token file, or CSS-in-JS setup.",
  },
  {
    question: "Is this generator free?",
    answer:
      "Yes. It runs entirely in your browser with no signup. Your brand color never leaves the device.",
  },
] as const;
