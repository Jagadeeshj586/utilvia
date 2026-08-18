import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SELF_EMPLOYMENT_COUNTRIES,
  calculateSelfEmployment,
  defaultsFromCountry,
  getSelfEmploymentCountry,
  validateSelfEmployment,
} from "./calculate";

const approx = (actual: number, expected: number, tolerance = 1) => {
  assert.ok(Number.isFinite(actual), `expected finite, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ~${expected}, got ${actual}`);
};

describe("country catalog", () => {
  it("lists six countries with local self-employment labels", () => {
    assert.deepEqual(
      SELF_EMPLOYMENT_COUNTRIES.map((country) => country.code),
      ["US", "IN", "GB", "CA", "AU", "AE"],
    );
    assert.equal(getSelfEmploymentCountry("US").labels.social, "Self-employment tax");
    assert.equal(getSelfEmploymentCountry("GB").labels.social, "National Insurance (Class 4)");
    assert.equal(getSelfEmploymentCountry("AU").labels.pageTitle, "Sole Trader Tax & Medicare");
    assert.equal(getSelfEmploymentCountry("IN").labels.pageTitle, "Self-Employed / Independent Professional Tax");
  });
});

describe("calculateSelfEmployment", () => {
  it("US: SE tax is 15.3% of 92.35% of $80k profit", () => {
    const result = calculateSelfEmployment(defaultsFromCountry(getSelfEmploymentCountry("US")));
    assert.ok(result);
    approx(result.socialTax, 80_000 * 0.9235 * 0.153, 1);
    assert.ok(result.incomeTax > 0);
    assert.ok(result.netAnnual < 80_000);
    approx(result.netMonthly, result.netAnnual / 12, 0.01);
  });

  it("reduces US SE tax when expenses are entered", () => {
    const base = defaultsFromCountry(getSelfEmploymentCountry("US"));
    const without = calculateSelfEmployment(base);
    const withExpenses = calculateSelfEmployment({ ...base, expenses: 10_000 });
    assert.ok(without && withExpenses);
    assert.ok(withExpenses.socialTax < without.socialTax);
    assert.ok(withExpenses.profit < without.profit);
  });

  it("India: ₹12 lakh professional receipts stay within the rebate band", () => {
    const result = calculateSelfEmployment(defaultsFromCountry(getSelfEmploymentCountry("IN")));
    assert.ok(result);
    assert.equal(result.incomeTax, 0);
    assert.equal(result.socialTax, 0);
    assert.equal(result.netAnnual, 1_200_000);
  });

  it("UAE: no corporate tax at AED 240k; 9% above AED 375k", () => {
    const low = calculateSelfEmployment(defaultsFromCountry(getSelfEmploymentCountry("AE")));
    assert.ok(low);
    assert.equal(low.incomeTax, 0);
    assert.equal(low.netAnnual, 240_000);

    const high = calculateSelfEmployment({
      ...defaultsFromCountry(getSelfEmploymentCountry("AE")),
      grossAnnual: 500_000,
    });
    assert.ok(high);
    approx(high.incomeTax, (500_000 - 375_000) * 0.09, 1);
  });

  it("UK: Class 4 NI applies between the limits", () => {
    const result = calculateSelfEmployment(defaultsFromCountry(getSelfEmploymentCountry("GB")));
    assert.ok(result);
    approx(result.socialTax, (45_000 - 12_570) * 0.06, 1);
    assert.ok(result.incomeTax > 0);
  });

  it("returns null for invalid income", () => {
    assert.equal(
      calculateSelfEmployment({ ...defaultsFromCountry(getSelfEmploymentCountry("US")), grossAnnual: 0 }),
      null,
    );
  });
});

describe("validateSelfEmployment", () => {
  it("accepts US defaults", () => {
    assert.deepEqual(validateSelfEmployment(defaultsFromCountry(getSelfEmploymentCountry("US"))), {});
  });

  it("rejects expenses above income", () => {
    const errors = validateSelfEmployment({
      ...defaultsFromCountry(getSelfEmploymentCountry("US")),
      expenses: 200_000,
    });
    assert.ok(errors.expenses);
  });
});
