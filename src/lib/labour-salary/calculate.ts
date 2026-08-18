import { calculateIndiaTax } from "@/lib/calculators/india-tax";
import {
  IN_PT_STATES,
  calculateAustraliaPaycheck,
  calculateCanadaPaycheck,
  calculateUkPaycheck,
  calculateUaePaycheck,
} from "@/lib/paycheck/international";
import {
  STANDARD_DEDUCTION_2026,
  calculateFederalTax,
  calculateFica,
  calculateStateTax,
} from "@/lib/paycheck/us";
import type { FilingStatus } from "@/lib/paycheck/types";
import {
  getSalaryCountry,
  type SalaryCountry,
  type SalaryCountryCode,
} from "./countries";
import { INDIA_LABOUR_CODE_2026, type IndiaTaxRegime, type PfContributionMode } from "./india-rules";

export type { SalaryCountry, SalaryCountryCode } from "./countries";
export { SALARY_COUNTRIES, FILING_STATUS_OPTIONS, getSalaryCountry } from "./countries";
export { INDIA_LABOUR_CODE_2026 } from "./india-rules";
export type { IndiaTaxRegime, PfContributionMode } from "./india-rules";

export type Line = { label: string; amount: number };

export type SalaryInput = {
  country: SalaryCountryCode;
  gross: number;
  basic: number;
  housing: number;
  other: number;
  bonus: number;
  employeeExtra: number;
  employerExtra: number;
  employeeExtraIsPercent: boolean;
  employerExtraIsPercent: boolean;
  region: string;
  filingStatus: FilingStatus;
  taxRegime: IndiaTaxRegime;
  pfMode: PfContributionMode;
};

export type SalaryValidation = {
  gross?: string;
  basic?: string;
  housing?: string;
  other?: string;
  bonus?: string;
  employeeExtra?: string;
  employerExtra?: string;
};

export type Snapshot = {
  applicableWage: number;
  employeeContributions: number;
  employerContributions: number;
  incomeTax: number;
  totalEmployeeDeductions: number;
  netAnnual: number;
  employerCost: number;
};

export type SalaryResult = {
  country: SalaryCountryCode;
  gross: number;
  basic: number;
  housing: number;
  other: number;
  bonus: number;
  applicableWage: number;
  applicableWageNote: string;
  employeeLines: Line[];
  employerLines: Line[];
  employeeContributions: number;
  employerContributions: number;
  incomeTax: number;
  incomeTaxLabel: string;
  regionalTax: number;
  regionalLabel: string;
  totalEmployeeDeductions: number;
  netAnnual: number;
  netMonthly: number;
  employerCost: number;
  comparison: { before: Snapshot; after: Snapshot } | null;
};

export const LABOUR_SALARY_FAQS = [
  {
    question: "What is the 50% wage rule under India’s Labour Codes?",
    answer:
      "Under Section 2(y) of the Code on Wages, wages are basic pay, dearness allowance, and retaining allowance. If other allowances exceed 50% of remuneration, the excess is added back to wages for PF, ESI, and gratuity. The Codes took effect on 21 November 2025.",
  },
  {
    question: "Does PF still use a ₹15,000 wage ceiling?",
    answer:
      "Yes in this model. EPF Scheme 2026 keeps a notified monthly wage ceiling of ₹15,000 for mandatory contributions. Amounts above that are voluntary — use “On full statutory wages” to model that choice.",
  },
  {
    question: "What happens when I pick a country other than India?",
    answer:
      "The Labour Code wage floor is not applied. The calculator switches to that country’s payroll framework — for example US FICA, UK PAYE and NI, Canada CPP/EI, Australia Super Guarantee, or UAE’s no personal income tax on salary.",
  },
  {
    question: "Why is take-home different from CTC?",
    answer:
      "Take-home is cash after employee PF/FICA/NI, tax, and other deductions. Employer contributions (PF, ESI, FICA, Super, NI) sit on top of cash pay and raise employer cost without hitting the employee’s bank account.",
  },
  {
    question: "Are these figures a legal determination?",
    answer:
      "No. Results are simplified estimates. Actual pay depends on notified ceilings, state rules, establishment coverage, and your employer’s policy. This is not legal, tax, or payroll advice.",
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

export function moneyDigits(currency: SalaryCountry["currency"]) {
  return currency === "INR" ? 0 : 2;
}

export function formatSalaryMoney(value: number, country: SalaryCountry, digits?: number) {
  const fraction = digits ?? moneyDigits(country.currency);
  const formatted = new Intl.NumberFormat(country.locale, {
    maximumFractionDigits: fraction,
    minimumFractionDigits: fraction,
  }).format(Number.isFinite(value) ? value : 0);
  if (country.currency === "AED") return `${country.currencySymbol} ${formatted}`;
  return `${country.currencySymbol}${formatted}`;
}

export function splitFromGross(country: SalaryCountry, gross: number) {
  const basic = (gross * country.defaultBasicPercent) / 100;
  const housing = (gross * country.defaultHousingPercent) / 100;
  const bonus = (gross * country.defaultBonusPercent) / 100;
  const other = Math.max(0, gross - basic - housing - bonus);
  return { basic, housing, other, bonus };
}

export function defaultsFromCountry(country: SalaryCountry): SalaryInput {
  const parts = splitFromGross(country, country.defaultGross);
  const extraIsPercent = country.code !== "IN" && country.code !== "AE";
  return {
    country: country.code,
    gross: country.defaultGross,
    ...parts,
    employeeExtra: extraIsPercent ? country.defaultEmployeeExtraPercent : 0,
    employerExtra: extraIsPercent ? country.defaultEmployerExtraPercent : 0,
    employeeExtraIsPercent: extraIsPercent,
    employerExtraIsPercent: extraIsPercent,
    region: country.defaultRegion,
    filingStatus: country.defaultFilingStatus,
    taxRegime: country.defaultTaxRegime,
    pfMode: country.defaultPfMode,
  };
}

export function validateSalary(input: SalaryInput): SalaryValidation {
  const country = getSalaryCountry(input.country);
  const errors: SalaryValidation = {};
  if (!Number.isFinite(input.gross) || input.gross <= 0) {
    errors.gross = `Enter a valid ${country.labels.gross.toLowerCase()}.`;
  }
  for (const key of ["basic", "housing", "other", "bonus"] as const) {
    if (!Number.isFinite(input[key]) || input[key] < 0) {
      errors[key] = `Enter a valid ${country.labels[key === "basic" ? "basic" : key === "housing" ? "housing" : key === "other" ? "other" : "bonus"].toLowerCase()}.`;
    }
  }
  if (!errors.basic && !errors.housing && !errors.other && !errors.bonus && Number.isFinite(input.gross)) {
    const sum = input.basic + input.housing + input.other + input.bonus;
    if (Math.abs(sum - input.gross) > 1) {
      errors.other = `Basic, housing, other, and bonus must add up to ${country.labels.gross.toLowerCase()}.`;
    }
  }
  if (!Number.isFinite(input.employeeExtra) || input.employeeExtra < 0) {
    errors.employeeExtra = "Enter 0 or more.";
  } else if (input.employeeExtraIsPercent && input.employeeExtra > 50) {
    errors.employeeExtra = "Keep this at 50% or less.";
  }
  if (!Number.isFinite(input.employerExtra) || input.employerExtra < 0) {
    errors.employerExtra = "Enter 0 or more.";
  } else if (input.employerExtraIsPercent && input.employerExtra > 50) {
    errors.employerExtra = "Keep this at 50% or less.";
  }
  return errors;
}

export function hasSalaryErrors(errors: SalaryValidation) {
  return Object.values(errors).some(Boolean);
}

function extraAmount(base: number, value: number, isPercent: boolean) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return isPercent ? (base * value) / 100 : value;
}

function pfWageAnnual(statutoryWages: number, mode: PfContributionMode) {
  const monthly = statutoryWages / 12;
  const capped = mode === "ceiling" ? Math.min(monthly, INDIA_LABOUR_CODE_2026.pf.wageCeilingMonthly) : monthly;
  return Math.max(0, capped) * 12;
}

export function statutoryWagesAnnual(
  input: Pick<SalaryInput, "basic" | "housing" | "other" | "bonus" | "pfMode">,
  applyFloor: boolean,
) {
  const rules = INDIA_LABOUR_CODE_2026;
  const contractual = Math.max(0, input.basic);
  if (!applyFloor) return { contractual, statutory: contractual, excessAdded: 0, remuneration: contractual + input.housing + input.other };

  let wages = contractual;
  let remuneration = 0;
  for (let step = 0; step < 6; step += 1) {
    const pfBase = pfWageAnnual(wages, input.pfMode);
    const employerPf = pfBase * rules.pf.employerRate;
    remuneration = contractual + Math.max(0, input.housing) + Math.max(0, input.other);
    if (rules.includeEmployerPfInRemuneration) remuneration += employerPf;
    const next = Math.max(contractual, remuneration * rules.wageFloorPercent);
    if (Math.abs(next - wages) < 0.5) {
      wages = next;
      break;
    }
    wages = next;
  }
  return {
    contractual,
    statutory: wages,
    excessAdded: Math.max(0, wages - contractual),
    remuneration,
  };
}

function indiaSnapshot(input: SalaryInput, applyFloor: boolean): Snapshot & { employeeLines: Line[]; employerLines: Line[]; incomeTax: number; regionalTax: number } {
  const rules = INDIA_LABOUR_CODE_2026;
  const wages = statutoryWagesAnnual(input, applyFloor);
  const pfBase = pfWageAnnual(wages.statutory, input.pfMode);
  const employeePf = pfBase * rules.pf.employeeRate;
  const employerPf = pfBase * rules.pf.employerRate;
  const edli = Math.min((pfBase / 12) * rules.pf.edliRate, rules.pf.edliCapMonthly) * 12;
  const monthlyWage = wages.statutory / 12;
  const esiApplies = monthlyWage > 0 && monthlyWage <= rules.esi.wageThresholdMonthly;
  const esiBase = wages.statutory;
  const employeeEsi = esiApplies ? esiBase * rules.esi.employeeRate : 0;
  const employerEsi = esiApplies ? esiBase * rules.esi.employerRate : 0;
  const gratuity = (wages.statutory * rules.gratuityDaysNumerator) / rules.gratuityDaysDenominator;
  const nps = extraAmount(input.gross, input.employeeExtra, input.employeeExtraIsPercent);
  const otherEmployer = extraAmount(input.gross, input.employerExtra, input.employerExtraIsPercent);
  const pt = IN_PT_STATES.find((item) => item.code === input.region)?.rate ?? 0;

  const tax = calculateIndiaTax({
    ctc: input.gross,
    regime: input.taxRegime,
    fy: "2025-26",
    includeEpf: false,
    deduction80c: input.taxRegime === "old" ? Math.min(employeePf, 150_000) : 0,
    nps80ccd1b: input.taxRegime === "old" ? Math.min(nps, 50_000) : 0,
  });

  const employeeLines: Line[] = [
    { label: "EPF (employee 12%)", amount: employeePf },
    ...(employeeEsi > 0 ? [{ label: "ESI (employee 0.75%)", amount: employeeEsi }] : []),
    ...(nps > 0 ? [{ label: "NPS / other employee deduction", amount: nps }] : []),
  ];
  const employerLines: Line[] = [
    { label: "EPF (employer 12%)", amount: employerPf },
    ...(edli > 0 ? [{ label: "EDLI (employer)", amount: edli }] : []),
    ...(employerEsi > 0 ? [{ label: "ESI (employer 3.25%)", amount: employerEsi }] : []),
    { label: "Gratuity provision (1 year)", amount: gratuity },
    ...(otherEmployer > 0 ? [{ label: "Other employer benefits", amount: otherEmployer }] : []),
  ];
  const employeeContributions = employeePf + employeeEsi + nps;
  const employerContributions = employerPf + edli + employerEsi + gratuity + otherEmployer;
  const totalEmployeeDeductions = employeeContributions + tax.annualTax + pt;
  return {
    applicableWage: wages.statutory,
    employeeContributions,
    employerContributions,
    incomeTax: tax.annualTax,
    totalEmployeeDeductions,
    netAnnual: Math.max(0, input.gross - totalEmployeeDeductions),
    employerCost: input.gross + employerContributions,
    employeeLines,
    employerLines,
    regionalTax: pt,
  };
}

function calculateIndia(input: SalaryInput): SalaryResult {
  const after = indiaSnapshot(input, true);
  const before = indiaSnapshot(input, false);
  const wages = statutoryWagesAnnual(input, true);
  const country = getSalaryCountry("IN");
  return {
    country: "IN",
    gross: input.gross,
    basic: input.basic,
    housing: input.housing,
    other: input.other,
    bonus: input.bonus,
    applicableWage: after.applicableWage,
    applicableWageNote:
      wages.excessAdded > 0
        ? `Allowances exceeded ${INDIA_LABOUR_CODE_2026.wageFloorPercent * 100}% of remuneration, so ${country.currencySymbol}${Math.round(wages.excessAdded).toLocaleString("en-IN")} was added back to wages.`
        : `Contractual basic + DA already meets the ${INDIA_LABOUR_CODE_2026.wageFloorPercent * 100}% wage floor.`,
    employeeLines: after.employeeLines,
    employerLines: after.employerLines,
    employeeContributions: after.employeeContributions,
    employerContributions: after.employerContributions,
    incomeTax: after.incomeTax,
    incomeTaxLabel: input.taxRegime === "new" ? "Income tax (new regime) + 4% cess" : "Income tax (old regime) + 4% cess",
    regionalTax: after.regionalTax,
    regionalLabel: after.regionalTax > 0 ? "Professional tax" : "Professional tax (none)",
    totalEmployeeDeductions: after.totalEmployeeDeductions,
    netAnnual: after.netAnnual,
    netMonthly: after.netAnnual / 12,
    employerCost: after.employerCost,
    comparison: { before, after },
  };
}

function calculateUnitedStates(input: SalaryInput): SalaryResult {
  const employee401k = extraAmount(input.gross, input.employeeExtra, true);
  const employerMatch = extraAmount(input.gross, input.employerExtra, true);
  const standardDeduction = STANDARD_DEDUCTION_2026[input.filingStatus];
  const taxableIncome = Math.max(0, input.gross - employee401k - standardDeduction);
  const { tax: incomeTax } = calculateFederalTax(taxableIncome, input.filingStatus);
  const fica = calculateFica(input.gross, input.filingStatus);
  const state = calculateStateTax(input.gross - employee401k, input.region);
  const employerFica = calculateFica(input.gross, "single");
  const employerSsMedicare = employerFica.socialSecurity + employerFica.medicare;
  const employeeLines: Line[] = [
    { label: "Social Security (6.2%)", amount: fica.socialSecurity },
    { label: "Medicare (1.45%)", amount: fica.medicare },
    ...(fica.additionalMedicare > 0 ? [{ label: "Additional Medicare (0.9%)", amount: fica.additionalMedicare }] : []),
    ...(employee401k > 0 ? [{ label: "401(k) employee deferral", amount: employee401k }] : []),
  ];
  const employerLines: Line[] = [
    { label: "Employer Social Security (6.2%)", amount: employerFica.socialSecurity },
    { label: "Employer Medicare (1.45%)", amount: employerFica.medicare },
    ...(employerMatch > 0 ? [{ label: "Employer 401(k) match", amount: employerMatch }] : []),
  ];
  const employeeContributions = fica.fica + employee401k;
  const totalEmployeeDeductions = employeeContributions + incomeTax + state.stateTax;
  return {
    country: "US",
    gross: input.gross,
    basic: input.basic,
    housing: input.housing,
    other: input.other,
    bonus: input.bonus,
    applicableWage: input.gross,
    applicableWageNote: `Federal taxable wages after 401(k) and a ${standardDeduction.toLocaleString("en-US")} standard deduction.`,
    employeeLines,
    employerLines,
    employeeContributions,
    employerContributions: employerSsMedicare + employerMatch,
    incomeTax,
    incomeTaxLabel: "Federal income tax",
    regionalTax: state.stateTax,
    regionalLabel: state.stateLabel,
    totalEmployeeDeductions,
    netAnnual: Math.max(0, input.gross - totalEmployeeDeductions),
    netMonthly: Math.max(0, input.gross - totalEmployeeDeductions) / 12,
    employerCost: input.gross + employerSsMedicare + employerMatch,
    comparison: null,
  };
}

function fromPaycheckLike(
  input: SalaryInput,
  computed: {
    incomeTax: number;
    incomeTaxLabel: string;
    regionalTax: number;
    regionalLabel: string;
    employeeLines: Line[];
    employerLines: Line[];
    applicableWage: number;
    applicableWageNote: string;
  },
): SalaryResult {
  const employeeContributions = computed.employeeLines.reduce((sum, line) => sum + line.amount, 0);
  const employerContributions = computed.employerLines.reduce((sum, line) => sum + line.amount, 0);
  const totalEmployeeDeductions = employeeContributions + computed.incomeTax + computed.regionalTax;
  return {
    country: input.country,
    gross: input.gross,
    basic: input.basic,
    housing: input.housing,
    other: input.other,
    bonus: input.bonus,
    applicableWage: computed.applicableWage,
    applicableWageNote: computed.applicableWageNote,
    employeeLines: computed.employeeLines,
    employerLines: computed.employerLines,
    employeeContributions,
    employerContributions,
    incomeTax: computed.incomeTax,
    incomeTaxLabel: computed.incomeTaxLabel,
    regionalTax: computed.regionalTax,
    regionalLabel: computed.regionalLabel,
    totalEmployeeDeductions,
    netAnnual: Math.max(0, input.gross - totalEmployeeDeductions),
    netMonthly: Math.max(0, input.gross - totalEmployeeDeductions) / 12,
    employerCost: input.gross + employerContributions,
    comparison: null,
  };
}

function calculateOther(input: SalaryInput): SalaryResult {
  const paycheckInput = {
    country: input.country,
    mode: "annual" as const,
    annualSalary: input.gross,
    hourlyRate: 0,
    hoursPerWeek: 40,
    weeksPerYear: 52,
    frequency: "monthly" as const,
    filingStatus: input.filingStatus,
    stateCode: input.region,
    contribution401kPercent: input.employeeExtraIsPercent ? input.employeeExtra : input.gross > 0 ? (input.employeeExtra / input.gross) * 100 : 0,
    healthInsuranceMonthly: 0,
    hsaMonthly: 0,
  };

  if (input.country === "GB") {
    const result = calculateUkPaycheck(paycheckInput);
    const employerNi = Math.max(0, input.gross - 5_000) * 0.15;
    const employerPension = extraAmount(input.gross, input.employerExtra, true);
    return fromPaycheckLike(input, {
      incomeTax: result.incomeTax,
      incomeTaxLabel: result.incomeTaxLabel,
      regionalTax: 0,
      regionalLabel: "Local tax (none)",
      employeeLines: result.socialLines.concat(
        result.pretaxAnnual > 0 ? [{ label: "Employee pension / extras", amount: result.pretaxAnnual }] : [],
      ),
      employerLines: [
        { label: "Employer NI (15% above £5,000)", amount: employerNi },
        ...(employerPension > 0 ? [{ label: "Employer pension", amount: employerPension }] : []),
      ],
      applicableWage: input.gross,
      applicableWageNote: result.taxableNote,
    });
  }

  if (input.country === "CA") {
    const result = calculateCanadaPaycheck(paycheckInput);
    const ympe = 71_300;
    const ybe = 3_500;
    const yampe = 81_200;
    const cpp = Math.min(Math.max(0, input.gross - ybe), ympe - ybe) * 0.0595;
    const cpp2 = Math.min(Math.max(0, input.gross - ympe), yampe - ympe) * 0.04;
    const eiEmployee = Math.min(input.gross, 65_700) * 0.0164;
    const employerExtra = extraAmount(input.gross, input.employerExtra, true);
    return fromPaycheckLike(input, {
      incomeTax: result.incomeTax,
      incomeTaxLabel: result.incomeTaxLabel,
      regionalTax: result.regionalTax,
      regionalLabel: result.regionalLabel,
      employeeLines: result.socialLines.concat(
        result.pretaxAnnual > 0 ? [{ label: "RRSP / benefits", amount: result.pretaxAnnual }] : [],
      ),
      employerLines: [
        { label: "Employer CPP", amount: cpp + cpp2 },
        { label: "Employer EI (1.4×)", amount: eiEmployee * 1.4 },
        ...(employerExtra > 0 ? [{ label: "Employer RRSP / benefits", amount: employerExtra }] : []),
      ],
      applicableWage: input.gross,
      applicableWageNote: result.taxableNote,
    });
  }

  if (input.country === "AU") {
    const result = calculateAustraliaPaycheck(paycheckInput);
    const ote = Math.max(0, input.gross - input.bonus);
    const superGuarantee = ote * 0.12;
    const extraSuper = extraAmount(ote, input.employerExtra, true);
    return fromPaycheckLike(input, {
      incomeTax: result.incomeTax,
      incomeTaxLabel: result.incomeTaxLabel,
      regionalTax: 0,
      regionalLabel: "State tax (none)",
      employeeLines: result.socialLines.concat(
        result.pretaxAnnual > 0 ? [{ label: "Salary-sacrificed super / extras", amount: result.pretaxAnnual }] : [],
      ),
      employerLines: [
        { label: "Super Guarantee (12% of OTE)", amount: superGuarantee },
        ...(extraSuper > 0 ? [{ label: "Extra employer super", amount: extraSuper }] : []),
      ],
      applicableWage: ote,
      applicableWageNote: "Ordinary-time earnings exclude bonus in this Super Guarantee estimate.",
    });
  }

  const result = calculateUaePaycheck(paycheckInput);
  const employeeSavings = extraAmount(input.gross, input.employeeExtra, false);
  const employerBenefits = extraAmount(input.gross, input.employerExtra, false);
  return fromPaycheckLike(input, {
    incomeTax: 0,
    incomeTaxLabel: "Income tax (none)",
    regionalTax: 0,
    regionalLabel: "Emirate tax (none)",
    employeeLines: employeeSavings > 0 ? [{ label: "Employee savings / pension", amount: employeeSavings }] : [],
    employerLines: employerBenefits > 0 ? [{ label: "Employer benefits", amount: employerBenefits }] : [],
    applicableWage: input.basic,
    applicableWageNote: result.taxableNote,
  });
}

export function calculateSalary(input: SalaryInput): SalaryResult {
  if (input.country === "IN") return calculateIndia(input);
  if (input.country === "US") return calculateUnitedStates(input);
  return calculateOther(input);
}
