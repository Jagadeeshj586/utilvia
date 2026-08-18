import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EMPLOYMENT_COUNTRIES,
  calculateEmploymentCompare,
  defaultsFromCountry,
  getEmploymentCountry,
  validateEmploymentCompare,
} from "./calculate";

const approx = (actual: number, expected: number, tolerance = 1) => {
  assert.ok(Number.isFinite(actual), `expected finite, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ~${expected}, got ${actual}`);
};

describe("country catalog", () => {
  it("lists six countries with local employment labels", () => {
    assert.deepEqual(
      EMPLOYMENT_COUNTRIES.map((country) => country.code),
      ["US", "IN", "GB", "CA", "AU", "AE"],
    );
    assert.equal(getEmploymentCountry("US").labels.employee, "W-2 Employee");
    assert.equal(getEmploymentCountry("US").labels.contractor, "1099 Contractor");
    assert.equal(getEmploymentCountry("IN").labels.employee, "Salaried Employee");
    assert.equal(getEmploymentCountry("GB").labels.contractor, "Self-Employed");
    assert.equal(getEmploymentCountry("AU").labels.contractor, "Sole Trader / Contractor");
  });
});

describe("calculateEmploymentCompare", () => {
  it("US: 1099 self-employment tax exceeds W-2 employee FICA at $90k", () => {
    const result = calculateEmploymentCompare(defaultsFromCountry(getEmploymentCountry("US")));
    assert.ok(result);
    assert.ok(result.contractor.socialTax > result.employee.socialTax);
    assert.ok(result.employee.netAnnual < 90_000);
    assert.ok(result.contractor.netAnnual < 90_000);
    assert.ok(result.employee.employerCost > 0);
    assert.equal(result.contractor.employerCost, 0);
    approx(result.employee.netMonthly, result.employee.netAnnual / 12, 0.01);
  });

  it("India: salaried side includes EPF while professional side does not", () => {
    const result = calculateEmploymentCompare(defaultsFromCountry(getEmploymentCountry("IN")));
    assert.ok(result);
    assert.ok(result.employee.socialTax > 0);
    assert.equal(result.contractor.socialTax, 0);
    assert.ok(result.employee.employerCost > 0);
  });

  it("UAE: neither side pays personal income tax", () => {
    const result = calculateEmploymentCompare(defaultsFromCountry(getEmploymentCountry("AE")));
    assert.ok(result);
    assert.equal(result.employee.incomeTax, 0);
    assert.equal(result.contractor.incomeTax, 0);
    assert.equal(result.employee.netAnnual, 240_000);
  });

  it("applies contractor expenses on the self-employed side only", () => {
    const base = defaultsFromCountry(getEmploymentCountry("GB"));
    const without = calculateEmploymentCompare(base);
    const withExpenses = calculateEmploymentCompare({ ...base, expenses: 5_000 });
    assert.ok(without && withExpenses);
    assert.ok(withExpenses.contractor.netAnnual < without.contractor.netAnnual || withExpenses.contractor.incomeTax < without.contractor.incomeTax);
    approx(withExpenses.employee.netAnnual, without.employee.netAnnual, 1);
  });

  it("returns null for invalid income", () => {
    assert.equal(calculateEmploymentCompare({ ...defaultsFromCountry(getEmploymentCountry("US")), grossAnnual: 0 }), null);
  });
});

describe("validateEmploymentCompare", () => {
  it("accepts US defaults", () => {
    assert.deepEqual(validateEmploymentCompare(defaultsFromCountry(getEmploymentCountry("US"))), {});
  });

  it("rejects expenses above gross", () => {
    const errors = validateEmploymentCompare({
      ...defaultsFromCountry(getEmploymentCountry("US")),
      expenses: 200_000,
    });
    assert.ok(errors.expenses);
  });
});
