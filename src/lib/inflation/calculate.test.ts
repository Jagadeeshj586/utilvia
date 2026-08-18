import assert from "node:assert/strict";
import test from "node:test";
import { calculateInflation } from "./calculate";

test("matches WorkUtilities USD defaults (100000, 10y, 3.2%)", () => {
  const result = calculateInflation({
    amount: 100_000,
    years: 10,
    inflationRatePercent: 3.2,
  });
  assert.ok(result);
  assert.equal(result.futureValue, 137_024);
  assert.equal(result.pastValue, 72_980);
  assert.equal(result.purchasingPowerLoss, 27);
});

test("matches WorkUtilities INR defaults (100000, 10y, 6.5%)", () => {
  const result = calculateInflation({
    amount: 100_000,
    years: 10,
    inflationRatePercent: 6.5,
  });
  assert.ok(result);
  assert.equal(result.futureValue, 187_714);
  assert.equal(result.pastValue, 53_273);
  assert.equal(result.purchasingPowerLoss, 46.7);
});

test("returns null for invalid inputs", () => {
  assert.equal(calculateInflation({ amount: -1, years: 10, inflationRatePercent: 6.5 }), null);
  assert.equal(calculateInflation({ amount: 1000, years: -1, inflationRatePercent: 6.5 }), null);
  assert.equal(calculateInflation({ amount: 1000, years: 10, inflationRatePercent: -1 }), null);
});
