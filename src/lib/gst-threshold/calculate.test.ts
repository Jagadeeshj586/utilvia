import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_GST_THRESHOLD_INPUT,
  calculateGstThreshold,
  gstThresholdAmount,
} from "./calculate";

describe("GST threshold checker", () => {
  it("matches the WorkUtilities default — services, regular state, ₹15 lakh", () => {
    const result = calculateGstThreshold(DEFAULT_GST_THRESHOLD_INPUT);
    assert.ok(result);
    assert.equal(result.threshold, 20_00_000);
    assert.equal(result.turnover, 15_00_000);
    assert.equal(result.mandatory, false);
    assert.equal(result.headline, "GST registration is NOT mandatory for you.");
  });

  it("treats inter-state supply as mandatory regardless of turnover", () => {
    const result = calculateGstThreshold({ ...DEFAULT_GST_THRESHOLD_INPUT, interstate: true });
    assert.ok(result);
    assert.equal(result.mandatory, true);
    assert.equal(result.reason, "interstate");
    assert.match(result.detail, /Inter-state supply/);
  });

  it("uses ₹40 lakh for goods in regular states and ₹20 lakh for goods in special states", () => {
    assert.equal(gstThresholdAmount("goods", "regular"), 40_00_000);
    assert.equal(gstThresholdAmount("goods", "special"), 20_00_000);
    assert.equal(gstThresholdAmount("services", "special"), 10_00_000);
    const goodsRegular = calculateGstThreshold({
      ...DEFAULT_GST_THRESHOLD_INPUT,
      supply: "goods",
    });
    assert.ok(goodsRegular);
    assert.equal(goodsRegular.mandatory, false);
    assert.equal(goodsRegular.threshold, 40_00_000);
    const specialServices = calculateGstThreshold({
      ...DEFAULT_GST_THRESHOLD_INPUT,
      state: "special",
    });
    assert.ok(specialServices);
    assert.equal(specialServices.mandatory, true);
    assert.equal(specialServices.reason, "threshold");
    assert.equal(specialServices.threshold, 10_00_000);
  });

  it("flags export and digital/IT overseas work as mandatory", () => {
    const exported = calculateGstThreshold({ ...DEFAULT_GST_THRESHOLD_INPUT, exportSupply: true });
    assert.ok(exported);
    assert.equal(exported.reason, "export");
    const digital = calculateGstThreshold({ ...DEFAULT_GST_THRESHOLD_INPUT, digitalOverseas: true });
    assert.ok(digital);
    assert.equal(digital.reason, "digital");
    const over = calculateGstThreshold({ ...DEFAULT_GST_THRESHOLD_INPUT, turnover: 20_00_000 });
    assert.ok(over);
    assert.equal(over.mandatory, true);
    assert.equal(over.reason, "threshold");
  });
});
