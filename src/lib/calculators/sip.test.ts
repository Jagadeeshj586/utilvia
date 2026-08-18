import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SIP_LIMITS,
  calculateSIP,
  calculateStandardSIP,
  calculateStepUpSIP,
  clampSipInput,
  sipFutureValue,
  validateSipInput,
} from "./sip";

const approx = (actual: number, expected: number, tolerance = 2) => {
  assert.ok(Number.isFinite(actual), `expected finite number, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ~${expected}, got ${actual}`);
};

describe("sipFutureValue", () => {
  it("matches the standard 10k / 12% / 10y example", () => {
    const fv = sipFutureValue(10_000, 0.01, 120);
    approx(fv, 23_23_391, 2);
  });

  it("returns P × n when monthly rate is 0", () => {
    assert.equal(sipFutureValue(10_000, 0, 120), 12_00_000);
  });
});

describe("calculateStandardSIP", () => {
  it("1. standard SIP: ₹10,000, 12%, 10 years", () => {
    const result = calculateStandardSIP({ monthlyInvestment: 10_000, annualReturn: 12, years: 10 });
    assert.equal(result.totalInvested, 12_00_000);
    approx(result.futureValue, 23_23_391, 2);
    approx(result.estimatedReturns, 11_23_391, 2);
    assert.equal(result.months, 120);
    assert.equal(result.yearlyBreakdown.length, 10);
    assert.equal(result.yearlyBreakdown[0].invested, 1_20_000);
    approx(result.yearlyBreakdown[0].totalValue, 1_28_093, 2);
  });

  it("2. zero return", () => {
    const result = calculateSIP({ monthlyInvestment: 8_000, annualReturn: 0, years: 5 });
    assert.equal(result.futureValue, 8_000 * 60);
    assert.equal(result.estimatedReturns, 0);
    assert.equal(result.totalInvested, 4_80_000);
  });

  it("3. very low return", () => {
    const result = calculateSIP({ monthlyInvestment: 10_000, annualReturn: 0.1, years: 5 });
    assert.ok(result.futureValue > result.totalInvested);
    assert.ok(result.futureValue < 10_000 * 60 * 1.02);
  });

  it("4. high return", () => {
    const result = calculateSIP({ monthlyInvestment: 10_000, annualReturn: 30, years: 10 });
    assert.ok(result.futureValue > 50_00_000);
    assert.equal(result.totalInvested, 12_00_000);
  });

  it("5. one-year duration", () => {
    const result = calculateSIP({ monthlyInvestment: 10_000, annualReturn: 12, years: 1 });
    assert.equal(result.totalInvested, 1_20_000);
    assert.equal(result.yearlyBreakdown.length, 1);
    approx(result.futureValue, sipFutureValue(10_000, 0.01, 12), 0.01);
  });

  it("6. long duration", () => {
    const result = calculateSIP({ monthlyInvestment: 10_000, annualReturn: 12, years: 40 });
    assert.equal(result.totalInvested, 48_00_000);
    assert.equal(result.yearlyBreakdown.length, 40);
    assert.ok(result.futureValue > result.totalInvested);
  });

  it("7. minimum investment", () => {
    const result = calculateSIP({ monthlyInvestment: SIP_LIMITS.monthlyInvestment.min, annualReturn: 12, years: 10 });
    assert.equal(result.totalInvested, 500 * 120);
    assert.ok(result.futureValue > 0);
  });

  it("8. maximum investment", () => {
    const result = calculateSIP({ monthlyInvestment: SIP_LIMITS.monthlyInvestment.max, annualReturn: 12, years: 10 });
    assert.equal(result.totalInvested, 10_00_000 * 120);
  });

  it("9. decimal return", () => {
    const result = calculateSIP({ monthlyInvestment: 10_000, annualReturn: 12.5, years: 8 });
    assert.ok(Number.isFinite(result.futureValue));
    assert.ok(result.futureValue > result.totalInvested);
  });
});

describe("calculateStepUpSIP", () => {
  it("10. step-up SIP grows contributions each year", () => {
    const result = calculateStepUpSIP({
      monthlyInvestment: 10_000,
      annualReturn: 12,
      years: 3,
      stepUpEnabled: true,
      stepUpPercent: 10,
    });
    approx(result.yearlyBreakdown[0].monthlySip, 10_000, 0.01);
    approx(result.yearlyBreakdown[1].monthlySip, 11_000, 0.01);
    approx(result.yearlyBreakdown[2].monthlySip, 12_100, 0.01);
    assert.ok(result.totalInvested > 10_000 * 36);
    assert.ok(result.futureValue > result.totalInvested);
  });

  it("step-up at 0% matches standard SIP", () => {
    const standard = calculateStandardSIP({ monthlyInvestment: 10_000, annualReturn: 12, years: 10 });
    const step = calculateStepUpSIP({
      monthlyInvestment: 10_000,
      annualReturn: 12,
      years: 10,
      stepUpEnabled: true,
      stepUpPercent: 0,
    });
    approx(step.futureValue, standard.futureValue, 1);
    approx(step.totalInvested, standard.totalInvested, 0.01);
  });

  it("calculateSIP uses standard formula when step-up is off", () => {
    const result = calculateSIP({ monthlyInvestment: 10_000, annualReturn: 12, years: 10, stepUpEnabled: false });
    assert.equal(result.mode, "standard");
    approx(result.futureValue, 23_23_391, 2);
  });
});

describe("validation and bounds", () => {
  it("11. invalid input", () => {
    const errors = validateSipInput({ monthlyInvestment: 100, annualReturn: -1, years: 0 });
    assert.ok(errors.monthlyInvestment);
    assert.ok(errors.annualReturn);
    assert.ok(errors.years);
  });

  it("12. boundary values", () => {
    const minOk = validateSipInput({ monthlyInvestment: 500, annualReturn: 0, years: 1 });
    const maxOk = validateSipInput({ monthlyInvestment: 10_00_000, annualReturn: 30, years: 40 });
    assert.deepEqual(minOk, {});
    assert.deepEqual(maxOk, {});
    const clamped = clampSipInput({ monthlyInvestment: -50, annualReturn: 99, years: 100 });
    assert.equal(clamped.monthlyInvestment, 500);
    assert.equal(clamped.annualReturn, 30);
    assert.equal(clamped.years, 40);
  });

  it("never returns NaN or Infinity", () => {
    const samples = [
      calculateSIP({ monthlyInvestment: 10_000, annualReturn: 0, years: 1 }),
      calculateSIP({ monthlyInvestment: 10_00_000, annualReturn: 30, years: 40 }),
      calculateStepUpSIP({ monthlyInvestment: 500, annualReturn: 0, years: 2, stepUpPercent: 15 }),
    ];
    for (const result of samples) {
      assert.ok(Number.isFinite(result.futureValue));
      assert.ok(Number.isFinite(result.totalInvested));
      assert.ok(Number.isFinite(result.estimatedReturns));
      assert.ok(result.futureValue >= 0);
    }
  });
});
