import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_SHADOW,
  SHADOW_LIMITS,
  addLayer,
  boxShadowValue,
  cloneShadow,
  formatLayer,
  generateShadowCss,
  matchPresetId,
  moveLayer,
  parseLayerColor,
  removeLayer,
  updateLayer,
} from "./shadow";

describe("formatLayer", () => {
  it("formats the default outer shadow", () => {
    assert.equal(
      formatLayer(DEFAULT_SHADOW.layers[0]!, "hex"),
      "0px 8px 24px 0px #1414131f",
    );
    assert.equal(
      formatLayer(DEFAULT_SHADOW.layers[0]!, "rgb"),
      "0px 8px 24px 0px rgba(20, 20, 19, 0.12)",
    );
  });

  it("prefixes inset shadows", () => {
    const css = formatLayer({ ...DEFAULT_SHADOW.layers[0]!, inset: true }, "rgb");
    assert.equal(css.startsWith("inset "), true);
  });
});

describe("generateShadowCss", () => {
  it("emits a single-line rule for one layer", () => {
    const css = generateShadowCss({ ...DEFAULT_SHADOW, colorFormat: "rgb" });
    assert.equal(css, ".element {\n  box-shadow: 0px 8px 24px 0px rgba(20, 20, 19, 0.12);\n}\n");
  });

  it("breaks multiple layers onto separate lines", () => {
    const added = addLayer(DEFAULT_SHADOW);
    assert.ok(!("error" in added));
    const css = generateShadowCss({ ...added, colorFormat: "rgb" });
    assert.match(css, /box-shadow:\n/);
    assert.match(css, /,\n/);
  });
});

describe("layer list", () => {
  it("adds, reorders, and refuses to remove the last layer", () => {
    const added = addLayer(DEFAULT_SHADOW);
    assert.ok(!("error" in added));
    assert.equal(added.layers.length, 2);

    const moved = moveLayer(added, added.layers[1]!.id, -1);
    assert.equal(moved.layers[0]!.id, added.layers[1]!.id);

    const removed = removeLayer(DEFAULT_SHADOW, DEFAULT_SHADOW.layers[0]!.id);
    assert.ok("error" in removed);
  });

  it("rejects more than the max layer count", () => {
    let config = cloneShadow();
    for (let index = 1; index < SHADOW_LIMITS.maxLayers; index += 1) {
      const next = addLayer(config);
      assert.ok(!("error" in next));
      config = next;
    }
    const overflow = addLayer(config);
    assert.ok("error" in overflow);
  });
});

describe("updateLayer", () => {
  it("clamps out-of-range offsets", () => {
    const next = updateLayer(DEFAULT_SHADOW, DEFAULT_SHADOW.layers[0]!.id, { offsetX: 400 });
    assert.equal(next.layers[0]!.offsetX, SHADOW_LIMITS.offset.max);
  });
});

describe("parseLayerColor", () => {
  it("accepts hex, rgb, and hsl", () => {
    assert.deepEqual(parseLayerColor("#cc785c"), { color: "#cc785c", opacity: 100 });
    assert.equal(parseLayerColor("rgba(204, 120, 92, 0.4)")?.opacity, 40);
    assert.equal(parseLayerColor("not-a-color"), null);
  });
});

describe("matchPresetId", () => {
  it("recognizes the default soft preset", () => {
    assert.equal(matchPresetId(DEFAULT_SHADOW), "soft");
  });
});

describe("boxShadowValue", () => {
  it("joins layers with commas", () => {
    const added = addLayer(DEFAULT_SHADOW);
    assert.ok(!("error" in added));
    const value = boxShadowValue({ ...added, colorFormat: "rgb" });
    assert.equal(value.includes(", "), true);
  });
});
