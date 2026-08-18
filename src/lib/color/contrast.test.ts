import assert from "node:assert/strict";
import test from "node:test";
import {
  contrastRatio,
  formatContrastRatio,
  wcagBadges,
  wcagResults,
} from "./contrast";

test("black on white matches WorkUtilities 21.00:1", () => {
  const ratio = contrastRatio("#000000", "#FFFFFF");
  assert.ok(ratio);
  assert.equal(formatContrastRatio(ratio), "21.00:1");
  assert.deepEqual(wcagResults(ratio), {
    normalAA: "pass",
    normalAAA: "pass",
    largeAA: "pass",
    largeAAA: "pass",
  });
});

test("#777777 on white matches WorkUtilities 4.48:1 thresholds", () => {
  const ratio = contrastRatio("#777777", "#FFFFFF");
  assert.ok(ratio);
  assert.equal(formatContrastRatio(ratio), "4.48:1");
  assert.deepEqual(wcagResults(ratio), {
    normalAA: "fail",
    normalAAA: "fail",
    largeAA: "pass",
    largeAAA: "fail",
  });
});

test("wcagBadges order matches WorkUtilities labels", () => {
  const badges = wcagBadges(21);
  assert.deepEqual(
    badges.map((item) => item.label),
    ["AA Normal", "AA Large", "AAA Normal", "AAA Large"],
  );
});

test("contrastRatio accepts 3-digit hex", () => {
  assert.equal(formatContrastRatio(contrastRatio("#000", "#fff")!), "21.00:1");
});

test("invalid colors return null", () => {
  assert.equal(contrastRatio("not-a-color", "#fff"), null);
});
