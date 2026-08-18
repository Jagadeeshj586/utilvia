import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_GLASS,
  GLASS_PRESETS,
  cloneGlass,
  generateGlassCss,
  generateGlassOutput,
  generateGlassTailwind,
  generateGlassVariables,
  glassBackground,
  glassBorder,
  glassFilter,
  glassShadow,
  matchPresetId,
} from "./glass";

describe("cloneGlass", () => {
  it("isolates copies from the default config", () => {
    const copy = cloneGlass();
    copy.blur = 99;
    assert.equal(DEFAULT_GLASS.blur, 12);
    assert.notEqual(copy, DEFAULT_GLASS);
  });
});

describe("generateGlassCss", () => {
  it("matches the default frosted-glass snippet", () => {
    const css = generateGlassCss(DEFAULT_GLASS);
    assert.match(css, /background: rgba\(255, 255, 255, 0\.15\);/);
    assert.match(css, /backdrop-filter: blur\(12px\) saturate\(150%\);/);
    assert.match(css, /-webkit-backdrop-filter: blur\(12px\) saturate\(150%\);/);
    assert.match(css, /border-radius: 16px;/);
    assert.match(css, /border: 1px solid rgba\(255, 255, 255, 0\.40\);/);
    assert.match(css, /box-shadow: 0 4px 25px rgba\(0, 0, 0, 0\.25\);/);
    assert.match(css, /@supports not \(backdrop-filter: blur\(1px\)\)/);
    assert.match(css, /background: rgba\(255, 255, 255, 0\.75\);/);
  });

  it("omits border and shadow when toggled off", () => {
    const css = generateGlassCss({
      ...DEFAULT_GLASS,
      borderEnabled: false,
      shadowEnabled: false,
    });
    assert.doesNotMatch(css, /\nborder:/);
    assert.doesNotMatch(css, /box-shadow:/);
  });
});

describe("generateGlassTailwind", () => {
  it("uses backdrop blur and white opacity utilities for the default tint", () => {
    const classes = generateGlassTailwind(DEFAULT_GLASS);
    assert.match(classes, /bg-white\/15/);
    assert.match(classes, /backdrop-blur-\[12px\]/);
    assert.match(classes, /backdrop-saturate-\[150%\]/);
    assert.match(classes, /rounded-\[16px\]/);
    assert.match(classes, /shadow-\[0_4px_25px_rgba\(0,0,0,0\.25\)\]/);
  });

  it("uses arbitrary background for a custom tint", () => {
    const classes = generateGlassTailwind({ ...DEFAULT_GLASS, tint: "#e8a55a" });
    assert.match(classes, /bg-\[rgba\(232,165,90,0\.15\)\]/);
  });
});

describe("generateGlassVariables", () => {
  it("emits tokens and a .glass consumer", () => {
    const css = generateGlassVariables(DEFAULT_GLASS);
    assert.match(css, /--glass-bg: rgba\(255, 255, 255, 0\.15\);/);
    assert.match(css, /--glass-blur: 12px;/);
    assert.match(css, /background: var\(--glass-bg\);/);
    assert.match(css, /border: var\(--glass-border\);/);
  });
});

describe("generateGlassOutput", () => {
  it("routes formats", () => {
    assert.equal(generateGlassOutput(DEFAULT_GLASS, "css"), generateGlassCss(DEFAULT_GLASS));
    assert.equal(generateGlassOutput(DEFAULT_GLASS, "tailwind"), generateGlassTailwind(DEFAULT_GLASS));
    assert.equal(generateGlassOutput(DEFAULT_GLASS, "variables"), generateGlassVariables(DEFAULT_GLASS));
  });
});

describe("presets", () => {
  it("includes six named starting points", () => {
    assert.equal(GLASS_PRESETS.length, 6);
    assert.deepEqual(
      GLASS_PRESETS.map((preset) => preset.id),
      ["default", "frosted-dark", "ice-teal", "warm-amber", "bold", "minimal"],
    );
  });

  it("matches the default preset to DEFAULT_GLASS", () => {
    assert.equal(matchPresetId(DEFAULT_GLASS), "default");
  });

  it("generates CSS for every preset", () => {
    for (const preset of GLASS_PRESETS) {
      const css = generateGlassCss(preset.config);
      assert.match(css, /\.glass \{/);
      assert.match(css, /backdrop-filter:/);
    }
  });
});

describe("helpers", () => {
  it("builds background, filter, border, and shadow", () => {
    assert.equal(glassBackground(DEFAULT_GLASS), "rgba(255, 255, 255, 0.15)");
    assert.equal(glassFilter(DEFAULT_GLASS), "blur(12px) saturate(150%)");
    assert.equal(glassBorder(DEFAULT_GLASS), "1px solid rgba(255, 255, 255, 0.40)");
    assert.equal(glassShadow(DEFAULT_GLASS), "0 4px 25px rgba(0, 0, 0, 0.25)");
    assert.equal(glassBorder({ ...DEFAULT_GLASS, borderEnabled: false }), "none");
    assert.equal(glassShadow({ ...DEFAULT_GLASS, shadowEnabled: false }), "none");
  });
});
