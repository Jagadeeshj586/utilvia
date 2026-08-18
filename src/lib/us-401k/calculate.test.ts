import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_K401_INPUT,
  applyAnnualCaps,
  calculateK401,
  employeeElectiveLimit,
  employerMatchOn,
  validateK401,
} from "./calculate";

describe("employeeElectiveLimit", () => {
  it("uses 2026 base, catch-up, and super catch-up bands", () => {
    assert.equal(employeeElectiveLimit(30), 24_500);
    assert.equal(employeeElectiveLimit(50), 32_500);
    assert.equal(employeeElectiveLimit(60), 35_750);
    assert.equal(employeeElectiveLimit(63), 35_750);
    assert.equal(employeeElectiveLimit(64), 32_500);
  });
});

describe("employerMatchOn", () => {
  it("matches 50% of deferrals up to 6% of salary", () => {
    assert.equal(employerMatchOn(75_000, 7_500, 50, 6), 2_250);
    assert.equal(employerMatchOn(75_000, 3_000, 50, 6), 1_500);
    assert.equal(employerMatchOn(75_000, 7_500, 0, 6), 0);
  });
});

describe("applyAnnualCaps", () => {
  it("caps employee deferrals at the age-based IRS limit", () => {
    const capped = applyAnnualCaps(30, 75_000, 40_000, 2_250);
    assert.equal(capped.employee, 24_500);
    assert.equal(capped.capped, true);
    assert.equal(capped.irsLimit, 24_500);
  });
});

describe("calculateK401", () => {
  it("matches the default 37-year projection", () => {
    const result = calculateK401(DEFAULT_K401_INPUT);
    assert.ok(result);
    assert.equal(result.years, 37);
    assert.equal(result.totalEmployeeContributions, 277_500);
    assert.equal(result.totalEmployerContributions, 83_250);
    assert.equal(result.yearly[0]!.balance, 9_750);
    assert.equal(result.yearly[1]!.balance, 20_183);
    assert.equal(result.projectedBalance, 1_563_290);
    assert.equal(result.investmentGrowth, 1_202_540);
    assert.equal(result.monthlyRetirementIncome, 5_211);
    assert.equal(result.startingIrsLimit, 24_500);
  });

  it("flags years that hit the elective deferral limit", () => {
    const result = calculateK401({
      ...DEFAULT_K401_INPUT,
      contributionPercent: 50,
    });
    assert.ok(result);
    assert.equal(result.contributionCapped, true);
    assert.ok(result.yearsCapped > 0);
    assert.equal(result.yearly[0]!.employee, 24_500);
  });

  it("grows salary and steps up dollar contributions", () => {
    const result = calculateK401({
      ...DEFAULT_K401_INPUT,
      currentAge: 40,
      retirementAge: 43,
      salaryGrowthPercent: 10,
      contributionIncreasePercent: 10,
      contributionMode: "dollars",
      contributionDollars: 5_000,
      employerMatchPercent: 0,
      returnPercent: 0,
    });
    assert.ok(result);
    assert.equal(result.yearly.length, 3);
    assert.ok(result.yearly[1]!.employee > result.yearly[0]!.employee);
    assert.ok(result.yearly[1]!.salary > result.yearly[0]!.salary);
  });

  it("applies super catch-up in ages 60–63", () => {
    const result = calculateK401({
      ...DEFAULT_K401_INPUT,
      currentAge: 60,
      retirementAge: 65,
      contributionPercent: 100,
      employerMatchPercent: 0,
      returnPercent: 0,
      annualSalary: 200_000,
    });
    assert.ok(result);
    assert.equal(result.yearly[0]!.age, 60);
    assert.equal(result.yearly[0]!.irsLimit, 35_750);
    assert.equal(result.yearly[3]!.age, 63);
    assert.equal(result.yearly[3]!.irsLimit, 35_750);
    assert.equal(result.yearly[4]!.age, 64);
    assert.equal(result.yearly[4]!.irsLimit, 32_500);
  });

  it("rejects retirement at or before current age", () => {
    const errors = validateK401({ ...DEFAULT_K401_INPUT, retirementAge: 30 });
    assert.ok(errors.retirementAge);
  });
});
