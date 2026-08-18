import assert from "node:assert/strict";
import test from "node:test";
import {
  cmykToRgb,
  formatsFromHex,
  formatsFromHsv,
  hexToRgb,
  hslToRgb,
  normalizeHex,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  validateHex,
} from "./conversion";

test("normalizes short and long hex", () => {
  assert.equal(normalizeHex("#fff"), "#ffffff");
  assert.equal(normalizeHex("6366F1"), "#6366f1");
  assert.equal(normalizeHex("#GGGGGG"), null);
});

test("round trips primary colors", () => {
  for (const hex of ["#ff0000", "#00ff00", "#0000ff", "#ffffff", "#000000"]) {
    const rgb = hexToRgb(hex)!;
    assert.equal(rgbToHex(rgb.r, rgb.g, rgb.b), hex);
  }
});

test("converts rgb hsl hsv cmyk consistently", () => {
  const rgb = { r: 99, g: 102, b: 241 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const back = hslToRgb(hsl.h, hsl.s, hsl.l);
  assert.ok(Math.abs(back.r - rgb.r) <= 1);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const formats = formatsFromHsv(hsv.h, hsv.s, hsv.v);
  assert.equal(formats.hex, "#6366f1");
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const fromCmyk = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
  assert.ok(Math.abs(fromCmyk.r - rgb.r) <= 2);
});

test("formats from hex include alpha channel", () => {
  const formats = formatsFromHex("#6366f1", 0.5)!;
  assert.equal(formats.alpha, 0.5);
  assert.match(formats.hex, /^#[0-9a-f]{8}$/);
});

test("validation rejects invalid hex", () => {
  assert.equal(validateHex("#12345"), false);
  assert.equal(validateHex("#123456"), true);
});
