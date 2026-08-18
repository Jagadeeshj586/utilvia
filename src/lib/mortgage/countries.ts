export type MortgageCountryCode = "US" | "IN" | "GB" | "CA" | "AU" | "AE";
export type MortgageCurrencyCode = "USD" | "INR" | "GBP" | "CAD" | "AUD" | "AED";
export type ExtraPeriod = "annual" | "monthly" | "one-time";

export type ExtraField = {
  id: string;
  label: string;
  hint: string;
  period: ExtraPeriod;
  optional?: boolean;
};

export type MortgageLabels = {
  homePrice: string;
  downPayment: string;
  loanAmount: string;
  interestRate: string;
  term: string;
  extrasHeading: string;
};

export type MortgageCountry = {
  code: MortgageCountryCode;
  name: string;
  flag: string;
  currency: MortgageCurrencyCode;
  currencySymbol: string;
  locale: string;
  /** Payments per year. All current countries use monthly (12). */
  paymentsPerYear: number;
  labels: MortgageLabels;
  extras: ExtraField[];
  termPresets: number[];
  defaultHomePrice: number;
  defaultDownPercent: number;
  /** Illustrative planning rate — not a live market quote. */
  defaultRate: number;
  defaultTermYears: number;
  defaultExtras: Record<string, number>;
  note: string;
};

export const MORTGAGE_COUNTRIES: MortgageCountry[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    locale: "en-US",
    paymentsPerYear: 12,
    labels: {
      homePrice: "Home Price",
      downPayment: "Down Payment",
      loanAmount: "Loan Amount",
      interestRate: "Interest Rate",
      term: "Loan Term",
      extrasHeading: "Taxes & insurance",
    },
    extras: [
      { id: "propertyTax", label: "Property Tax", hint: "Annual", period: "annual" },
      { id: "homeInsurance", label: "Home Insurance", hint: "Annual", period: "annual" },
      { id: "hoa", label: "HOA Fees", hint: "Monthly · optional", period: "monthly", optional: true },
    ],
    termPresets: [15, 20, 30],
    defaultHomePrice: 400_000,
    defaultDownPercent: 20,
    defaultRate: 6.5,
    defaultTermYears: 30,
    defaultExtras: { propertyTax: 4_800, homeInsurance: 1_800, hoa: 0 },
    note: "Monthly USD mortgage with property tax, home insurance, and optional HOA. Rates are examples for planning, not live quotes.",
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    currencySymbol: "₹",
    locale: "en-IN",
    paymentsPerYear: 12,
    labels: {
      homePrice: "Property Value",
      downPayment: "Down Payment",
      loanAmount: "Loan Amount",
      interestRate: "Interest Rate",
      term: "Loan Tenure",
      extrasHeading: "Charges",
    },
    extras: [
      {
        id: "processing",
        label: "Processing / Additional Charges",
        hint: "One-time · optional",
        period: "one-time",
        optional: true,
      },
    ],
    termPresets: [10, 15, 20, 25],
    defaultHomePrice: 8_000_000,
    defaultDownPercent: 20,
    defaultRate: 8.5,
    defaultTermYears: 20,
    defaultExtras: { processing: 0 },
    note: "Monthly INR home-loan EMI. Processing charges are one-time and added to total amount paid. Rates are examples, not live quotes.",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    currencySymbol: "£",
    locale: "en-GB",
    paymentsPerYear: 12,
    labels: {
      homePrice: "Property Price",
      downPayment: "Deposit",
      loanAmount: "Mortgage Amount",
      interestRate: "Interest Rate",
      term: "Mortgage Term",
      extrasHeading: "Additional costs",
    },
    extras: [
      { id: "fees", label: "Arrangement / Other Fees", hint: "One-time · optional", period: "one-time", optional: true },
      { id: "serviceCharge", label: "Service Charge", hint: "Monthly · optional", period: "monthly", optional: true },
    ],
    termPresets: [15, 25, 30, 35],
    defaultHomePrice: 350_000,
    defaultDownPercent: 10,
    defaultRate: 4.5,
    defaultTermYears: 25,
    defaultExtras: { fees: 0, serviceCharge: 0 },
    note: "Monthly GBP mortgage. Optional fees and service charge can be added. Rates are examples for planning, not live quotes.",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    currencySymbol: "$",
    locale: "en-CA",
    paymentsPerYear: 12,
    labels: {
      homePrice: "Home Price",
      downPayment: "Down Payment",
      loanAmount: "Mortgage Amount",
      interestRate: "Interest Rate",
      term: "Amortization Period",
      extrasHeading: "Taxes & insurance",
    },
    extras: [
      { id: "propertyTax", label: "Property Tax", hint: "Annual", period: "annual" },
      { id: "homeInsurance", label: "Home Insurance", hint: "Annual", period: "annual" },
    ],
    termPresets: [15, 20, 25, 30],
    defaultHomePrice: 550_000,
    defaultDownPercent: 20,
    defaultRate: 5.5,
    defaultTermYears: 25,
    defaultExtras: { propertyTax: 4_400, homeInsurance: 1_500 },
    note: "Monthly CAD mortgage using amortization period for the payment. Property tax and insurance are annual. Rates are examples, not live quotes.",
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    currencySymbol: "$",
    locale: "en-AU",
    paymentsPerYear: 12,
    labels: {
      homePrice: "Property Price",
      downPayment: "Deposit",
      loanAmount: "Loan Amount",
      interestRate: "Interest Rate",
      term: "Loan Term",
      extrasHeading: "Additional costs",
    },
    extras: [
      { id: "stampDuty", label: "Stamp Duty / Other Fees", hint: "One-time · optional", period: "one-time", optional: true },
      { id: "strata", label: "Strata / Body Corporate", hint: "Monthly · optional", period: "monthly", optional: true },
    ],
    termPresets: [20, 25, 30],
    defaultHomePrice: 750_000,
    defaultDownPercent: 20,
    defaultRate: 6,
    defaultTermYears: 30,
    defaultExtras: { stampDuty: 0, strata: 0 },
    note: "Monthly AUD home loan. Optional stamp duty and strata can be included. Rates are examples for planning, not live quotes.",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    currency: "AED",
    currencySymbol: "د.إ",
    locale: "en-AE",
    paymentsPerYear: 12,
    labels: {
      homePrice: "Property Value",
      downPayment: "Down Payment",
      loanAmount: "Loan Amount",
      interestRate: "Interest Rate",
      term: "Loan Tenure",
      extrasHeading: "Fees",
    },
    extras: [
      { id: "dld", label: "DLD / Registration Fees", hint: "One-time · optional", period: "one-time", optional: true },
      { id: "service", label: "Service Charges", hint: "Monthly · optional", period: "monthly", optional: true },
    ],
    termPresets: [15, 20, 25],
    defaultHomePrice: 1_500_000,
    defaultDownPercent: 20,
    defaultRate: 5,
    defaultTermYears: 25,
    defaultExtras: { dld: 0, service: 0 },
    note: "Monthly AED home loan. Optional DLD/registration and service charges can be added. Rates are examples, not live quotes.",
  },
];

export function getMortgageCountry(code: MortgageCountryCode): MortgageCountry {
  return MORTGAGE_COUNTRIES.find((country) => country.code === code) ?? MORTGAGE_COUNTRIES[0];
}

export function extraValue(extras: Record<string, number>, id: string) {
  const value = extras[id];
  return Number.isFinite(value) ? value : 0;
}
