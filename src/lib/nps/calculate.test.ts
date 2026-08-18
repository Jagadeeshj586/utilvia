import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_NPS_INPUT,
  calculateNps,
  estimateNpsTaxSavings,
  futureValueAnnuityDue,
  validateNps,
} from "./calculate";
import { NPS_RULES } from "./rules";

describe("futureValueAnnuityDue", () => {
  it("matches the beginning-of-month SIP formula", () => {
    const monthly = 5_000;
    const months = 12;
    const rate = 10 / 12 / 100;
    const expected = ((Math.pow(1 + rate, months) - 1) / rate) * monthly * (1 + rate);
    assert.ok(Math.abs(futureValueAnnuityDue(monthly, 10, months) - expected) < 1e-6);
  });

  it("returns contributions only when the rate is 0", () => {
    assert.equal(futureValueAnnuityDue(5_000, 0, 12), 60_000);
  });
});

describe("calculateNps", () => {
  it("matches the default 30-year NPS projection", () => {
    const result = calculateNps(DEFAULT_NPS_INPUT);
    assert.ok(result);
    assert.equal(result.years, 30);
    assert.equal(result.totalContributed, 18_00_000);
    assert.equal(result.totalInvested, 18_00_000);
    const closed = futureValueAnnuityDue(5_000, 10, 360);
    assert.equal(result.corpus, Math.round(closed));
    assert.equal(result.annuityCorpus, Math.round(result.corpus * 0.4));
    assert.equal(result.lumpSumWithdrawal, result.corpus - result.annuityCorpus);
    assert.equal(result.monthlyPension, Math.round((6 / 100) * result.annuityCorpus / 12));
    assert.equal(result.totalRetirementValue, result.corpus);
    assert.equal(result.returnsEarned, result.corpus - result.totalInvested);
  });

  it("builds year-by-year growth including year 1 and year 10", () => {
    const result = calculateNps(DEFAULT_NPS_INPUT);
    assert.ok(result);
    assert.equal(result.yearly.length, 30);
    assert.equal(result.yearly[0]!.age, 31);
    assert.equal(result.yearly[0]!.invested, 60_000);
    assert.equal(result.yearly[0]!.balance, Math.round(futureValueAnnuityDue(5_000, 10, 12)));
    assert.equal(result.yearly[9]!.age, 40);
    assert.equal(result.yearly[9]!.invested, 6_00_000);
    assert.equal(result.yearly[9]!.balance, Math.round(futureValueAnnuityDue(5_000, 10, 120)));
  });

  it("grows an existing corpus and steps up contributions", () => {
    const result = calculateNps({
      ...DEFAULT_NPS_INPUT,
      currentAge: 58,
      retirementAge: 60,
      currentCorpus: 2_00_000,
      stepUpPercent: 10,
    });
    assert.ok(result);
    assert.equal(result.years, 2);
    assert.ok(result.yearly[1]!.contributedThisYear > result.yearly[0]!.contributedThisYear);
    assert.ok(result.totalInvested > result.totalContributed);
    assert.ok(result.corpus > result.totalInvested);
  });

  it("illustrates 80CCD tax at the 30% slab without exceeding the contribution", () => {
    const tax = estimateNpsTaxSavings(60_000);
    assert.equal(tax.ccd1Deduction, 60_000);
    assert.equal(tax.ccd1bDeduction, 0);
    assert.equal(tax.totalTaxSaved, 18_000);

    const larger = estimateNpsTaxSavings(2_00_000);
    assert.equal(larger.ccd1Deduction, NPS_RULES.ccd1Limit);
    assert.equal(larger.ccd1bDeduction, NPS_RULES.ccd1bLimit);
    assert.equal(larger.totalTaxSaved, 60_000);
  });

  it("rejects retirement at or before current age", () => {
    const errors = validateNps({ ...DEFAULT_NPS_INPUT, retirementAge: 30 });
    assert.ok(errors.retirementAge);
  });

  it("requires a higher annuity share on premature exit", () => {
    const errors = validateNps({ ...DEFAULT_NPS_INPUT, retirementAge: 55, annuityPercent: 40 });
    assert.ok(errors.annuityPercent);
    const ok = validateNps({ ...DEFAULT_NPS_INPUT, retirementAge: 55, annuityPercent: 80 });
    assert.equal(ok.annuityPercent, undefined);
  });

  it("rejects a monthly contribution below the NPS minimum", () => {
    const errors = validateNps({ ...DEFAULT_NPS_INPUT, monthlyContribution: 100 });
    assert.ok(errors.monthlyContribution);
  });
});
