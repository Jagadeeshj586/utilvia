import assert from "node:assert/strict";
import test from "node:test";
import { calculateEpf } from "./calculate";

const WU_DEFAULT = {
  basicSalaryMonthly: 30_000,
  currentAge: 25,
  retirementAge: 58,
  currentBalance: 50_000,
  annualIncrementPercent: 5,
  interestRatePercent: 8.25,
};

test("matches WorkUtilities default maturity breakdown", () => {
  const result = calculateEpf(WU_DEFAULT);
  assert.ok(result);
  assert.equal(result.maturityAmount, 17_405_777);
  assert.equal(result.employeeContribution, 3_458_755);
  assert.equal(result.employerContribution, 1_057_803);
  assert.equal(result.interestEarned, 12_839_219);
});

test("matches WorkUtilities year-by-year balances", () => {
  const result = calculateEpf(WU_DEFAULT);
  assert.ok(result);
  assert.equal(result.yearly.length, 33);
  assert.equal(result.yearly[0]?.balance, 113_282);
  assert.equal(result.yearly[6]?.balance, 702_086);
  assert.equal(result.yearly[32]?.balance, 17_405_777);
});

test("returns null when retirement age is not after current age", () => {
  assert.equal(calculateEpf({ ...WU_DEFAULT, currentAge: 58, retirementAge: 58 }), null);
});

test("handles zero increment and zero interest", () => {
  const result = calculateEpf({
    ...WU_DEFAULT,
    currentBalance: 0,
    annualIncrementPercent: 0,
    interestRatePercent: 0,
    retirementAge: 26,
  });
  assert.ok(result);
  const monthly = 30_000 * (0.12 + 0.0367);
  assert.equal(result.maturityAmount, Math.round(monthly * 12));
});
