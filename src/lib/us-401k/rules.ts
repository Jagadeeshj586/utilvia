/**
 * US 401(k) planning defaults for calendar year 2026.
 * Update these IRS figures when the annual cost-of-living adjustments are published.
 */
export const K401_RULES = {
  rulesLabel: "Based on 2026 IRS 401(k) contribution limits",
  taxYear: 2026,
  /** IRC 402(g) employee elective deferral limit. */
  electiveDeferralLimit: 24_500,
  /** Age 50+ catch-up (IRC 414(v)). */
  catchUpLimit: 8_000,
  /** SECURE 2.0 higher catch-up for ages 60–63. */
  superCatchUpLimit: 11_250,
  superCatchUpMinAge: 60,
  superCatchUpMaxAge: 63,
  catchUpMinAge: 50,
  /** IRC 415(c) annual additions limit (employee + employer, excluding catch-up). */
  annualAdditionsLimit: 72_000,
  withdrawalRatePercent: 4,
  defaultCurrentAge: 30,
  defaultRetirementAge: 67,
  defaultSalary: 75_000,
  defaultBalance: 0,
  defaultContributionPercent: 10,
  defaultMatchPercent: 50,
  defaultMatchUpToPercent: 6,
  defaultReturnPercent: 7,
  defaultSalaryGrowthPercent: 0,
  defaultContributionIncreasePercent: 0,
  defaultCurrentTaxPercent: 22,
  defaultRetirementTaxPercent: 22,
  minCurrentAge: 18,
  maxCurrentAge: 75,
  minRetirementAge: 30,
  maxRetirementAge: 80,
  minSalary: 1,
  maxSalary: 10_000_000,
  minBalance: 0,
  maxBalance: 20_000_000,
  minContributionPercent: 0,
  maxContributionPercent: 100,
  minContributionDollars: 0,
  maxContributionDollars: 100_000,
  minMatchPercent: 0,
  maxMatchPercent: 200,
  minMatchUpToPercent: 0,
  maxMatchUpToPercent: 100,
  minReturnPercent: 0,
  maxReturnPercent: 15,
  minGrowthPercent: 0,
  maxGrowthPercent: 20,
  minTaxPercent: 0,
  maxTaxPercent: 50,
} as const;

export type K401AccountType = "traditional" | "roth" | "compare";
export type K401ContributionMode = "percent" | "dollars";

export function employeeElectiveLimit(age: number) {
  if (age >= K401_RULES.superCatchUpMinAge && age <= K401_RULES.superCatchUpMaxAge) {
    return K401_RULES.electiveDeferralLimit + K401_RULES.superCatchUpLimit;
  }
  if (age >= K401_RULES.catchUpMinAge) {
    return K401_RULES.electiveDeferralLimit + K401_RULES.catchUpLimit;
  }
  return K401_RULES.electiveDeferralLimit;
}

export function catchUpRoom(age: number) {
  return employeeElectiveLimit(age) - K401_RULES.electiveDeferralLimit;
}
