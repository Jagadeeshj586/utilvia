import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MORTGAGE_COUNTRIES,
  MORTGAGE_DEFAULTS,
  calculateMortgage,
  defaultsFromCountry,
  downPaymentFromPercent,
  formatMortgageMoney,
  getMortgageCountry,
  loanFromHomeAndDown,
  monthlyPrincipalAndInterest,
  parseMoney,
  percentFromDownPayment,
  validateMortgageInput,
  type MortgageCountryCode,
} from "./calculate";

const approx = (actual: number, expected: number, tolerance = 0.02) => {
  assert.ok(Number.isFinite(actual), `expected finite number, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ~${expected}, got ${actual}`);
};

describe("country catalog", () => {
  it("includes the six supported countries in display order", () => {
    assert.deepEqual(
      MORTGAGE_COUNTRIES.map((country) => country.code),
      ["US", "IN", "GB", "CA", "AU", "AE"],
    );
  });

  it("falls back to the United States for an unknown code", () => {
    assert.equal(getMortgageCountry("US").currency, "USD");
    assert.equal(getMortgageCountry("ZZ" as MortgageCountryCode).code, "US");
  });
});

describe("parseMoney", () => {
  it("strips currency symbols and grouping separators", () => {
    assert.equal(parseMoney("$400,000"), 400_000);
    assert.equal(parseMoney("₹80,00,000"), 8_000_000);
    assert.equal(parseMoney("80,000.50"), 80_000.5);
  });

  it("returns NaN for empty input", () => {
    assert.equal(Number.isNaN(parseMoney("")), true);
    assert.equal(Number.isNaN(parseMoney("£")), true);
  });
});

describe("linked down payment helpers", () => {
  it("keeps price, down payment, and loan amount in sync", () => {
    assert.equal(downPaymentFromPercent(400_000, 20), 80_000);
    approx(percentFromDownPayment(400_000, 80_000), 20, 1e-9);
    assert.equal(loanFromHomeAndDown(400_000, 80_000), 320_000);
  });
});

describe("monthlyPrincipalAndInterest", () => {
  it("matches the classic $200k / 5% / 30y payment", () => {
    approx(monthlyPrincipalAndInterest(200_000, 5, 30), 1_073.64, 0.02);
  });

  it("splits principal evenly when the rate is 0%", () => {
    assert.equal(monthlyPrincipalAndInterest(240_000, 0, 20), 1_000);
  });
});

describe("calculateMortgage", () => {
  it("uses US defaults for a $400k home with 20% down", () => {
    const result = calculateMortgage(MORTGAGE_DEFAULTS);
    assert.ok(result);
    assert.equal(result.loanAmount, 320_000);
    assert.equal(result.months, 360);
    approx(result.principalAndInterest, 2_022.62, 0.02);
    approx(result.additionalCostsMonthly, 550, 0.02);
    approx(result.monthlyPayment, result.principalAndInterest + 550, 0.02);
    approx(result.ltvPercent, 80, 1e-9);
    approx(result.totalInterest, result.principalAndInterest * 360 - 320_000, 0.05);
    assert.equal(result.yearlyAmortization.length, 30);
  });

  it("adds India processing charges to total amount paid, not the EMI", () => {
    const base = defaultsFromCountry(getMortgageCountry("IN"));
    const result = calculateMortgage({ ...base, extras: { processing: 50_000 } });
    assert.ok(result);
    approx(result.additionalCostsMonthly, 0, 1e-9);
    assert.equal(result.additionalCostsOneTime, 50_000);
    approx(result.monthlyPayment, result.principalAndInterest, 1e-9);
    approx(result.totalAmountPaid, result.principalAndInterest * result.months + 50_000, 0.05);
  });

  it("formats currency with the selected country symbol", () => {
    const india = getMortgageCountry("IN");
    const uae = getMortgageCountry("AE");
    assert.ok(formatMortgageMoney(1000, india).includes("₹"));
    assert.ok(formatMortgageMoney(1000, uae).includes("د.إ"));
  });

  it("returns null when down payment exceeds home price", () => {
    assert.equal(
      calculateMortgage({
        ...MORTGAGE_DEFAULTS,
        downPaymentAmount: 500_000,
        downPaymentPercent: 125,
        loanAmount: -100_000,
      }),
      null,
    );
  });
});

describe("validateMortgageInput", () => {
  it("accepts the US defaults", () => {
    assert.deepEqual(validateMortgageInput(MORTGAGE_DEFAULTS), {});
  });

  it("uses country-specific labels in errors", () => {
    const india = defaultsFromCountry(getMortgageCountry("IN"));
    const errors = validateMortgageInput({ ...india, homePrice: 0, loanAmount: 0, downPaymentAmount: 0 });
    assert.ok(errors.homePrice?.toLowerCase().includes("property value"));
  });
});
