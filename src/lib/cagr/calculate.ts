import { CAGR_RULES, type CagrMode, type NiftyComparison } from "./rules";

export { CAGR_RULES } from "./rules";
export type { CagrMode, NiftyComparison } from "./rules";

export type CagrInput = {
  mode: CagrMode;
  initial: number;
  final: number;
  target: number;
  cagrPercent: number;
  years: number;
  inflationPercent: number;
};

export type CagrYearRow = {
  year: number;
  balance: number;
  gain: number;
};

export type CagrErrors = Partial<Record<"initial" | "final" | "target" | "cagrPercent" | "years" | "inflationPercent", string>>;

export type CagrFindResult = {
  mode: "find-cagr";
  initial: number;
  final: number;
  years: number;
  cagr: number;
  absoluteReturn: number;
  realCagr: number;
  inflationPercent: number;
  doublingYears: number | null;
};

export type CagrFvResult = {
  mode: "find-fv";
  initial: number;
  cagr: number;
  years: number;
  futureValue: number;
  totalGain: number;
  absoluteReturn: number;
  doublingYears: number | null;
  yearRows: CagrYearRow[];
};

export type CagrRequiredResult = {
  mode: "find-required";
  initial: number;
  target: number;
  years: number;
  requiredCagr: number;
  doublingYears: number | null;
  niftyComparison: NiftyComparison;
};

export type CagrResult = CagrFindResult | CagrFvResult | CagrRequiredResult;

export const DEFAULT_CAGR_INPUT: CagrInput = {
  mode: CAGR_RULES.defaultMode,
  initial: CAGR_RULES.defaultInitial,
  final: CAGR_RULES.defaultFinal,
  target: CAGR_RULES.defaultTarget,
  cagrPercent: CAGR_RULES.defaultCagrPercent,
  years: CAGR_RULES.defaultYears,
  inflationPercent: CAGR_RULES.inflationPercent,
};

function rupees(value: number) {
  return Math.round(value);
}

export function absoluteReturnPercent(initial: number, final: number) {
  if (initial <= 0) return 0;
  return ((final - initial) / initial) * 100;
}

export function cagrPercent(initial: number, final: number, years: number) {
  if (initial <= 0 || final <= 0 || years <= 0) return null;
  return (Math.pow(final / initial, 1 / years) - 1) * 100;
}

export function futureValue(initial: number, cagrPercentValue: number, years: number) {
  if (initial <= 0 || years <= 0 || cagrPercentValue < 0) return null;
  return initial * Math.pow(1 + cagrPercentValue / 100, years);
}

export function realCagrPercent(cagr: number, inflationPercent: number = CAGR_RULES.inflationPercent) {
  return ((1 + cagr / 100) / (1 + inflationPercent / 100) - 1) * 100;
}

export function doublingYears(cagr: number) {
  if (cagr <= 0) return null;
  return 72 / cagr;
}

export function niftyComparison(cagr: number): NiftyComparison {
  if (cagr > CAGR_RULES.niftyMaxPercent) return "above";
  if (cagr < CAGR_RULES.niftyMinPercent) return "below";
  return "within";
}

export function validateCagr(input: CagrInput): CagrErrors {
  const errors: CagrErrors = {};

  if (!Number.isFinite(input.initial) || input.initial < CAGR_RULES.minValue) {
    errors.initial = "Enter an initial value greater than ₹0.";
  } else if (input.initial > CAGR_RULES.maxValue) {
    errors.initial = "Initial value is above the amount this calculator can model.";
  }

  if (!Number.isFinite(input.years) || input.years < CAGR_RULES.minYears) {
    errors.years = `Enter a time period of at least ${CAGR_RULES.minYears} years.`;
  } else if (input.years > CAGR_RULES.maxYears) {
    errors.years = `Time period cannot exceed ${CAGR_RULES.maxYears} years.`;
  }

  if (input.mode === "find-cagr") {
    if (!Number.isFinite(input.inflationPercent) || input.inflationPercent < CAGR_RULES.minInflationPercent) {
      errors.inflationPercent = "Inflation cannot be negative.";
    } else if (input.inflationPercent > CAGR_RULES.maxInflationPercent) {
      errors.inflationPercent = `Inflation cannot exceed ${CAGR_RULES.maxInflationPercent}%.`;
    }

    if (!Number.isFinite(input.final) || input.final < CAGR_RULES.minValue) {
      errors.final = "Enter a final value greater than ₹0.";
    } else if (input.final > CAGR_RULES.maxValue) {
      errors.final = "Final value is above the amount this calculator can model.";
    }
  }

  if (input.mode === "find-required") {
    if (!Number.isFinite(input.target) || input.target < CAGR_RULES.minValue) {
      errors.target = "Enter a target value greater than ₹0.";
    } else if (input.target > CAGR_RULES.maxValue) {
      errors.target = "Target value is above the amount this calculator can model.";
    }
  }

  if (input.mode === "find-fv") {
    if (!Number.isFinite(input.cagrPercent) || input.cagrPercent < CAGR_RULES.minCagrPercent) {
      errors.cagrPercent = "Expected CAGR cannot be negative.";
    } else if (input.cagrPercent > CAGR_RULES.maxCagrPercent) {
      errors.cagrPercent = `Expected CAGR cannot exceed ${CAGR_RULES.maxCagrPercent}%.`;
    }
  }

  return errors;
}

export function hasCagrErrors(errors: CagrErrors) {
  return Object.keys(errors).length > 0;
}

function yearRows(initial: number, cagr: number, years: number): CagrYearRow[] {
  const rows: CagrYearRow[] = [];
  const lastYear = Math.floor(years);
  for (let year = 1; year <= lastYear; year += 1) {
    const balance = futureValue(initial, cagr, year) ?? initial;
    rows.push({ year, balance: rupees(balance), gain: rupees(balance - initial) });
  }
  return rows;
}

export function calculateCagr(input: CagrInput): CagrResult | null {
  if (hasCagrErrors(validateCagr(input))) return null;

  if (input.mode === "find-cagr") {
    const cagr = cagrPercent(input.initial, input.final, input.years);
    if (cagr == null || !Number.isFinite(cagr)) return null;
    return {
      mode: "find-cagr",
      initial: input.initial,
      final: input.final,
      years: input.years,
      cagr,
      absoluteReturn: absoluteReturnPercent(input.initial, input.final),
      realCagr: realCagrPercent(cagr, input.inflationPercent),
      inflationPercent: input.inflationPercent,
      doublingYears: doublingYears(cagr),
    };
  }

  if (input.mode === "find-fv") {
    const value = futureValue(input.initial, input.cagrPercent, input.years);
    if (value == null || !Number.isFinite(value)) return null;
    return {
      mode: "find-fv",
      initial: input.initial,
      cagr: input.cagrPercent,
      years: input.years,
      futureValue: rupees(value),
      totalGain: rupees(value - input.initial),
      absoluteReturn: absoluteReturnPercent(input.initial, value),
      doublingYears: doublingYears(input.cagrPercent),
      yearRows: yearRows(input.initial, input.cagrPercent, input.years),
    };
  }

  const required = cagrPercent(input.initial, input.target, input.years);
  if (required == null || !Number.isFinite(required)) return null;
  return {
    mode: "find-required",
    initial: input.initial,
    target: input.target,
    years: input.years,
    requiredCagr: required,
    doublingYears: doublingYears(required),
    niftyComparison: niftyComparison(required),
  };
}

export const CAGR_FAQS = [
  {
    question: "What is a good CAGR in India?",
    answer: `For equity mutual funds and stocks, a CAGR of ${CAGR_RULES.niftyMinPercent}–${CAGR_RULES.niftyMaxPercent}% or above over 5+ years is generally considered good, as it matches or beats the Nifty 50’s historical long-term average. For fixed income, 7–8% CAGR (PPF/FD range) is typical. Always compare against the relevant benchmark.`,
  },
  {
    question: "What is the difference between CAGR and absolute return?",
    answer:
      "Absolute return is the total gain, ignoring time. ₹1 lakh growing to ₹2 lakhs is 100% absolute return whether it took 2 years or 10. CAGR is the annualised rate — 100% in 2 years is about 41.4% CAGR, while 100% in 10 years is about 7.2% CAGR. Use CAGR when comparing investments of different durations.",
  },
  {
    question: "Can I use CAGR for SIP investments?",
    answer:
      "CAGR is for a single lump-sum with one start value and one end value. For SIPs with multiple cash flows, use XIRR, which accounts for different dates and amounts. Most mutual fund platforms show XIRR for SIP portfolios.",
  },
  {
    question: "What is the Rule of 72?",
    answer: `Divide 72 by the annual growth rate to estimate years to double. At 12% CAGR, money doubles in 6 years. At 8%, it takes 9 years. At ${CAGR_RULES.inflationPercent}% inflation, prices double in 12 years — which is why investments should earn more than inflation.`,
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Amounts stay on your device.",
  },
] as const;
