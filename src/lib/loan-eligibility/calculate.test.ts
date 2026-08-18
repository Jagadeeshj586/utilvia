import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateLoanEligibility,
  defaultsFromCountry,
  getLoanCountry,
  hasLoanErrors,
  monthlyPayment,
  principalFromPayment,
  qualifyingRatePercent,
  ratioCaps,
  toMonthlyIncome,
  validateLoanEligibility,
} from "./calculate";
import { getLoanType } from "./countries";

describe("payment math", () => {
  it("round-trips payment and principal", () => {
    const principal = 20_000;
    const payment = monthlyPayment(principal, 11, 5);
    const back = principalFromPayment(payment, 11, 5);
    assert.ok(Math.abs(back - principal) < 1);
  });

  it("handles a zero rate", () => {
    assert.equal(monthlyPayment(12_000, 0, 1), 1_000);
    assert.equal(principalFromPayment(1_000, 0, 1), 12_000);
  });
});

describe("income and caps", () => {
  it("converts annual income to monthly", () => {
    assert.equal(toMonthlyIncome(120_000, "annual"), 10_000);
    assert.equal(toMonthlyIncome(80_000, "monthly"), 80_000);
  });

  it("tightens UAE ratio without salary transfer", () => {
    const uae = getLoanCountry("AE");
    assert.equal(ratioCaps(uae, true).eligible, 0.5);
    assert.equal(ratioCaps(uae, false).eligible, 0.4);
  });

  it("applies the Canadian mortgage stress test", () => {
    const canada = getLoanCountry("CA");
    const home = getLoanType(canada, "home");
    assert.equal(qualifyingRatePercent(home, 5.2), Math.max(7.2, 5.25));
    assert.ok(qualifyingRatePercent(home, 3) >= 5.25);
  });
});

describe("calculateLoanEligibility", () => {
  it("marks a typical US personal loan as eligible", () => {
    const country = getLoanCountry("US");
    const result = calculateLoanEligibility(defaultsFromCountry(country, "personal"));
    assert.equal(result.status, "eligible");
    assert.ok(result.eligibleLoanAmount > result.requestedAmount);
    assert.ok(result.ratioPercent < result.eligibleRatioPercent);
  });

  it("marks high DTI as not eligible", () => {
    const country = getLoanCountry("US");
    const input = defaultsFromCountry(country, "personal");
    input.existingDebt = 6_000;
    input.requestedAmount = 40_000;
    const result = calculateLoanEligibility(input);
    assert.equal(result.status, "not");
  });

  it("haircuts self-employed income", () => {
    const country = getLoanCountry("US");
    const w2 = calculateLoanEligibility(defaultsFromCountry(country, "personal"));
    const self = defaultsFromCountry(country, "personal");
    self.employmentId = "self";
    const selfResult = calculateLoanEligibility(self);
    assert.ok(selfResult.eligibleLoanAmount < w2.eligibleLoanAmount);
    assert.ok(selfResult.factors.some((factor) => /80%/.test(factor.detail)));
  });

  it("uses CIBIL and FOIR labels for India", () => {
    const country = getLoanCountry("IN");
    const result = calculateLoanEligibility(defaultsFromCountry(country, "personal"));
    assert.ok(result.factors.some((factor) => /FOIR/.test(factor.label)));
    assert.ok(result.factors.some((factor) => /CIBIL/.test(factor.label)));
  });

  it("sizes Canadian mortgages at the stress rate", () => {
    const country = getLoanCountry("CA");
    const input = defaultsFromCountry(country, "home");
    const result = calculateLoanEligibility(input);
    assert.ok(result.qualifyingRate > result.quotedRate);
    const unstressed = principalFromPayment(result.maxAffordablePayment, result.quotedRate, input.termYears);
    assert.ok(result.eligibleLoanAmount < unstressed);
  });

  it("treats a very low credit score as not eligible", () => {
    const country = getLoanCountry("US");
    const input = defaultsFromCountry(country, "personal");
    input.creditScore = 500;
    const result = calculateLoanEligibility(input);
    assert.equal(result.status, "not");
  });
});

describe("validateLoanEligibility", () => {
  it("rejects missing income and out-of-range terms", () => {
    const country = getLoanCountry("US");
    const input = defaultsFromCountry(country, "personal");
    input.income = 0;
    input.termYears = 40;
    const errors = validateLoanEligibility(input);
    assert.equal(hasLoanErrors(errors), true);
    assert.match(errors.income ?? "", /greater than 0/i);
    assert.match(errors.termYears ?? "", /between/i);
  });
});
