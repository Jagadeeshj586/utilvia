import type { CountryCode, CurrencyCode, PayFrequency } from "@/lib/paycheck/types";

export type { CountryCode, CurrencyCode, PayFrequency };

export type EarningMode = "hours" | "amount";
export type StatutoryCategory = "tax" | "social" | "pension" | "insurance";
export type PayStubStep = "country" | "details" | "earnings" | "deductions" | "preview";

export type PayStubEarning = {
  id: string;
  label: string;
  mode: EarningMode;
  hours: number;
  rate: number;
  amount: number;
};

export type PayStubOtherDeduction = {
  id: string;
  label: string;
  amount: number;
};

export type StatutoryLine = {
  key: string;
  label: string;
  amount: number;
  estimated: boolean;
  category: StatutoryCategory;
};

export type PayStubRegion = { code: string; name: string };

export type PayStubCountryProfile = {
  code: CountryCode;
  name: string;
  flag: string;
  currency: CurrencyCode;
  locale: string;
  ruleNote: string;
  documentTitle: string;
  documentName: string;
  employerLabel: string;
  employeeIdLabel: string;
  jobTitleLabel: string;
  nationalIdLabel: string;
  nationalIdPrefix: string;
  departmentLabel: string;
  regionLabel: string | null;
  regions: PayStubRegion[];
  defaultRegion: string;
  defaultFrequency: PayFrequency;
  defaultRetirementPercent: number;
  retirementLabel: string;
  companyName: string;
  companyAddress: string;
  employeeName: string;
  employeeAddress: string;
  defaultEarnings: Array<Omit<PayStubEarning, "id">>;
  bonusLabel: string;
  allowanceLabel: string;
  hoursEarningLabel: string;
  otherDeductionLabel: string;
};

export type PayStubInput = {
  country: CountryCode;
  frequency: PayFrequency;
  regionCode: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  earnings: PayStubEarning[];
  retirementPercent: number;
  statutoryOverrides: Record<string, number | null>;
  otherDeductions: PayStubOtherDeduction[];
};

export type PayStubTotals = {
  country: CountryCode;
  currency: CurrencyCode;
  grossPay: number;
  statutory: StatutoryLine[];
  otherDeductionsTotal: number;
  totalDeductions: number;
  netPay: number;
  periodsPerYear: number;
  periodIndex: number;
  ytdGross: number;
  ytdDeductions: number;
  ytdNet: number;
  errors: string[];
};

export const PAY_STUB_STEPS: Array<{ id: PayStubStep; label: string }> = [
  { id: "country", label: "Country" },
  { id: "details", label: "Details" },
  { id: "earnings", label: "Earnings" },
  { id: "deductions", label: "Deductions" },
  { id: "preview", label: "Preview" },
];
