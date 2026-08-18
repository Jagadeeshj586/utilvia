import assert from "node:assert/strict";
import test from "node:test";
import { calculateGratuity, roundYearsForFormula } from "./calculate";
import { MAX_GRATUITY_LIMIT } from "./rules";

test("matches WorkUtilities default (₹50,000, 10 years, covered)", () => {
  const result = calculateGratuity({ salary: 50_000, yearsOfService: 10, coveredUnderAct: true });
  assert.ok(result);
  assert.equal(result.gratuityAmount, 288_462);
  assert.equal(result.roundedYears, 10);
  assert.equal(result.formula, "(15 × Salary × Years) / 26");
  assert.equal(result.capApplied, false);
  assert.equal(result.eligibleByYears, true);
});

test("matches WorkUtilities decimal year rounding", () => {
  assert.equal(roundYearsForFormula(10.5), 11);
  assert.equal(roundYearsForFormula(10.4), 10);

  const roundedUp = calculateGratuity({ salary: 50_000, yearsOfService: 10.5, coveredUnderAct: true });
  assert.ok(roundedUp);
  assert.equal(roundedUp.gratuityAmount, 317_308);
  assert.equal(roundedUp.roundedYears, 11);

  const notRounded = calculateGratuity({ salary: 50_000, yearsOfService: 10.4, coveredUnderAct: true });
  assert.ok(notRounded);
  assert.equal(notRounded.gratuityAmount, 288_462);
  assert.equal(notRounded.roundedYears, 10);
});

test("uses divisor 30 when not covered under the Act", () => {
  const result = calculateGratuity({ salary: 50_000, yearsOfService: 10, coveredUnderAct: false });
  assert.ok(result);
  assert.equal(result.gratuityAmount, 250_000);
  assert.equal(result.formula, "(15 × Salary × Years) / 30");
});

test("caps gratuity at the tax-free limit", () => {
  const result = calculateGratuity({ salary: 2_00_000, yearsOfService: 20, coveredUnderAct: true });
  assert.ok(result);
  assert.equal(result.calculatedBeforeCap, 2_307_692);
  assert.equal(result.gratuityAmount, MAX_GRATUITY_LIMIT);
  assert.equal(result.capApplied, true);
});

test("flags eligibility below 5 years but still calculates", () => {
  const result = calculateGratuity({ salary: 50_000, yearsOfService: 4, coveredUnderAct: true });
  assert.ok(result);
  assert.equal(result.eligibleByYears, false);
  assert.equal(result.gratuityAmount, 115_385);
});

test("returns null for invalid inputs", () => {
  assert.equal(calculateGratuity({ salary: 0, yearsOfService: 10, coveredUnderAct: true }), null);
  assert.equal(calculateGratuity({ salary: 50_000, yearsOfService: -1, coveredUnderAct: true }), null);
});
