import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateAspectRatio,
  calculateGcd,
  calculateHeight,
  calculateWidth,
  formatDecimal,
  parseDimension,
  simplifyRatio,
} from "./calculate";

test("calculates gcd", () => {
  assert.equal(calculateGcd(1920, 1080), 120);
  assert.equal(calculateGcd(1280, 720), 80);
});

test("simplifies common ratios", () => {
  assert.deepEqual(simplifyRatio(1920, 1080), { w: 16, h: 9, label: "16:9" });
  assert.deepEqual(simplifyRatio(1280, 720), { w: 16, h: 9, label: "16:9" });
  assert.deepEqual(simplifyRatio(1440, 1080), { w: 4, h: 3, label: "4:3" });
  assert.deepEqual(simplifyRatio(1080, 1080), { w: 1, h: 1, label: "1:1" });
  assert.deepEqual(simplifyRatio(800, 600), { w: 4, h: 3, label: "4:3" });
});

test("calculates aspect ratio details", () => {
  const result = calculateAspectRatio(1920, 1080);
  assert.equal(result.simplified, "16:9");
  assert.equal(formatDecimal(result.decimal), "1.7778");
});

test("calculates target height and width", () => {
  assert.equal(calculateHeight(1920, 1080, 1280), 720);
  assert.equal(calculateWidth(1920, 1080, 720), 1280);
});

test("validates dimensions", () => {
  assert.equal(parseDimension("1920").value, 1920);
  assert.equal(parseDimension("0").error, "Enter a value greater than 0.");
  assert.equal(parseDimension("-5").error, "Enter a value greater than 0.");
  assert.equal(parseDimension("abc").error, "Enter a valid number.");
});
