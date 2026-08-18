import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_BRAND_HEX,
  buildPaletteScale,
  cssVariablesSnippet,
  formatSwatchValue,
  parseBrandHex,
  tailwindConfigSnippet,
} from "./generate";

const WORKUTILITIES_DEFAULT: Record<number, { hex: string; badge: "B" | "W" }> = {
  50: { hex: "#f4f6fb", badge: "B" },
  100: { hex: "#e7edf9", badge: "B" },
  200: { hex: "#c3d5f4", badge: "B" },
  300: { hex: "#97b9f2", badge: "B" },
  400: { hex: "#5f96f1", badge: "B" },
  500: { hex: "#4f8ef7", badge: "B" },
  600: { hex: "#2470ef", badge: "W" },
  700: { hex: "#155dd6", badge: "W" },
  800: { hex: "#164eac", badge: "W" },
  900: { hex: "#153f84", badge: "W" },
  950: { hex: "#0b1e3c", badge: "W" },
};

describe("parseBrandHex", () => {
  it("accepts 3-digit and 6-digit hex", () => {
    assert.equal(parseBrandHex("#4f8ef7"), "#4f8ef7");
    assert.equal(parseBrandHex("4F8EF7"), "#4f8ef7");
    assert.equal(parseBrandHex("#abc"), "#aabbcc");
  });

  it("rejects invalid values", () => {
    assert.equal(parseBrandHex("not-a-color"), null);
    assert.equal(parseBrandHex("#gg0000"), null);
    assert.equal(parseBrandHex(""), null);
  });
});

describe("buildPaletteScale", () => {
  it("matches the WorkUtilities default #4f8ef7 scale and WCAG badges", () => {
    const scale = buildPaletteScale(DEFAULT_BRAND_HEX);
    assert.ok(scale);
    assert.equal(scale.length, 11);
    for (const swatch of scale) {
      const expected = WORKUTILITIES_DEFAULT[swatch.shade];
      assert.equal(swatch.hex, expected.hex);
      assert.equal(swatch.contrastLabel, expected.badge);
    }
  });

  it("keeps shade 500 as the brand hex", () => {
    const scale = buildPaletteScale("#cc785c");
    assert.equal(scale?.[5]?.shade, 500);
    assert.equal(scale?.[5]?.hex, "#cc785c");
  });

  it("formats HEX, RGB, and HSL", () => {
    const scale = buildPaletteScale(DEFAULT_BRAND_HEX);
    const mid = scale?.[5];
    assert.ok(mid);
    assert.equal(formatSwatchValue(mid, "hex"), "#4f8ef7");
    assert.equal(formatSwatchValue(mid, "rgb"), "rgb(79, 142, 247)");
    assert.equal(formatSwatchValue(mid, "hsl"), "hsl(218, 91%, 64%)");
  });

  it("returns null for invalid hex", () => {
    assert.equal(buildPaletteScale("zzz"), null);
  });
});

describe("exports", () => {
  it("builds a Tailwind config matching WorkUtilities", () => {
    const scale = buildPaletteScale(DEFAULT_BRAND_HEX)!;
    const code = tailwindConfigSnippet(scale);
    assert.match(code, /\/\/ tailwind\.config\.js/);
    assert.match(code, /50: '#f4f6fb'/);
    assert.match(code, /500: '#4f8ef7'/);
    assert.match(code, /950: '#0b1e3c'/);
  });

  it("builds CSS variables", () => {
    const scale = buildPaletteScale(DEFAULT_BRAND_HEX)!;
    const code = cssVariablesSnippet(scale);
    assert.equal(code.startsWith(":root {"), true);
    assert.match(code, /--color-brand-50: #f4f6fb;/);
    assert.match(code, /--color-brand-950: #0b1e3c;/);
  });
});
