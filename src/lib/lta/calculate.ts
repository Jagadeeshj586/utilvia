import { LTA_RULES } from "@/lib/lta/rules";

export { LTA_RULES };

export type LtaCalculatorInput = {
  ltaReceived: number;
  actualTravelExpense: number;
  /** Collected for UI parity with WorkUtilities; exemption uses LTA vs fare only. */
  numberOfTrips: number;
};

export type LtaCalculatorResult = {
  exemptAmount: number;
  taxableAmount: number;
  numberOfTrips: number;
  tripsExceedBlockLimit: boolean;
};

export const LTA_FAQS = [
  {
    question: "What expenses qualify for LTA?",
    answer:
      "Eligible expenses are generally air, rail, or bus fare for yourself and family. Hotel, food, and local transport usually do not qualify for LTA exemption.",
  },
  {
    question: "How many trips are allowed?",
    answer: `You can claim LTA for a maximum of ${LTA_RULES.maxJourneysPerBlock} journeys in each ${LTA_RULES.blockYears}-year block. The current block is ${LTA_RULES.currentBlockLabel}.`,
  },
  {
    question: "How is exemption calculated?",
    answer:
      "Exempt LTA is the lower of LTA received and actual eligible travel expense. Any remaining LTA is taxable. This calculator shows that split for planning — it is not tax advice.",
  },
  {
    question: "Is LTA available under the New Tax Regime?",
    answer:
      "LTA exemption is available only under the Old Tax Regime. It is not available under the New Tax Regime (Section 115BAC).",
  },
  {
    question: "Is LTA available every year?",
    answer: `LTA is part of salary every year if your employer pays it, but tax exemption is limited to ${LTA_RULES.maxJourneysPerBlock} journeys per ${LTA_RULES.blockYears}-year block, subject to other conditions.`,
  },
  {
    question: "Is LTA calculator free?",
    answer: "Yes. The Utilvia LTA Calculator is free with no signup required.",
  },
] as const;

export function calculateLta(input: LtaCalculatorInput): LtaCalculatorResult | null {
  const { ltaReceived, actualTravelExpense, numberOfTrips } = input;

  if (
    !Number.isFinite(ltaReceived) ||
    !Number.isFinite(actualTravelExpense) ||
    !Number.isFinite(numberOfTrips) ||
    ltaReceived < 0 ||
    actualTravelExpense < 0 ||
    numberOfTrips < 0
  ) {
    return null;
  }

  const exemptAmount = Math.round(Math.min(ltaReceived, actualTravelExpense));
  const taxableAmount = Math.round(Math.max(0, ltaReceived - exemptAmount));

  return {
    exemptAmount,
    taxableAmount,
    numberOfTrips,
    tripsExceedBlockLimit: numberOfTrips > LTA_RULES.maxJourneysPerBlock,
  };
}
