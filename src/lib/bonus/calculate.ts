export const BONUS_RULES = {
  rulesLabel: "Based on Payment of Bonus Act, 1965 (amended 2015)",
  actYear: 1965,
  amendedYear: 2015,
  wageCeiling: 7_000,
  eligibilityThreshold: 21_000,
  minRate: 8.33,
  maxRate: 20,
  minMonths: 1,
  maxMonths: 12,
  defaultSalary: 15_000,
  defaultRate: 8.33,
  defaultMonths: 12,
  minSalary: 1,
  maxSalary: 10_00_000,
} as const;

export type BonusInput = {
  monthlySalary: number;
  ratePercent: number;
  months: number;
};

export type BonusResult = {
  eligible: boolean;
  calculationWage: number;
  cappedAtCeiling: boolean;
  months: number;
  ratePercent: number;
  minimum: number;
  yours: number;
  maximum: number;
};

export type BonusErrors = Partial<Record<"monthlySalary" | "ratePercent" | "months", string>>;

export const DEFAULT_BONUS_INPUT: BonusInput = {
  monthlySalary: BONUS_RULES.defaultSalary,
  ratePercent: BONUS_RULES.defaultRate,
  months: BONUS_RULES.defaultMonths,
};

function rupees(value: number) {
  return Math.round(value);
}

export function bonusAmount(wage: number, ratePercent: number, months: number) {
  return rupees(wage * (ratePercent / 100) * months);
}

export function validateBonus(input: BonusInput): BonusErrors {
  const errors: BonusErrors = {};
  if (
    !Number.isFinite(input.monthlySalary) ||
    input.monthlySalary < BONUS_RULES.minSalary ||
    input.monthlySalary > BONUS_RULES.maxSalary
  ) {
    errors.monthlySalary = `Enter monthly gross salary from ₹${BONUS_RULES.minSalary.toLocaleString("en-IN")} to ₹${BONUS_RULES.maxSalary.toLocaleString("en-IN")}.`;
  }
  if (
    !Number.isFinite(input.ratePercent) ||
    input.ratePercent < BONUS_RULES.minRate ||
    input.ratePercent > BONUS_RULES.maxRate
  ) {
    errors.ratePercent = `Enter a bonus rate from ${BONUS_RULES.minRate}% to ${BONUS_RULES.maxRate}%.`;
  }
  if (
    !Number.isFinite(input.months) ||
    input.months < BONUS_RULES.minMonths ||
    input.months > BONUS_RULES.maxMonths
  ) {
    errors.months = `Enter employment duration from ${BONUS_RULES.minMonths} to ${BONUS_RULES.maxMonths} months.`;
  }
  return errors;
}

export function hasBonusErrors(errors: BonusErrors) {
  return Object.keys(errors).length > 0;
}

export function calculateBonus(input: BonusInput): BonusResult | null {
  if (hasBonusErrors(validateBonus(input))) return null;

  const calculationWage = Math.min(input.monthlySalary, BONUS_RULES.wageCeiling);
  const months = Math.round(input.months);

  return {
    eligible: input.monthlySalary <= BONUS_RULES.eligibilityThreshold,
    calculationWage,
    cappedAtCeiling: input.monthlySalary > BONUS_RULES.wageCeiling,
    months,
    ratePercent: input.ratePercent,
    minimum: bonusAmount(calculationWage, BONUS_RULES.minRate, months),
    yours: bonusAmount(calculationWage, input.ratePercent, months),
    maximum: bonusAmount(calculationWage, BONUS_RULES.maxRate, months),
  };
}

export const BONUS_FAQS = [
  {
    question: "Who is eligible for statutory bonus in India?",
    answer: `Employees earning up to ₹${BONUS_RULES.eligibilityThreshold.toLocaleString("en-IN")} per month in establishments covered by the Payment of Bonus Act are eligible, after working at least 30 days in the accounting year. Above that salary, any bonus paid is typically ex-gratia at the employer's discretion.`,
  },
  {
    question: "How is bonus calculated under the Payment of Bonus Act?",
    answer: `Bonus is ${BONUS_RULES.minRate}% to ${BONUS_RULES.maxRate}% of wages for the months worked. Wages for this calculation are capped at ₹${BONUS_RULES.wageCeiling.toLocaleString("en-IN")} per month. This calculator prorates by employment duration (1–12 months).`,
  },
  {
    question: "Why is the bonus calculated on ₹7,000 even if my salary is higher?",
    answer: `The Act caps the wage used for bonus at ₹${BONUS_RULES.wageCeiling.toLocaleString("en-IN")} per month. That ceiling was last revised in ${BONUS_RULES.amendedYear}. If you earn more, the extra salary does not increase statutory bonus.`,
  },
  {
    question: "Is bonus taxable in India?",
    answer:
      "Yes. Statutory bonus is taxable as salary. Your employer typically deducts TDS if applicable. This tool estimates the bonus amount only — not tax.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Your salary stays on your device.",
  },
];
