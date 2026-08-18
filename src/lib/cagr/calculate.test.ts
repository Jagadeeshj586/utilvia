import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_CAGR_INPUT,
  absoluteReturnPercent,
  calculateCagr,
  cagrPercent,
  doublingYears,
  futureValue,
  realCagrPercent,
  validateCagr,
} from "./calculate";

describe("cagrPercent", () => {
  it("matches the WorkUtilities default 5-year path", () => {
    const cagr = cagrPercent(1_00_000, 1_76_234, 5);
    assert.ok(cagr != null);
    assert.equal(cagr.toFixed(2), "12.00");
  });
});

describe("calculateCagr", () => {
  it("matches Find CAGR defaults", () => {
    const result = calculateCagr(DEFAULT_CAGR_INPUT);
    assert.ok(result);
    assert.equal(result.mode, "find-cagr");
    if (result.mode !== "find-cagr") return;
    assert.equal(result.cagr.toFixed(2), "12.00");
    assert.equal(result.absoluteReturn.toFixed(2), "76.23");
    assert.equal(result.realCagr.toFixed(2), "5.66");
    assert.equal(result.doublingYears?.toFixed(1), "6.0");
  });

  it("projects future value at 12% for 5 years", () => {
    const result = calculateCagr({ ...DEFAULT_CAGR_INPUT, mode: "find-fv" });
    assert.ok(result);
    assert.equal(result.mode, "find-fv");
    if (result.mode !== "find-fv") return;
    assert.equal(result.futureValue, 1_76_234);
    assert.equal(result.totalGain, 76_234);
    assert.equal(result.yearRows.length, 5);
    assert.equal(result.yearRows[0]!.balance, 1_12_000);
  });

  it("flags required CAGR above the Nifty band", () => {
    const result = calculateCagr({ ...DEFAULT_CAGR_INPUT, mode: "find-required" });
    assert.ok(result);
    assert.equal(result.mode, "find-required");
    if (result.mode !== "find-required") return;
    assert.equal(result.niftyComparison, "above");
    assert.ok(result.requiredCagr > 15);
  });

  it("returns null doubling years for zero or negative CAGR", () => {
    assert.equal(doublingYears(0), null);
    assert.equal(doublingYears(-4), null);
  });

  it("rejects a missing initial value", () => {
    const errors = validateCagr({ ...DEFAULT_CAGR_INPUT, initial: 0 });
    assert.ok(errors.initial);
  });

  it("does not let unused inflation block future value", () => {
    const result = calculateCagr({
      ...DEFAULT_CAGR_INPUT,
      mode: "find-fv",
      inflationPercent: Number.NaN,
    });
    assert.ok(result);
    assert.equal(result?.mode, "find-fv");
  });
});

describe("helpers", () => {
  it("computes absolute return and real CAGR", () => {
    assert.equal(absoluteReturnPercent(1_00_000, 1_76_234).toFixed(2), "76.23");
    assert.equal(realCagrPercent(12, 6).toFixed(2), "5.66");
    assert.equal(Math.round(futureValue(1_00_000, 12, 5) ?? 0), 1_76_234);
  });
});
