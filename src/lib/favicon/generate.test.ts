import assert from "node:assert/strict";
import test from "node:test";
import { FAVICON_HTML_TAGS, FAVICON_SIZES, buildIco, isAcceptedFaviconImage } from "./generate";

test("accepts png, jpg, and webp uploads", () => {
  assert.equal(isAcceptedFaviconImage({ type: "image/png" } as File), true);
  assert.equal(isAcceptedFaviconImage({ type: "image/jpeg" } as File), true);
  assert.equal(isAcceptedFaviconImage({ type: "image/webp" } as File), true);
  assert.equal(isAcceptedFaviconImage({ type: "image/gif" } as File), false);
});

test("builds a valid multi-image ico header", () => {
  const ico = buildIco([
    { size: 16, data: new Uint8Array([1, 2, 3]) },
    { size: 32, data: new Uint8Array([4, 5, 6, 7]) },
  ]);
  const view = new DataView(ico.buffer);
  assert.equal(view.getUint16(0, true), 0);
  assert.equal(view.getUint16(2, true), 1);
  assert.equal(view.getUint16(4, true), 2);
  assert.equal(ico[6], 16);
  assert.equal(ico[22], 32);
  assert.equal(ico.length, 6 + 16 * 2 + 3 + 4);
});

test("exports standard favicon sizes and html tags", () => {
  assert.deepEqual(FAVICON_SIZES, [16, 32, 180, 192, 512]);
  assert.match(FAVICON_HTML_TAGS, /favicon\.ico/);
  assert.match(FAVICON_HTML_TAGS, /apple-touch-icon/);
  assert.match(FAVICON_HTML_TAGS, /android-chrome-512x512\.png/);
});
