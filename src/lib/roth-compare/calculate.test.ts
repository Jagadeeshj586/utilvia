import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_ROTH_COMPARE_INPUT,
  calculateRothCompare,
  futureValueAnnuity,
  iraContributionLimit,
} from "./calculate";

describe("401k vs Roth IRA comparison", () => {
  it("uses 2026 IRA limits by age", () => {
    assert.equal(iraContributionLimit(30), 7_500);
    assert.equal(iraContributionLimit(50), 8_600);
  });

  it("matches the WorkUtilities default projection", () => {
    const result = calculateRothCompare(DEFAULT_ROTH_COMPARE_INPUT);
    assert.ok(result);
    assert.equal(result.years, 35);
    assert.equal(result.combinedNow, 27);
    assert.equal(result.combinedLater, 27);
    assert.equal(result.verdict, "equal");
    assert.equal(futureValueAnnuity(10_000, 7, 35), 1_382_369);

    const [traditional, roth401k, rothIra] = result.accounts;
    assert.equal(traditional.annualContribution, 10_000);
    assert.equal(traditional.taxSavingToday, 2_700);
    assert.equal(traditional.netAnnualCost, 7_300);
    assert.equal(traditional.futureBalance, 1_382_369);
    assert.equal(traditional.taxOnWithdrawal, 373_240);
    assert.equal(traditional.netRetirement, 1_009_129);
    assert.equal(traditional.rmdsRequired, true);

    assert.equal(roth401k.annualContribution, 10_000);
    assert.equal(roth401k.taxSavingToday, 0);
    assert.equal(roth401k.netAnnualCost, 10_000);
    assert.equal(roth401k.futureBalance, 1_382_369);
    assert.equal(roth401k.taxOnWithdrawal, 0);
    assert.equal(roth401k.netRetirement, 1_382_369);
    assert.equal(roth401k.rmdsRequired, false);

    assert.equal(rothIra.annualContribution, 7_500);
    assert.equal(rothIra.futureBalance, 1_036_777);
    assert.equal(rothIra.netRetirement, 1_036_777);
    assert.equal(result.iraCapped, true);
    assert.equal(result.copyLabel, "Copy Traditional net");
    assert.equal(result.copyValue, 1_009_129);
  });

  it("picks Traditional when retirement tax is lower", () => {
    const result = calculateRothCompare({ ...DEFAULT_ROTH_COMPARE_INPUT, federalLater: 12 });
    assert.ok(result);
    assert.equal(result.verdict, "traditional");
    assert.match(result.verdictTitle, /Traditional/);
  });

  it("picks Roth when retirement tax is higher", () => {
    const result = calculateRothCompare({ ...DEFAULT_ROTH_COMPARE_INPUT, federalLater: 32 });
    assert.ok(result);
    assert.equal(result.verdict, "roth");
    assert.equal(result.copyLabel, "Copy Roth 401k net");
  });

  it("handles a zero return as contributions only", () => {
    const result = calculateRothCompare({ ...DEFAULT_ROTH_COMPARE_INPUT, returnPercent: 0 });
    assert.ok(result);
    assert.equal(result.accounts[0].futureBalance, 350_000);
    assert.equal(result.accounts[2].futureBalance, 262_500);
  });
});
