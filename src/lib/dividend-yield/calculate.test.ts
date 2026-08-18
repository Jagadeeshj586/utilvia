import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_DIVIDEND_INPUT,
  calculateDividend,
  formatYield,
  tdsOnCompany,
} from "./calculate";

describe("Dividend yield calculator", () => {
  it("matches WorkUtilities single-stock defaults", () => {
    const result = calculateDividend(DEFAULT_DIVIDEND_INPUT);
    assert.ok(result);
    assert.equal(result.mode, "single");
    if (result.mode !== "single") return;
    assert.equal(formatYield(result.currentYield), "6.25%");
    assert.equal(formatYield(result.yieldOnCost), "8.33%");
    assert.equal(result.annualIncome, 2_500);
    assert.equal(result.monthlyIncome, 208);
    assert.equal(result.tds.applies, false);
    assert.equal(result.investment, 30_000);
    assert.equal(result.fdIncome, 2_100);
    assert.equal(result.fdHigher, true);
  });

  it("applies 10% TDS on the full amount once income exceeds ₹5,000", () => {
    const result = calculateDividend({
      ...DEFAULT_DIVIDEND_INPUT,
      shares: 300,
    });
    assert.ok(result);
    assert.equal(result.mode, "single");
    if (result.mode !== "single") return;
    assert.equal(result.annualIncome, 7_500);
    assert.equal(result.monthlyIncome, 625);
    assert.equal(result.tds.applies, true);
    assert.equal(result.tds.tds, 750);
    assert.equal(result.tds.net, 6_750);
    assert.equal(result.investment, 90_000);
    assert.equal(result.fdIncome, 6_300);
    assert.deepEqual(tdsOnCompany(5_000), { applies: false, tds: 0, net: 5_000 });
  });

  it("weights portfolio yield and applies TDS per company", () => {
    const result = calculateDividend({
      ...DEFAULT_DIVIDEND_INPUT,
      mode: "portfolio",
      holdings: [
        { name: "Stock 1", dps: 25, price: 400, shares: 100 },
        { name: "Stock 2", dps: 25, price: 400, shares: 300 },
      ],
    });
    assert.ok(result);
    assert.equal(result.mode, "portfolio");
    if (result.mode !== "portfolio") return;
    assert.equal(result.annualIncome, 10_000);
    assert.equal(formatYield(result.weightedYield), "6.25%");
    assert.equal(result.tds.tds, 750);
    assert.equal(result.tds.net, 9_250);
    assert.equal(result.rows[0].tds.applies, false);
    assert.equal(result.rows[1].tds.applies, true);
  });
});
