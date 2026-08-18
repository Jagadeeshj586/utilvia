import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_RD_INPUT,
  calculateRd,
  installmentFormulaMaturity,
  validateRd,
} from "./calculate";

describe("installmentFormulaMaturity", () => {
  it("matches the classic Indian quarterly RD formula", () => {
    const monthly = 5_000;
    const months = 12;
    const rate = 7;
    const i = rate / 400;
    const expected = (monthly * (Math.pow(1 + i, months / 3) - 1)) / (1 - Math.pow(1 + i, -1 / 3));
    const actual = installmentFormulaMaturity(monthly, months, rate, 4);
    assert.ok(Math.abs(actual - expected) < 1e-6);
  });

  it("returns principal only when the rate is 0", () => {
    assert.equal(installmentFormulaMaturity(5_000, 12, 0, 4), 60_000);
  });
});

describe("calculateRd", () => {
  it("computes default 12-month quarterly RD", () => {
    const result = calculateRd(DEFAULT_RD_INPUT);
    assert.ok(result);
    assert.equal(result.months, 12);
    assert.equal(result.totalDeposited, 60_000);
    assert.equal(result.schedule.length, 12);
    assert.ok(result.maturityAmount > result.totalDeposited);
    assert.equal(result.interestEarned, result.maturityAmount - result.totalDeposited);
    const closed = installmentFormulaMaturity(5_000, 12, 7, 4);
    assert.equal(result.maturityAmount, Math.round(closed));
  });

  it("builds a year-by-year table for multi-year tenure", () => {
    const result = calculateRd({ ...DEFAULT_RD_INPUT, tenureValue: 2, tenureUnit: "years" });
    assert.ok(result);
    assert.equal(result.months, 24);
    assert.equal(result.yearly.length, 2);
    assert.equal(result.yearly[0]!.invested, 60_000);
    assert.equal(result.yearly[1]!.invested, 120_000);
    assert.ok(result.yearly[1]!.balance > result.yearly[0]!.balance);
  });

  it("accepts tenure in months", () => {
    const result = calculateRd({ ...DEFAULT_RD_INPUT, tenureValue: 18, tenureUnit: "months" });
    assert.ok(result);
    assert.equal(result.months, 18);
    assert.equal(result.totalDeposited, 90_000);
  });

  it("credits interest only at compounding dates in period-credit mode", () => {
    const result = calculateRd({
      ...DEFAULT_RD_INPUT,
      method: "period-credit",
      compounding: "quarterly",
    });
    assert.ok(result);
    assert.equal(result.schedule[0]!.interestCredited, 0);
    assert.equal(result.schedule[1]!.interestCredited, 0);
    assert.ok(result.schedule[2]!.interestCredited > 0);
  });

  it("monthly compounding earns more than yearly at the same rate", () => {
    const monthly = calculateRd({ ...DEFAULT_RD_INPUT, compounding: "monthly", tenureValue: 5 });
    const yearly = calculateRd({ ...DEFAULT_RD_INPUT, compounding: "yearly", tenureValue: 5 });
    assert.ok(monthly && yearly);
    assert.ok(monthly.maturityAmount > yearly.maturityAmount);
  });

  it("rejects tenure below 6 months", () => {
    const errors = validateRd({ ...DEFAULT_RD_INPUT, tenureValue: 3, tenureUnit: "months" });
    assert.ok(errors.tenureValue);
  });

  it("rejects a monthly deposit below the minimum", () => {
    const errors = validateRd({ ...DEFAULT_RD_INPUT, monthlyDeposit: 50 });
    assert.ok(errors.monthlyDeposit);
    assert.equal(calculateRd({ ...DEFAULT_RD_INPUT, monthlyDeposit: 50 }), null);
  });
});
