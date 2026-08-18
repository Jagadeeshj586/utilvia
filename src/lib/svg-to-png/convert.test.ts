import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSvgDimensions, resolveOutputSize } from "./convert";

describe("parseSvgDimensions", () => {
  it("reads viewBox size", () => {
    assert.deepEqual(
      parseSvgDimensions('<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"></svg>'),
      { width: 100, height: 50 },
    );
  });

  it("falls back to width/height attributes", () => {
    assert.deepEqual(
      parseSvgDimensions('<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg"></svg>'),
      { width: 200, height: 80 },
    );
  });

  it("defaults to 512×512", () => {
    assert.deepEqual(parseSvgDimensions("<svg xmlns='http://www.w3.org/2000/svg'></svg>"), {
      width: 512,
      height: 512,
    });
  });
});

describe("resolveOutputSize", () => {
  it("multiplies by scale", () => {
    assert.deepEqual(
      resolveOutputSize({
        baseWidth: 512,
        baseHeight: 512,
        scale: 2,
        customWidthEnabled: false,
        customWidth: "",
      }),
      { width: 1024, height: 1024 },
    );
  });

  it("uses custom width and preserves aspect ratio", () => {
    assert.deepEqual(
      resolveOutputSize({
        baseWidth: 200,
        baseHeight: 100,
        scale: 2,
        customWidthEnabled: true,
        customWidth: "400",
      }),
      { width: 400, height: 200 },
    );
  });

  it("ignores empty custom width", () => {
    assert.deepEqual(
      resolveOutputSize({
        baseWidth: 100,
        baseHeight: 50,
        scale: 4,
        customWidthEnabled: true,
        customWidth: "",
      }),
      { width: 400, height: 200 },
    );
  });
});
