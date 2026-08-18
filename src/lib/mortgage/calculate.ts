import {
  extraValue,
  getMortgageCountry,
  type ExtraField,
  type MortgageCountry,
  type MortgageCountryCode,
} from "./countries";

export type { MortgageCountry, MortgageCountryCode, ExtraField } from "./countries";
export { MORTGAGE_COUNTRIES, getMortgageCountry } from "./countries";

export type DownPaymentMode = "amount" | "percent";

export type MortgageInput = {
  country: MortgageCountryCode;
  homePrice: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  loanAmount: number;
  interestRatePercent: number;
  termYears: number;
  extras: Record<string, number>;
};

export type MortgageValidation = {
  homePrice?: string;
  downPaymentAmount?: string;
  downPaymentPercent?: string;
  loanAmount?: string;
  interestRatePercent?: string;
  termYears?: string;
  extras?: Record<string, string>;
};

export type ExtraLine = {
  id: string;
  label: string;
  period: ExtraField["period"];
  entered: number;
  monthly: number;
  oneTime: number;
};

export type AmortizationYear = {
  year: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
};

export type MortgageResult = {
  country: MortgageCountryCode;
  loanAmount: number;
  homePrice: number;
  months: number;
  principalAndInterest: number;
  additionalCostsMonthly: number;
  additionalCostsOneTime: number;
  extraLines: ExtraLine[];
  monthlyPayment: number;
  totalInterest: number;
  totalAmountPaid: number;
  ltvPercent: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  yearlyAmortization: AmortizationYear[];
};

export const MORTGAGE_LIMITS = {
  homePrice: { min: 1, max: 100_000_000_000 },
  downPaymentPercent: { min: 0, max: 100 },
  interestRatePercent: { min: 0, max: 30 },
  termYears: { min: 1, max: 50 },
} as const;

export function defaultsFromCountry(country: MortgageCountry): MortgageInput {
  const downPaymentAmount = downPaymentFromPercent(country.defaultHomePrice, country.defaultDownPercent);
  return {
    country: country.code,
    homePrice: country.defaultHomePrice,
    downPaymentAmount,
    downPaymentPercent: country.defaultDownPercent,
    loanAmount: loanFromHomeAndDown(country.defaultHomePrice, downPaymentAmount),
    interestRatePercent: country.defaultRate,
    termYears: country.defaultTermYears,
    extras: { ...country.defaultExtras },
  };
}

export const MORTGAGE_DEFAULTS = defaultsFromCountry(getMortgageCountry("US"));

export const MORTGAGE_FAQS = [
  {
    question: "Does the calculator change when I pick another country?",
    answer:
      "Yes. Country selection updates currency, number formatting, field labels (for example deposit vs down payment), loan-term presets, and extra costs such as HOA, processing charges, or DLD fees.",
  },
  {
    question: "How is the monthly payment calculated?",
    answer:
      "Principal and interest use the standard amortizing-loan formula with monthly compounding. Recurring extras (annual tax divided by 12, or monthly fees) are added to the monthly payment. One-time fees are included in total amount paid, not in the monthly installment.",
  },
  {
    question: "What is LTV?",
    answer:
      "Loan-to-value (LTV) is the loan amount divided by the property price. A 20% down payment is an 80% LTV. Lenders often use LTV when setting rates and insurance requirements.",
  },
  {
    question: "Are the interest rates live market rates?",
    answer:
      "No. Each country ships with a sensible example rate for planning. Enter the rate your lender quoted. Figures are estimates, not a loan offer.",
  },
  {
    question: "Is this mortgage calculator free?",
    answer: "Yes. It runs entirely in your browser with no signup.",
  },
] as const;

export function parseMoney(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  const firstDot = cleaned.indexOf(".");
  const normalized =
    firstDot === -1 ? cleaned : `${cleaned.slice(0, firstDot + 1)}${cleaned.slice(firstDot + 1).replace(/\./g, "")}`;
  return Number(normalized);
}

export function formatMoneyDraft(value: number, locale = "en-US", digits = 0) {
  if (!Number.isFinite(value)) return "";
  return value.toLocaleString(locale, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits > 0 && !Number.isInteger(value) ? Math.min(digits, 2) : 0,
  });
}

export function moneyDigits(currency: MortgageCountry["currency"]) {
  return currency === "INR" ? 0 : 2;
}

export function formatMortgageMoney(value: number, country: MortgageCountry, digits?: number) {
  const fraction = digits ?? moneyDigits(country.currency);
  const formatted = new Intl.NumberFormat(country.locale, {
    maximumFractionDigits: fraction,
    minimumFractionDigits: fraction,
  }).format(Number.isFinite(value) ? value : 0);
  if (country.currency === "AED") return `${country.currencySymbol} ${formatted}`;
  return `${country.currencySymbol}${formatted}`;
}

export function downPaymentFromPercent(homePrice: number, percent: number) {
  if (!Number.isFinite(homePrice) || !Number.isFinite(percent)) return NaN;
  return (homePrice * percent) / 100;
}

export function percentFromDownPayment(homePrice: number, downPayment: number) {
  if (!Number.isFinite(homePrice) || !Number.isFinite(downPayment) || homePrice <= 0) return NaN;
  return (downPayment / homePrice) * 100;
}

export function loanFromHomeAndDown(homePrice: number, downPayment: number) {
  if (!Number.isFinite(homePrice) || !Number.isFinite(downPayment)) return NaN;
  return homePrice - downPayment;
}

/** Standard amortizing principal & interest for one payment period. */
export function periodPrincipalAndInterest(principal: number, annualRatePercent: number, termYears: number, paymentsPerYear = 12) {
  const periods = Math.round(termYears * paymentsPerYear);
  if (periods <= 0 || principal <= 0) return 0;
  const periodRate = annualRatePercent / paymentsPerYear / 100;
  if (periodRate === 0) return principal / periods;
  const factor = Math.pow(1 + periodRate, periods);
  return (principal * periodRate * factor) / (factor - 1);
}

export function monthlyPrincipalAndInterest(principal: number, annualRatePercent: number, termYears: number) {
  return periodPrincipalAndInterest(principal, annualRatePercent, termYears, 12);
}

function extraLinesFor(country: MortgageCountry, extras: Record<string, number>, paymentsPerYear: number): ExtraLine[] {
  return country.extras.map((field) => {
    const entered = Math.max(0, extraValue(extras, field.id));
    if (field.period === "annual") {
      return { id: field.id, label: field.label, period: field.period, entered, monthly: entered / paymentsPerYear, oneTime: 0 };
    }
    if (field.period === "monthly") {
      return { id: field.id, label: field.label, period: field.period, entered, monthly: entered, oneTime: 0 };
    }
    return { id: field.id, label: field.label, period: field.period, entered, monthly: 0, oneTime: entered };
  });
}

export function validateMortgageInput(input: MortgageInput): MortgageValidation {
  const country = getMortgageCountry(input.country);
  const errors: MortgageValidation = {};
  const { homePrice, downPaymentAmount, downPaymentPercent, loanAmount, interestRatePercent, termYears } = input;

  if (!Number.isFinite(homePrice)) errors.homePrice = `Enter a valid ${country.labels.homePrice.toLowerCase()}.`;
  else if (homePrice <= 0) errors.homePrice = `${country.labels.homePrice} must be greater than 0.`;
  else if (homePrice > MORTGAGE_LIMITS.homePrice.max) errors.homePrice = `${country.labels.homePrice} is too large.`;

  if (!Number.isFinite(downPaymentAmount)) errors.downPaymentAmount = `Enter a valid ${country.labels.downPayment.toLowerCase()}.`;
  else if (downPaymentAmount < 0) errors.downPaymentAmount = `${country.labels.downPayment} cannot be negative.`;
  else if (Number.isFinite(homePrice) && downPaymentAmount > homePrice) {
    errors.downPaymentAmount = `${country.labels.downPayment} cannot exceed ${country.labels.homePrice.toLowerCase()}.`;
  }

  if (!Number.isFinite(downPaymentPercent)) errors.downPaymentPercent = `Enter a valid ${country.labels.downPayment.toLowerCase()} percent.`;
  else if (downPaymentPercent < 0 || downPaymentPercent > 100) {
    errors.downPaymentPercent = `${country.labels.downPayment} must be between 0% and 100%.`;
  }

  if (!Number.isFinite(loanAmount)) errors.loanAmount = `Enter a valid ${country.labels.loanAmount.toLowerCase()}.`;
  else if (loanAmount <= 0) errors.loanAmount = `${country.labels.loanAmount} must be greater than 0.`;
  else if (Number.isFinite(homePrice) && loanAmount > homePrice) {
    errors.loanAmount = `${country.labels.loanAmount} cannot exceed ${country.labels.homePrice.toLowerCase()}.`;
  }

  if (!Number.isFinite(interestRatePercent)) errors.interestRatePercent = "Enter a valid interest rate.";
  else if (interestRatePercent < 0) errors.interestRatePercent = "Interest rate cannot be negative.";
  else if (interestRatePercent > MORTGAGE_LIMITS.interestRatePercent.max) {
    errors.interestRatePercent = "Interest rate must be 30% or less.";
  }

  if (!Number.isFinite(termYears)) errors.termYears = `Enter a valid ${country.labels.term.toLowerCase()}.`;
  else if (termYears < MORTGAGE_LIMITS.termYears.min || termYears > MORTGAGE_LIMITS.termYears.max) {
    errors.termYears = `${country.labels.term} must be between 1 and 50 years.`;
  }

  const extraErrors: Record<string, string> = {};
  for (const field of country.extras) {
    const raw = input.extras[field.id];
    const value = raw === undefined || raw === null ? 0 : raw;
    if (!Number.isFinite(value) || value < 0) {
      extraErrors[field.id] = `Enter a valid ${field.label.toLowerCase()} (0 or more).`;
    }
  }
  if (Object.keys(extraErrors).length > 0) errors.extras = extraErrors;

  return errors;
}

export function hasMortgageErrors(errors: MortgageValidation) {
  return Boolean(
    errors.homePrice ||
      errors.downPaymentAmount ||
      errors.downPaymentPercent ||
      errors.loanAmount ||
      errors.interestRatePercent ||
      errors.termYears ||
      (errors.extras && Object.keys(errors.extras).length > 0),
  );
}

function yearlyAmortization(
  principal: number,
  annualRatePercent: number,
  termYears: number,
  payment: number,
  paymentsPerYear: number,
): AmortizationYear[] {
  const periodRate = annualRatePercent / paymentsPerYear / 100;
  const totalPeriods = Math.round(termYears * paymentsPerYear);
  let balance = principal;
  const rows: AmortizationYear[] = [];

  for (let year = 1; year <= Math.ceil(totalPeriods / paymentsPerYear); year += 1) {
    let principalPaid = 0;
    let interestPaid = 0;
    for (let period = 0; period < paymentsPerYear && (year - 1) * paymentsPerYear + period < totalPeriods; period += 1) {
      const interestPart = periodRate === 0 ? 0 : balance * periodRate;
      const principalPart = Math.min(Math.max(0, payment - interestPart), balance);
      interestPaid += interestPart;
      principalPaid += principalPart;
      balance = Math.max(0, balance - principalPart);
    }
    rows.push({ year, principalPaid, interestPaid, endingBalance: balance });
  }

  return rows;
}

export function calculateMortgage(input: MortgageInput): MortgageResult | null {
  if (hasMortgageErrors(validateMortgageInput(input))) return null;

  const country = getMortgageCountry(input.country);
  const paymentsPerYear = country.paymentsPerYear;
  const loanAmount = input.loanAmount;
  const months = Math.round(input.termYears * paymentsPerYear);
  const principalAndInterest = periodPrincipalAndInterest(
    loanAmount,
    input.interestRatePercent,
    input.termYears,
    paymentsPerYear,
  );
  const extraLines = extraLinesFor(country, input.extras, paymentsPerYear);
  const additionalCostsMonthly = extraLines.reduce((sum, line) => sum + line.monthly, 0);
  const additionalCostsOneTime = extraLines.reduce((sum, line) => sum + line.oneTime, 0);
  const monthlyPayment = principalAndInterest + additionalCostsMonthly;
  const totalInterest = principalAndInterest * months - loanAmount;
  const totalAmountPaid = principalAndInterest * months + additionalCostsMonthly * months + additionalCostsOneTime;
  const ltvPercent = input.homePrice > 0 ? (loanAmount / input.homePrice) * 100 : 0;

  return {
    country: country.code,
    loanAmount,
    homePrice: input.homePrice,
    months,
    principalAndInterest,
    additionalCostsMonthly,
    additionalCostsOneTime,
    extraLines,
    monthlyPayment,
    totalInterest,
    totalAmountPaid,
    ltvPercent,
    downPaymentAmount: input.downPaymentAmount,
    downPaymentPercent: input.downPaymentPercent,
    yearlyAmortization: yearlyAmortization(
      loanAmount,
      input.interestRatePercent,
      input.termYears,
      principalAndInterest,
      paymentsPerYear,
    ),
  };
}
