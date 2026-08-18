export type CompoundingFrequency = "annually" | "semi-annually" | "quarterly" | "monthly" | "daily";

export const FREQUENCY_OPTIONS: Array<{ id: CompoundingFrequency; label: string; periodsPerYear: number }> = [
  { id: "annually", label: "Annually", periodsPerYear: 1 },
  { id: "semi-annually", label: "Semi-annually", periodsPerYear: 2 },
  { id: "quarterly", label: "Quarterly", periodsPerYear: 4 },
  { id: "monthly", label: "Monthly", periodsPerYear: 12 },
  { id: "daily", label: "Daily", periodsPerYear: 365 },
];

export type CompoundInterestInput = {
  principal: number;
  annualRatePercent: number;
  years: number;
  frequency: CompoundingFrequency;
  monthlyContribution?: number;
};

export type YearlyGrowth = {
  year: number;
  amount: number;
};

export type CompoundInterestResult = {
  finalAmount: number;
  totalInterest: number;
  totalContributions: number;
  effectiveAnnualRate: number;
  yearly: YearlyGrowth[];
};

export const COMPOUND_INTEREST_FAQS = [
  {
    question: "What is compound interest?",
    answer:
      "Compound interest is interest earned on both your original principal and the interest already added. Over time, that snowball effect can grow savings and investments faster than simple interest.",
  },
  {
    question: "How often should interest compound?",
    answer:
      "More frequent compounding (monthly or daily) produces a slightly higher effective annual return than annual compounding at the same nominal rate. Banks and FDs often compound quarterly; many investment models use monthly.",
  },
  {
    question: "Can I add monthly contributions?",
    answer:
      "Yes. Enter an optional monthly contribution to model SIPs or recurring deposits. The calculator adds those contributions each year on top of compounding growth.",
  },
  {
    question: "What rate should I use?",
    answer:
      "Use a realistic expected return for your instrument — for example FD rates for deposits, or a long-term equity/mutual fund assumption for market investments. Past returns do not guarantee future results.",
  },
  {
    question: "Is this compound interest calculator free?",
    answer: "Yes. It runs entirely in your browser with no signup required.",
  },
] as const;

export function periodsPerYear(frequency: CompoundingFrequency) {
  return FREQUENCY_OPTIONS.find((item) => item.id === frequency)?.periodsPerYear ?? 1;
}

/** Effective annual rate from nominal rate and compounding frequency. */
export function effectiveAnnualRate(annualRatePercent: number, frequency: CompoundingFrequency) {
  const r = annualRatePercent / 100;
  const n = periodsPerYear(frequency);
  if (r === 0) return 0;
  return Math.pow(1 + r / n, n) - 1;
}

function amountAtYears(
  principal: number,
  monthlyContribution: number,
  eff: number,
  years: number,
) {
  const annualContribution = monthlyContribution * 12;
  if (years <= 0) return principal;
  if (eff === 0) return principal + annualContribution * years;
  const growth = Math.pow(1 + eff, years);
  return principal * growth + annualContribution * ((growth - 1) / eff);
}

/**
 * Matches WorkUtilities compound interest logic:
 * apply selected compounding over each year, then add 12 × monthly contribution.
 */
export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult | null {
  const principal = input.principal;
  const rate = input.annualRatePercent;
  const years = input.years;
  const monthly = input.monthlyContribution ?? 0;

  if (![principal, rate, years, monthly].every((value) => Number.isFinite(value))) return null;
  if (principal < 0 || rate < 0 || years <= 0 || monthly < 0) return null;

  const eff = effectiveAnnualRate(rate, input.frequency);
  const wholeYears = Math.max(1, Math.ceil(years));
  const yearly: YearlyGrowth[] = Array.from({ length: wholeYears }, (_, index) => {
    const year = index + 1;
    const yt = Math.min(year, years);
    return { year, amount: amountAtYears(principal, monthly, eff, yt) };
  });

  const finalAmount = amountAtYears(principal, monthly, eff, years);
  const totalContributions = principal + monthly * 12 * years;
  const totalInterest = finalAmount - totalContributions;

  return {
    finalAmount,
    totalInterest,
    totalContributions,
    effectiveAnnualRate: eff * 100,
    yearly,
  };
}
