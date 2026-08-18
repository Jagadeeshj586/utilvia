import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAPITAL_GAINS_RULES,
  DEFAULT_CAPITAL_GAINS_INPUT,
  calculateCapitalGains,
  classifyHolding,
  validateCapitalGains,
} from "./calculate";
import { ciiForDate, financialYearKey } from "./rules";

function base(overrides: Partial<typeof DEFAULT_CAPITAL_GAINS_INPUT> = {}) {
  return { ...DEFAULT_CAPITAL_GAINS_INPUT, ...overrides };
}

describe("holding period", () => {
  it("treats listed equity held exactly 12 months as STCG", () => {
    const holding = classifyHolding("listed-equity", "2024-01-15", "2025-01-15");
    assert.ok(holding);
    assert.equal(holding.kind, "stcg");
  });

  it("treats listed equity held more than 12 months as LTCG", () => {
    const holding = classifyHolding("listed-equity", "2024-01-15", "2025-01-16");
    assert.ok(holding);
    assert.equal(holding.kind, "ltcg");
  });

  it("uses 24 months for property", () => {
    const short = classifyHolding("property", "2023-08-01", "2025-08-01");
    const long = classifyHolding("property", "2023-08-01", "2025-08-02");
    assert.equal(short?.kind, "stcg");
    assert.equal(long?.kind, "ltcg");
  });
});

describe("equity special rates", () => {
  it("applies 20% STCG plus 4% cess on listed equity", () => {
    const result = calculateCapitalGains(
      base({
        assetType: "listed-equity",
        purchaseDate: "2025-01-01",
        purchaseCost: 100_000,
        saleDate: "2025-06-01",
        saleValue: 150_000,
        expenses: 0,
      }),
    );
    assert.ok(result);
    assert.equal(result.holdingKind, "stcg");
    assert.equal(result.capitalGain, 50_000);
    assert.equal(result.tax, 10_000);
    assert.equal(result.cess, 400);
    assert.equal(result.totalTax, 10_400);
    assert.equal(result.netGainAfterTax, 39_600);
  });

  it("applies 12.5% LTCG after the ₹1.25 lakh 112A exemption", () => {
    const result = calculateCapitalGains(
      base({
        purchaseDate: "2023-01-01",
        purchaseCost: 100_000,
        saleDate: "2025-06-01",
        saleValue: 400_000,
        expenses: 0,
        other112AUsed: 0,
      }),
    );
    assert.ok(result);
    assert.equal(result.holdingKind, "ltcg");
    assert.equal(result.capitalGain, 300_000);
    assert.equal(result.exemptionApplied, 125_000);
    assert.equal(result.taxableGain, 175_000);
    assert.equal(result.tax, 21_875);
    assert.equal(result.cess, 875);
    assert.equal(result.totalTax, 22_750);
  });

  it("reduces the 112A exemption when other LTCG was already used", () => {
    const result = calculateCapitalGains(
      base({
        purchaseDate: "2023-01-01",
        purchaseCost: 100_000,
        saleDate: "2025-06-01",
        saleValue: 400_000,
        expenses: 0,
        other112AUsed: 125_000,
      }),
    );
    assert.ok(result);
    assert.equal(result.exemptionApplied, 0);
    assert.equal(result.taxableGain, 300_000);
    assert.equal(result.tax, 37_500);
  });
});

describe("property and other assets", () => {
  it("taxes property STCG at the entered slab rate", () => {
    const result = calculateCapitalGains(
      base({
        assetType: "property",
        purchaseDate: "2024-08-01",
        purchaseCost: 2_000_000,
        saleDate: "2025-08-01",
        saleValue: 2_400_000,
        expenses: 0,
        slabRatePercent: 20,
      }),
    );
    assert.ok(result);
    assert.equal(result.holdingKind, "stcg");
    assert.equal(result.tax, 80_000);
    assert.equal(result.cess, 3_200);
  });

  it("picks the lower of 12.5% unindexed and 20% indexed for grandfathered property", () => {
    const result = calculateCapitalGains(
      base({
        assetType: "property",
        purchaseDate: "2020-04-01",
        purchaseCost: 5_000_000,
        saleDate: "2025-08-01",
        saleValue: 8_000_000,
        expenses: 0,
        improvementCost: 0,
        residentIndividual: true,
      }),
    );
    assert.ok(result);
    assert.equal(result.holdingKind, "ltcg");
    assert.equal(result.taxPaths.length, 2);
    const selected = result.taxPaths.find((path) => path.selected);
    assert.ok(selected);
    assert.equal(selected.ratePercent, 20);
    assert.equal(result.tax, selected.tax);
    const unindexed = result.taxPaths.find((path) => path.ratePercent === 12.5);
    assert.ok(unindexed);
    assert.ok(selected.tax < unindexed.tax);
  });

  it("does not offer indexation for property bought on or after 23 Jul 2024", () => {
    const result = calculateCapitalGains(
      base({
        assetType: "property",
        purchaseDate: "2024-07-23",
        purchaseCost: 5_000_000,
        saleDate: "2026-08-01",
        saleValue: 8_000_000,
        expenses: 0,
      }),
    );
    assert.ok(result);
    assert.equal(result.holdingKind, "ltcg");
    assert.equal(result.taxPaths.length, 1);
    assert.equal(result.ratePercent, 12.5);
  });

  it("subtracts expenses, improvement, and Section 54 exemption", () => {
    const result = calculateCapitalGains(
      base({
        assetType: "gold-other",
        purchaseDate: "2022-01-01",
        purchaseCost: 200_000,
        saleDate: "2025-08-01",
        saleValue: 500_000,
        expenses: 10_000,
        improvementCost: 40_000,
        exemptionClaimed: 50_000,
      }),
    );
    assert.ok(result);
    assert.equal(result.netConsideration, 490_000);
    assert.equal(result.costBase, 240_000);
    assert.equal(result.capitalGain, 250_000);
    assert.equal(result.exemptionApplied, 50_000);
    assert.equal(result.taxableGain, 200_000);
    assert.equal(result.tax, 25_000);
  });

  it("charges no tax on a capital loss", () => {
    const result = calculateCapitalGains(
      base({
        purchaseCost: 500_000,
        saleValue: 400_000,
        expenses: 5_000,
      }),
    );
    assert.ok(result);
    assert.equal(result.isLoss, true);
    assert.equal(result.totalTax, 0);
    assert.equal(result.netGainAfterTax, result.capitalGain);
  });
});

describe("helpers", () => {
  it("maps dates to FY and CII 376 for FY 2025-26", () => {
    assert.equal(financialYearKey("2025-08-01"), "2025-26");
    assert.equal(financialYearKey("2025-03-31"), "2024-25");
    assert.equal(ciiForDate("2025-08-01")?.cii, 376);
    assert.equal(ciiForDate("2024-06-01")?.cii, 363);
  });

  it("rejects a sale before purchase", () => {
    const errors = validateCapitalGains(base({ purchaseDate: "2025-08-01", saleDate: "2025-01-01" }));
    assert.ok(errors.dates);
  });

  it("uses AY 2026-27 special equity rates from the rules file", () => {
    assert.equal(CAPITAL_GAINS_RULES.equityStcgRate, 0.2);
    assert.equal(CAPITAL_GAINS_RULES.equityLtcgRate, 0.125);
    assert.equal(CAPITAL_GAINS_RULES.equityLtcgExemption, 125_000);
  });
});
