import {
  NPS_RULES,
  fullWithdrawalLimit,
  minAnnuityPercentForExit,
} from "./rules";

export { NPS_RULES, fullWithdrawalLimit, minAnnuityPercentForExit } from "./rules";

export type NpsInput = {
  currentAge: number;
  retirementAge: number;
  monthlyContribution: number;
  currentCorpus: number;
  returnPercent: number;
  stepUpPercent: number;
  annuityPercent: number;
  annuityRatePercent: number;
};

export type NpsYearRow = {
  year: number;
  age: number;
  contributedThisYear: number;
  invested: number;
  returns: number;
  balance: number;
};

export type NpsTaxSavings = {
  annualContribution: number;
  ccd1Deduction: number;
  ccd1bDeduction: number;
  taxSavedCcd1: number;
  taxSavedCcd1b: number;
  totalTaxSaved: number;
  slabPercent: number;
};

export type NpsErrors = Partial<
  Record<
    | "currentAge"
    | "retirementAge"
    | "monthlyContribution"
    | "currentCorpus"
    | "returnPercent"
    | "stepUpPercent"
    | "annuityPercent"
    | "annuityRatePercent",
    string
  >
>;

export type NpsResult = {
  currentAge: number;
  retirementAge: number;
  years: number;
  months: number;
  monthlyContribution: number;
  currentCorpus: number;
  returnPercent: number;
  stepUpPercent: number;
  annuityPercent: number;
  annuityRatePercent: number;
  totalInvested: number;
  totalContributed: number;
  corpus: number;
  returnsEarned: number;
  lumpSumWithdrawal: number;
  annuityCorpus: number;
  monthlyPension: number;
  totalRetirementValue: number;
  investedShare: number;
  returnsShare: number;
  prematureExit: boolean;
  fullLumpSumAllowed: boolean;
  taxSavings: NpsTaxSavings;
  yearly: NpsYearRow[];
};

export const DEFAULT_NPS_INPUT: NpsInput = {
  currentAge: NPS_RULES.defaultCurrentAge,
  retirementAge: NPS_RULES.defaultRetirementAge,
  monthlyContribution: NPS_RULES.defaultMonthly,
  currentCorpus: NPS_RULES.defaultCurrentCorpus,
  returnPercent: NPS_RULES.defaultReturnPercent,
  stepUpPercent: NPS_RULES.defaultStepUpPercent,
  annuityPercent: NPS_RULES.defaultAnnuityPercent,
  annuityRatePercent: NPS_RULES.defaultAnnuityRatePercent,
};

function rupees(value: number) {
  return Math.round(value);
}

export function investmentYears(input: Pick<NpsInput, "currentAge" | "retirementAge">) {
  return input.retirementAge - input.currentAge;
}

/** SIP-style future value of beginning-of-month contributions (annuity due). */
export function futureValueAnnuityDue(monthly: number, annualRatePercent: number, months: number) {
  if (months <= 0) return 0;
  const rate = annualRatePercent / 12 / 100;
  if (rate === 0) return monthly * months;
  return ((Math.pow(1 + rate, months) - 1) / rate) * monthly * (1 + rate);
}

export function estimateNpsTaxSavings(annualContribution: number): NpsTaxSavings {
  const annual = Math.max(0, annualContribution);
  const ccd1Deduction = Math.min(NPS_RULES.ccd1Limit, annual);
  const ccd1bDeduction = Math.min(NPS_RULES.ccd1bLimit, Math.max(0, annual - ccd1Deduction));
  const slab = NPS_RULES.illustrationSlabPercent / 100;
  return {
    annualContribution: rupees(annual),
    ccd1Deduction: rupees(ccd1Deduction),
    ccd1bDeduction: rupees(ccd1bDeduction),
    taxSavedCcd1: rupees(ccd1Deduction * slab),
    taxSavedCcd1b: rupees(ccd1bDeduction * slab),
    totalTaxSaved: rupees((ccd1Deduction + ccd1bDeduction) * slab),
    slabPercent: NPS_RULES.illustrationSlabPercent,
  };
}

export function validateNps(input: NpsInput): NpsErrors {
  const errors: NpsErrors = {};
  if (!Number.isFinite(input.currentAge) || input.currentAge < NPS_RULES.minCurrentAge) {
    errors.currentAge = `Enter your age (${NPS_RULES.minCurrentAge} or older).`;
  } else if (input.currentAge > NPS_RULES.maxCurrentAge) {
    errors.currentAge = `Current age cannot exceed ${NPS_RULES.maxCurrentAge}.`;
  }

  if (!Number.isFinite(input.retirementAge) || input.retirementAge < NPS_RULES.minRetirementAge) {
    errors.retirementAge = `Retirement age should be at least ${NPS_RULES.minRetirementAge}.`;
  } else if (input.retirementAge > NPS_RULES.maxRetirementAge) {
    errors.retirementAge = `Retirement age cannot exceed ${NPS_RULES.maxRetirementAge}.`;
  } else if (Number.isFinite(input.currentAge) && input.retirementAge <= input.currentAge) {
    errors.retirementAge = "Retirement age must be greater than your current age.";
  }

  if (!Number.isFinite(input.monthlyContribution) || input.monthlyContribution < NPS_RULES.minMonthly) {
    errors.monthlyContribution = `Enter at least ₹${NPS_RULES.minMonthly.toLocaleString("en-IN")} per month.`;
  } else if (input.monthlyContribution > NPS_RULES.maxMonthly) {
    errors.monthlyContribution = `Monthly contribution cannot exceed ₹${NPS_RULES.maxMonthly.toLocaleString("en-IN")}.`;
  }

  if (!Number.isFinite(input.currentCorpus) || input.currentCorpus < NPS_RULES.minCurrentCorpus) {
    errors.currentCorpus = "Current corpus cannot be negative.";
  } else if (input.currentCorpus > NPS_RULES.maxCurrentCorpus) {
    errors.currentCorpus = `Current corpus cannot exceed ₹${NPS_RULES.maxCurrentCorpus.toLocaleString("en-IN")}.`;
  }

  if (!Number.isFinite(input.returnPercent) || input.returnPercent < NPS_RULES.minReturnPercent) {
    errors.returnPercent = `Enter an expected return of at least ${NPS_RULES.minReturnPercent}%.`;
  } else if (input.returnPercent > NPS_RULES.maxReturnPercent) {
    errors.returnPercent = `Expected return cannot exceed ${NPS_RULES.maxReturnPercent}%.`;
  }

  if (!Number.isFinite(input.stepUpPercent) || input.stepUpPercent < NPS_RULES.minStepUpPercent) {
    errors.stepUpPercent = "Contribution increase cannot be negative.";
  } else if (input.stepUpPercent > NPS_RULES.maxStepUpPercent) {
    errors.stepUpPercent = `Annual increase cannot exceed ${NPS_RULES.maxStepUpPercent}%.`;
  }

  const minAnnuity = Number.isFinite(input.retirementAge)
    ? minAnnuityPercentForExit(input.retirementAge)
    : NPS_RULES.minAnnuityPercent;
  if (!Number.isFinite(input.annuityPercent) || input.annuityPercent < minAnnuity) {
    errors.annuityPercent =
      minAnnuity > NPS_RULES.minAnnuityPercent
        ? `Before age ${NPS_RULES.standardExitAge}, NPS requires at least ${minAnnuity}% as annuity if the corpus is above the full-withdrawal limit.`
        : `Annuity must be at least ${NPS_RULES.minAnnuityPercent}% at retirement.`;
  } else if (input.annuityPercent > NPS_RULES.maxAnnuityPercent) {
    errors.annuityPercent = "Annuity cannot exceed 100%.";
  }

  if (!Number.isFinite(input.annuityRatePercent) || input.annuityRatePercent < NPS_RULES.minAnnuityRatePercent) {
    errors.annuityRatePercent = "Enter an annuity rate of 0% or more.";
  } else if (input.annuityRatePercent > NPS_RULES.maxAnnuityRatePercent) {
    errors.annuityRatePercent = `Annuity rate cannot exceed ${NPS_RULES.maxAnnuityRatePercent}%.`;
  }

  return errors;
}

export function hasNpsErrors(errors: NpsErrors) {
  return Object.keys(errors).length > 0;
}

export function calculateNps(input: NpsInput): NpsResult | null {
  if (hasNpsErrors(validateNps(input))) return null;

  const years = investmentYears(input);
  const months = years * 12;
  const monthlyRate = input.returnPercent / 12 / 100;
  const step = input.stepUpPercent / 100;

  let balance = input.currentCorpus;
  let contributed = 0;
  const yearly: NpsYearRow[] = [];

  for (let year = 1; year <= years; year += 1) {
    const monthly = input.monthlyContribution * Math.pow(1 + step, year - 1);
    let contributedThisYear = 0;
    for (let month = 0; month < 12; month += 1) {
      balance = (balance + monthly) * (1 + monthlyRate);
      contributed += monthly;
      contributedThisYear += monthly;
    }
    const invested = input.currentCorpus + contributed;
    yearly.push({
      year,
      age: input.currentAge + year,
      contributedThisYear: rupees(contributedThisYear),
      invested: rupees(invested),
      returns: rupees(balance - invested),
      balance: rupees(balance),
    });
  }

  const corpus = rupees(balance);
  const totalContributed = rupees(contributed);
  const totalInvested = rupees(input.currentCorpus + contributed);
  const returnsEarned = rupees(corpus - totalInvested);
  const annuityPercent = input.annuityPercent;
  const annuityCorpus = rupees((annuityPercent / 100) * corpus);
  const lumpSumWithdrawal = rupees(corpus - annuityCorpus);
  const monthlyPension = rupees((input.annuityRatePercent / 100) * annuityCorpus / 12);
  const investedShare = corpus <= 0 ? 0 : (totalInvested / corpus) * 100;
  const last = yearly[yearly.length - 1];
  if (last) last.balance = corpus;

  return {
    currentAge: input.currentAge,
    retirementAge: input.retirementAge,
    years,
    months,
    monthlyContribution: input.monthlyContribution,
    currentCorpus: rupees(input.currentCorpus),
    returnPercent: input.returnPercent,
    stepUpPercent: input.stepUpPercent,
    annuityPercent,
    annuityRatePercent: input.annuityRatePercent,
    totalInvested,
    totalContributed,
    corpus,
    returnsEarned,
    lumpSumWithdrawal,
    annuityCorpus,
    monthlyPension,
    totalRetirementValue: corpus,
    investedShare,
    returnsShare: 100 - investedShare,
    prematureExit: input.retirementAge < NPS_RULES.standardExitAge,
    fullLumpSumAllowed: corpus <= fullWithdrawalLimit(input.retirementAge),
    taxSavings: estimateNpsTaxSavings(input.monthlyContribution * 12),
    yearly,
  };
}

export const NPS_FAQS = [
  {
    question: "What is the minimum monthly contribution to NPS?",
    answer: `NPS Tier I typically needs at least ₹${NPS_RULES.minMonthly.toLocaleString("en-IN")} per contribution and ₹1,000 in a financial year. This calculator defaults to ₹${NPS_RULES.defaultMonthly.toLocaleString("en-IN")} a month.`,
  },
  {
    question: "Can I withdraw the full NPS corpus at retirement?",
    answer: `At age ${NPS_RULES.standardExitAge} or later, at least ${NPS_RULES.minAnnuityPercent}% usually goes to an annuity and up to ${NPS_RULES.maxLumpSumPercentAt60}% can be withdrawn as a lump sum. If the corpus is ₹${(NPS_RULES.fullWithdrawalCorpusAt60 / 1_00_000).toFixed(0)} lakh or less, a 100% lump-sum exit is allowed. Before 60, the annuity share is typically ${NPS_RULES.prematureAnnuityPercent}% unless the corpus is very small.`,
  },
  {
    question: "Is NPS better than PPF?",
    answer:
      "They serve different jobs. PPF is a 15-year EEE small-savings scheme with a government-set rate. NPS is market-linked, can run to retirement, and pays a pension from the annuity. Many people use both. This calculator does not compare products.",
  },
  {
    question: "Is NPS available under the new tax regime?",
    answer:
      "Your own NPS contribution is not deductible under the new regime. Employer NPS under 80CCD(2) still is. Under the old regime, 80CCD(1) (within the ₹1.5 lakh 80C cap) and extra 80CCD(1B) up to ₹50,000 can apply. Tax figures here are an old-regime illustration at a 30% slab.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Amounts stay on your device.",
  },
] as const;
