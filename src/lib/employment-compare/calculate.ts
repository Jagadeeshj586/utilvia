import { calculateIndiaTax } from "@/lib/calculators/india-tax";
import { applyBrackets } from "@/lib/paycheck/helpers";
import {
  AU_BRACKETS,
  CA_FEDERAL_BRACKETS,
  CA_PROVINCES,
  GB_NATIONS,
  IN_PT_STATES,
  UK_ENGLAND_BRACKETS,
  UK_SCOTLAND_BRACKETS,
  ukNationalInsurance,
  ukPersonalAllowance,
} from "@/lib/paycheck/international";
import type { FilingStatus } from "@/lib/paycheck/types";
import {
  FICA_2026,
  STANDARD_DEDUCTION_2026,
  calculateFederalTax,
  calculateFica,
  calculateStateTax,
} from "@/lib/paycheck/us";
import {
  getEmploymentCountry,
  type EmploymentCountry,
  type EmploymentCountryCode,
} from "./countries";

export type { EmploymentCountry, EmploymentCountryCode } from "./countries";
export { EMPLOYMENT_COUNTRIES, EMPLOYMENT_FILING_STATUSES, getEmploymentCountry } from "./countries";

export type EmploymentCompareInput = {
  country: EmploymentCountryCode;
  grossAnnual: number;
  expenses: number;
  benefits: number;
  retirementPercent: number;
  regionCode: string;
  filingStatus: FilingStatus;
};

export type TaxLine = { label: string; amount: number };

export type SideResult = {
  key: "employee" | "contractor";
  label: string;
  incomeTax: number;
  socialTax: number;
  regionalTax: number;
  deductions: number;
  employerCost: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number;
  lines: TaxLine[];
};

export type EmploymentCompareResult = {
  country: EmploymentCountryCode;
  employee: SideResult;
  contractor: SideResult;
  netDifference: number;
  employeeComesOutAhead: boolean;
  note: string;
};

export type EmploymentValidation = {
  grossAnnual?: string;
  expenses?: string;
  benefits?: string;
  retirementPercent?: string;
};

export function defaultsFromCountry(country: EmploymentCountry): EmploymentCompareInput {
  return {
    country: country.code,
    grossAnnual: country.defaultGross,
    expenses: 0,
    benefits: 0,
    retirementPercent: country.defaultRetirementPercent,
    regionCode: country.defaultRegion,
    filingStatus: "single",
  };
}

export const EMPLOYMENT_COMPARE_DEFAULTS = defaultsFromCountry(getEmploymentCountry("US"));

export const EMPLOYMENT_COMPARE_FAQS = [
  {
    question: "Why do other countries not say W-2 and 1099?",
    answer:
      "W-2 and 1099 are US tax forms. In other countries the same comparison is employee vs self-employed, contractor, sole trader, or freelancer — the calculator switches labels with the country.",
  },
  {
    question: "Does the contractor side include self-employment tax?",
    answer:
      "Yes, where that country has an equivalent. The US uses self-employment tax (Social Security and Medicare). The UK uses Class 4 NI, Canada uses both CPP portions, and India/UAE follow local contribution rules in the estimate.",
  },
  {
    question: "Are work expenses deducted for employees too?",
    answer:
      "Generally no in this estimate. Unreimbursed employee expenses are limited or unavailable in many systems. Expenses reduce contractor / self-employed profit only.",
  },
  {
    question: "What is employer / business-paid cost?",
    answer:
      "Payroll taxes or contributions the employer pays on top of wages — for example US FICA match, UK employer NI, Canada employer CPP/EI, India employer EPF, or Australian Super Guarantee. Contractors typically bear those themselves or they do not apply.",
  },
  {
    question: "Is this tax advice?",
    answer:
      "No. Figures are simplified estimates for comparison. Real withholding depends on credits, forms, visas, and elections. Check official rules or a qualified advisor.",
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

export function moneyDigits(currency: EmploymentCountry["currency"]) {
  return currency === "INR" ? 0 : 2;
}

export function formatEmploymentMoney(value: number, country: EmploymentCountry, digits?: number) {
  const fraction = digits ?? moneyDigits(country.currency);
  const formatted = new Intl.NumberFormat(country.locale, {
    maximumFractionDigits: fraction,
    minimumFractionDigits: fraction,
  }).format(Number.isFinite(value) ? value : 0);
  if (country.currency === "AED") return `${country.currencySymbol} ${formatted}`;
  return `${country.currencySymbol}${formatted}`;
}

export function validateEmploymentCompare(input: EmploymentCompareInput): EmploymentValidation {
  const errors: EmploymentValidation = {};
  if (!Number.isFinite(input.grossAnnual) || input.grossAnnual <= 0) {
    errors.grossAnnual = "Enter a gross income greater than 0.";
  }
  if (!Number.isFinite(input.expenses) || input.expenses < 0) {
    errors.expenses = "Enter work expenses of 0 or more.";
  } else if (Number.isFinite(input.grossAnnual) && input.expenses > input.grossAnnual) {
    errors.expenses = "Expenses cannot exceed gross income.";
  }
  if (!Number.isFinite(input.benefits) || input.benefits < 0) {
    errors.benefits = "Enter benefits of 0 or more.";
  }
  if (!Number.isFinite(input.retirementPercent) || input.retirementPercent < 0 || input.retirementPercent > 100) {
    errors.retirementPercent = "Retirement contribution must be between 0% and 100%.";
  }
  return errors;
}

export function hasEmploymentErrors(errors: EmploymentValidation) {
  return Object.keys(errors).length > 0;
}

function clamp(n: number) {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function side(
  key: SideResult["key"],
  label: string,
  parts: {
    incomeTax: number;
    socialTax: number;
    regionalTax?: number;
    deductions: number;
    employerCost: number;
    netAnnual: number;
    gross: number;
    lines: TaxLine[];
  },
): SideResult {
  const regionalTax = parts.regionalTax ?? 0;
  const taxTotal = parts.incomeTax + parts.socialTax + regionalTax;
  return {
    key,
    label,
    incomeTax: parts.incomeTax,
    socialTax: parts.socialTax,
    regionalTax,
    deductions: parts.deductions,
    employerCost: parts.employerCost,
    netAnnual: Math.max(0, parts.netAnnual),
    netMonthly: Math.max(0, parts.netAnnual) / 12,
    effectiveRate: parts.gross > 0 ? (taxTotal / parts.gross) * 100 : 0,
    lines: parts.lines,
  };
}

function compare(country: EmploymentCountry, employee: SideResult, contractor: SideResult): EmploymentCompareResult {
  const netDifference = employee.netAnnual - contractor.netAnnual;
  return {
    country: country.code,
    employee,
    contractor,
    netDifference,
    employeeComesOutAhead: netDifference >= 0,
    note: country.note,
  };
}

type Engine = (input: EmploymentCompareInput, country: EmploymentCountry) => EmploymentCompareResult;

const usEngine: Engine = (input, country) => {
  const gross = clamp(input.grossAnnual);
  const expenses = Math.min(clamp(input.expenses), gross);
  const benefits = clamp(input.benefits);
  const retirement = gross * (clamp(input.retirementPercent) / 100);
  const filing = input.filingStatus;

  const employeePretax = retirement + benefits;
  const employeeTaxable = Math.max(0, gross - employeePretax - STANDARD_DEDUCTION_2026[filing]);
  const employeeFederal = calculateFederalTax(employeeTaxable, filing).tax;
  const employeeFica = calculateFica(gross, filing);
  const employeeState = calculateStateTax(gross - employeePretax, input.regionCode);
  const employerFica = calculateFica(gross, filing).fica;
  const employeeNet = gross - employeePretax - employeeFederal - employeeFica.fica - employeeState.stateTax;

  const profit = Math.max(0, gross - expenses);
  const seBase = profit * 0.9235;
  const seSs = Math.min(seBase, FICA_2026.socialSecurityWageBase) * FICA_2026.socialSecurityRate * 2;
  const seMedicare = seBase * FICA_2026.medicareRate * 2;
  const seAdd =
    Math.max(0, seBase - FICA_2026.additionalMedicareThreshold[filing]) * FICA_2026.additionalMedicareRate;
  const seTax = seSs + seMedicare + seAdd;
  const halfSe = seTax / 2;
  const contractorRetirement = profit * (clamp(input.retirementPercent) / 100);
  const qbi = Math.max(0, profit - contractorRetirement - halfSe) * 0.2;
  const contractorTaxable = Math.max(
    0,
    profit - contractorRetirement - halfSe - qbi - STANDARD_DEDUCTION_2026[filing],
  );
  const contractorFederal = calculateFederalTax(contractorTaxable, filing).tax;
  const contractorState = calculateStateTax(profit - contractorRetirement - halfSe, input.regionCode);
  const contractorNet = profit - contractorRetirement - seTax - contractorFederal - contractorState.stateTax - benefits;

  return compare(
    country,
    side("employee", country.labels.employee, {
      incomeTax: employeeFederal,
      socialTax: employeeFica.fica,
      regionalTax: employeeState.stateTax,
      deductions: employeePretax + STANDARD_DEDUCTION_2026[filing],
      employerCost: employerFica,
      netAnnual: employeeNet,
      gross,
      lines: [
        { label: "Federal income tax", amount: employeeFederal },
        { label: "FICA (employee)", amount: employeeFica.fica },
        { label: employeeState.stateLabel, amount: employeeState.stateTax },
        { label: "Pre-tax benefits / retirement", amount: employeePretax },
      ],
    }),
    side("contractor", country.labels.contractor, {
      incomeTax: contractorFederal,
      socialTax: seTax,
      regionalTax: contractorState.stateTax,
      deductions: expenses + contractorRetirement + halfSe + qbi + STANDARD_DEDUCTION_2026[filing],
      employerCost: 0,
      netAnnual: contractorNet,
      gross,
      lines: [
        { label: "Federal income tax", amount: contractorFederal },
        { label: "Self-employment tax", amount: seTax },
        { label: contractorState.stateLabel, amount: contractorState.stateTax },
        { label: "Business expenses", amount: expenses },
        { label: "QBI (20% est.)", amount: qbi },
      ],
    }),
  );
};

const indiaEngine: Engine = (input, country) => {
  const gross = clamp(input.grossAnnual);
  const expenses = Math.min(clamp(input.expenses), gross);
  const benefits = clamp(input.benefits);
  const epfRate = clamp(input.retirementPercent) / 100;
  const basic = gross * 0.5;
  const employeeEpf = basic * epfRate;
  const employerEpf = basic * 0.12;
  const esi = gross / 12 <= 21_000 ? gross * 0.0075 : 0;
  const pt = IN_PT_STATES.find((state) => state.code === input.regionCode)?.rate ?? 0;
  const employeeTax = calculateIndiaTax({ ctc: gross, regime: "new", fy: "2025-26", includeEpf: false });
  const employeeNet = gross - benefits - employeeTax.annualTax - employeeEpf - esi - pt;

  const professionalProfit = Math.max(0, gross - expenses);
  const nps = professionalProfit * epfRate;
  const contractorTax = calculateIndiaTax({
    ctc: Math.max(0, professionalProfit - nps),
    regime: "new",
    fy: "2025-26",
    includeEpf: false,
  });
  const contractorNet = professionalProfit - nps - contractorTax.annualTax - benefits;

  return compare(
    country,
    side("employee", country.labels.employee, {
      incomeTax: employeeTax.annualTax,
      socialTax: employeeEpf + esi,
      regionalTax: pt,
      deductions: benefits + employeeTax.standardDeduction,
      employerCost: employerEpf,
      netAnnual: employeeNet,
      gross,
      lines: [
        { label: "Income tax + cess", amount: employeeTax.annualTax },
        { label: "EPF (employee)", amount: employeeEpf },
        ...(esi > 0 ? [{ label: "ESI (0.75%)", amount: esi }] : []),
        { label: pt === 0 ? "Professional tax (none)" : "Professional tax", amount: pt },
      ],
    }),
    side("contractor", country.labels.contractor, {
      incomeTax: contractorTax.annualTax,
      socialTax: 0,
      deductions: expenses + nps,
      employerCost: 0,
      netAnnual: contractorNet,
      gross,
      lines: [
        { label: "Income tax + cess", amount: contractorTax.annualTax },
        { label: "Business expenses", amount: expenses },
        { label: "NPS / savings (est.)", amount: nps },
      ],
    }),
  );
};

const ukEngine: Engine = (input, country) => {
  const gross = clamp(input.grossAnnual);
  const expenses = Math.min(clamp(input.expenses), gross);
  const benefits = clamp(input.benefits);
  const pension = gross * (clamp(input.retirementPercent) / 100);
  const scotland = input.regionCode === "SCT" || GB_NATIONS.find((item) => item.code === input.regionCode)?.code === "SCT";
  const brackets = scotland ? UK_SCOTLAND_BRACKETS : UK_ENGLAND_BRACKETS;

  const employeePretax = pension + benefits;
  const employeeAllowance = ukPersonalAllowance(Math.max(0, gross - employeePretax));
  const employeeTaxable = Math.max(0, gross - employeePretax - employeeAllowance);
  const employeeIncomeTax = applyBrackets(employeeTaxable, brackets).tax;
  const employeeNi = ukNationalInsurance(Math.max(0, gross - pension));
  const employerNi = Math.max(0, gross - 5_000) * 0.15;
  const employeeNet = gross - employeePretax - employeeIncomeTax - employeeNi;

  const profit = Math.max(0, gross - expenses);
  const contractorPension = profit * (clamp(input.retirementPercent) / 100);
  const contractorAllowance = ukPersonalAllowance(Math.max(0, profit - contractorPension));
  const contractorTaxable = Math.max(0, profit - contractorPension - contractorAllowance);
  const contractorIncomeTax = applyBrackets(contractorTaxable, brackets).tax;
  const lpl = 12_570;
  const upl = 50_270;
  const class4Band = Math.max(0, Math.min(profit, upl) - lpl);
  const class4Above = Math.max(0, profit - upl);
  const class4 = class4Band * 0.06 + class4Above * 0.02;
  const contractorNet = profit - contractorPension - contractorIncomeTax - class4 - benefits;

  return compare(
    country,
    side("employee", country.labels.employee, {
      incomeTax: employeeIncomeTax,
      socialTax: employeeNi,
      deductions: employeePretax + employeeAllowance,
      employerCost: employerNi,
      netAnnual: employeeNet,
      gross,
      lines: [
        { label: scotland ? "Scottish income tax" : "Income tax (PAYE)", amount: employeeIncomeTax },
        { label: "NI Class 1 (employee)", amount: employeeNi },
        { label: "Pension / benefits", amount: employeePretax },
      ],
    }),
    side("contractor", country.labels.contractor, {
      incomeTax: contractorIncomeTax,
      socialTax: class4,
      deductions: expenses + contractorPension + contractorAllowance,
      employerCost: 0,
      netAnnual: contractorNet,
      gross,
      lines: [
        { label: scotland ? "Scottish income tax" : "Income tax", amount: contractorIncomeTax },
        { label: "NI Class 4", amount: class4 },
        { label: "Allowable expenses", amount: expenses },
      ],
    }),
  );
};

const canadaEngine: Engine = (input, country) => {
  const gross = clamp(input.grossAnnual);
  const expenses = Math.min(clamp(input.expenses), gross);
  const benefits = clamp(input.benefits);
  const rrsp = gross * (clamp(input.retirementPercent) / 100);
  const ympe = 71_300;
  const ybe = 3_500;
  const yampe = 81_200;
  const employeeCpp = Math.min(Math.max(0, gross - ybe), ympe - ybe) * 0.0595;
  const employeeCpp2 = Math.min(Math.max(0, gross - ympe), yampe - ympe) * 0.04;
  const employeeEi = Math.min(gross, 65_700) * 0.0164;
  const province = CA_PROVINCES.find((item) => item.code === input.regionCode) ?? CA_PROVINCES[0];

  const employeeTaxable = Math.max(0, gross - rrsp - benefits);
  const employeeFederal = Math.max(0, applyBrackets(employeeTaxable, CA_FEDERAL_BRACKETS).tax - 16_129 * 0.15);
  const employeeProvincial = employeeTaxable * (province.rate ?? 0);
  const employeeSocial = employeeCpp + employeeCpp2 + employeeEi;
  const employerCost = employeeCpp + employeeCpp2 + employeeEi * 1.4;
  const employeeNet = gross - rrsp - benefits - employeeFederal - employeeProvincial - employeeSocial;

  const profit = Math.max(0, gross - expenses);
  const contractorRrsp = profit * (clamp(input.retirementPercent) / 100);
  const contractorTaxable = Math.max(0, profit - contractorRrsp);
  const contractorFederal = Math.max(0, applyBrackets(contractorTaxable, CA_FEDERAL_BRACKETS).tax - 16_129 * 0.15);
  const contractorProvincial = contractorTaxable * (province.rate ?? 0);
  const seCpp = Math.min(Math.max(0, profit - ybe), ympe - ybe) * 0.119;
  const seCpp2 = Math.min(Math.max(0, profit - ympe), yampe - ympe) * 0.08;
  const contractorSocial = seCpp + seCpp2;
  const contractorNet = profit - contractorRrsp - contractorFederal - contractorProvincial - contractorSocial - benefits;

  return compare(
    country,
    side("employee", country.labels.employee, {
      incomeTax: employeeFederal,
      socialTax: employeeSocial,
      regionalTax: employeeProvincial,
      deductions: rrsp + benefits,
      employerCost,
      netAnnual: employeeNet,
      gross,
      lines: [
        { label: "Federal income tax", amount: employeeFederal },
        { label: `Provincial tax (${province.name})`, amount: employeeProvincial },
        { label: "CPP / EI (employee)", amount: employeeSocial },
      ],
    }),
    side("contractor", country.labels.contractor, {
      incomeTax: contractorFederal,
      socialTax: contractorSocial,
      regionalTax: contractorProvincial,
      deductions: expenses + contractorRrsp,
      employerCost: 0,
      netAnnual: contractorNet,
      gross,
      lines: [
        { label: "Federal income tax", amount: contractorFederal },
        { label: `Provincial tax (${province.name})`, amount: contractorProvincial },
        { label: "CPP (self-employed)", amount: contractorSocial },
        { label: "Business expenses", amount: expenses },
      ],
    }),
  );
};

const australiaEngine: Engine = (input, country) => {
  const gross = clamp(input.grossAnnual);
  const expenses = Math.min(clamp(input.expenses), gross);
  const benefits = clamp(input.benefits);
  const superRate = clamp(input.retirementPercent) / 100;
  const sacrificed = gross * superRate;
  const employeeTaxable = Math.max(0, gross - sacrificed - benefits);
  const employeeIncomeTax = applyBrackets(employeeTaxable, AU_BRACKETS).tax;
  const employeeMedicare = employeeTaxable >= 26_000 ? employeeTaxable * 0.02 : 0;
  const employerSg = gross * 0.115;
  const employeeNet = gross - sacrificed - benefits - employeeIncomeTax - employeeMedicare;

  const profit = Math.max(0, gross - expenses);
  const traderSuper = profit * superRate;
  const contractorTaxable = Math.max(0, profit - traderSuper);
  const contractorIncomeTax = applyBrackets(contractorTaxable, AU_BRACKETS).tax;
  const contractorMedicare = contractorTaxable >= 26_000 ? contractorTaxable * 0.02 : 0;
  const contractorNet = profit - traderSuper - contractorIncomeTax - contractorMedicare - benefits;

  return compare(
    country,
    side("employee", country.labels.employee, {
      incomeTax: employeeIncomeTax,
      socialTax: employeeMedicare,
      deductions: sacrificed + benefits,
      employerCost: employerSg,
      netAnnual: employeeNet,
      gross,
      lines: [
        { label: "Income tax (PAYG)", amount: employeeIncomeTax },
        { label: "Medicare levy", amount: employeeMedicare },
        { label: "Salary-sacrificed super", amount: sacrificed },
      ],
    }),
    side("contractor", country.labels.contractor, {
      incomeTax: contractorIncomeTax,
      socialTax: contractorMedicare,
      deductions: expenses + traderSuper,
      employerCost: 0,
      netAnnual: contractorNet,
      gross,
      lines: [
        { label: "Income tax", amount: contractorIncomeTax },
        { label: "Medicare levy", amount: contractorMedicare },
        { label: "Business expenses", amount: expenses },
        { label: "Deductible super", amount: traderSuper },
      ],
    }),
  );
};

const uaeEngine: Engine = (input, country) => {
  const gross = clamp(input.grossAnnual);
  const expenses = Math.min(clamp(input.expenses), gross);
  const benefits = clamp(input.benefits);
  const savings = gross * (clamp(input.retirementPercent) / 100);
  const employeeNet = gross - benefits - savings;
  const contractorNet = Math.max(0, gross - expenses - benefits - savings);

  return compare(
    country,
    side("employee", country.labels.employee, {
      incomeTax: 0,
      socialTax: 0,
      deductions: benefits + savings,
      employerCost: 0,
      netAnnual: employeeNet,
      gross,
      lines: [
        { label: "Income tax", amount: 0 },
        { label: "Benefits / savings", amount: benefits + savings },
      ],
    }),
    side("contractor", country.labels.contractor, {
      incomeTax: 0,
      socialTax: 0,
      deductions: expenses + benefits + savings,
      employerCost: 0,
      netAnnual: contractorNet,
      gross,
      lines: [
        { label: "Income tax", amount: 0 },
        { label: "Business expenses", amount: expenses },
        { label: "Benefits / savings", amount: benefits + savings },
      ],
    }),
  );
};

const ENGINES: Record<EmploymentCountryCode, Engine> = {
  US: usEngine,
  IN: indiaEngine,
  GB: ukEngine,
  CA: canadaEngine,
  AU: australiaEngine,
  AE: uaeEngine,
};

export function calculateEmploymentCompare(input: EmploymentCompareInput): EmploymentCompareResult | null {
  if (hasEmploymentErrors(validateEmploymentCompare(input))) return null;
  const country = getEmploymentCountry(input.country);
  return ENGINES[country.code](input, country);
}
