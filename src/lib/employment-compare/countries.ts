import type { CountryCode, CurrencyCode, RegionOption } from "@/lib/paycheck/types";
import { CA_PROVINCES, GB_NATIONS, IN_PT_STATES } from "@/lib/paycheck/international";
import { STATE_TAX_RATES } from "@/lib/paycheck/us";
import { FILING_STATUSES } from "@/lib/paycheck/types";

export type EmploymentCountryCode = CountryCode;

export type EmploymentLabels = {
  pageTitle: string;
  employee: string;
  contractor: string;
  income: string;
  expenses: string;
  expensesHint: string;
  benefits: string;
  benefitsHint: string;
  retirement: string;
  retirementHint: string;
  socialEmployee: string;
  socialContractor: string;
  employerCost: string;
};

export type EmploymentCountry = {
  code: EmploymentCountryCode;
  name: string;
  flag: string;
  currency: CurrencyCode;
  currencySymbol: string;
  locale: string;
  labels: EmploymentLabels;
  defaultGross: number;
  defaultRetirementPercent: number;
  showFilingStatus: boolean;
  regionLabel: string | null;
  regions: RegionOption[];
  defaultRegion: string;
  note: string;
};

export const EMPLOYMENT_COUNTRIES: EmploymentCountry[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    locale: "en-US",
    labels: {
      pageTitle: "W-2 Employee vs 1099 Contractor",
      employee: "W-2 Employee",
      contractor: "1099 Contractor",
      income: "Annual Gross Income",
      expenses: "Work-related expenses",
      expensesHint: "Deductible on the 1099 side only (Schedule C style).",
      benefits: "Pre-tax benefits",
      benefitsHint: "Health / HSA-style benefits. Pretax for W-2; after-tax for 1099 unless included in expenses.",
      retirement: "Retirement contribution",
      retirementHint: "401(k) / IRA style pretax percent of gross.",
      socialEmployee: "FICA (employee)",
      socialContractor: "Self-employment tax",
      employerCost: "Employer FICA match",
    },
    defaultGross: 90_000,
    defaultRetirementPercent: 0,
    showFilingStatus: true,
    regionLabel: "State",
    regions: STATE_TAX_RATES,
    defaultRegion: "FL",
    note: "2026 US federal brackets, FICA, and simplified state tax. Self-employment tax uses 92.35% of net profit. Estimates only — not tax advice.",
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    currencySymbol: "₹",
    locale: "en-IN",
    labels: {
      pageTitle: "Salaried Employee vs Self-Employed / Independent Professional",
      employee: "Salaried Employee",
      contractor: "Self-Employed / Independent Professional",
      income: "Annual Gross Income / Receipts",
      expenses: "Business expenses",
      expensesHint: "Deducted from professional receipts. Salaried standard deduction still applies on the employee side.",
      benefits: "Allowances / other pretax",
      benefitsHint: "Optional annual amount treated as pretax for salary; ignored for professionals unless in expenses.",
      retirement: "EPF / NPS contribution",
      retirementHint: "Employee: % of basic (50% of CTC) to EPF. Professional: optional NPS-style % of receipts.",
      socialEmployee: "EPF / ESI",
      socialContractor: "Social contributions",
      employerCost: "Employer EPF",
    },
    defaultGross: 1_200_000,
    defaultRetirementPercent: 12,
    showFilingStatus: false,
    regionLabel: "Professional tax state",
    regions: IN_PT_STATES,
    defaultRegion: "KA",
    note: "India FY 2025-26 new regime with 4% cess. Salaried estimate includes EPF, ESI, and professional tax. Self-employed is taxed on receipts minus expenses. Estimates only — not tax advice.",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    currencySymbol: "£",
    locale: "en-GB",
    labels: {
      pageTitle: "Employee vs Self-Employed",
      employee: "Employee",
      contractor: "Self-Employed",
      income: "Annual Gross Income / Profits",
      expenses: "Allowable expenses",
      expensesHint: "Deducted from self-employed profits only.",
      benefits: "Salary-sacrifice / benefits",
      benefitsHint: "Pretax for employees. Self-employed use expenses instead.",
      retirement: "Pension contribution",
      retirementHint: "Percent of gross. Salary sacrifice / relief at source style estimate.",
      socialEmployee: "National Insurance (Class 1)",
      socialContractor: "National Insurance (Class 4)",
      employerCost: "Employer NI (Class 1)",
    },
    defaultGross: 45_000,
    defaultRetirementPercent: 5,
    showFilingStatus: false,
    regionLabel: "Tax nation",
    regions: GB_NATIONS,
    defaultRegion: "ENG",
    note: "UK 2025/26 PAYE or Scottish bands, Class 1 NI for employees, Class 4 NI for self-employed. Employer NI is a business cost, not taken from take-home. Estimates only — not tax advice.",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    currencySymbol: "$",
    locale: "en-CA",
    labels: {
      pageTitle: "Employee vs Self-Employed / Contractor",
      employee: "Employee",
      contractor: "Self-Employed / Contractor",
      income: "Annual Gross Income",
      expenses: "Business expenses",
      expensesHint: "Deducted from self-employed income only.",
      benefits: "Benefits / other pretax",
      benefitsHint: "Pretax for employees. Contractors typically pay benefits after tax.",
      retirement: "RRSP contribution",
      retirementHint: "Percent of gross, deducted for both sides in this estimate.",
      socialEmployee: "CPP / EI (employee)",
      socialContractor: "CPP (self-employed)",
      employerCost: "Employer CPP / EI",
    },
    defaultGross: 85_000,
    defaultRetirementPercent: 0,
    showFilingStatus: false,
    regionLabel: "Province / territory",
    regions: CA_PROVINCES,
    defaultRegion: "ON",
    note: "2025 Canadian federal tax, simplified provincial tax, CPP/EI. Self-employed pay both CPP portions and typically no EI. Estimates only — not tax advice.",
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    currencySymbol: "$",
    locale: "en-AU",
    labels: {
      pageTitle: "Employee vs Sole Trader / Contractor",
      employee: "Employee",
      contractor: "Sole Trader / Contractor",
      income: "Annual Gross Income",
      expenses: "Business expenses",
      expensesHint: "Deducted from sole-trader taxable income only.",
      benefits: "Salary-sacrificed extras",
      benefitsHint: "Pretax for employees. Sole traders use expenses.",
      retirement: "Super contribution",
      retirementHint: "Employee: salary-sacrificed super %. Employer SG is shown as a business cost. Sole trader: deductible super % of income.",
      socialEmployee: "Medicare levy",
      socialContractor: "Medicare levy",
      employerCost: "Employer super (SG)",
    },
    defaultGross: 95_000,
    defaultRetirementPercent: 0,
    showFilingStatus: false,
    regionLabel: null,
    regions: [],
    defaultRegion: "AU",
    note: "Australia 2025–26 resident PAYG brackets and 2% Medicare levy. Employer Super Guarantee (11.5%) is a business cost on top of salary. Estimates only — not tax advice.",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    currency: "AED",
    currencySymbol: "د.إ",
    locale: "en-AE",
    labels: {
      pageTitle: "Employee vs Self-Employed / Freelancer",
      employee: "Employee",
      contractor: "Self-Employed / Freelancer",
      income: "Annual Gross Income",
      expenses: "Business expenses",
      expensesHint: "Reduce freelancer net income. UAE has no personal income tax on salary in this estimate.",
      benefits: "Benefits / allowances",
      benefitsHint: "Optional deductions from take-home for both sides.",
      retirement: "Pension / savings",
      retirementHint: "Optional percent of gross set aside from take-home.",
      socialEmployee: "Social contributions",
      socialContractor: "Social contributions",
      employerCost: "Employer costs",
    },
    defaultGross: 240_000,
    defaultRetirementPercent: 0,
    showFilingStatus: false,
    regionLabel: null,
    regions: [],
    defaultRegion: "AE",
    note: "UAE has no federal personal income tax on salary in this estimate. Compare take-home after optional savings, benefits, and freelancer expenses. Estimates only — not tax advice.",
  },
];

export const EMPLOYMENT_FILING_STATUSES = FILING_STATUSES;

export function getEmploymentCountry(code: EmploymentCountryCode): EmploymentCountry {
  return EMPLOYMENT_COUNTRIES.find((country) => country.code === code) ?? EMPLOYMENT_COUNTRIES[0];
}
