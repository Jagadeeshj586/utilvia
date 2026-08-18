import { IN_PT_STATES } from "@/lib/paycheck/international";
import { FILING_STATUSES } from "@/lib/paycheck/types";
import { STATE_TAX_RATES } from "@/lib/paycheck/us";
import type { FilingStatus } from "@/lib/paycheck/types";
import type { IndiaTaxRegime, PfContributionMode } from "./india-rules";

export type SalaryCountryCode = "IN" | "US" | "GB" | "CA" | "AU" | "AE";
export type SalaryCurrencyCode = "INR" | "USD" | "GBP" | "CAD" | "AUD" | "AED";

export type RegionOption = { code: string; name: string };

export type SalaryLabels = {
  pageTitle: string;
  framework: string;
  gross: string;
  grossHint: string;
  basic: string;
  basicHint: string;
  housing: string;
  housingHint: string;
  other: string;
  otherHint: string;
  bonus: string;
  bonusHint: string;
  employeeExtra: string;
  employeeExtraHint: string;
  employerExtra: string;
  employerExtraHint: string;
  taxStatus: string;
  region: string | null;
  applicableWage: string;
};

export type SalaryCountry = {
  code: SalaryCountryCode;
  name: string;
  flag: string;
  currency: SalaryCurrencyCode;
  currencySymbol: string;
  locale: string;
  note: string;
  defaultGross: number;
  defaultBasicPercent: number;
  defaultHousingPercent: number;
  defaultBonusPercent: number;
  defaultEmployeeExtraPercent: number;
  defaultEmployerExtraPercent: number;
  defaultRegion: string;
  defaultFilingStatus: FilingStatus;
  defaultTaxRegime: IndiaTaxRegime;
  defaultPfMode: PfContributionMode;
  regions: RegionOption[];
  showFilingStatus: boolean;
  showTaxRegime: boolean;
  showPfMode: boolean;
  labels: SalaryLabels;
};

export const SALARY_COUNTRIES: SalaryCountry[] = [
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    currencySymbol: "₹",
    locale: "en-IN",
    note: "Applies the Code on Wages 50% wage floor (in force 21 November 2025) and EPF Scheme 2026 rates. Statutory wages drive PF, ESI, and gratuity. Estimates only — state rules and employer policy can differ.",
    defaultGross: 1_200_000,
    defaultBasicPercent: 40,
    defaultHousingPercent: 20,
    defaultBonusPercent: 0,
    defaultEmployeeExtraPercent: 0,
    defaultEmployerExtraPercent: 0,
    defaultRegion: "KA",
    defaultFilingStatus: "single",
    defaultTaxRegime: "new",
    defaultPfMode: "ceiling",
    regions: IN_PT_STATES.map((item) => ({ code: item.code, name: item.name })),
    showFilingStatus: false,
    showTaxRegime: true,
    showPfMode: true,
    labels: {
      pageTitle: "India Labour Code 2026 salary",
      framework: "Code on Wages + Social Security Code (EPF Scheme 2026)",
      gross: "Annual CTC (cash salary)",
      grossHint: "Basic + HRA + other allowances + bonus paid to you. Employer PF, ESI, and gratuity are added on top as employer cost.",
      basic: "Basic + DA",
      basicHint: "Contractual basic pay and dearness allowance. If this is under 50% of remuneration, the excess allowances are added back to statutory wages.",
      housing: "HRA",
      housingHint: "House rent allowance. Counts toward the 50% allowance cap, not toward contractual wages.",
      other: "Special / other allowances",
      otherHint: "Remaining cash pay. Auto-fills so components add up to CTC.",
      bonus: "Bonus / variable pay",
      bonusHint: "Annual performance incentives are excluded from statutory wages (MoLE March 2026 FAQ).",
      employeeExtra: "NPS / other employee deduction",
      employeeExtraHint: "Optional extra you pay from take-home (₹ per year).",
      employerExtra: "Other employer benefits",
      employerExtraHint: "Optional extra employer cost not already in PF, ESI, or gratuity (₹ per year).",
      taxStatus: "Tax regime",
      region: "Professional tax state",
      applicableWage: "Statutory wages (Labour Code)",
    },
  },
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    locale: "en-US",
    note: "Uses 2026 federal income-tax brackets and FICA (Social Security 6.2% up to the wage base, Medicare 1.45%). Employer FICA is shown separately. Not a W-2.",
    defaultGross: 85_000,
    defaultBasicPercent: 80,
    defaultHousingPercent: 0,
    defaultBonusPercent: 10,
    defaultEmployeeExtraPercent: 0,
    defaultEmployerExtraPercent: 0,
    defaultRegion: "FL",
    defaultFilingStatus: "single",
    defaultTaxRegime: "new",
    defaultPfMode: "ceiling",
    regions: STATE_TAX_RATES.map((item) => ({ code: item.code, name: item.name })),
    showFilingStatus: true,
    showTaxRegime: false,
    showPfMode: false,
    labels: {
      pageTitle: "US salary & payroll",
      framework: "Federal income tax + FICA (2026)",
      gross: "Gross salary",
      grossHint: "W-2 wages before tax: base, allowances, and bonus.",
      basic: "Base salary",
      basicHint: "Regular wages. Remaining gross after housing and bonus goes to other pay.",
      housing: "Housing / stipend",
      housingHint: "Optional cash housing or living stipend included in wages.",
      other: "Other pay",
      otherHint: "Overtime, allowances, and other taxable cash.",
      bonus: "Bonus / variable pay",
      bonusHint: "Taxable bonus included in gross wages.",
      employeeExtra: "401(k) contribution",
      employeeExtraHint: "Percent of gross deferred from pay (pre-tax in this estimate).",
      employerExtra: "Employer 401(k) match",
      employerExtraHint: "Percent of gross the employer contributes. Adds to employer cost, not take-home.",
      taxStatus: "Filing status",
      region: "State",
      applicableWage: "Taxable wages",
    },
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    currencySymbol: "£",
    locale: "en-GB",
    note: "Uses 2025/26 PAYE bands and employee Class 1 NI. Employer NI is 15% above the £5,000 secondary threshold. Pension contributions are optional.",
    defaultGross: 45_000,
    defaultBasicPercent: 85,
    defaultHousingPercent: 0,
    defaultBonusPercent: 5,
    defaultEmployeeExtraPercent: 5,
    defaultEmployerExtraPercent: 3,
    defaultRegion: "ENG",
    defaultFilingStatus: "single",
    defaultTaxRegime: "new",
    defaultPfMode: "ceiling",
    regions: [
      { code: "ENG", name: "England, Wales & Northern Ireland" },
      { code: "SCT", name: "Scotland" },
    ],
    showFilingStatus: false,
    showTaxRegime: false,
    showPfMode: false,
    labels: {
      pageTitle: "UK salary & PAYE",
      framework: "PAYE + Class 1 National Insurance (2025/26)",
      gross: "Gross salary",
      grossHint: "Annual cash pay before tax and NI.",
      basic: "Basic pay",
      basicHint: "Contracted salary before allowances and bonus.",
      housing: "Housing / London weighting",
      housingHint: "Location or housing cash allowance.",
      other: "Other allowances",
      otherHint: "Remaining cash pay so components add up to gross.",
      bonus: "Bonus / variable pay",
      bonusHint: "Included in PAYE and NI in this estimate.",
      employeeExtra: "Employee pension",
      employeeExtraHint: "Salary-sacrifice / employee pension as a percent of gross.",
      employerExtra: "Employer pension",
      employerExtraHint: "Employer pension contribution as a percent of gross.",
      taxStatus: "Tax status",
      region: "Tax nation",
      applicableWage: "PAYE pay",
    },
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    currencySymbol: "$",
    locale: "en-CA",
    note: "Uses 2025 federal brackets, CPP/CPP2, EI, and a simplified provincial tax estimate. Employer CPP matches the employee; employer EI is 1.4× the employee rate.",
    defaultGross: 85_000,
    defaultBasicPercent: 85,
    defaultHousingPercent: 0,
    defaultBonusPercent: 5,
    defaultEmployeeExtraPercent: 0,
    defaultEmployerExtraPercent: 0,
    defaultRegion: "ON",
    defaultFilingStatus: "single",
    defaultTaxRegime: "new",
    defaultPfMode: "ceiling",
    regions: [
      { code: "ON", name: "Ontario" },
      { code: "BC", name: "British Columbia" },
      { code: "AB", name: "Alberta" },
      { code: "QC", name: "Quebec" },
      { code: "MB", name: "Manitoba" },
      { code: "SK", name: "Saskatchewan" },
      { code: "NS", name: "Nova Scotia" },
      { code: "NB", name: "New Brunswick" },
      { code: "NL", name: "Newfoundland and Labrador" },
      { code: "PE", name: "Prince Edward Island" },
      { code: "NT", name: "Northwest Territories" },
      { code: "NU", name: "Nunavut" },
      { code: "YT", name: "Yukon" },
    ],
    showFilingStatus: false,
    showTaxRegime: false,
    showPfMode: false,
    labels: {
      pageTitle: "Canada salary & payroll",
      framework: "Federal tax + CPP / EI",
      gross: "Gross salary",
      grossHint: "Annual cash pay before tax, CPP, and EI.",
      basic: "Base salary",
      basicHint: "Regular wages.",
      housing: "Housing / living allowance",
      housingHint: "Taxable cash allowance, if any.",
      other: "Other pay",
      otherHint: "Remaining cash so components add up to gross.",
      bonus: "Bonus / variable pay",
      bonusHint: "Included in taxable income in this estimate.",
      employeeExtra: "RRSP contribution",
      employeeExtraHint: "Percent of gross contributed to RRSP (pre-tax here).",
      employerExtra: "Employer RRSP / benefits",
      employerExtraHint: "Percent of gross paid by the employer on top of salary.",
      taxStatus: "Tax status",
      region: "Province / territory",
      applicableWage: "Pensionable / insurable pay",
    },
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    currencySymbol: "$",
    locale: "en-AU",
    note: "Uses 2025–26 resident PAYG brackets and a 2% Medicare levy. Employer Super Guarantee is modelled at 12% of ordinary-time earnings (gross excluding bonus).",
    defaultGross: 95_000,
    defaultBasicPercent: 85,
    defaultHousingPercent: 0,
    defaultBonusPercent: 5,
    defaultEmployeeExtraPercent: 0,
    defaultEmployerExtraPercent: 0,
    defaultRegion: "AU",
    defaultFilingStatus: "single",
    defaultTaxRegime: "new",
    defaultPfMode: "ceiling",
    regions: [],
    showFilingStatus: false,
    showTaxRegime: false,
    showPfMode: false,
    labels: {
      pageTitle: "Australia salary & PAYG",
      framework: "PAYG + Medicare levy + Super Guarantee",
      gross: "Gross salary",
      grossHint: "Annual cash pay before tax. Super is on top unless you salary-sacrifice.",
      basic: "Base salary",
      basicHint: "Ordinary-time earnings excluding bonus.",
      housing: "Housing / living allowance",
      housingHint: "Taxable allowance included in PAYG.",
      other: "Other allowances",
      otherHint: "Remaining cash so components add up to gross.",
      bonus: "Bonus / variable pay",
      bonusHint: "Taxed as income. Super in this model is calculated on pay excluding bonus.",
      employeeExtra: "Salary-sacrificed super",
      employeeExtraHint: "Percent of gross sacrificed into super (reduces taxable income).",
      employerExtra: "Extra employer super",
      employerExtraHint: "Additional employer super above the 12% guarantee, as a percent of OTE.",
      taxStatus: "Tax status",
      region: null,
      applicableWage: "Ordinary-time earnings",
    },
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    currency: "AED",
    currencySymbol: "د.إ",
    locale: "en-AE",
    note: "UAE has no federal personal income tax on salary. Optional pension or savings and health insurance are the usual deductions. End-of-service is not accrued here.",
    defaultGross: 240_000,
    defaultBasicPercent: 60,
    defaultHousingPercent: 25,
    defaultBonusPercent: 5,
    defaultEmployeeExtraPercent: 0,
    defaultEmployerExtraPercent: 0,
    defaultRegion: "AE",
    defaultFilingStatus: "single",
    defaultTaxRegime: "new",
    defaultPfMode: "ceiling",
    regions: [],
    showFilingStatus: false,
    showTaxRegime: false,
    showPfMode: false,
    labels: {
      pageTitle: "UAE salary",
      framework: "No personal income tax on salary",
      gross: "Gross salary",
      grossHint: "Annual cash package before optional deductions.",
      basic: "Basic salary",
      basicHint: "Used by many employers for overtime and end-of-service (not calculated here).",
      housing: "Housing allowance",
      housingHint: "Cash housing allowance.",
      other: "Other allowances",
      otherHint: "Transport, education, and other cash allowances.",
      bonus: "Bonus / variable pay",
      bonusHint: "Discretionary or contractual bonus.",
      employeeExtra: "Employee savings / pension",
      employeeExtraHint: "Optional deduction from pay (AED per year).",
      employerExtra: "Employer benefits",
      employerExtraHint: "Health insurance or other employer-paid benefits (AED per year).",
      taxStatus: "Tax status",
      region: null,
      applicableWage: "Basic salary",
    },
  },
];

export const FILING_STATUS_OPTIONS = FILING_STATUSES;

export function getSalaryCountry(code: SalaryCountryCode) {
  return SALARY_COUNTRIES.find((item) => item.code === code) ?? SALARY_COUNTRIES[0];
}
