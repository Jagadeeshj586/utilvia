import { calculatePaycheck, periodsForFrequency } from "@/lib/paycheck/calculate";
import type { CountryCode, PayFrequency } from "@/lib/paycheck/types";
import { getPayStubCountry } from "./countries";
import type {
  PayStubEarning,
  PayStubInput,
  PayStubOtherDeduction,
  PayStubTotals,
  StatutoryCategory,
  StatutoryLine,
} from "./types";

export { PAY_STUB_COUNTRIES, getPayStubCountry } from "./countries";
export { PAY_STUB_STEPS } from "./types";
export type {
  CountryCode,
  CurrencyCode,
  EarningMode,
  PayFrequency,
  PayStubCountryProfile,
  PayStubEarning,
  PayStubInput,
  PayStubOtherDeduction,
  PayStubStep,
  PayStubTotals,
  StatutoryLine,
} from "./types";

export const PAY_STUB_RULES = {
  rulesLabel:
    "Sample payroll estimates for the US, India, UK, Canada, Australia, and UAE — not official payslips",
} as const;

export function currentMonthPeriod(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: toIsoDate(start), end: toIsoDate(end), payDate: toIsoDate(end) };
}

export function periodForFrequency(frequency: PayFrequency, now = new Date()) {
  if (frequency === "weekly") {
    const start = addDays(now, -6);
    return { start: toIsoDate(start), end: toIsoDate(now), payDate: toIsoDate(now) };
  }
  if (frequency === "biweekly") {
    const start = addDays(now, -13);
    return { start: toIsoDate(start), end: toIsoDate(now), payDate: toIsoDate(now) };
  }
  if (frequency === "semi-monthly") {
    if (now.getDate() <= 15) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 15);
      return { start: toIsoDate(start), end: toIsoDate(end), payDate: toIsoDate(end) };
    }
    const start = new Date(now.getFullYear(), now.getMonth(), 16);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: toIsoDate(start), end: toIsoDate(end), payDate: toIsoDate(end) };
  }
  if (frequency === "annual") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return { start: toIsoDate(start), end: toIsoDate(end), payDate: toIsoDate(end) };
  }
  return currentMonthPeriod(now);
}

export function earningAmount(row: Pick<PayStubEarning, "mode" | "hours" | "rate" | "amount">) {
  if (row.mode === "hours") return Math.max(0, row.hours) * Math.max(0, row.rate);
  return Math.max(0, row.amount);
}

export function newEarning(label: string, mode: PayStubEarning["mode"] = "amount", hours = 0, rate = 0, amount = 0): PayStubEarning {
  return { id: uid("earn"), label, mode, hours, rate, amount };
}

export function newOtherDeduction(label: string, amount = 0): PayStubOtherDeduction {
  return { id: uid("ded"), label, amount };
}

export function earningsFromProfile(code: CountryCode): PayStubEarning[] {
  return getPayStubCountry(code).defaultEarnings.map((row, index) => ({
    ...row,
    id: `earn-${code.toLowerCase()}-${index}`,
  }));
}

export function periodIndexFor(frequency: PayFrequency, payDateIso: string) {
  const date = parseIsoDate(payDateIso) ?? new Date();
  const month = date.getMonth() + 1;
  const dayOfYear = dayNumber(date);
  if (frequency === "weekly") return Math.max(1, Math.ceil(dayOfYear / 7));
  if (frequency === "biweekly") return Math.max(1, Math.ceil(dayOfYear / 14));
  if (frequency === "semi-monthly") return Math.max(1, (month - 1) * 2 + (date.getDate() > 15 ? 2 : 1));
  if (frequency === "annual") return 1;
  return month;
}

export function formatPayStubMoney(value: number, currency: PayStubTotals["currency"] | "USD" = "USD") {
  const locale =
    currency === "INR" ? "en-IN" : currency === "GBP" ? "en-GB" : currency === "CAD" ? "en-CA" : currency === "AUD" ? "en-AU" : currency === "AED" ? "en-AE" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPayStubDate(iso: string, locale = "en-US") {
  if (!iso) return "—";
  const date = parseIsoDate(iso);
  if (!date) return iso;
  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

export function formatPayStubMoneyPdf(value: number, currency: PayStubTotals["currency"]) {
  const formatted = formatPayStubMoney(value, currency);
  return formatted.replace("₹", "INR ").replace("AED", "AED ");
}

export function calculatePayStub(input: PayStubInput): PayStubTotals {
  const profile = getPayStubCountry(input.country);
  const grossPay = input.earnings.reduce((sum, row) => sum + earningAmount(row), 0);
  const periods = periodsForFrequency(input.frequency);
  const errors = validatePayStub(input, grossPay);
  const statutory = estimateStatutory(input, grossPay, periods);
  const otherDeductionsTotal = input.otherDeductions.reduce((sum, row) => sum + Math.max(0, row.amount), 0);
  const statutoryTotal = statutory.reduce((sum, row) => sum + row.amount, 0);
  const totalDeductions = statutoryTotal + otherDeductionsTotal;
  const netPay = grossPay - totalDeductions;
  const periodIndex = periodIndexFor(input.frequency, input.payPeriodEnd);
  return {
    country: input.country,
    currency: profile.currency,
    grossPay,
    statutory,
    otherDeductionsTotal,
    totalDeductions,
    netPay,
    periodsPerYear: periods,
    periodIndex,
    ytdGross: grossPay * periodIndex,
    ytdDeductions: totalDeductions * periodIndex,
    ytdNet: netPay * periodIndex,
    errors,
  };
}

export function validatePayStub(input: Pick<PayStubInput, "payPeriodStart" | "payPeriodEnd" | "earnings">, grossPay?: number) {
  const errors: string[] = [];
  const gross = grossPay ?? input.earnings.reduce((sum, row) => sum + earningAmount(row), 0);
  if (gross <= 0) errors.push("Add at least one earning greater than zero.");
  if (input.payPeriodStart && input.payPeriodEnd && input.payPeriodEnd < input.payPeriodStart) {
    errors.push("Pay period end must be on or after the start date.");
  }
  return errors;
}

export const PAY_STUB_FAQS = [
  {
    question: "Can I use this pay stub for a rental application or visa?",
    answer:
      "This is a sample, estimated payroll document — not an official payslip. Some landlords or agencies may still ask for employer or payroll-provider records. Always check what they require.",
  },
  {
    question: "Do taxes and contributions change when I pick another country?",
    answer:
      "Yes. Each country uses its own currency, pay-stub labels, and payroll estimates: US federal tax and FICA, India new-regime tax with EPF/ESI/professional tax, UK PAYE and National Insurance, Canada federal/CPP/EI plus a provincial estimate, Australia PAYG and Medicare levy, and UAE salary with no personal income tax.",
  },
  {
    question: "How accurate are the tax deductions?",
    answer:
      "Statutory lines are estimates from current public tax tables, annualized from your pay frequency. You can override any line. Real withholding depends on tax codes, benefits, and payroll software. This is not tax advice or an official record.",
  },
  {
    question: "Is my pay information safe to enter here?",
    answer:
      "Yes. Everything runs in your browser. Nothing is uploaded. Close the tab to clear the stub. Only the last four characters of a national ID are stored, and they print with a mask.",
  },
  {
    question: "What is the difference between gross pay and net pay?",
    answer:
      "Gross pay is the sum of earnings for the period (hours × rate, or a fixed amount). Net pay is gross minus estimated taxes, social/pension contributions, and any other deductions you add.",
  },
] as const;

function estimateStatutory(input: PayStubInput, grossPay: number, periods: number): StatutoryLine[] {
  const annual = grossPay * periods;
  const retirement = Math.max(0, input.retirementPercent);
  const paycheck = calculatePaycheck({
    country: input.country,
    mode: "annual",
    annualSalary: annual,
    hourlyRate: 0,
    hoursPerWeek: 40,
    weeksPerYear: 52,
    frequency: "annual",
    filingStatus: "single",
    stateCode: input.regionCode,
    contribution401kPercent: input.country === "IN" ? 0 : retirement,
    healthInsuranceMonthly: 0,
    hsaMonthly: 0,
  });

  const lines: StatutoryLine[] = [];
  if (!paycheck) return lines;

  if (input.country !== "AE" || paycheck.incomeTax > 0) {
    pushLine(lines, input, "income_tax", paycheck.incomeTaxLabel, paycheck.incomeTax / periods, "tax");
  }
  if (paycheck.regionalTax > 0 || (input.country === "US" && input.regionCode)) {
    pushLine(lines, input, "regional_tax", paycheck.regionalLabel, paycheck.regionalTax / periods, "tax");
  }

  if (input.country === "IN") {
    const basic = indiaBasic(input.earnings, grossPay);
    const epf = basic * (retirement / 100);
    pushLine(lines, input, "epf", "EPF (employee)", epf, "pension");
    const monthlyGross = grossPay * (12 / periods);
    const esi = monthlyGross <= 21_000 ? grossPay * 0.0075 : 0;
    if (esi > 0 || input.statutoryOverrides.esi != null) {
      pushLine(lines, input, "esi", "ESI (0.75%)", esi, "insurance");
    }
  } else {
    paycheck.socialLines.forEach((line) => {
      pushLine(lines, input, slugKey(line.label), line.label, line.amount / periods, categoryFor(line.label));
    });
    if (retirement > 0 && input.country !== "AE") {
      const pretax = (paycheck.pretaxAnnual || annual * (retirement / 100)) / periods;
      pushLine(lines, input, "retirement", retirementLabel(input.country), pretax, "pension");
    } else if (retirement > 0 && input.country === "AE") {
      pushLine(lines, input, "retirement", "Pension / savings", grossPay * (retirement / 100), "pension");
    }
  }

  return lines.filter((line) => line.amount > 0 || !line.estimated || line.category === "tax");
}

function pushLine(
  lines: StatutoryLine[],
  input: PayStubInput,
  key: string,
  label: string,
  estimatedAmount: number,
  category: StatutoryCategory,
) {
  const override = input.statutoryOverrides[key];
  const estimated = override == null;
  const amount = estimated ? Math.max(0, estimatedAmount) : Math.max(0, override);
  lines.push({ key, label, amount, estimated, category });
}

function indiaBasic(earnings: PayStubEarning[], grossPay: number) {
  const basic = earnings.find((row) => /basic/i.test(row.label));
  if (basic) return earningAmount(basic);
  return grossPay * 0.5;
}

function categoryFor(label: string): StatutoryCategory {
  const text = label.toLowerCase();
  if (text.includes("pension") || text.includes("super") || text.includes("rrsp") || text.includes("epf") || text.includes("401")) {
    return "pension";
  }
  if (text.includes("esi") || text.includes("health") || text.includes("insurance")) return "insurance";
  if (text.includes("tax") || text.includes("paye") || text.includes("payg") || text.includes("levy")) return "tax";
  return "social";
}

function retirementLabel(country: CountryCode) {
  if (country === "GB") return "Pension / salary sacrifice";
  if (country === "CA") return "RRSP";
  if (country === "AU") return "Salary-sacrificed super";
  if (country === "US") return "401(k)";
  return "Pension";
}

function slugKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "line";
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function parseIsoDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayNumber(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

function uid(prefix: string) {
  const rand = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${rand}`;
}
