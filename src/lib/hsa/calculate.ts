export const HSA_RULES = {
  taxYear: 2026,
  rulesLabel: "Based on 2026 IRS HSA contribution limits",
  individualLimit: 4300,
  familyLimit: 8550,
  catchUpAge: 55,
  catchUpAmount: 1000,
  retirementAge: 65,
  withdrawalYears: 25,
  minAge: 18,
  maxAge: 64,
  defaultAge: 35,
  defaultContribution: 4300,
  defaultFederalPercent: 22,
  defaultStatePercent: 5,
  defaultReturnPercent: 6,
  minContribution: 0,
  maxContribution: 50_000,
  minStatePercent: 0,
  maxStatePercent: 15,
  minReturnPercent: 0,
  maxReturnPercent: 20,
  hdhpMinDeductibleIndividual: 1650,
  hdhpMinDeductibleFamily: 3300,
} as const;

export const FEDERAL_BRACKETS = [10, 12, 22, 24, 32] as const;

export type HsaCoverage = "individual" | "family";
export type FederalBracket = (typeof FEDERAL_BRACKETS)[number];

export type HsaInput = {
  coverage: HsaCoverage;
  currentAge: number;
  contribution: number;
  federalTaxPercent: number;
  stateTaxPercent: number;
  returnPercent: number;
};

export type HsaResult = {
  contributionLimit: number;
  catchUpApplies: boolean;
  contribution: number;
  remainingRoom: number;
  overLimit: boolean;
  yearsToRetirement: number;
  federalTaxSavings: number;
  stateTaxSavings: number;
  totalTaxSavings: number;
  effectiveCost: number;
  projectedBalance: number;
  monthlyHealthcareBudget: number;
};

export type HsaErrors = Partial<
  Record<"currentAge" | "contribution" | "federalTaxPercent" | "stateTaxPercent" | "returnPercent", string>
>;

export const COVERAGE_OPTIONS: { id: HsaCoverage; label: string }[] = [
  { id: "individual", label: "Individual" },
  { id: "family", label: "Family" },
];

export const DEFAULT_HSA_INPUT: HsaInput = {
  coverage: "individual",
  currentAge: HSA_RULES.defaultAge,
  contribution: HSA_RULES.defaultContribution,
  federalTaxPercent: HSA_RULES.defaultFederalPercent,
  stateTaxPercent: HSA_RULES.defaultStatePercent,
  returnPercent: HSA_RULES.defaultReturnPercent,
};

export function hsaContributionLimit(coverage: HsaCoverage, age: number) {
  const base = coverage === "family" ? HSA_RULES.familyLimit : HSA_RULES.individualLimit;
  if (!Number.isFinite(age) || age < HSA_RULES.catchUpAge) return base;
  return base + HSA_RULES.catchUpAmount;
}

export function validateHsa(input: HsaInput): HsaErrors {
  const errors: HsaErrors = {};
  if (
    !Number.isFinite(input.currentAge) ||
    input.currentAge < HSA_RULES.minAge ||
    input.currentAge > HSA_RULES.maxAge
  ) {
    errors.currentAge = `Enter an age between ${HSA_RULES.minAge} and ${HSA_RULES.maxAge}.`;
  }
  if (
    !Number.isFinite(input.contribution) ||
    input.contribution < HSA_RULES.minContribution ||
    input.contribution > HSA_RULES.maxContribution
  ) {
    errors.contribution = "Enter an annual HSA contribution in dollars.";
  }
  if (!FEDERAL_BRACKETS.includes(input.federalTaxPercent as FederalBracket)) {
    errors.federalTaxPercent = "Choose a federal tax bracket.";
  }
  if (
    !Number.isFinite(input.stateTaxPercent) ||
    input.stateTaxPercent < HSA_RULES.minStatePercent ||
    input.stateTaxPercent > HSA_RULES.maxStatePercent
  ) {
    errors.stateTaxPercent = `Enter a state tax rate from ${HSA_RULES.minStatePercent} to ${HSA_RULES.maxStatePercent}%.`;
  }
  if (
    !Number.isFinite(input.returnPercent) ||
    input.returnPercent < HSA_RULES.minReturnPercent ||
    input.returnPercent > HSA_RULES.maxReturnPercent
  ) {
    errors.returnPercent = `Enter an expected return from ${HSA_RULES.minReturnPercent} to ${HSA_RULES.maxReturnPercent}%.`;
  }
  return errors;
}

export function hasHsaErrors(errors: HsaErrors) {
  return Object.keys(errors).length > 0;
}

function dollars(value: number) {
  return Math.round(value);
}

/** Beginning-of-year contributions through the year you turn 64 (retire at 65). */
export function futureValueAnnuityDue(payment: number, annualRate: number, years: number) {
  if (years <= 0 || payment <= 0) return 0;
  if (annualRate === 0) return payment * years;
  return payment * ((Math.pow(1 + annualRate, years) - 1) / annualRate) * (1 + annualRate);
}

export function calculateHsa(input: HsaInput): HsaResult | null {
  if (hasHsaErrors(validateHsa(input))) return null;

  const contributionLimit = hsaContributionLimit(input.coverage, input.currentAge);
  const catchUpApplies = input.currentAge >= HSA_RULES.catchUpAge;
  const contribution = Math.min(Math.max(0, input.contribution), contributionLimit);
  const remainingRoom = Math.max(0, contributionLimit - input.contribution);
  const overLimit = input.contribution > contributionLimit;
  const yearsToRetirement = HSA_RULES.retirementAge - input.currentAge;

  const federalTaxSavings = dollars(contribution * (input.federalTaxPercent / 100));
  const stateTaxSavings = dollars(contribution * (input.stateTaxPercent / 100));
  const totalTaxSavings = federalTaxSavings + stateTaxSavings;
  const effectiveCost = dollars(contribution - totalTaxSavings);

  const projectedBalance = dollars(
    futureValueAnnuityDue(contribution, input.returnPercent / 100, yearsToRetirement),
  );
  const monthlyHealthcareBudget = dollars(
    projectedBalance / HSA_RULES.withdrawalYears / 12,
  );

  return {
    contributionLimit,
    catchUpApplies,
    contribution,
    remainingRoom,
    overLimit,
    yearsToRetirement,
    federalTaxSavings,
    stateTaxSavings,
    totalTaxSavings,
    effectiveCost,
    projectedBalance,
    monthlyHealthcareBudget,
  };
}

export function hsaCopyText(result: HsaResult) {
  const usd = (value: number) =>
    `$${Math.round(value).toLocaleString("en-US")}`;
  return [
    `Projected HSA at retirement (age ${HSA_RULES.retirementAge}): ${usd(result.projectedBalance)}`,
    `Monthly healthcare budget (est.): ${usd(result.monthlyHealthcareBudget)}`,
    `2026 contribution room: ${usd(result.contributionLimit)}`,
    `Remaining room: ${usd(result.remainingRoom)}`,
    `Total annual tax savings: ${usd(result.totalTaxSavings)}`,
    `Effective cost: ${usd(result.effectiveCost)}`,
  ].join("\n");
}

export const HSA_FAQS = [
  {
    question: "What is the HSA contribution limit for 2026?",
    answer:
      "For 2026, you can contribute up to $4,300 for self-only HDHP coverage or $8,550 for family coverage. Age 55+ adds $1,000 catch-up.",
  },
  {
    question: "Do I need an HDHP to open an HSA?",
    answer:
      "Yes — you must be enrolled in a qualifying High Deductible Health Plan. 2026 minimum deductible: $1,650 individual / $3,300 family.",
  },
  {
    question: "What is the HSA triple tax advantage?",
    answer:
      "Tax-deductible contributions, tax-free growth, and tax-free withdrawals for qualified medical expenses. After 65, withdrawals for any purpose are taxed like a traditional IRA.",
  },
  {
    question: "What happens if I no longer have an HDHP?",
    answer:
      "Existing balance remains yours and grows tax-free. You cannot make new contributions until you re-enroll in a qualifying HDHP.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Your numbers stay on your device.",
  },
];
