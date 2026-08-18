/** Configurable Payment of Gratuity values — update when rules change. */
export const GRATUITY_RULES = {
  actLabel: "Payment of Gratuity Act — FY2025-26",
  minEligibleYears: 5,
  daysWagesPerYear: 15,
  workingDaysCovered: 26,
  workingDaysNotCovered: 30,
  taxFreeLimit: 20_00_000,
} as const;

export const MAX_GRATUITY_LIMIT = GRATUITY_RULES.taxFreeLimit;
