import { applyBrackets } from "@/lib/paycheck/helpers";
import {
  AU_BRACKETS,
  CA_FEDERAL_BRACKETS,
  CA_PROVINCES,
  GB_NATIONS,
  IN_PT_STATES,
  UK_ENGLAND_BRACKETS,
  UK_SCOTLAND_BRACKETS,
  ukPersonalAllowance,
} from "@/lib/paycheck/international";
import type { FilingStatus } from "@/lib/paycheck/types";
import {
  FICA_2026,
  STANDARD_DEDUCTION_2026,
  calculateFederalTax,
  calculateStateTax,
} from "@/lib/paycheck/us";
import {
  getSelfEmploymentCountry,
  type SelfEmploymentCountry,
  type SelfEmploymentCountryCode,
} from "./countries";

export type { SelfEmploymentCountry, SelfEmploymentCountryCode } from "./countries";
export { SELF_EMPLOYMENT_COUNTRIES, SELF_EMPLOYMENT_FILING_STATUSES, getSelfEmploymentCountry } from "./countries";

export type SelfEmploymentInput = {
  country: SelfEmploymentCountryCode;
  grossAnnual: number;
  expenses: number;
  otherDeductions: number;
  retirement: number;
  regionCode: string;
  filingStatus: FilingStatus;
};

export type TaxLine = { label: string; amount: number };

export type SelfEmploymentResult = {
  country: SelfEmploymentCountryCode;
  grossAnnual: number;
  profit: number;
  incomeTax: number;
  socialTax: number;
  regionalTax: number;
  deductions: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number;
  lines: TaxLine[];
  chart: Array<{ name: string; value: number; color: string }>;
  note: string;
};

export type SelfEmploymentValidation = {
  grossAnnual?: string;
  expenses?: string;
  otherDeductions?: string;
  retirement?: string;
};

const CHART = {
  net: "#cc785c",
  tax: "#e8a55a",
  social: "#5db8a6",
  expenses: "#a09d96",
};

export function defaultsFromCountry(country: SelfEmploymentCountry): SelfEmploymentInput {
  return {
    country: country.code,
    grossAnnual: country.defaultGross,
    expenses: 0,
    otherDeductions: 0,
    retirement: 0,
    regionCode: country.defaultRegion,
    filingStatus: "single",
  };
}

export const SELF_EMPLOYMENT_DEFAULTS = defaultsFromCountry(getSelfEmploymentCountry("US"));

export const SELF_EMPLOYMENT_FAQS = [
  {
    question: "What does this calculator estimate?",
    answer:
      "It estimates income tax and self-employment or social contributions for freelancers, contractors, sole traders, and independent professionals. Labels and rules change with the country.",
  },
  {
    question: "Is US self-employment tax the same as income tax?",
    answer:
      "No. Self-employment tax is Social Security and Medicare on net profit (15.3% on 92.35% of profit, with wage-base limits). Income tax is separate and uses federal brackets plus a simplified state estimate.",
  },
  {
    question: "Do expenses reduce tax in every country?",
    answer:
      "Yes in this estimate. Business or allowable expenses reduce net profit, which then feeds income tax and contribution calculations for that country.",
  },
  {
    question: "Does the UAE have self-employment tax?",
    answer:
      "There is no federal personal income tax on salary. This estimate applies simplified UAE corporate tax of 0% on the first AED 375,000 of profit and 9% above. Small-business relief may make the tax zero.",
  },
  {
    question: "Is this tax advice?",
    answer:
      "No. Figures are simplified estimates for planning. Credits, GST/VAT, visas, and elections can change the result. Check official rules or a qualified advisor.",
  },
] as const;

export function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  const firstDot = cleaned.indexOf(".");
  const normalized =
    firstDot === -1 ? cleaned : `${cleaned.slice(0, firstDot + 1)}${cleaned.slice(firstDot + 1).replace(/\./g, "")}`;
  return Number(normalized);
}

export function formatAmountDraft(value: number, locale = "en-US", digits = 0) {
  if (!Number.isFinite(value)) return "";
  return value.toLocaleString(locale, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits > 0 && !Number.isInteger(value) ? Math.min(digits, 2) : 0,
  });
}

export function moneyDigits(currency: SelfEmploymentCountry["currency"]) {
  return currency === "INR" ? 0 : 2;
}

export function formatSelfEmploymentMoney(value: number, country: SelfEmploymentCountry, digits?: number) {
  const fraction = digits ?? moneyDigits(country.currency);
  const formatted = new Intl.NumberFormat(country.locale, {
    maximumFractionDigits: fraction,
    minimumFractionDigits: fraction,
  }).format(Number.isFinite(value) ? value : 0);
  if (country.currency === "AED") return `${country.currencySymbol} ${formatted}`;
  return `${country.currencySymbol}${formatted}`;
}

export function validateSelfEmployment(input: SelfEmploymentInput): SelfEmploymentValidation {
  const errors: SelfEmploymentValidation = {};
  if (!Number.isFinite(input.grossAnnual) || input.grossAnnual <= 0) {
    errors.grossAnnual = "Enter self-employment income greater than 0.";
  }
  if (!Number.isFinite(input.expenses) || input.expenses < 0) {
    errors.expenses = "Enter expenses of 0 or more.";
  } else if (Number.isFinite(input.grossAnnual) && input.expenses > input.grossAnnual) {
    errors.expenses = "Expenses cannot exceed income.";
  }
  if (!Number.isFinite(input.otherDeductions) || input.otherDeductions < 0) {
    errors.otherDeductions = "Enter other deductions of 0 or more.";
  }
  if (!Number.isFinite(input.retirement) || input.retirement < 0) {
    errors.retirement = "Enter a retirement contribution of 0 or more.";
  }
  return errors;
}

export function hasSelfEmploymentErrors(errors: SelfEmploymentValidation) {
  return Object.keys(errors).length > 0;
}

function clamp(n: number) {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function indiaProfessionalTax(taxable: number) {
  const income = Math.max(0, taxable);
  const slabs: Array<[number, number]> = [
    [400_000, 0],
    [800_000, 0.05],
    [1_200_000, 0.1],
    [1_600_000, 0.15],
    [2_000_000, 0.2],
    [2_400_000, 0.25],
    [Infinity, 0.3],
  ];
  let tax = 0;
  let previous = 0;
  for (const [limit, rate] of slabs) {
    if (income <= previous) break;
    tax += (Math.min(income, limit) - previous) * rate;
    previous = limit;
  }
  if (income <= 1_200_000) tax = 0;
  return tax * 1.04;
}

function finish(
  country: SelfEmploymentCountry,
  input: SelfEmploymentInput,
  parts: {
    profit: number;
    incomeTax: number;
    socialTax: number;
    regionalTax?: number;
    deductions: number;
    netAnnual: number;
    lines: TaxLine[];
  },
): SelfEmploymentResult {
  const regionalTax = parts.regionalTax ?? 0;
  const taxTotal = parts.incomeTax + parts.socialTax + regionalTax;
  const expenses = Math.min(clamp(input.expenses), clamp(input.grossAnnual));
  const retirement = clamp(input.retirement);
  const chart = [
    { name: "Net income", value: Math.max(0, parts.netAnnual), color: CHART.net },
    { name: country.labels.tax, value: Math.max(0, parts.incomeTax + regionalTax), color: CHART.tax },
    { name: country.labels.social, value: Math.max(0, parts.socialTax), color: CHART.social },
    { name: country.labels.expenses, value: Math.max(0, expenses + retirement), color: CHART.expenses },
  ].filter((item) => item.value > 0);

  return {
    country: country.code,
    grossAnnual: clamp(input.grossAnnual),
    profit: parts.profit,
    incomeTax: parts.incomeTax,
    socialTax: parts.socialTax,
    regionalTax,
    deductions: parts.deductions,
    netAnnual: Math.max(0, parts.netAnnual),
    netMonthly: Math.max(0, parts.netAnnual) / 12,
    effectiveRate: clamp(input.grossAnnual) > 0 ? (taxTotal / clamp(input.grossAnnual)) * 100 : 0,
    lines: parts.lines,
    chart,
    note: country.note,
  };
}

type Engine = (input: SelfEmploymentInput, country: SelfEmploymentCountry) => SelfEmploymentResult;

const usEngine: Engine = (input, country) => {
  const gross = clamp(input.grossAnnual);
  const expenses = Math.min(clamp(input.expenses), gross);
  const other = clamp(input.otherDeductions);
  const retirement = clamp(input.retirement);
  const filing = input.filingStatus;
  const profit = Math.max(0, gross - expenses);
  const seBase = profit * 0.9235;
  const seSs = Math.min(seBase, FICA_2026.socialSecurityWageBase) * FICA_2026.socialSecurityRate * 2;
  const seMedicare = seBase * FICA_2026.medicareRate * 2;
  const seAdd =
    Math.max(0, seBase - FICA_2026.additionalMedicareThreshold[filing]) * FICA_2026.additionalMedicareRate;
  const seTax = seSs + seMedicare + seAdd;
  const halfSe = seTax / 2;
  const qbi = Math.max(0, profit - retirement - halfSe) * 0.2;
  const taxable = Math.max(
    0,
    profit - retirement - halfSe - qbi - other - STANDARD_DEDUCTION_2026[filing],
  );
  const federal = calculateFederalTax(taxable, filing).tax;
  const state = calculateStateTax(Math.max(0, profit - retirement - halfSe - other), input.regionCode);
  const net = profit - retirement - seTax - federal - state.stateTax;

  return finish(country, input, {
    profit,
    incomeTax: federal,
    socialTax: seTax,
    regionalTax: state.stateTax,
    deductions: expenses + retirement + halfSe + qbi + other + STANDARD_DEDUCTION_2026[filing],
    netAnnual: net,
    lines: [
      { label: "Net profit", amount: profit },
      { label: "SE tax base (92.35%)", amount: seBase },
      { label: "Social Security (12.4%)", amount: seSs },
      { label: "Medicare (2.9%)", amount: seMedicare },
      ...(seAdd > 0 ? [{ label: "Additional Medicare", amount: seAdd }] : []),
      { label: "Deductible half of SE tax", amount: halfSe },
      { label: "QBI (20% est.)", amount: qbi },
      { label: "Federal income tax", amount: federal },
      { label: state.stateLabel, amount: state.stateTax },
    ],
  });
};

const indiaEngine: Engine = (input, country) => {
  const gross = clamp(input.grossAnnual);
  const expenses = Math.min(clamp(input.expenses), gross);
  const other = clamp(input.otherDeductions);
  const retirement = clamp(input.retirement);
  const profit = Math.max(0, gross - expenses);
  const taxable = Math.max(0, profit - retirement - other);
  const incomeTax = indiaProfessionalTax(taxable);
  const pt = IN_PT_STATES.find((state) => state.code === input.regionCode)?.rate ?? 0;
  const net = profit - retirement - incomeTax - pt;

  return finish(country, input, {
    profit,
    incomeTax,
    socialTax: 0,
    regionalTax: pt,
    deductions: expenses + retirement + other,
    netAnnual: net,
    lines: [
      { label: "Net professional income", amount: profit },
      { label: "Taxable income", amount: taxable },
      { label: "Income tax + cess", amount: incomeTax },
      { label: pt === 0 ? "Professional tax (none)" : "Professional tax", amount: pt },
      { label: "NPS / retirement", amount: retirement },
    ],
  });
};

const ukEngine: Engine = (input, country) => {
  const gross = clamp(input.grossAnnual);
  const expenses = Math.min(clamp(input.expenses), gross);
  const other = clamp(input.otherDeductions);
  const pension = clamp(input.retirement);
  const profit = Math.max(0, gross - expenses);
  const scotland = GB_NATIONS.find((item) => item.code === input.regionCode)?.code === "SCT";
  const brackets = scotland ? UK_SCOTLAND_BRACKETS : UK_ENGLAND_BRACKETS;
  const allowance = ukPersonalAllowance(Math.max(0, profit - pension - other));
  const taxable = Math.max(0, profit - pension - other - allowance);
  const incomeTax = applyBrackets(taxable, brackets).tax;
  const lpl = 12_570;
  const upl = 50_270;
  const class4 = Math.max(0, Math.min(profit, upl) - lpl) * 0.06 + Math.max(0, profit - upl) * 0.02;
  const net = profit - pension - incomeTax - class4;

  return finish(country, input, {
    profit,
    incomeTax,
    socialTax: class4,
    deductions: expenses + pension + other + allowance,
    netAnnual: net,
    lines: [
      { label: "Taxable profits", amount: profit },
      { label: "Personal allowance", amount: allowance },
      { label: scotland ? "Scottish income tax" : "Income tax", amount: incomeTax },
      { label: "NI Class 4", amount: class4 },
      { label: "Pension contribution", amount: pension },
    ],
  });
};

const canadaEngine: Engine = (input, country) => {
  const gross = clamp(input.grossAnnual);
  const expenses = Math.min(clamp(input.expenses), gross);
  const other = clamp(input.otherDeductions);
  const rrsp = clamp(input.retirement);
  const profit = Math.max(0, gross - expenses);
  const ympe = 71_300;
  const ybe = 3_500;
  const yampe = 81_200;
  const seCpp = Math.min(Math.max(0, profit - ybe), ympe - ybe) * 0.119;
  const seCpp2 = Math.min(Math.max(0, profit - ympe), yampe - ympe) * 0.08;
  const social = seCpp + seCpp2;
  const province = CA_PROVINCES.find((item) => item.code === input.regionCode) ?? CA_PROVINCES[0];
  const taxable = Math.max(0, profit - rrsp - other);
  const federal = Math.max(0, applyBrackets(taxable, CA_FEDERAL_BRACKETS).tax - 16_129 * 0.15);
  const provincial = taxable * (province.rate ?? 0);
  const net = profit - rrsp - federal - provincial - social;

  return finish(country, input, {
    profit,
    incomeTax: federal,
    socialTax: social,
    regionalTax: provincial,
    deductions: expenses + rrsp + other,
    netAnnual: net,
    lines: [
      { label: "Net self-employment income", amount: profit },
      { label: "Federal income tax", amount: federal },
      { label: `Provincial tax (${province.name})`, amount: provincial },
      { label: "CPP (both portions)", amount: social },
      { label: "RRSP contribution", amount: rrsp },
    ],
  });
};

const australiaEngine: Engine = (input, country) => {
  const gross = clamp(input.grossAnnual);
  const expenses = Math.min(clamp(input.expenses), gross);
  const other = clamp(input.otherDeductions);
  const superAmt = clamp(input.retirement);
  const profit = Math.max(0, gross - expenses);
  const taxable = Math.max(0, profit - superAmt - other);
  const incomeTax = applyBrackets(taxable, AU_BRACKETS).tax;
  const medicare = taxable >= 26_000 ? taxable * 0.02 : 0;
  const net = profit - superAmt - incomeTax - medicare;

  return finish(country, input, {
    profit,
    incomeTax,
    socialTax: medicare,
    deductions: expenses + superAmt + other,
    netAnnual: net,
    lines: [
      { label: "Taxable income", amount: taxable },
      { label: "Income tax (PAYG)", amount: incomeTax },
      { label: "Medicare levy", amount: medicare },
      { label: "Deductible super", amount: superAmt },
    ],
  });
};

const uaeEngine: Engine = (input, country) => {
  const gross = clamp(input.grossAnnual);
  const expenses = Math.min(clamp(input.expenses), gross);
  const other = clamp(input.otherDeductions);
  const savings = clamp(input.retirement);
  const profit = Math.max(0, gross - expenses);
  const taxable = Math.max(0, profit - other);
  const threshold = 375_000;
  const corporateTax = Math.max(0, taxable - threshold) * 0.09;
  const net = profit - savings - corporateTax;

  return finish(country, input, {
    profit,
    incomeTax: corporateTax,
    socialTax: 0,
    deductions: expenses + savings + other,
    netAnnual: net,
    lines: [
      { label: "Net profit", amount: profit },
      { label: "0% band (AED 375,000)", amount: Math.min(taxable, threshold) },
      { label: "Corporate tax (9% est.)", amount: corporateTax },
      { label: "Pension / savings", amount: savings },
    ],
  });
};

const ENGINES: Record<SelfEmploymentCountryCode, Engine> = {
  US: usEngine,
  IN: indiaEngine,
  GB: ukEngine,
  CA: canadaEngine,
  AU: australiaEngine,
  AE: uaeEngine,
};

export function calculateSelfEmployment(input: SelfEmploymentInput): SelfEmploymentResult | null {
  if (hasSelfEmploymentErrors(validateSelfEmployment(input))) return null;
  const country = getSelfEmploymentCountry(input.country);
  return ENGINES[country.code](input, country);
}
