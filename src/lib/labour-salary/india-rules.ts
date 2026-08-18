/**
 * India Labour Code 2026 payroll constants.
 * Codes in force 21 November 2025. EPF / EPS / EDLI schemes notified 29 June 2026.
 * Figures are planning defaults — update here when MoLE notifies new ceilings or rates.
 */
export const INDIA_LABOUR_CODE_2026 = {
  effectiveDate: "2025-11-21",
  /** First proviso to Section 2(y), Code on Wages — allowances above this share are added back to wages. */
  wageFloorPercent: 0.5,
  /**
   * March 2026 MoLE FAQ: statutory employer PF/pension and statutory bonus count toward
   * the 50% remuneration test; gratuity, ESI, and annual performance incentives do not.
   */
  includeEmployerPfInRemuneration: true,
  excludeVariableFromWages: true,
  pf: {
    employeeRate: 0.12,
    employerRate: 0.12,
    employerEpsRate: 0.0833,
    employerEpfRate: 0.0367,
    /** Notified wage ceiling under Section 2(89) CoSS (S.O. 2701(E), 29 May 2026). */
    wageCeilingMonthly: 15_000,
    edliRate: 0.005,
    edliCapMonthly: 75,
  },
  esi: {
    employeeRate: 0.0075,
    employerRate: 0.0325,
    /** Pre-existing coverage threshold continues pending final ESI rules. */
    wageThresholdMonthly: 21_000,
  },
  /** Annual gratuity provision for one year of service: 15/26 of monthly wages × 12. */
  gratuityDaysNumerator: 15,
  gratuityDaysDenominator: 26,
  tax: {
    standardDeductionNew: 75_000,
    standardDeductionOld: 50_000,
    cess: 0.04,
  },
} as const;

export type PfContributionMode = "ceiling" | "full-wages";
export type IndiaTaxRegime = "new" | "old";
