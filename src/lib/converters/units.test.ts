import assert from "node:assert/strict";
import test from "node:test";
import { allConversions, convertUnits, formatUnitValue, parseUnitInput } from "./units";

test("parses comma-formatted input", () => {
  assert.equal(parseUnitInput("1,000"), 1000);
  assert.equal(parseUnitInput("1.5"), 1.5);
});

test("converts length like WorkUtilities defaults", () => {
  assert.equal(convertUnits(1, "km", "m", "length"), 1000);
  assert.ok(Math.abs((convertUnits(1, "km", "mi", "length") ?? 0) - 0.621371) < 1e-5);
});

test("converts temperature through Celsius base", () => {
  assert.equal(convertUnits(0, "c", "f", "temperature"), 32);
  assert.equal(convertUnits(100, "c", "k", "temperature"), 373.15);
  assert.ok(Math.abs((convertUnits(32, "f", "c", "temperature") ?? 0) - 0) < 1e-9);
});

test("lists all conversions for the active category", () => {
  const rows = allConversions(1, "km", "length");
  assert.equal(rows.length, 6);
  assert.equal(rows.find((row) => row.unit.id === "m")?.value, 1000);
});

test("formats with en-IN style thresholds", () => {
  assert.equal(formatUnitValue(1000, "length"), "1,000");
  assert.match(formatUnitValue(32.4567, "temperature"), /^32\.46$/);
});
