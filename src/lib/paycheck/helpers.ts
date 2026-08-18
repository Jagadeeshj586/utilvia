import type {
  CurrencyCode,
  PayFrequency,
  PaycheckInput,
  PaycheckResult,
  TaxBracket,
} from "./types";
import { PAY_FREQUENCIES } from "./types";

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  USD: "en-US",
  INR: "en-IN",
  GBP: "en-GB",
  CAD: "en-CA",
  AUD: "en-AU",
  AED: "en-AE",
};

export function formatMoney(value: number, currency: CurrencyCode, digits = 0) {
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function resolveGrossAnnual(
  input: Pick<PaycheckInput, "mode" | "annualSalary" | "hourlyRate" | "hoursPerWeek" | "weeksPerYear">,
): number {
  if (input.mode === "hourly") {
    const hours = Math.max(0, input.hoursPerWeek);
    const weeks = Math.max(0, input.weeksPerYear);
    return Math.max(0, input.hourlyRate) * hours * weeks;
  }
  return Math.max(0, input.annualSalary);
}

export function periodsForFrequency(frequency: PayFrequency): number {
  return PAY_FREQUENCIES.find((item) => item.value === frequency)?.periods ?? 1;
}

export function frequencyLabel(frequency: PayFrequency): string {
  return PAY_FREQUENCIES.find((item) => item.value === frequency)?.label ?? "Annual";
}

export function applyBrackets(taxableIncome: number, brackets: TaxBracket[]): { tax: number; marginalRate: number } {
  const income = Math.max(0, taxableIncome);
  let tax = 0;
  let previous = 0;
  let marginalRate = brackets[0]?.rate ?? 0;

  for (const bracket of brackets) {
    if (income <= previous) break;
    const taxableInBracket = Math.min(income, bracket.upTo) - previous;
    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracket.rate;
      marginalRate = bracket.rate;
    }
    previous = bracket.upTo;
  }

  return { tax, marginalRate };
}

export function finishResult(
  input: PaycheckInput,
  partial: Omit<
    PaycheckResult,
    | "grossPerPeriod"
    | "netPerPeriod"
    | "periodsPerYear"
    | "frequencyLabel"
    | "federalTax"
    | "federalTaxableIncome"
    | "marginalFederalRate"
    | "fica"
    | "stateTax"
    | "stateLabel"
    | "socialSecurity"
    | "medicare"
    | "additionalMedicare"
  > &
    Partial<
      Pick<
        PaycheckResult,
        "socialSecurity" | "medicare" | "additionalMedicare" | "fica" | "stateTax" | "stateLabel"
      >
    >,
): PaycheckResult {
  const periods = periodsForFrequency(input.frequency);
  const socialTotal = partial.socialTotal;
  const regionalTax = partial.regionalTax;
  return {
    ...partial,
    socialSecurity: partial.socialSecurity ?? 0,
    medicare: partial.medicare ?? 0,
    additionalMedicare: partial.additionalMedicare ?? 0,
    fica: partial.fica ?? socialTotal,
    stateTax: partial.stateTax ?? regionalTax,
    stateLabel: partial.stateLabel ?? partial.regionalLabel,
    federalTax: partial.incomeTax,
    federalTaxableIncome: partial.taxableIncome,
    marginalFederalRate: partial.marginalRate,
    periodsPerYear: periods,
    frequencyLabel: frequencyLabel(input.frequency),
    grossPerPeriod: partial.grossAnnual / periods,
    netPerPeriod: partial.netAnnual / periods,
  };
}
