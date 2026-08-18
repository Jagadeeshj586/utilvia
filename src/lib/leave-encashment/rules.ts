/**
 * Indian leave-encashment planning defaults.
 * Update the statutory exemption when the Income-tax Act / Budget limit changes.
 */
export const LEAVE_ENCASHMENT_RULES = {
  rulesLabel: "Based on Indian Income Tax rules — Budget 2023 ₹25L exemption",
  previousExemptionLimit: 3_00_000,
  statutoryExemptionLimit: 25_00_000,
  monthsSalaryCap: 10,
  privateWorkingDays: 26,
  governmentYearDays: 300,
  defaultMonthlyBasic: 50_000,
  defaultLeaveDays: 30,
  defaultEncashmentType: "retirement" as const,
  defaultBasis: "private" as const,
  defaultSlabPercent: 30,
  slabPercents: [5, 10, 15, 20, 30] as const,
  minMonthlyBasic: 1,
  maxMonthlyBasic: 1_00_00_000,
  minLeaveDays: 1,
  maxLeaveDays: 300,
} as const;

export type LeaveEncashmentType = "during-service" | "retirement";
export type LeaveEncashmentBasis = "private" | "government";
