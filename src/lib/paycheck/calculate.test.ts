import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PAYCHECK_DEFAULTS,
  calculateFederalTax,
  calculateFica,
  calculatePaycheck,
  resolveGrossAnnual,
} from "./calculate";

const approx = (actual: number, expected: number, tolerance = 1) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ~${expected}, got ${actual}`);
};

describe("resolveGrossAnnual", () => {
  it("uses annual salary in annual mode", () => {
    assert.equal(resolveGrossAnnual({ ...PAYCHECK_DEFAULTS, mode: "annual", annualSalary: 85_000 }), 85_000);
  });

  it("converts hourly to annual", () => {
    approx(
      resolveGrossAnnual({
        ...PAYCHECK_DEFAULTS,
        mode: "hourly",
        hourlyRate: 40.87,
        hoursPerWeek: 40,
        weeksPerYear: 52,
      }),
      85_009.6,
      1,
    );
  });
});

describe("calculateFederalTax", () => {
  it("matches the WorkUtilities $85k single example taxable income", () => {
    // 85000 - 16100 standard deduction = 68900
    const { tax, marginalRate } = calculateFederalTax(68_900, "single");
    approx(tax, 9_870, 1);
    assert.equal(marginalRate, 0.22);
  });
});

describe("calculateFica", () => {
  it("applies SS and Medicare on $85k", () => {
    const result = calculateFica(85_000, "single");
    approx(result.socialSecurity, 5_270, 1);
    approx(result.medicare, 1_232.5, 0.5);
    assert.equal(result.additionalMedicare, 0);
  });

  it("caps Social Security at the wage base", () => {
    const result = calculateFica(200_000, "single");
    approx(result.socialSecurity, 184_500 * 0.062, 1);
  });
});

describe("calculatePaycheck", () => {
  it("matches WorkUtilities biweekly FL $85k single defaults", () => {
    const result = calculatePaycheck({
      ...PAYCHECK_DEFAULTS,
      country: "US",
      annualSalary: 85_000,
      frequency: "biweekly",
      filingStatus: "single",
      stateCode: "FL",
    });
    assert.ok(result);
    approx(result.grossPerPeriod, 3_269.23, 0.05);
    approx(result.federalTax, 9_870, 1);
    approx(result.socialSecurity, 5_270, 1);
    approx(result.medicare, 1_232.5, 0.5);
    assert.equal(result.stateTax, 0);
    approx(result.netAnnual, 68_628, 2);
    approx(result.netPerPeriod, 2_639.52, 0.1);
    assert.equal(result.marginalFederalRate, 0.22);
    assert.equal(result.federalTaxableIncome, 68_900);
  });

  it("uses India FY 2025-26 new-regime tax, EPF, and professional tax", () => {
    const result = calculatePaycheck({
      ...PAYCHECK_DEFAULTS,
      country: "IN",
      annualSalary: 1_200_000,
      frequency: "monthly",
      stateCode: "KA",
      contribution401kPercent: 12,
    });
    assert.ok(result);
    assert.equal(result.currency, "INR");
    assert.equal(result.incomeTax, 0);
    approx(result.socialTotal, 72_000, 1);
    assert.equal(result.regionalTax, 2_400);
    approx(result.netAnnual, 1_125_600, 1);
  });

  it("uses UK PAYE and Class 1 NI for England", () => {
    const result = calculatePaycheck({
      ...PAYCHECK_DEFAULTS,
      country: "GB",
      annualSalary: 45_000,
      frequency: "monthly",
      stateCode: "ENG",
      contribution401kPercent: 5,
    });
    assert.ok(result);
    assert.equal(result.currency, "GBP");
    approx(result.incomeTax, 6_036, 1);
    approx(result.socialTotal, 2_414.4, 1);
    approx(result.netAnnual, 34_299.6, 2);
  });

  it("treats UAE salary as untaxed", () => {
    const result = calculatePaycheck({
      ...PAYCHECK_DEFAULTS,
      country: "AE",
      annualSalary: 240_000,
      frequency: "monthly",
      contribution401kPercent: 0,
    });
    assert.ok(result);
    assert.equal(result.incomeTax, 0);
    assert.equal(result.socialTotal, 0);
    assert.equal(result.netAnnual, 240_000);
  });
});
