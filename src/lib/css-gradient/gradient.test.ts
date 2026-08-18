import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_GRADIENT,
  addStop,
  cloneGradient,
  formatStopColor,
  generateCss,
  gradientFunction,
  interpolateAt,
  moveStop,
  parseColorInput,
  removeStop,
  sortStops,
  updateStop,
  validateGradient,
} from "./gradient";

describe("parseColorInput", () => {
  it("parses hex, rgb, and hsl", () => {
    assert.deepEqual(parseColorInput("#cc785c"), { color: "#cc785c", opacity: 1 });
    assert.deepEqual(parseColorInput("#c75"), { color: "#cc7755", opacity: 1 });
    assert.equal(parseColorInput("#cc785c80")?.opacity.toFixed(2), "0.50");
    assert.deepEqual(parseColorInput("rgb(204, 120, 92)"), { color: "#cc785c", opacity: 1 });
    assert.equal(parseColorInput("rgba(204, 120, 92, 0.4)")?.opacity, 0.4);
    const hsl = parseColorInput("hsl(14, 53%, 58%)");
    assert.ok(hsl);
    assert.equal(hsl.color.startsWith("#"), true);
  });

  it("rejects invalid colors", () => {
    assert.equal(parseColorInput("not-a-color"), null);
    assert.equal(parseColorInput("rgb(300, 0, 0)"), null);
  });
});

describe("CSS output", () => {
  it("builds a linear gradient with hex stops", () => {
    const css = generateCss(DEFAULT_GRADIENT);
    assert.equal(css, "background: linear-gradient(135deg, #cc785c 0%, #e8a55a 100%);");
  });

  it("uses rgba when opacity is below 1", () => {
    const config = cloneGradient();
    config.colorFormat = "rgb";
    config.stops[0].opacity = 0.5;
    assert.match(gradientFunction(config), /rgba\(204, 120, 92, 0\.5\) 0%/);
  });

  it("builds radial and conic functions", () => {
    const radial = cloneGradient();
    radial.type = "radial";
    radial.radialShape = "circle";
    radial.at = "top left";
    assert.equal(
      gradientFunction(radial),
      "radial-gradient(circle at top left, #cc785c 0%, #e8a55a 100%)",
    );

    const conic = cloneGradient();
    conic.type = "conic";
    conic.angle = 45;
    conic.at = "center";
    assert.equal(
      gradientFunction(conic),
      "conic-gradient(from 45deg at center, #cc785c 0%, #e8a55a 100%)",
    );
  });

  it("prefixes repeating gradients", () => {
    const config = cloneGradient();
    config.repeating = true;
    assert.match(gradientFunction(config), /^repeating-linear-gradient/);
  });

  it("sorts stops by position in the CSS", () => {
    const config = cloneGradient();
    config.stops = [
      { id: "b", color: "#e8a55a", opacity: 1, position: 100 },
      { id: "a", color: "#cc785c", opacity: 1, position: 0 },
    ];
    assert.equal(gradientFunction(config), "linear-gradient(135deg, #cc785c 0%, #e8a55a 100%)");
  });

  it("formats HSL stops", () => {
    const stop = { id: "s1", color: "#cc785c", opacity: 1, position: 0 };
    assert.match(formatStopColor(stop, "hsl"), /^hsl\(/);
  });
});

describe("stops", () => {
  it("adds a stop in the largest gap", () => {
    const result = addStop(DEFAULT_GRADIENT);
    assert.equal("error" in result, false);
    if ("error" in result) return;
    assert.equal(result.stops.length, 3);
    const added = sortStops(result.stops).find((stop) => stop.id !== "s1" && stop.id !== "s2");
    assert.ok(added);
    assert.ok(added.position > 0 && added.position < 100);
  });

  it("refuses fewer than two stops", () => {
    const result = removeStop(DEFAULT_GRADIENT, "s1");
    assert.deepEqual(result, { error: "Keep at least 2 color stops." });
  });

  it("updates position and keeps opacity when setting a 6-digit hex", () => {
    const faded = cloneGradient();
    faded.stops[0].opacity = 0.4;
    const next = updateStop(faded, "s1", { color: "#5db8a6", position: 12 });
    const stop = next.stops.find((item) => item.id === "s1")!;
    assert.equal(stop.color, "#5db8a6");
    assert.equal(stop.opacity, 0.4);
    assert.equal(stop.position, 12);
  });

  it("applies alpha from rgba input", () => {
    const next = updateStop(DEFAULT_GRADIENT, "s1", { color: "rgba(204, 120, 92, 0.25)" });
    assert.equal(next.stops[0].opacity, 0.25);
  });

  it("reorders by swapping positions", () => {
    const three = addStop(DEFAULT_GRADIENT, 50);
    assert.equal("error" in three, false);
    if ("error" in three) return;
    const mid = sortStops(three.stops)[1];
    const moved = moveStop(three, mid.id, 1);
    const sorted = sortStops(moved.stops);
    assert.equal(sorted[2].id, mid.id);
  });

  it("interpolates a mid color", () => {
    const mixed = interpolateAt(DEFAULT_GRADIENT.stops, 50);
    assert.equal(mixed.color.startsWith("#"), true);
    assert.notEqual(mixed.color, "#cc785c");
    assert.notEqual(mixed.color, "#e8a55a");
  });
});

describe("validateGradient", () => {
  it("flags an empty stop list", () => {
    const config = cloneGradient();
    config.stops = [];
    const errors = validateGradient(config);
    assert.match(errors.stops ?? "", /at least 2/i);
  });
});
