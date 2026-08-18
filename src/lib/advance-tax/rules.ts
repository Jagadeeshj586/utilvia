/** Indian advance-tax planning defaults. Update slabs and due dates when the law changes. */
export const ADVANCE_TAX_RULES = {
  rulesLabel: "Based on Indian Income Tax rules — Advance tax FY 2026-27",
  financialYear: "FY 2026-27",
  assessmentYear: "AY 2027-28",
  defaultIncome: 15_00_000,
  defaultTds: 0,
  defaultIncomeType: "salaried" as const,
  defaultRegime: "new" as const,
  minIncome: 1,
  maxIncome: 10_00_00_000,
  minTds: 0,
  maxTds: 10_00_00_000,
  threshold: 10_000,
  cessPercent: 4,
  newStandardDeduction: 75_000,
  oldStandardDeduction: 50_000,
  adaDeemedPercent: 50,
  adaReceiptsSoftCap: 75_00_000,
  newRebateLimit: 12_00_000,
  newRebateCap: 60_000,
  oldRebateLimit: 5_00_000,
  oldRebateCap: 12_500,
  newSlabs: [
    { upTo: 4_00_000, rate: 0 },
    { upTo: 8_00_000, rate: 0.05 },
    { upTo: 12_00_000, rate: 0.1 },
    { upTo: 16_00_000, rate: 0.15 },
    { upTo: 20_00_000, rate: 0.2 },
    { upTo: 24_00_000, rate: 0.25 },
    { upTo: Infinity, rate: 0.3 },
  ],
  oldSlabs: [
    { upTo: 2_50_000, rate: 0 },
    { upTo: 5_00_000, rate: 0.05 },
    { upTo: 10_00_000, rate: 0.2 },
    { upTo: Infinity, rate: 0.3 },
  ],
  quarterlyInstallments: [
    { id: "jun", label: "1st Installment", dueDate: "15 June 2026", cumulativePercent: 15 },
    { id: "sep", label: "2nd Installment", dueDate: "15 September 2026", cumulativePercent: 45 },
    { id: "dec", label: "3rd Installment", dueDate: "15 December 2026", cumulativePercent: 75 },
    { id: "mar", label: "4th Installment", dueDate: "15 March 2027", cumulativePercent: 100 },
  ],
  adaInstallments: [
    { id: "mar", label: "Single installment", dueDate: "15 March 2027", cumulativePercent: 100 },
  ],
} as const;

export type AdvanceTaxIncomeType = "salaried" | "business" | "44ada";
export type AdvanceTaxRegime = "new" | "old";
