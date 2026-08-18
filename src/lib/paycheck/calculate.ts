import type { CountryCode, CountryProfile, PaycheckInput, PaycheckResult } from "./types";
import { CA_PROVINCES, GB_NATIONS, IN_PT_STATES, calculateAustraliaPaycheck, calculateCanadaPaycheck, calculateIndiaPaycheck, calculateUaePaycheck, calculateUkPaycheck } from "./international";
import { STATE_TAX_RATES, calculateUsPaycheck } from "./us";

export type { CountryCode, CurrencyCode, FilingStatus, PayFrequency, PaycheckInput, PaycheckResult, SalaryMode } from "./types";
export { FILING_STATUSES, PAY_FREQUENCIES } from "./types";
export { formatMoney, frequencyLabel, periodsForFrequency, resolveGrossAnnual } from "./helpers";
export {
  FEDERAL_BRACKETS_2026,
  FICA_2026,
  STANDARD_DEDUCTION_2026,
  STATE_TAX_RATES,
  calculateFederalTax,
  calculateFica,
  calculateStateTax,
  getStateTaxInfo,
} from "./us";

export const PAYCHECK_COUNTRIES: CountryProfile[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    ruleNote: "Based on 2026 US Federal tax rules (IRS Rev. Proc. 2025-32)",
    defaultAnnual: 85_000,
    defaultHourly: 40.87,
    defaultFrequency: "biweekly",
    defaultRegion: "FL",
    defaultRetirement: 0,
    regionLabel: "State",
    regions: STATE_TAX_RATES,
    showFilingStatus: true,
    retirementLabel: "401(k) Contribution (%)",
    healthLabel: "Health Insurance ($/mo)",
    extraPretaxLabel: "HSA ($/mo)",
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    currencySymbol: "₹",
    ruleNote: "Based on India FY 2025-26 new tax regime (Budget 2025) plus EPF, ESI, and professional tax",
    defaultAnnual: 1_200_000,
    defaultHourly: 500,
    defaultFrequency: "monthly",
    defaultRegion: "KA",
    defaultRetirement: 12,
    regionLabel: "Professional tax state",
    regions: IN_PT_STATES,
    showFilingStatus: false,
    retirementLabel: "EPF (% of basic)",
    healthLabel: "Health Insurance (₹/mo)",
    extraPretaxLabel: "NPS (₹/mo)",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    currencySymbol: "£",
    ruleNote: "Based on UK 2025/26 PAYE and Class 1 National Insurance",
    defaultAnnual: 45_000,
    defaultHourly: 22,
    defaultFrequency: "monthly",
    defaultRegion: "ENG",
    defaultRetirement: 5,
    regionLabel: "Tax nation",
    regions: GB_NATIONS,
    showFilingStatus: false,
    retirementLabel: "Pension / salary sacrifice (%)",
    healthLabel: "Other deductions (£/mo)",
    extraPretaxLabel: null,
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    currencySymbol: "$",
    ruleNote: "Based on 2025 Canadian federal tax, CPP/EI, and a simplified provincial estimate",
    defaultAnnual: 85_000,
    defaultHourly: 40,
    defaultFrequency: "biweekly",
    defaultRegion: "ON",
    defaultRetirement: 0,
    regionLabel: "Province / territory",
    regions: CA_PROVINCES,
    showFilingStatus: false,
    retirementLabel: "RRSP Contribution (%)",
    healthLabel: "Benefits ($/mo)",
    extraPretaxLabel: null,
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    currencySymbol: "$",
    ruleNote: "Based on Australia 2025–26 resident PAYG brackets and 2% Medicare levy",
    defaultAnnual: 95_000,
    defaultHourly: 45,
    defaultFrequency: "monthly",
    defaultRegion: "AU",
    defaultRetirement: 0,
    regionLabel: null,
    regions: [],
    showFilingStatus: false,
    retirementLabel: "Salary-sacrificed super (%)",
    healthLabel: "Other deductions ($/mo)",
    extraPretaxLabel: null,
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    currency: "AED",
    currencySymbol: "AED",
    ruleNote: "UAE has no federal personal income tax on salary — net equals gross minus optional deductions",
    defaultAnnual: 240_000,
    defaultHourly: 100,
    defaultFrequency: "monthly",
    defaultRegion: "AE",
    defaultRetirement: 0,
    regionLabel: null,
    regions: [],
    showFilingStatus: false,
    retirementLabel: "Pension / savings (%)",
    healthLabel: "Health Insurance (AED/mo)",
    extraPretaxLabel: null,
  },
];

export function getCountry(code: CountryCode): CountryProfile {
  return PAYCHECK_COUNTRIES.find((country) => country.code === code) ?? PAYCHECK_COUNTRIES[0];
}

export const PAYCHECK_DEFAULTS: PaycheckInput = {
  country: "US",
  mode: "annual",
  annualSalary: 85_000,
  hourlyRate: 40.87,
  hoursPerWeek: 40,
  weeksPerYear: 52,
  frequency: "biweekly",
  filingStatus: "single",
  stateCode: "FL",
  contribution401kPercent: 0,
  healthInsuranceMonthly: 0,
  hsaMonthly: 0,
};

export const PAYCHECK_FAQS = [
  {
    question: "Does the calculator change when I pick another country?",
    answer:
      "Yes. Each country uses its own income-tax brackets, social contributions, and typical payroll deductions — for example US FICA, UK National Insurance, India EPF/ESI, and Canada CPP/EI.",
  },
  {
    question: "Why is my tax bracket different from my effective tax rate?",
    answer:
      "Your marginal bracket is the rate on your last dollar (or rupee/pound) of taxable income. Your effective rate is total tax divided by income, which is usually lower because earlier amounts are taxed in lower bands.",
  },
  {
    question: "Will a raise ever reduce my take-home pay?",
    answer:
      "Crossing into a higher bracket only raises the rate on income above that threshold — it does not re-tax your whole salary at the higher rate. Take-home should still increase with a raise.",
  },
  {
    question: "How accurate are state, province, or professional-tax amounts?",
    answer:
      "Regional tax is a simplified estimate for comparison. Real withholding depends on local brackets, credits, and forms — check official rules for precision. Estimates are not tax advice.",
  },
  {
    question: "Is paycheck calculator free?",
    answer: "Yes. The Utilvia Paycheck Calculator is free with no signup. Estimates run in your browser and are not tax advice.",
  },
] as const;

const ENGINES: Record<CountryCode, (input: PaycheckInput) => PaycheckResult> = {
  US: calculateUsPaycheck,
  IN: calculateIndiaPaycheck,
  GB: calculateUkPaycheck,
  CA: calculateCanadaPaycheck,
  AU: calculateAustraliaPaycheck,
  AE: calculateUaePaycheck,
};

export function calculatePaycheck(input: PaycheckInput): PaycheckResult | null {
  const grossAnnual = input.mode === "hourly"
    ? Math.max(0, input.hourlyRate) * Math.max(0, input.hoursPerWeek) * Math.max(0, input.weeksPerYear)
    : Math.max(0, input.annualSalary);
  if (!Number.isFinite(grossAnnual)) return null;
  const country = input.country ?? "US";
  return ENGINES[country]({ ...input, country });
}
