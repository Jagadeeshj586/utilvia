import { FILING_STATUSES, type CountryCode, type CurrencyCode, type RegionOption } from "@/lib/paycheck/types";
import { CA_PROVINCES, GB_NATIONS, IN_PT_STATES } from "@/lib/paycheck/international";
import { STATE_TAX_RATES } from "@/lib/paycheck/us";

export type SelfEmploymentCountryCode = CountryCode;

export type SelfEmploymentLabels = {
  pageTitle: string;
  income: string;
  incomeHint: string;
  expenses: string;
  expensesHint: string;
  otherDeductions: string;
  otherDeductionsHint: string;
  retirement: string;
  retirementHint: string;
  tax: string;
  social: string;
};

export type SelfEmploymentCountry = {
  code: SelfEmploymentCountryCode;
  name: string;
  flag: string;
  currency: CurrencyCode;
  currencySymbol: string;
  locale: string;
  labels: SelfEmploymentLabels;
  defaultGross: number;
  showFilingStatus: boolean;
  regionLabel: string | null;
  regions: RegionOption[];
  defaultRegion: string;
  note: string;
};

export const SELF_EMPLOYMENT_COUNTRIES: SelfEmploymentCountry[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    locale: "en-US",
    labels: {
      pageTitle: "Self-Employment Tax",
      income: "Annual self-employment income",
      incomeHint: "Gross receipts or Schedule C revenue before expenses.",
      expenses: "Business expenses",
      expensesHint: "Deductible costs that reduce net profit (Schedule C style).",
      otherDeductions: "Other deductions",
      otherDeductionsHint: "Extra above-the-line amounts after the deductible half of SE tax and QBI estimate.",
      retirement: "Retirement contribution",
      retirementHint: "SEP-IRA / Solo 401(k) / traditional IRA amount deducted from taxable income and take-home.",
      tax: "Federal income tax",
      social: "Self-employment tax",
    },
    defaultGross: 80_000,
    showFilingStatus: true,
    regionLabel: "State",
    regions: STATE_TAX_RATES,
    defaultRegion: "FL",
    note: "2026 US federal brackets, FICA-based self-employment tax on 92.35% of net profit, simplified state tax, and a 20% QBI estimate. Estimates only — not tax advice.",
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    currencySymbol: "₹",
    locale: "en-IN",
    labels: {
      pageTitle: "Self-Employed / Independent Professional Tax",
      income: "Annual gross receipts",
      incomeHint: "Professional or business receipts before expenses.",
      expenses: "Business / professional expenses",
      expensesHint: "Costs deducted from receipts. Salaried standard deduction is not applied.",
      otherDeductions: "Other deductions",
      otherDeductionsHint: "Optional extra deductions from taxable professional income.",
      retirement: "NPS / retirement contribution",
      retirementHint: "Amount set aside from receipts. Reduces taxable income in this estimate.",
      tax: "Income tax + cess",
      social: "Social contributions",
    },
    defaultGross: 1_200_000,
    showFilingStatus: false,
    regionLabel: "Professional tax state",
    regions: IN_PT_STATES,
    defaultRegion: "NONE",
    note: "India FY 2025-26 new regime on professional profits (receipts minus expenses), plus 4% cess. Optional professional tax by state. Estimates only — not tax advice.",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    currencySymbol: "£",
    locale: "en-GB",
    labels: {
      pageTitle: "Self-Employed Tax & National Insurance",
      income: "Annual turnover / profits",
      incomeHint: "Self-employed turnover before allowable expenses.",
      expenses: "Allowable expenses",
      expensesHint: "Costs that reduce taxable profits.",
      otherDeductions: "Other deductions",
      otherDeductionsHint: "Extra amounts deducted from taxable profits after expenses.",
      retirement: "Pension contribution",
      retirementHint: "Relief-at-source style amount deducted from taxable income and take-home.",
      tax: "Income tax",
      social: "National Insurance (Class 4)",
    },
    defaultGross: 45_000,
    showFilingStatus: false,
    regionLabel: "Tax nation",
    regions: GB_NATIONS,
    defaultRegion: "ENG",
    note: "UK 2025/26 self-employed estimate: income tax (or Scottish bands) and Class 4 NI. Class 2 NI is not charged in this estimate. Estimates only — not tax advice.",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    currencySymbol: "$",
    locale: "en-CA",
    labels: {
      pageTitle: "Self-Employed Tax & CPP",
      income: "Annual self-employment income",
      incomeHint: "Gross business or professional income before expenses.",
      expenses: "Business expenses",
      expensesHint: "Deductible costs that reduce net self-employment income.",
      otherDeductions: "Other deductions",
      otherDeductionsHint: "Extra amounts deducted from taxable income.",
      retirement: "RRSP contribution",
      retirementHint: "Deducted from taxable income and take-home in this estimate.",
      tax: "Federal income tax",
      social: "CPP (self-employed)",
    },
    defaultGross: 85_000,
    showFilingStatus: false,
    regionLabel: "Province / territory",
    regions: CA_PROVINCES,
    defaultRegion: "ON",
    note: "2025 Canadian federal tax, simplified provincial tax, and both CPP portions. EI is omitted unless you opt in. Estimates only — not tax advice.",
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    currencySymbol: "$",
    locale: "en-AU",
    labels: {
      pageTitle: "Sole Trader Tax & Medicare",
      income: "Annual business income",
      incomeHint: "Sole-trader or contractor income before expenses.",
      expenses: "Business expenses",
      expensesHint: "Deductible costs that reduce taxable income.",
      otherDeductions: "Other deductions",
      otherDeductionsHint: "Extra deductible amounts after expenses.",
      retirement: "Super contribution",
      retirementHint: "Deductible super amount set aside from profits.",
      tax: "Income tax (PAYG)",
      social: "Medicare levy",
    },
    defaultGross: 95_000,
    showFilingStatus: false,
    regionLabel: null,
    regions: [],
    defaultRegion: "AU",
    note: "Australia 2025–26 resident sole-trader estimate with PAYG brackets and a 2% Medicare levy. GST is not included. Estimates only — not tax advice.",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    currency: "AED",
    currencySymbol: "د.إ",
    locale: "en-AE",
    labels: {
      pageTitle: "Freelancer / Self-Employed Tax",
      income: "Annual self-employment income",
      incomeHint: "Freelance or business receipts before expenses.",
      expenses: "Business expenses",
      expensesHint: "Costs that reduce net profit.",
      otherDeductions: "Other deductions",
      otherDeductionsHint: "Extra amounts treated as reducing taxable profit in this estimate.",
      retirement: "Pension / savings",
      retirementHint: "Optional amount set aside from take-home.",
      tax: "Corporate tax (est.)",
      social: "Social contributions",
    },
    defaultGross: 240_000,
    showFilingStatus: false,
    regionLabel: null,
    regions: [],
    defaultRegion: "AE",
    note: "UAE has no federal personal income tax on salary. This estimate applies simplified corporate tax of 0% up to AED 375,000 of profit and 9% above. Small-business relief may reduce tax to 0%. Estimates only — not tax advice.",
  },
];

export const SELF_EMPLOYMENT_FILING_STATUSES = FILING_STATUSES;

export function getSelfEmploymentCountry(code: SelfEmploymentCountryCode): SelfEmploymentCountry {
  return SELF_EMPLOYMENT_COUNTRIES.find((country) => country.code === code) ?? SELF_EMPLOYMENT_COUNTRIES[0];
}
