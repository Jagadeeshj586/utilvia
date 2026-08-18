/**
 * Indian NPS (National Pension System) planning defaults.
 * Update limits, tax sections, and exit rules here when PFRDA or Income-tax law changes.
 */
export const NPS_RULES = {
  rulesLabel: "Based on PFRDA NPS guidelines — FY 2026–27, 80CCD tax benefits",
  financialYear: "FY 2026–27",
  defaultCurrentAge: 30,
  defaultRetirementAge: 60,
  defaultMonthly: 5_000,
  defaultCurrentCorpus: 0,
  defaultReturnPercent: 10,
  defaultStepUpPercent: 0,
  defaultAnnuityPercent: 40,
  defaultAnnuityRatePercent: 6,
  minCurrentAge: 18,
  maxCurrentAge: 70,
  minRetirementAge: 50,
  maxRetirementAge: 75,
  standardExitAge: 60,
  maxContinueAge: 70,
  minMonthly: 500,
  maxMonthly: 5_00_000,
  minCurrentCorpus: 0,
  maxCurrentCorpus: 10_00_00_000,
  minReturnPercent: 1,
  maxReturnPercent: 15,
  minStepUpPercent: 0,
  maxStepUpPercent: 20,
  minAnnuityPercent: 40,
  prematureAnnuityPercent: 80,
  maxAnnuityPercent: 100,
  minAnnuityRatePercent: 0,
  maxAnnuityRatePercent: 12,
  /** Full lump-sum allowed at or after 60 if corpus is at or below this. */
  fullWithdrawalCorpusAt60: 5_00_000,
  /** Full lump-sum allowed on premature exit if corpus is at or below this. */
  fullWithdrawalCorpusPremature: 2_50_000,
  maxLumpSumPercentAt60: 60,
  ccd1Limit: 1_50_000,
  ccd1bLimit: 50_000,
  illustrationSlabPercent: 30,
} as const;

export function minAnnuityPercentForExit(retirementAge: number) {
  return retirementAge < NPS_RULES.standardExitAge
    ? NPS_RULES.prematureAnnuityPercent
    : NPS_RULES.minAnnuityPercent;
}

export function fullWithdrawalLimit(retirementAge: number) {
  return retirementAge < NPS_RULES.standardExitAge
    ? NPS_RULES.fullWithdrawalCorpusPremature
    : NPS_RULES.fullWithdrawalCorpusAt60;
}
