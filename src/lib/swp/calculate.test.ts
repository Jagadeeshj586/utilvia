import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_SWP_INPUT, calculateSwp, corpusRequired, formatDuration } from "./calculate";

describe("SWP calculator", () => {
  it("flags a self-sustaining corpus on the WorkUtilities default", () => {
    const result = calculateSwp(DEFAULT_SWP_INPUT);
    assert.ok(result);
    assert.equal(result.mode, "duration");
    if (result.mode !== "duration") return;
    assert.equal(result.neverDepletes, true);
    assert.equal(result.monthlyReturn, 33_333);
    assert.equal(result.fdMonthly, 29_167);
  });

  it("matches depletion of ₹50 lakh at ₹50,000 / month and 8%", () => {
    const result = calculateSwp({
      ...DEFAULT_SWP_INPUT,
      monthlyWithdrawal: 50_000,
    });
    assert.ok(result);
    assert.equal(result.mode, "duration");
    if (result.mode !== "duration") return;
    assert.equal(result.neverDepletes, false);
    assert.equal(result.months, 166);
    assert.equal(formatDuration(result.months), "13 years 10 months");
    assert.equal(result.totalWithdrawn, 82_67_064);
    assert.equal(result.returnsEarned, 32_67_064);
    assert.ok(result.yearly.length >= 13);
    assert.deepEqual(result.yearly[0], {
      year: 1,
      opening: 50_00_000,
      withdrawn: 6_00_000,
      returns: 3_92_501,
      closing: 47_92_501,
    });
    assert.deepEqual(result.yearly[1], {
      year: 2,
      opening: 47_92_501,
      withdrawn: 6_00_000,
      returns: 3_75_279,
      closing: 45_67_780,
    });
  });

  it("matches corpus needed for ₹25,000 over 20 years at 8%", () => {
    assert.equal(corpusRequired(25_000, 20, 8), 29_88_857);
    const result = calculateSwp({
      mode: "corpus",
      corpus: 0,
      monthlyWithdrawal: 25_000,
      returnPercent: 8,
      years: 20,
    });
    assert.ok(result);
    assert.equal(result.mode, "corpus");
    if (result.mode !== "corpus") return;
    assert.equal(result.corpusRequired, 29_88_857);
    assert.equal(result.totalWithdrawn, 60_00_000);
    assert.equal(result.returnsFundingGap, 30_11_143);
  });
});
