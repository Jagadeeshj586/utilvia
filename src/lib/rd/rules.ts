/**
 * Indian recurring-deposit planning defaults.
 * Update compounding options or tenure limits here when bank conventions change.
 */
export type RdCompoundingId = "monthly" | "quarterly" | "yearly";
export type RdMethodId = "installment-formula" | "period-credit";

export type RdCompounding = {
  id: RdCompoundingId;
  label: string;
  hint: string;
  periodsPerYear: number;
};

export type RdMethod = {
  id: RdMethodId;
  label: string;
  hint: string;
};

export const RD_COMPOUNDING: RdCompounding[] = [
  {
    id: "monthly",
    label: "Monthly",
    hint: "Interest compounds every month",
    periodsPerYear: 12,
  },
  {
    id: "quarterly",
    label: "Quarterly",
    hint: "Most Indian banks compound RD interest quarterly",
    periodsPerYear: 4,
  },
  {
    id: "yearly",
    label: "Yearly",
    hint: "Interest compounds once a year",
    periodsPerYear: 1,
  },
];

export const RD_METHODS: RdMethod[] = [
  {
    id: "installment-formula",
    label: "Indian installment formula",
    hint: "Standard closed-form RD maturity used by many bank calculators",
  },
  {
    id: "period-credit",
    label: "Credit at compounding dates",
    hint: "Adds each deposit, then credits interest only at the compounding interval",
  },
];

export const RD_RULES = {
  rulesLabel: "Based on Indian banking RD rules — quarterly compounding, TDS thresholds",
  defaultMonthly: 5_000,
  defaultRatePercent: 7,
  defaultMonths: 12,
  defaultTenureUnit: "years" as const,
  defaultCompounding: "quarterly" as RdCompoundingId,
  defaultMethod: "installment-formula" as RdMethodId,
  minMonthly: 100,
  maxMonthly: 10_00_000,
  minRatePercent: 0,
  maxRatePercent: 20,
  minMonths: 6,
  maxMonths: 120,
  minYears: 1,
  maxYears: 10,
} as const;

export function getRdCompounding(id: RdCompoundingId): RdCompounding {
  return RD_COMPOUNDING.find((item) => item.id === id) ?? RD_COMPOUNDING[1]!;
}

export function getRdMethod(id: RdMethodId): RdMethod {
  return RD_METHODS.find((item) => item.id === id) ?? RD_METHODS[0]!;
}

export function tenureToMonths(value: number, unit: "years" | "months") {
  return unit === "years" ? Math.round(value * 12) : Math.round(value);
}
