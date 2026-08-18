export const ESI_RULES = {
  rulesLabel: "Based on ESIC guidelines — FY 2026-27 contribution rates",
  financialYear: "FY 2026-27",
  employeeRate: 0.75,
  employerRate: 3.25,
  totalRate: 4,
  wageCeiling: 21_000,
  disabledWageCeiling: 25_000,
  epfWageCeiling: 15_000,
  epfEmployeeRate: 12,
  ptEstimateRate: 1,
  defaultWages: 18_000,
  minWages: 1,
  maxWages: 10_00_000,
} as const;

export type EsiInput = {
  monthlyWages: number;
  disabled: boolean;
};

export type EsiResult = {
  eligible: boolean;
  ceiling: number;
  employeeMonthly: number;
  employerMonthly: number;
  totalMonthly: number;
  employeeAnnual: number;
  employerAnnual: number;
  totalAnnual: number;
  professionalTaxEst: number;
  epfEmployeeEst: number;
  netTakeHomeEst: number;
};

export type EsiErrors = Partial<Record<"monthlyWages", string>>;

export const DEFAULT_ESI_INPUT: EsiInput = {
  monthlyWages: ESI_RULES.defaultWages,
  disabled: false,
};

function rupees(value: number) {
  return Math.round(value);
}

export function esiCeiling(disabled: boolean) {
  return disabled ? ESI_RULES.disabledWageCeiling : ESI_RULES.wageCeiling;
}

export function estimatedProfessionalTax(monthlyWages: number) {
  return rupees(monthlyWages * (ESI_RULES.ptEstimateRate / 100));
}

export function estimatedEpfEmployee(monthlyWages: number) {
  const wage = Math.min(monthlyWages, ESI_RULES.epfWageCeiling);
  return rupees(wage * (ESI_RULES.epfEmployeeRate / 100));
}

export function validateEsi(input: EsiInput): EsiErrors {
  const errors: EsiErrors = {};
  if (
    !Number.isFinite(input.monthlyWages) ||
    input.monthlyWages < ESI_RULES.minWages ||
    input.monthlyWages > ESI_RULES.maxWages
  ) {
    errors.monthlyWages = `Enter monthly gross wages from ₹${ESI_RULES.minWages.toLocaleString("en-IN")} to ₹${ESI_RULES.maxWages.toLocaleString("en-IN")}.`;
  }
  return errors;
}

export function hasEsiErrors(errors: EsiErrors) {
  return Object.keys(errors).length > 0;
}

export function calculateEsi(input: EsiInput): EsiResult | null {
  if (hasEsiErrors(validateEsi(input))) return null;

  const ceiling = esiCeiling(input.disabled);
  const eligible = input.monthlyWages <= ceiling;
  const employeeMonthly = eligible ? rupees(input.monthlyWages * (ESI_RULES.employeeRate / 100)) : 0;
  const employerMonthly = eligible ? rupees(input.monthlyWages * (ESI_RULES.employerRate / 100)) : 0;
  const totalMonthly = employeeMonthly + employerMonthly;
  const professionalTaxEst = estimatedProfessionalTax(input.monthlyWages);
  const epfEmployeeEst = estimatedEpfEmployee(input.monthlyWages);

  return {
    eligible,
    ceiling,
    employeeMonthly,
    employerMonthly,
    totalMonthly,
    employeeAnnual: employeeMonthly * 12,
    employerAnnual: employerMonthly * 12,
    totalAnnual: totalMonthly * 12,
    professionalTaxEst,
    epfEmployeeEst,
    netTakeHomeEst: input.monthlyWages - employeeMonthly - professionalTaxEst - epfEmployeeEst,
  };
}

export function esiCopyText(wages: number, result: EsiResult) {
  if (!result.eligible) {
    return `ESI not applicable — gross wages ₹${wages.toLocaleString("en-IN")} exceed the ₹${result.ceiling.toLocaleString("en-IN")} ceiling.`;
  }
  return [
    `ESI on ₹${wages.toLocaleString("en-IN")} / month`,
    `Your contribution (0.75%): ₹${result.employeeMonthly.toLocaleString("en-IN")}`,
    `Employer (3.25%): ₹${result.employerMonthly.toLocaleString("en-IN")}`,
    `Total ESI (4%): ₹${result.totalMonthly.toLocaleString("en-IN")}`,
    `Net take-home (est.): ₹${result.netTakeHomeEst.toLocaleString("en-IN")}`,
  ].join("\n");
}

export const ESI_FAQS = [
  {
    question: "What is the ESI contribution rate in India for 2026?",
    answer: `For ${ESI_RULES.financialYear}, the employee contributes ${ESI_RULES.employeeRate}% of gross wages and the employer contributes ${ESI_RULES.employerRate}% (total ${ESI_RULES.totalRate}%). These are the current ESIC rates used in this calculator.`,
  },
  {
    question: `What is the ESI wage ceiling for ${ESI_RULES.financialYear}?`,
    answer: `ESI applies when monthly gross wages are ₹${ESI_RULES.wageCeiling.toLocaleString("en-IN")} or less. For employees with a disability, the ceiling is ₹${ESI_RULES.disabledWageCeiling.toLocaleString("en-IN")}.`,
  },
  {
    question: "Is ESI deducted from Basic or Gross salary?",
    answer:
      "ESI is calculated on gross wages — typically basic, DA, and other cash allowances that form wages under the ESI Act. This calculator uses the monthly gross figure you enter.",
  },
  {
    question: "What happens to my ESI if my salary exceeds ₹21,000 mid-year?",
    answer:
      "Coverage is for a contribution period. If you were covered at the start of the period, ESI usually continues until that period ends even if wages later cross the ceiling. New coverage is not taken if you already earn above the ceiling. Confirm the dates with your employer or ESIC.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Your salary stays on your device.",
  },
];
