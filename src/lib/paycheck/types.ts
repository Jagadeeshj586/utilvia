export type CountryCode = "US" | "IN" | "GB" | "CA" | "AU" | "AE";
export type CurrencyCode = "USD" | "INR" | "GBP" | "CAD" | "AUD" | "AED";
export type SalaryMode = "annual" | "hourly";
export type PayFrequency = "weekly" | "biweekly" | "semi-monthly" | "monthly" | "annual";
export type FilingStatus = "single" | "married-joint" | "head-of-household";

export type TaxBracket = { upTo: number; rate: number };

export type RegionOption = { code: string; name: string; rate?: number };

export type PaycheckInput = {
  country: CountryCode;
  mode: SalaryMode;
  annualSalary: number;
  hourlyRate: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  frequency: PayFrequency;
  filingStatus: FilingStatus;
  stateCode: string;
  contribution401kPercent: number;
  healthInsuranceMonthly: number;
  hsaMonthly: number;
};

export type BreakdownLine = { label: string; amount: number };

export type PaycheckResult = {
  country: CountryCode;
  currency: CurrencyCode;
  flag: string;
  ruleNote: string;
  grossAnnual: number;
  pretaxAnnual: number;
  taxableIncome: number;
  incomeTax: number;
  incomeTaxLabel: string;
  regionalTax: number;
  regionalLabel: string;
  socialLines: BreakdownLine[];
  socialTotal: number;
  socialSummaryLabel: string;
  netAnnual: number;
  grossPerPeriod: number;
  netPerPeriod: number;
  periodsPerYear: number;
  frequencyLabel: string;
  marginalRate: number;
  taxableNote: string;
  lines: BreakdownLine[];
  summary: Array<{ label: string; amount: number }>;
  /** US-compat aliases used by existing tests */
  federalTax: number;
  federalTaxableIncome: number;
  marginalFederalRate: number;
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  fica: number;
  stateTax: number;
  stateLabel: string;
  standardDeduction: number;
};

export type CountryProfile = {
  code: CountryCode;
  name: string;
  flag: string;
  currency: CurrencyCode;
  currencySymbol: string;
  ruleNote: string;
  defaultAnnual: number;
  defaultHourly: number;
  defaultFrequency: PayFrequency;
  defaultRegion: string;
  defaultRetirement: number;
  regionLabel: string | null;
  regions: RegionOption[];
  showFilingStatus: boolean;
  retirementLabel: string;
  healthLabel: string;
  extraPretaxLabel: string | null;
};

export const PAY_FREQUENCIES: Array<{ value: PayFrequency; label: string; periods: number }> = [
  { value: "weekly", label: "Weekly", periods: 52 },
  { value: "biweekly", label: "Biweekly", periods: 26 },
  { value: "semi-monthly", label: "Semi-monthly", periods: 24 },
  { value: "monthly", label: "Monthly", periods: 12 },
  { value: "annual", label: "Annual", periods: 1 },
];

export const FILING_STATUSES: Array<{ value: FilingStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married-joint", label: "Married Filing Jointly" },
  { value: "head-of-household", label: "Head of Household" },
];
