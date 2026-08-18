import {
  CAPITAL_GAINS_RULES,
  addCalendarMonths,
  ciiForDate,
  daysBetween,
  formatHoldingPeriod,
  getAssetRule,
  isoToUtc,
  parseIsoDate,
  type AssetTypeId,
} from "./rules";

export {
  ASSET_TYPES,
  CAPITAL_GAINS_RULES,
  CII_BY_FY,
  SLAB_RATE_OPTIONS,
  addCalendarMonths,
  ciiForDate,
  daysBetween,
  financialYearKey,
  formatHoldingPeriod,
  getAssetRule,
} from "./rules";
export type { AssetRule, AssetTypeId } from "./rules";

export type CapitalGainsInput = {
  assetType: AssetTypeId;
  purchaseDate: string;
  purchaseCost: number;
  saleDate: string;
  saleValue: number;
  expenses: number;
  improvementCost: number;
  improvementDate: string;
  exemptionClaimed: number;
  other112AUsed: number;
  slabRatePercent: number;
  residentIndividual: boolean;
};

export type HoldingKind = "stcg" | "ltcg";

export type CapitalGainsErrors = Partial<Record<keyof CapitalGainsInput | "dates", string>>;

export type TaxPath = {
  label: string;
  taxableGain: number;
  ratePercent: number;
  tax: number;
  selected: boolean;
};

export type CapitalGainsResult = {
  assetLabel: string;
  sectionLabel: string;
  holdingKind: HoldingKind;
  holdingLabel: string;
  holdingDays: number;
  netConsideration: number;
  costBase: number;
  indexedCostBase: number | null;
  capitalGain: number;
  indexedGain: number | null;
  exemptionApplied: number;
  taxableGain: number;
  ratePercent: number;
  rateLabel: string;
  tax: number;
  cess: number;
  totalTax: number;
  netGainAfterTax: number;
  isLoss: boolean;
  taxPaths: TaxPath[];
  assumptions: string[];
  notes: string[];
};

export const DEFAULT_CAPITAL_GAINS_INPUT: CapitalGainsInput = {
  assetType: "listed-equity",
  purchaseDate: "2023-04-10",
  purchaseCost: 250_000,
  saleDate: "2025-08-01",
  saleValue: 420_000,
  expenses: 500,
  improvementCost: 0,
  improvementDate: "",
  exemptionClaimed: 0,
  other112AUsed: 0,
  slabRatePercent: 30,
  residentIndividual: true,
};

function rupees(value: number) {
  return Math.round(value);
}

function finiteAmount(value: number) {
  return Number.isFinite(value) && value >= 0;
}

export function classifyHolding(assetType: AssetTypeId, purchaseDate: string, saleDate: string): {
  kind: HoldingKind;
  label: string;
  days: number;
  monthsRequired: number;
} | null {
  const asset = getAssetRule(assetType);
  const purchase = isoToUtc(purchaseDate);
  const sale = isoToUtc(saleDate);
  const threshold = addCalendarMonths(purchaseDate, asset.holdingMonthsForLtcg);
  const days = daysBetween(purchaseDate, saleDate);
  const label = formatHoldingPeriod(purchaseDate, saleDate);
  if (!purchase || !sale || !threshold || days == null || !label || sale.getTime() < purchase.getTime()) return null;
  const longTerm = sale.getTime() > threshold.getTime();
  return {
    kind: longTerm ? "ltcg" : "stcg",
    label,
    days,
    monthsRequired: asset.holdingMonthsForLtcg,
  };
}

export function validateCapitalGains(input: CapitalGainsInput): CapitalGainsErrors {
  const errors: CapitalGainsErrors = {};
  if (!getAssetRule(input.assetType)) errors.assetType = "Choose an asset type.";
  if (!parseIsoDate(input.purchaseDate)) errors.purchaseDate = "Enter a valid purchase date.";
  if (!parseIsoDate(input.saleDate)) errors.saleDate = "Enter a valid sale date.";
  if (!errors.purchaseDate && !errors.saleDate) {
    const purchase = isoToUtc(input.purchaseDate)!;
    const sale = isoToUtc(input.saleDate)!;
    if (sale.getTime() < purchase.getTime()) errors.dates = "Sale date must be on or after the purchase date.";
  }
  if (!finiteAmount(input.purchaseCost)) errors.purchaseCost = "Enter a purchase cost of ₹0 or more.";
  if (!finiteAmount(input.saleValue) || input.saleValue <= 0) errors.saleValue = "Enter a sale value greater than ₹0.";
  if (!finiteAmount(input.expenses)) errors.expenses = "Enter transfer expenses of ₹0 or more.";
  if (!finiteAmount(input.improvementCost)) errors.improvementCost = "Enter an improvement cost of ₹0 or more.";
  if (input.improvementCost > 0 && input.improvementDate && !parseIsoDate(input.improvementDate)) {
    errors.improvementDate = "Enter a valid improvement date, or leave it blank.";
  }
  if (!finiteAmount(input.exemptionClaimed)) errors.exemptionClaimed = "Enter an exemption of ₹0 or more.";
  if (!finiteAmount(input.other112AUsed)) errors.other112AUsed = "Enter other 112A LTCG already used of ₹0 or more.";
  if (!Number.isFinite(input.slabRatePercent) || input.slabRatePercent < 0 || input.slabRatePercent > 30) {
    errors.slabRatePercent = "Choose a slab rate between 0% and 30%.";
  }
  return errors;
}

export function hasCapitalGainsErrors(errors: CapitalGainsErrors) {
  return Object.keys(errors).length > 0;
}

function indexedAmount(cost: number, fromDate: string, toDate: string): { amount: number; fromFy: string; toFy: string } | null {
  const from = ciiForDate(fromDate);
  const to = ciiForDate(toDate);
  if (!from || !to || from.cii <= 0) return null;
  return {
    amount: (cost * to.cii) / from.cii,
    fromFy: from.fy,
    toFy: to.fy,
  };
}

export function calculateCapitalGains(input: CapitalGainsInput): CapitalGainsResult | null {
  if (hasCapitalGainsErrors(validateCapitalGains(input))) return null;

  const asset = getAssetRule(input.assetType);
  const holding = classifyHolding(input.assetType, input.purchaseDate, input.saleDate);
  if (!holding) return null;

  const expenses = rupees(input.expenses);
  const improvement = asset.allowsImprovement ? rupees(input.improvementCost) : 0;
  const purchaseCost = rupees(input.purchaseCost);
  const saleValue = rupees(input.saleValue);
  const netConsideration = saleValue - expenses;
  const costBase = purchaseCost + improvement;
  const unindexedGain = netConsideration - costBase;
  const isLoss = unindexedGain < 0;

  const improvementDate = input.improvementDate || input.purchaseDate;
  const indexedPurchase = indexedAmount(purchaseCost, input.purchaseDate, input.saleDate);
  const indexedImprovement =
    improvement > 0 ? indexedAmount(improvement, improvementDate, input.saleDate) : { amount: 0, fromFy: "", toFy: "" };
  const indexedCostBase = indexedPurchase && indexedImprovement ? indexedPurchase.amount + indexedImprovement.amount : null;
  const indexedGain = indexedCostBase != null ? netConsideration - indexedCostBase : null;

  const notes: string[] = [];
  const assumptions: string[] = [
    `${CAPITAL_GAINS_RULES.sourceLabel}.`,
    `Health and education cess of ${(CAPITAL_GAINS_RULES.cessRate * 100).toFixed(0)}% is added to tax.`,
    "Surcharge is not included. High-income taxpayers may owe surcharge on the tax amount.",
    "Estimates only. Treatment can vary by asset, STT, taxpayer status, exemptions, and the tax year.",
  ];

  if (holding.kind === "stcg") {
    assumptions.push(
      `Short-term if held for ${holding.monthsRequired} month${holding.monthsRequired === 1 ? "" : "s"} or less (${asset.label.toLowerCase()}).`,
    );
  } else {
    assumptions.push(
      `Long-term if held for more than ${holding.monthsRequired} months (${asset.label.toLowerCase()}).`,
    );
  }

  let exemptionApplied = 0;
  let taxableGain = 0;
  let ratePercent = 0;
  let rateLabel = "";
  let tax = 0;
  const taxPaths: TaxPath[] = [];

  if (isLoss) {
    rateLabel = "No tax on a capital loss";
    notes.push("A capital loss does not create tax in this estimate. Losses may be set off or carried forward under the Act, subject to conditions.");
  } else if (holding.kind === "stcg") {
    if (asset.stcgMethod === "section-111a") {
      ratePercent = CAPITAL_GAINS_RULES.equityStcgRate * 100;
      rateLabel = `${ratePercent}% STCG under Section 111A`;
      taxableGain = unindexedGain;
      tax = rupees(taxableGain * CAPITAL_GAINS_RULES.equityStcgRate);
      taxPaths.push({ label: rateLabel, taxableGain, ratePercent, tax, selected: true });
    } else {
      ratePercent = input.slabRatePercent;
      rateLabel = `${ratePercent}% slab rate on STCG`;
      taxableGain = unindexedGain;
      tax = rupees(taxableGain * (ratePercent / 100));
      taxPaths.push({ label: rateLabel, taxableGain, ratePercent, tax, selected: true });
      notes.push("STCG on this asset is added to your other income and taxed at slab rates. Enter the slab you expect this gain to fall into.");
    }
  } else {
    const section54 = asset.allowsSection54Exemption ? Math.min(rupees(input.exemptionClaimed), Math.max(0, unindexedGain)) : 0;

    if (asset.ltcgMethod === "section-112a") {
      const remainingExemption = Math.max(0, CAPITAL_GAINS_RULES.equityLtcgExemption - rupees(input.other112AUsed));
      exemptionApplied = Math.min(unindexedGain, remainingExemption);
      taxableGain = Math.max(0, unindexedGain - exemptionApplied);
      ratePercent = CAPITAL_GAINS_RULES.equityLtcgRate * 100;
      rateLabel = `${ratePercent}% LTCG under Section 112A`;
      tax = rupees(taxableGain * CAPITAL_GAINS_RULES.equityLtcgRate);
      taxPaths.push({ label: rateLabel, taxableGain, ratePercent, tax, selected: true });
      assumptions.push(
        `Section 112A exempts the first ${formatPlain(CAPITAL_GAINS_RULES.equityLtcgExemption)} of listed-equity LTCG in a financial year (shared across scrips and funds).`,
      );
      if (input.other112AUsed > 0) {
        notes.push("Other Section 112A LTCG entered for this year reduces the remaining exemption.");
      }
    } else {
      exemptionApplied = section54;
      const flatGain = Math.max(0, unindexedGain - section54);
      const flatTax = rupees(flatGain * CAPITAL_GAINS_RULES.otherLtcgRate);
      const flatPath: TaxPath = {
        label: `${CAPITAL_GAINS_RULES.otherLtcgRate * 100}% LTCG without indexation`,
        taxableGain: flatGain,
        ratePercent: CAPITAL_GAINS_RULES.otherLtcgRate * 100,
        tax: flatTax,
        selected: false,
      };

      const canIndex =
        asset.ltcgMethod === "section-112-indexation-choice" &&
        input.residentIndividual &&
        input.purchaseDate < CAPITAL_GAINS_RULES.propertyIndexationCutoff &&
        indexedGain != null;

      if (canIndex && indexedGain != null) {
        const indexedTaxable = Math.max(0, indexedGain - section54);
        const indexedTax = rupees(indexedTaxable * CAPITAL_GAINS_RULES.indexedLtcgRate);
        const indexedPath: TaxPath = {
          label: `${CAPITAL_GAINS_RULES.indexedLtcgRate * 100}% LTCG with indexation`,
          taxableGain: indexedTaxable,
          ratePercent: CAPITAL_GAINS_RULES.indexedLtcgRate * 100,
          tax: indexedTax,
          selected: false,
        };
        const useIndexed = indexedTax < flatTax;
        flatPath.selected = !useIndexed;
        indexedPath.selected = useIndexed;
        taxPaths.push(flatPath, indexedPath);
        const chosen = useIndexed ? indexedPath : flatPath;
        taxableGain = chosen.taxableGain;
        ratePercent = chosen.ratePercent;
        rateLabel = chosen.label;
        tax = chosen.tax;
        assumptions.push(
          `Property acquired before ${formatCutoff()} by a resident individual or HUF may use 12.5% without indexation or 20% with indexation — this estimate uses the lower tax.`,
        );
        if (indexedPurchase) {
          notes.push(
            `Indexed cost uses CII ${indexedPurchase.fromFy} (${ciiForDate(input.purchaseDate)?.cii}) → ${indexedPurchase.toFy} (${ciiForDate(input.saleDate)?.cii}).`,
          );
        }
      } else {
        flatPath.selected = true;
        taxPaths.push(flatPath);
        taxableGain = flatGain;
        ratePercent = flatPath.ratePercent;
        rateLabel = flatPath.label;
        tax = flatTax;
        if (asset.ltcgMethod === "section-112-indexation-choice" && input.purchaseDate >= CAPITAL_GAINS_RULES.propertyIndexationCutoff) {
          notes.push("Property acquired on or after 23 July 2024 is taxed at 12.5% without indexation.");
        }
      }

      if (section54 > 0) {
        notes.push("Exemption claimed (for example Section 54 / 54F / 54EC) is deducted from the gain, subject to statutory caps not modelled here.");
      }
    }
  }

  const cess = rupees(tax * CAPITAL_GAINS_RULES.cessRate);
  const totalTax = tax + cess;
  const netGainAfterTax = unindexedGain - totalTax;

  return {
    assetLabel: asset.label,
    sectionLabel: asset.sectionLabel,
    holdingKind: holding.kind,
    holdingLabel: holding.label,
    holdingDays: holding.days,
    netConsideration,
    costBase,
    indexedCostBase: indexedCostBase != null ? rupees(indexedCostBase) : null,
    capitalGain: unindexedGain,
    indexedGain: indexedGain != null ? rupees(indexedGain) : null,
    exemptionApplied,
    taxableGain,
    ratePercent,
    rateLabel,
    tax,
    cess,
    totalTax,
    netGainAfterTax,
    isLoss,
    taxPaths,
    assumptions,
    notes,
  };
}

function formatPlain(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatCutoff() {
  const parsed = parseIsoDate(CAPITAL_GAINS_RULES.propertyIndexationCutoff);
  if (!parsed) return CAPITAL_GAINS_RULES.propertyIndexationCutoff;
  return `${parsed.day} July ${parsed.year}`;
}

export const CAPITAL_GAINS_FAQS = [
  {
    question: "What rates does this calculator use?",
    answer: `For ${CAPITAL_GAINS_RULES.assessmentYear}, listed equity and equity mutual funds use 20% STCG (Section 111A) and 12.5% LTCG (Section 112A) on gains above ₹1.25 lakh. Other long-term assets generally use 12.5% without indexation. Rates live in a rules file so they can be updated when the law changes.`,
  },
  {
    question: "How is short-term vs long-term decided?",
    answer:
      "Listed equity, equity funds, and other listed securities become long-term after more than 12 months. Property, gold, and other assets become long-term after more than 24 months. Held for that period or less is short-term.",
  },
  {
    question: "Does property still get indexation?",
    answer:
      "Indexation is generally not available after 23 July 2024. Resident individuals and HUFs who acquired land or building before that date may still choose 20% with indexation or 12.5% without — this estimate picks the lower tax.",
  },
  {
    question: "Is the ₹1.25 lakh LTCG exemption per sale?",
    answer:
      "No. The Section 112A exemption is ₹1.25 lakh per financial year across all listed-equity and equity-fund long-term gains. Enter other 112A gains already booked this year to reduce the remaining exemption.",
  },
  {
    question: "Are these figures tax advice?",
    answer:
      "No. Results are planning estimates. Actual tax can vary with STT, surcharge, set-off of losses, Sections 54/54F/54EC conditions, taxpayer status, and the applicable year. Confirm with a qualified tax professional or the Income Tax Department.",
  },
] as const;
