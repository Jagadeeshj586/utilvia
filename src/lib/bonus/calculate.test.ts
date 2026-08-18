import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BONUS_RULES, calculateBonus, DEFAULT_BONUS_INPUT } from "./calculate";

describe("statutory bonus", () => {
  it("matches the WorkUtilities default (₹15,000, 8.33%, 12 months)", () => {
    const result = calculateBonus(DEFAULT_BONUS_INPUT);
    assert.ok(result);
    assert.equal(result.eligible, true);
    assert.equal(result.calculationWage, 7_000);
    assert.equal(result.cappedAtCeiling, true);
    assert.equal(result.minimum, 6_997);
    assert.equal(result.yours, 6_997);
    assert.equal(result.maximum, 16_800);
  });

  it("uses actual salary when below the wage ceiling", () => {
    const result = calculateBonus({ monthlySalary: 5_000, ratePercent: 8.33, months: 12 });
    assert.ok(result);
    assert.equal(result.calculationWage, 5_000);
    assert.equal(result.cappedAtCeiling, false);
    assert.equal(result.minimum, 4_998);
    assert.equal(result.maximum, 12_000);
  });

  it("prorates for part-year employment", () => {
    const result = calculateBonus({ monthlySalary: 15_000, ratePercent: 20, months: 6 });
    assert.ok(result);
    assert.equal(result.yours, 8_400);
    assert.equal(result.maximum, 8_400);
  });

  it("flags salaries above ₹21,000 as ex-gratia only", () => {
    const result = calculateBonus({ monthlySalary: 25_000, ratePercent: 8.33, months: 12 });
    assert.ok(result);
    assert.equal(result.eligible, false);
    assert.equal(result.yours, 6_997);
  });

  it("treats ₹21,000 as still eligible", () => {
    const result = calculateBonus({ ...DEFAULT_BONUS_INPUT, monthlySalary: BONUS_RULES.eligibilityThreshold });
    assert.ok(result);
    assert.equal(result.eligible, true);
  });
});
