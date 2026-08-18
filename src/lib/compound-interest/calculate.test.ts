import assert from "node:assert/strict";
import test from "node:test";
import { calculateCompoundInterest } from "./calculate";

test("annual compounding with no contributions matches WorkUtilities", () => {
  const result = calculateCompoundInterest({
    principal: 100000,
    annualRatePercent: 8,
    years: 10,
    frequency: "annually",
    monthlyContribution: 0,
  });
  assert.ok(result);
  assert.equal(Math.round(result.finalAmount), 215892);
  assert.equal(Math.round(result.totalInterest), 115892);
  assert.equal(result.totalContributions, 100000);
});

test("annual compounding with monthly contributions matches WorkUtilities", () => {
  const result = calculateCompoundInterest({
    principal: 100000,
    annualRatePercent: 8,
    years: 10,
    frequency: "annually",
    monthlyContribution: 5000,
  });
  assert.ok(result);
  assert.equal(Math.round(result.finalAmount), 1085086);
  assert.equal(Math.round(result.totalInterest), 385086);
  assert.equal(result.totalContributions, 700000);
  assert.equal(Math.round(result.yearly[0].amount), 168000);
  assert.equal(Math.round(result.yearly[9].amount), 1085086);
});

test("monthly compounding with contributions matches WorkUtilities", () => {
  const result = calculateCompoundInterest({
    principal: 100000,
    annualRatePercent: 8,
    years: 10,
    frequency: "monthly",
    monthlyContribution: 5000,
  });
  assert.ok(result);
  assert.equal(Math.round(result.finalAmount), 1103637);
  assert.equal(Math.round(result.totalInterest), 403637);
  assert.equal(result.totalContributions, 700000);
  assert.equal(Math.round(result.yearly[0].amount), 168300);
  assert.equal(Math.round(result.yearly[1].amount), 242269);
  assert.equal(Math.round(result.yearly[9].amount), 1103637);
});

test("zero rate returns principal plus contributions", () => {
  const result = calculateCompoundInterest({
    principal: 10000,
    annualRatePercent: 0,
    years: 5,
    frequency: "monthly",
    monthlyContribution: 1000,
  });
  assert.ok(result);
  assert.equal(result.finalAmount, 10000 + 1000 * 12 * 5);
  assert.equal(result.totalInterest, 0);
});

test("rejects invalid years", () => {
  assert.equal(
    calculateCompoundInterest({
      principal: 10000,
      annualRatePercent: 8,
      years: 0,
      frequency: "annually",
    }),
    null,
  );
});
