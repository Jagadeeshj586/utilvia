import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_ADVANCE_TAX_INPUT,
  calculateAdvanceTax,
  computeIncomeTax,
  taxableIncomeFor,
  validateAdvanceTax,
} from "./calculate";

describe("WorkUtilities default path", () => {
  it("matches ₹15 lakh salaried new-regime tax and installments", () => {
    const result = calculateAdvanceTax(DEFAULT_ADVANCE_TAX_INPUT);
    assert.ok(result);
    assert.equal(result.taxableIncome, 14_25_000);
    assert.equal(result.totalTax, 97_500);
    assert.equal(result.netTax, 97_500);
    assert.equal(result.required, true);
    assert.equal(result.installments.length, 4);
    assert.equal(result.installments[0]!.amountDue, 14_625);
    assert.equal(result.installments[1]!.amountDue, 29_250);
    assert.equal(result.installments[2]!.amountDue, 29_250);
    assert.equal(result.installments[3]!.amountDue, 24_375);
    assert.equal(
      result.installments.reduce((sum, row) => sum + row.amountDue, 0),
      97_500,
    );
  });
});

describe("income types", () => {
  it("skips standard deduction for business income", () => {
    const result = calculateAdvanceTax({ ...DEFAULT_ADVANCE_TAX_INPUT, incomeType: "business" });
    assert.ok(result);
    assert.equal(result.standardDeduction, 0);
    assert.equal(result.taxableIncome, 15_00_000);
    assert.equal(result.installments.length, 4);
  });

  it("uses 50% deemed income and a single March payment for 44ADA", () => {
    const result = calculateAdvanceTax({ ...DEFAULT_ADVANCE_TAX_INPUT, incomeType: "44ada" });
    assert.ok(result);
    assert.equal(result.taxableIncome, 7_50_000);
    assert.equal(result.singleMarchPayment, true);
    assert.equal(result.installments.length, 1);
    assert.equal(result.installments[0]!.dueDate, "15 March 2027");
    assert.equal(result.installments[0]!.cumulativePercent, 100);
    assert.equal(result.installments[0]!.amountDue, result.netTax);
  });
});

describe("eligibility and TDS", () => {
  it("does not require advance tax when net liability is ₹10,000 or less", () => {
    const tax = computeIncomeTax(taxableIncomeFor({ ...DEFAULT_ADVANCE_TAX_INPUT, income: 8_00_000 }), "new");
    assert.equal(tax.totalTax, 0);
    const result = calculateAdvanceTax({ ...DEFAULT_ADVANCE_TAX_INPUT, income: 8_00_000 });
    assert.ok(result);
    assert.equal(result.required, false);
  });

  it("reduces net tax by TDS already deducted", () => {
    const result = calculateAdvanceTax({ ...DEFAULT_ADVANCE_TAX_INPUT, tds: 40_000 });
    assert.ok(result);
    assert.equal(result.netTax, 57_500);
    assert.equal(result.required, true);
    assert.equal(result.installments[0]!.amountDue, 8_625);
  });
});

describe("validateAdvanceTax", () => {
  it("rejects missing income and negative TDS", () => {
    assert.ok(validateAdvanceTax({ ...DEFAULT_ADVANCE_TAX_INPUT, income: 0 }).income);
    assert.ok(validateAdvanceTax({ ...DEFAULT_ADVANCE_TAX_INPUT, tds: -1 }).tds);
  });
});
