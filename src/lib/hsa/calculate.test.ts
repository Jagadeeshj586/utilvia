import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_HSA_INPUT,
  calculateHsa,
  futureValueAnnuityDue,
  hsaContributionLimit,
} from "./calculate";

describe("HSA calculator", () => {
  it("matches WorkUtilities default — individual, age 35, $4,300, 22% + 5%, 6%", () => {
    const result = calculateHsa(DEFAULT_HSA_INPUT);
    assert.ok(result);
    assert.equal(result.contributionLimit, 4300);
    assert.equal(result.remainingRoom, 0);
    assert.equal(result.federalTaxSavings, 946);
    assert.equal(result.stateTaxSavings, 215);
    assert.equal(result.totalTaxSavings, 1161);
    assert.equal(result.effectiveCost, 3139);
    assert.equal(result.projectedBalance, 360347);
    assert.equal(result.monthlyHealthcareBudget, 1201);
    assert.equal(result.yearsToRetirement, 30);
  });

  it("keeps contribution when coverage is family and shows remaining room", () => {
    const result = calculateHsa({ ...DEFAULT_HSA_INPUT, coverage: "family" });
    assert.ok(result);
    assert.equal(result.contributionLimit, 8550);
    assert.equal(result.remainingRoom, 4250);
    assert.equal(result.contribution, 4300);
    assert.equal(result.totalTaxSavings, 1161);
    assert.equal(result.projectedBalance, 360347);
  });

  it("adds $1,000 catch-up at age 55+", () => {
    assert.equal(hsaContributionLimit("individual", 54), 4300);
    assert.equal(hsaContributionLimit("individual", 55), 5300);
    assert.equal(hsaContributionLimit("family", 60), 9550);
    const result = calculateHsa({ ...DEFAULT_HSA_INPUT, currentAge: 55, contribution: 5300 });
    assert.ok(result);
    assert.equal(result.catchUpApplies, true);
    assert.equal(result.contributionLimit, 5300);
    assert.equal(result.remainingRoom, 0);
    assert.equal(result.yearsToRetirement, 10);
  });

  it("caps tax and projection at the IRS limit when contribution is over", () => {
    const result = calculateHsa({ ...DEFAULT_HSA_INPUT, contribution: 10_000 });
    assert.ok(result);
    assert.equal(result.overLimit, true);
    assert.equal(result.remainingRoom, 0);
    assert.equal(result.contribution, 4300);
    assert.equal(result.totalTaxSavings, 1161);
    assert.equal(result.projectedBalance, 360347);
  });

  it("uses beginning-of-year (annuity-due) compounding", () => {
    const fv = futureValueAnnuityDue(4300, 0.06, 30);
    assert.equal(Math.round(fv), 360347);
    assert.equal(futureValueAnnuityDue(4300, 0, 30), 129000);
  });
});
