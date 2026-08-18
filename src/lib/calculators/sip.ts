import { formatINR } from "../utils";

export const SIP_DEFAULTS = {
  monthlyInvestment: 10_000,
  annualReturn: 12,
  years: 10,
  stepUpEnabled: false,
  stepUpPercent: 10,
} as const;

export const SIP_LIMITS = {
  monthlyInvestment: { min: 500, max: 10_00_000 },
  annualReturn: { min: 0, max: 30 },
  years: { min: 1, max: 40 },
  stepUpPercent: { min: 0, max: 25 },
} as const;

export type SipInput = {
  monthlyInvestment: number;
  annualReturn: number;
  years: number;
  stepUpEnabled?: boolean;
  stepUpPercent?: number;
};

export type SipYearRow = {
  year: number;
  monthlySip: number;
  invested: number;
  estimatedReturns: number;
  totalValue: number;
};

export type SipResult = {
  monthlyInvestment: number;
  annualReturn: number;
  years: number;
  months: number;
  monthlyRate: number;
  totalInvested: number;
  estimatedReturns: number;
  futureValue: number;
  wealthGainPercent: number;
  stepUpEnabled: boolean;
  stepUpPercent: number;
  yearlyBreakdown: SipYearRow[];
  mode: "standard" | "step-up";
};

export type SipValidation = {
  monthlyInvestment?: string;
  annualReturn?: string;
  years?: string;
  stepUpPercent?: string;
};

export function monthlyRateFromAnnual(annualReturn: number) {
  return annualReturn / 12 / 100;
}

/** Annuity-due SIP future value. When r = 0, FV = P × n. */
export function sipFutureValue(monthlyInvestment: number, monthlyRate: number, months: number) {
  if (months <= 0 || monthlyInvestment === 0) return 0;
  if (monthlyRate === 0) return monthlyInvestment * months;
  const growth = Math.pow(1 + monthlyRate, months);
  return monthlyInvestment * ((growth - 1) / monthlyRate) * (1 + monthlyRate);
}

export function calculateStandardSIP(input: SipInput): SipResult {
  const monthlyInvestment = input.monthlyInvestment;
  const annualReturn = input.annualReturn;
  const years = Math.round(input.years);
  const months = years * 12;
  const r = monthlyRateFromAnnual(annualReturn);
  const futureValue = sipFutureValue(monthlyInvestment, r, months);
  const totalInvested = monthlyInvestment * months;
  const yearlyBreakdown: SipYearRow[] = [];

  for (let year = 1; year <= years; year += 1) {
    const n = year * 12;
    const invested = monthlyInvestment * n;
    const totalValue = sipFutureValue(monthlyInvestment, r, n);
    yearlyBreakdown.push({
      year,
      monthlySip: monthlyInvestment,
      invested,
      totalValue,
      estimatedReturns: totalValue - invested,
    });
  }

  return finalizeResult({
    monthlyInvestment,
    annualReturn,
    years,
    months,
    monthlyRate: r,
    totalInvested,
    futureValue,
    yearlyBreakdown,
    stepUpEnabled: false,
    stepUpPercent: 0,
    mode: "standard",
  });
}

export function calculateStepUpSIP(input: SipInput): SipResult {
  const monthlyInvestment = input.monthlyInvestment;
  const annualReturn = input.annualReturn;
  const years = Math.round(input.years);
  const months = years * 12;
  const r = monthlyRateFromAnnual(annualReturn);
  const stepUpPercent = Math.max(0, input.stepUpPercent ?? 0);
  const step = stepUpPercent / 100;

  let value = 0;
  let invested = 0;
  const yearlyBreakdown: SipYearRow[] = [];

  for (let year = 1; year <= years; year += 1) {
    const monthlySip = monthlyInvestment * Math.pow(1 + step, year - 1);
    for (let month = 0; month < 12; month += 1) {
      invested += monthlySip;
      value = r === 0 ? value + monthlySip : (value + monthlySip) * (1 + r);
    }
    yearlyBreakdown.push({
      year,
      monthlySip,
      invested,
      totalValue: value,
      estimatedReturns: value - invested,
    });
  }

  return finalizeResult({
    monthlyInvestment,
    annualReturn,
    years,
    months,
    monthlyRate: r,
    totalInvested: invested,
    futureValue: value,
    yearlyBreakdown,
    stepUpEnabled: true,
    stepUpPercent,
    mode: "step-up",
  });
}

export function calculateSIP(input: SipInput): SipResult {
  const stepUpEnabled = Boolean(input.stepUpEnabled);
  const stepUpPercent = input.stepUpPercent ?? 0;
  if (stepUpEnabled && stepUpPercent > 0) return calculateStepUpSIP(input);
  return calculateStandardSIP(input);
}

function finalizeResult(
  partial: Omit<SipResult, "estimatedReturns" | "wealthGainPercent"> & {
    futureValue: number;
    totalInvested: number;
  },
): SipResult {
  const futureValue = Number.isFinite(partial.futureValue) ? partial.futureValue : 0;
  const totalInvested = Number.isFinite(partial.totalInvested) ? partial.totalInvested : 0;
  const estimatedReturns = futureValue - totalInvested;
  const wealthGainPercent = totalInvested > 0 ? (estimatedReturns / totalInvested) * 100 : 0;
  return {
    ...partial,
    futureValue,
    totalInvested,
    estimatedReturns,
    wealthGainPercent,
  };
}

export function validateSipInput(input: {
  monthlyInvestment: number;
  annualReturn: number;
  years: number;
  stepUpEnabled?: boolean;
  stepUpPercent?: number;
}): SipValidation {
  const errors: SipValidation = {};
  const { monthlyInvestment, annualReturn, years, stepUpEnabled, stepUpPercent } = input;

  if (!Number.isFinite(monthlyInvestment) || monthlyInvestment < SIP_LIMITS.monthlyInvestment.min || monthlyInvestment > SIP_LIMITS.monthlyInvestment.max) {
    errors.monthlyInvestment = `Enter an investment amount between ${formatINR(SIP_LIMITS.monthlyInvestment.min)} and ${formatINR(SIP_LIMITS.monthlyInvestment.max)}.`;
  }
  if (!Number.isFinite(annualReturn) || annualReturn < SIP_LIMITS.annualReturn.min || annualReturn > SIP_LIMITS.annualReturn.max) {
    errors.annualReturn = `Enter an expected return between ${SIP_LIMITS.annualReturn.min}% and ${SIP_LIMITS.annualReturn.max}%.`;
  }
  if (!Number.isFinite(years) || years < SIP_LIMITS.years.min || years > SIP_LIMITS.years.max) {
    errors.years = `Investment duration must be between ${SIP_LIMITS.years.min} and ${SIP_LIMITS.years.max} years.`;
  }
  if (stepUpEnabled) {
    const step = stepUpPercent ?? NaN;
    if (!Number.isFinite(step) || step < SIP_LIMITS.stepUpPercent.min || step > SIP_LIMITS.stepUpPercent.max) {
      errors.stepUpPercent = `Annual SIP increase must be between ${SIP_LIMITS.stepUpPercent.min}% and ${SIP_LIMITS.stepUpPercent.max}%.`;
    }
  }
  return errors;
}

export function clampSipInput(input: SipInput): SipInput {
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  return {
    monthlyInvestment: clamp(Number.isFinite(input.monthlyInvestment) ? input.monthlyInvestment : SIP_DEFAULTS.monthlyInvestment, SIP_LIMITS.monthlyInvestment.min, SIP_LIMITS.monthlyInvestment.max),
    annualReturn: clamp(Number.isFinite(input.annualReturn) ? input.annualReturn : SIP_DEFAULTS.annualReturn, SIP_LIMITS.annualReturn.min, SIP_LIMITS.annualReturn.max),
    years: Math.round(clamp(Number.isFinite(input.years) ? input.years : SIP_DEFAULTS.years, SIP_LIMITS.years.min, SIP_LIMITS.years.max)),
    stepUpEnabled: Boolean(input.stepUpEnabled),
    stepUpPercent: clamp(Number.isFinite(input.stepUpPercent ?? SIP_DEFAULTS.stepUpPercent) ? (input.stepUpPercent ?? SIP_DEFAULTS.stepUpPercent) : SIP_DEFAULTS.stepUpPercent, SIP_LIMITS.stepUpPercent.min, SIP_LIMITS.stepUpPercent.max),
  };
}

export function sipSummaryText(result: SipResult) {
  const monthly = formatINR(result.monthlyInvestment);
  const invested = formatINR(Math.round(result.totalInvested));
  const value = formatINR(Math.round(result.futureValue));
  const step = result.mode === "step-up"
    ? ` with an annual step-up of ${result.stepUpPercent}%`
    : "";
  return `If you invest ${monthly} every month for ${result.years} year${result.years === 1 ? "" : "s"} at an assumed annual return of ${result.annualReturn}%${step}, your total investment would be ${invested} and the estimated value could grow to approximately ${value}.`;
}

export function sipCopyText(result: SipResult) {
  const lines = [
    "SIP Calculator",
    "",
    `Monthly Investment: ${formatINR(result.monthlyInvestment)}`,
    `Expected Return: ${result.annualReturn}%`,
    `Duration: ${result.years} years`,
  ];
  if (result.mode === "step-up") lines.push(`Annual SIP Increase: ${result.stepUpPercent}%`);
  lines.push(
    `Total Invested: ${formatINR(Math.round(result.totalInvested))}`,
    `Estimated Returns: ${formatINR(Math.round(result.estimatedReturns))}`,
    `Estimated Value: ${formatINR(Math.round(result.futureValue))}`,
    "",
    "Estimates only. Actual mutual fund returns may vary and are not guaranteed.",
  );
  return lines.join("\n");
}

export const SIP_PRESETS = [
  { id: "conservative", label: "Conservative", monthlyInvestment: 5_000, annualReturn: 8, years: 10 },
  { id: "balanced", label: "Balanced", monthlyInvestment: 10_000, annualReturn: 12, years: 15 },
  { id: "growth", label: "Growth", monthlyInvestment: 20_000, annualReturn: 15, years: 20 },
] as const;

export const SIP_DISCLAIMER =
  "This calculator is for illustrative purposes only. The estimated returns are based on the assumed rate entered by the user and are not guaranteed. Actual mutual fund returns may vary depending on market conditions and other factors. This tool does not constitute investment advice.";

export const SIP_FAQS = [
  {
    question: "What is a SIP calculator?",
    answer: "A SIP calculator estimates how a monthly Systematic Investment Plan could grow, based on the amount you invest, an assumed annual return, and how long you stay invested. It is a planning tool, not a prediction.",
  },
  {
    question: "How is SIP maturity calculated?",
    answer: "The calculator uses the standard SIP future-value formula: FV = P × [((1 + r)^n − 1) / r] × (1 + r), where P is the monthly investment, r is the monthly rate, and n is the number of months. If the return is 0%, the future value equals the amount invested.",
  },
  {
    question: "What is the minimum amount required for SIP?",
    answer: "Many mutual funds in India allow SIPs from about ₹100–₹500 per month. This calculator accepts monthly investments from ₹500 to ₹10,00,000 so you can model common scenarios.",
  },
  {
    question: "Can I increase my SIP every year?",
    answer: "Yes. Use Advanced Options to enable Annual SIP Increase (step-up). Your monthly amount then rises each year by the percentage you choose, and the projection updates accordingly.",
  },
  {
    question: "Is SIP return guaranteed?",
    answer: "No. Mutual fund SIP returns are not guaranteed. The rate you enter is only an assumption to estimate possible outcomes. Actual results depend on markets and fund performance.",
  },
  {
    question: "What return should I enter?",
    answer: "Enter an assumed annual return you want to model - often between 8% and 15% for equity-oriented funds over long periods, or lower for more conservative products. This is not a recommendation; try a few rates to see the range.",
  },
  {
    question: "What is the difference between SIP and lump-sum investment?",
    answer: "A SIP invests a fixed amount at regular intervals. A lump-sum invests one amount at once. SIPs can help with discipline and rupee-cost averaging; lump-sum keeps the full amount invested from day one. This tool models SIP contributions only.",
  },
  {
    question: "How does compounding affect SIP?",
    answer: "Each installment stays invested and can earn returns, and those returns can earn further returns. Over longer durations, compounding often accounts for a larger share of estimated value - which is why time in the market matters in these illustrations.",
  },
  {
    question: "Can I use the calculator for different investment periods?",
    answer: "Yes. Choose any duration from 1 to 40 years. The results, charts, and year-by-year table update immediately.",
  },
  {
    question: "Is this calculator accurate?",
    answer: "The maths follows the standard SIP formula and a separate month-by-month step-up model. Figures are estimates based on a constant assumed return. Real mutual fund NAVs change, so actual maturity values will differ.",
  },
] as const;
