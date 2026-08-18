export type InflationMode = "future" | "past";
export type InflationCurrency = "INR" | "USD";

export const INFLATION_DEFAULT_RATES = {
  INR: 6.5,
  USD: 3.2,
} as const;

export const INFLATION_DEFAULTS = {
  amount: 100_000,
  years: 10,
  mode: "future" as InflationMode,
  currency: "INR" as InflationCurrency,
  inflationRatePercent: INFLATION_DEFAULT_RATES.INR,
};

export type InflationCalculatorInput = {
  amount: number;
  years: number;
  inflationRatePercent: number;
};

export type InflationCalculatorResult = {
  futureValue: number;
  pastValue: number;
  purchasingPowerLoss: number;
};

export const INFLATION_FAQS = [
  {
    question: "What is future value mode?",
    answer:
      "Future Value shows how much money you would need in the future to match today's purchasing power, given an annual inflation rate.",
  },
  {
    question: "What is past value mode?",
    answer:
      "Past Value shows what today's amount would have been worth in the past, after adjusting backward for inflation.",
  },
  {
    question: "What inflation rate should I use?",
    answer:
      "This calculator pre-fills about 6.5% for INR (India) and 3.2% for USD (US) as approximate long-run averages. Edit the rate to match your own assumption.",
  },
  {
    question: "What is purchasing power loss?",
    answer:
      "Purchasing power loss is the share of future value that comes from inflation rather than the original amount. It shows how much buying power erodes over the period.",
  },
  {
    question: "Is inflation calculator free?",
    answer: "Yes. The Utilvia Inflation Calculator is free with no signup required.",
  },
] as const;

export function calculateInflation(input: InflationCalculatorInput): InflationCalculatorResult | null {
  const { amount, years, inflationRatePercent } = input;

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(years) ||
    !Number.isFinite(inflationRatePercent) ||
    amount < 0 ||
    years < 0 ||
    inflationRatePercent < 0
  ) {
    return null;
  }

  const rate = inflationRatePercent / 100;
  const factor = Math.pow(1 + rate, years);
  const futureValue = Math.round(amount * factor);
  const pastValue = Math.round(amount / factor);
  const purchasingPowerLoss =
    futureValue === 0 ? 0 : Math.round(((futureValue - amount) / futureValue) * 1000) / 10;

  return {
    futureValue,
    pastValue,
    purchasingPowerLoss,
  };
}
