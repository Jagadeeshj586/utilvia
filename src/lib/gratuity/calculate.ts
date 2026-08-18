import { GRATUITY_RULES, MAX_GRATUITY_LIMIT } from "@/lib/gratuity/rules";

export { GRATUITY_RULES, MAX_GRATUITY_LIMIT };

export type GratuityCoverage = "covered" | "not-covered";

export type GratuityCalculatorInput = {
  salary: number;
  yearsOfService: number;
  coveredUnderAct: boolean;
};

export type GratuityCalculatorResult = {
  gratuityAmount: number;
  roundedYears: number;
  formula: string;
  coveredUnderAct: boolean;
  calculatedBeforeCap: number;
  capApplied: boolean;
  eligibleByYears: boolean;
};

export const GRATUITY_FAQS = [
  {
    question: "What is the gratuity formula?",
    answer:
      "For establishments covered under the Payment of Gratuity Act, gratuity = (15 × last drawn salary × years of service) ÷ 26. For those not covered, the divisor is 30. The result is capped at the current tax-free limit.",
  },
  {
    question: "Minimum years for gratuity?",
    answer:
      "Gratuity generally requires at least 5 years of continuous service. Exceptions apply in cases of death or disability. The calculator shows a note when service is under 5 years.",
  },
  {
    question: "What is the tax-free limit?",
    answer: `The tax-free gratuity limit used in this calculator is ₹20,00,000 as per current rules. Amounts above this cap are not reflected in the displayed gratuity.`,
  },
  {
    question: "Is partial year counted?",
    answer:
      "If you enter decimal years, a fractional part of 0.5 or more is rounded up to the next whole year for the formula. For example, 10.5 years is treated as 11 years.",
  },
  {
    question: "Is gratuity calculator free?",
    answer: "Yes. The Utilvia Gratuity Calculator is free with no signup required.",
  },
] as const;

export function roundYearsForFormula(yearsOfService: number): number {
  return Math.floor(yearsOfService) + (yearsOfService % 1 >= 0.5 ? 1 : 0);
}

export function calculateGratuity(input: GratuityCalculatorInput): GratuityCalculatorResult | null {
  const { salary, yearsOfService, coveredUnderAct } = input;

  if (!Number.isFinite(salary) || !Number.isFinite(yearsOfService) || salary <= 0 || yearsOfService < 0) {
    return null;
  }

  const roundedYears = roundYearsForFormula(yearsOfService);
  const divisor = coveredUnderAct ? GRATUITY_RULES.workingDaysCovered : GRATUITY_RULES.workingDaysNotCovered;
  const formula = `(15 × Salary × Years) / ${divisor}`;
  const calculatedBeforeCap =
    (GRATUITY_RULES.daysWagesPerYear * salary * roundedYears) / divisor;
  const gratuityAmount = Math.round(Math.min(calculatedBeforeCap, MAX_GRATUITY_LIMIT));

  return {
    gratuityAmount,
    roundedYears,
    formula,
    coveredUnderAct,
    calculatedBeforeCap: Math.round(calculatedBeforeCap),
    capApplied: calculatedBeforeCap > MAX_GRATUITY_LIMIT,
    eligibleByYears: yearsOfService >= GRATUITY_RULES.minEligibleYears,
  };
}
