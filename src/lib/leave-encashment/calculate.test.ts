import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_LEAVE_ENCASHMENT_INPUT,
  calculateLeaveEncashment,
  governmentEncashment,
  privateEncashment,
  validateLeaveEncashment,
} from "./calculate";
import { LEAVE_ENCASHMENT_RULES } from "./rules";

describe("leave encashment formulas", () => {
  it("matches WorkUtilities private and government defaults", () => {
    assert.equal(Math.round(privateEncashment(50_000, 30)), 57_692);
    assert.equal(Math.round(governmentEncashment(50_000, 30)), 60_000);
  });
});

describe("calculateLeaveEncashment", () => {
  it("matches the WorkUtilities default retirement projection", () => {
    const result = calculateLeaveEncashment(DEFAULT_LEAVE_ENCASHMENT_INPUT);
    assert.ok(result);
    assert.equal(result.encashmentAmount, 57_692);
    assert.equal(result.privateSectorAmount, 57_692);
    assert.equal(result.governmentAmount, 60_000);
    assert.equal(result.tenMonthsSalary, 5_00_000);
    assert.equal(result.statutoryLimit, 25_00_000);
    assert.equal(result.taxExemption, 57_692);
    assert.equal(result.taxableAmount, 0);
    assert.equal(result.taxPayable, 0);
    assert.equal(result.netAfterTax, 57_692);
  });

  it("treats during-service encashment as fully taxable", () => {
    const result = calculateLeaveEncashment({
      ...DEFAULT_LEAVE_ENCASHMENT_INPUT,
      encashmentType: "during-service",
    });
    assert.ok(result);
    assert.equal(result.taxExemption, 0);
    assert.equal(result.taxableAmount, 57_692);
    assert.equal(result.taxPayable, 17_308);
    assert.equal(result.netAfterTax, 40_384);
  });

  it("uses the government ÷300 formula when selected", () => {
    const result = calculateLeaveEncashment({
      ...DEFAULT_LEAVE_ENCASHMENT_INPUT,
      basis: "government",
    });
    assert.ok(result);
    assert.equal(result.encashmentAmount, 60_000);
    assert.equal(result.taxExemption, 60_000);
  });

  it("caps retirement exemption at the Budget 2023 statutory limit", () => {
    const result = calculateLeaveEncashment({
      monthlyBasic: 5_00_000,
      leaveDays: 300,
      encashmentType: "retirement",
      basis: "private",
      slabPercent: 30,
    });
    assert.ok(result);
    assert.equal(result.tenMonthsSalary, 50_00_000);
    assert.equal(result.taxExemption, LEAVE_ENCASHMENT_RULES.statutoryExemptionLimit);
    assert.ok(result.taxableAmount > 0);
  });

  it("rejects leave days outside 1–300", () => {
    const errors = validateLeaveEncashment({ ...DEFAULT_LEAVE_ENCASHMENT_INPUT, leaveDays: 0 });
    assert.ok(errors.leaveDays);
  });
});
