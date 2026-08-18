export type LoanCountryCode = "US" | "IN" | "GB" | "CA" | "AU" | "AE";
export type LoanCurrencyCode = "USD" | "INR" | "GBP" | "CAD" | "AUD" | "AED";
export type LoanTypeId = "personal" | "home" | "auto";
export type IncomePeriod = "monthly" | "annual";
export type EligibilityStatus = "eligible" | "maybe" | "not";

export type EmploymentOption = {
  id: string;
  label: string;
  incomeFactor: number;
  hint: string;
};

export type CreditBand = {
  upTo: number;
  label: string;
  rateAddon: number;
  status: EligibilityStatus;
};

export type CreditRules = {
  label: string;
  hint: string;
  min: number;
  max: number;
  defaultScore: number;
  bands: CreditBand[];
};

export type LoanTypeRules = {
  id: LoanTypeId;
  label: string;
  termPresets: number[];
  minTermYears: number;
  maxTermYears: number;
  defaultTermYears: number;
  defaultRate: number;
  defaultRequested: number;
  showDownPayment: boolean;
  defaultDownPercent: number;
  eligibleLtv: number;
  maybeLtv: number;
  /** Added to the quoted rate when sizing the maximum loan (stress / assessment rate). */
  qualifyingRateAddon: number;
  qualifyingRateFloor: number;
};

export type ExtraFlags = {
  age?: boolean;
  employmentMonths?: boolean;
  salaryTransfer?: boolean;
  residency?: boolean;
};

export type LoanLabels = {
  pageTitle: string;
  income: string;
  incomeHint: string;
  existingDebt: string;
  existingDebtHint: string;
  requested: string;
  requestedHint: string;
  term: string;
  rate: string;
  employment: string;
  downPayment: string;
  downPaymentHint: string;
  ratio: string;
  ratioHint: string;
  age?: string;
  ageHint?: string;
  employmentMonths?: string;
  employmentMonthsHint?: string;
  salaryTransfer?: string;
  salaryTransferHint?: string;
  residency?: string;
};

export type LoanCountry = {
  code: LoanCountryCode;
  name: string;
  flag: string;
  currency: LoanCurrencyCode;
  currencySymbol: string;
  locale: string;
  note: string;
  defaultIncome: number;
  defaultIncomePeriod: IncomePeriod;
  defaultExistingDebt: number;
  defaultLoanType: LoanTypeId;
  /** Share of assessable monthly income allowed for all debts (eligible). */
  eligibleRatio: number;
  /** Upper planning band — above this is typically declined. */
  maybeRatio: number;
  minMonthlyIncome: number;
  employmentTypes: EmploymentOption[];
  credit: CreditRules | null;
  loanTypes: LoanTypeRules[];
  extras: ExtraFlags;
  labels: LoanLabels;
  minAge?: number;
  maxAge?: number;
  minEmploymentMonths?: number;
  /** When salary is not transferred, use this ratio cap instead of eligibleRatio. */
  noSalaryTransferRatio?: number;
  /** UAE mortgages: non-residents need a larger down payment. */
  nonResidentMaxLtv?: number;
};

export const LOAN_COUNTRIES: LoanCountry[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    locale: "en-US",
    note: "Uses a simplified back-end debt-to-income (DTI) test similar to qualified-mortgage guidelines (about 36% / 43%). Rates and scores are examples for planning, not a lender quote.",
    defaultIncome: 85_000,
    defaultIncomePeriod: "annual",
    defaultExistingDebt: 450,
    defaultLoanType: "personal",
    eligibleRatio: 0.36,
    maybeRatio: 0.43,
    minMonthlyIncome: 1_500,
    employmentTypes: [
      { id: "w2", label: "W-2 employee", incomeFactor: 1, hint: "Full salary is typically counted." },
      { id: "self", label: "Self-employed", incomeFactor: 0.8, hint: "Lenders often use about 80% of reported income." },
      { id: "contract", label: "1099 / contract", incomeFactor: 0.85, hint: "Variable income is often haircut." },
    ],
    credit: {
      label: "FICO score",
      hint: "300–850. Around 670+ is often treated as fair-to-good for unsecured credit.",
      min: 300,
      max: 850,
      defaultScore: 720,
      bands: [
        { upTo: 579, label: "Poor", rateAddon: 3, status: "not" },
        { upTo: 669, label: "Fair", rateAddon: 1.5, status: "maybe" },
        { upTo: 739, label: "Good", rateAddon: 0.5, status: "eligible" },
        { upTo: 850, label: "Excellent", rateAddon: 0, status: "eligible" },
      ],
    },
    loanTypes: [
      { id: "personal", label: "Personal loan", termPresets: [3, 5, 7], minTermYears: 1, maxTermYears: 7, defaultTermYears: 5, defaultRate: 11, defaultRequested: 20_000, showDownPayment: false, defaultDownPercent: 0, eligibleLtv: 100, maybeLtv: 100, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
      { id: "home", label: "Mortgage", termPresets: [15, 20, 30], minTermYears: 5, maxTermYears: 30, defaultTermYears: 30, defaultRate: 6.5, defaultRequested: 320_000, showDownPayment: true, defaultDownPercent: 20, eligibleLtv: 80, maybeLtv: 97, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
      { id: "auto", label: "Auto loan", termPresets: [3, 5, 6], minTermYears: 1, maxTermYears: 7, defaultTermYears: 5, defaultRate: 7.5, defaultRequested: 28_000, showDownPayment: true, defaultDownPercent: 10, eligibleLtv: 90, maybeLtv: 110, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
    ],
    extras: {},
    labels: {
      pageTitle: "US loan eligibility",
      income: "Gross income",
      incomeHint: "Pre-tax household income used for DTI. Switch monthly or annual.",
      existingDebt: "Existing monthly debt",
      existingDebtHint: "Minimums on cards, auto, student loans, and other installment payments.",
      requested: "Loan amount requested",
      requestedHint: "The amount you want to borrow, not including any down payment.",
      term: "Loan term",
      rate: "Interest rate",
      employment: "Employment type",
      downPayment: "Down payment",
      downPaymentHint: "Cash toward the purchase. Loan-to-value is loan ÷ (loan + down payment).",
      ratio: "Debt-to-income (DTI)",
      ratioHint: "Existing monthly debt plus the new payment, divided by gross monthly income. Many US lenders prefer about 36%, with 43% as a common ceiling.",
    },
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    currencySymbol: "₹",
    locale: "en-IN",
    note: "Uses a simplified FOIR (fixed obligation to income) cap of about 50%, stretching to 60% for planning. CIBIL bands and age limits are illustrative — not a bank sanction.",
    defaultIncome: 80_000,
    defaultIncomePeriod: "monthly",
    defaultExistingDebt: 8_000,
    defaultLoanType: "personal",
    eligibleRatio: 0.5,
    maybeRatio: 0.6,
    minMonthlyIncome: 15_000,
    minAge: 21,
    maxAge: 65,
    employmentTypes: [
      { id: "salaried", label: "Salaried", incomeFactor: 1, hint: "Net monthly salary after statutory deductions is typical." },
      { id: "self", label: "Self-employed", incomeFactor: 0.8, hint: "Banks often average the last two years of ITR income." },
    ],
    credit: {
      label: "CIBIL score",
      hint: "300–900. 750+ is generally treated as strong.",
      min: 300,
      max: 900,
      defaultScore: 760,
      bands: [
        { upTo: 649, label: "Poor", rateAddon: 3, status: "not" },
        { upTo: 749, label: "Average", rateAddon: 1, status: "maybe" },
        { upTo: 799, label: "Good", rateAddon: 0.25, status: "eligible" },
        { upTo: 900, label: "Excellent", rateAddon: 0, status: "eligible" },
      ],
    },
    loanTypes: [
      { id: "personal", label: "Personal loan", termPresets: [2, 3, 5], minTermYears: 1, maxTermYears: 6, defaultTermYears: 4, defaultRate: 14, defaultRequested: 500_000, showDownPayment: false, defaultDownPercent: 0, eligibleLtv: 100, maybeLtv: 100, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
      { id: "home", label: "Home loan", termPresets: [10, 15, 20, 25], minTermYears: 5, maxTermYears: 30, defaultTermYears: 20, defaultRate: 8.5, defaultRequested: 5_000_000, showDownPayment: true, defaultDownPercent: 20, eligibleLtv: 80, maybeLtv: 90, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
      { id: "auto", label: "Vehicle loan", termPresets: [3, 5, 7], minTermYears: 1, maxTermYears: 7, defaultTermYears: 5, defaultRate: 10, defaultRequested: 800_000, showDownPayment: true, defaultDownPercent: 15, eligibleLtv: 85, maybeLtv: 95, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
    ],
    extras: { age: true },
    labels: {
      pageTitle: "India loan eligibility",
      income: "Net income",
      incomeHint: "Take-home pay used for FOIR. Monthly is the usual input in India.",
      existingDebt: "Existing EMIs",
      existingDebtHint: "Current monthly EMIs on other loans and credit cards.",
      requested: "Loan amount requested",
      requestedHint: "The principal you want sanctioned.",
      term: "Tenure",
      rate: "Interest rate",
      employment: "Employment type",
      downPayment: "Down payment",
      downPaymentHint: "Margin money. LTV is loan ÷ (loan + down payment).",
      ratio: "FOIR",
      ratioHint: "Fixed obligation to income: existing EMIs plus the new EMI, divided by net monthly income. Many banks stay near 50%.",
      age: "Age",
      ageHint: "Most lenders prefer borrowers between 21 and 65 at loan maturity.",
    },
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    currencySymbol: "£",
    locale: "en-GB",
    note: "Mortgages are sized with a 3% affordability buffer on the rate plus a ~40% commitment ratio. Personal loans skip the buffer. Figures are estimates, not a Decision in Principle.",
    defaultIncome: 45_000,
    defaultIncomePeriod: "annual",
    defaultExistingDebt: 250,
    defaultLoanType: "personal",
    eligibleRatio: 0.4,
    maybeRatio: 0.45,
    minMonthlyIncome: 1_250,
    employmentTypes: [
      { id: "employed", label: "Employed", incomeFactor: 1, hint: "PAYE salary is usually counted in full." },
      { id: "self", label: "Self-employed", incomeFactor: 0.8, hint: "Lenders often average the last two years of accounts." },
      { id: "contractor", label: "Contractor", incomeFactor: 0.85, hint: "Day-rate income may be annualised with a haircut." },
    ],
    credit: {
      label: "Experian score",
      hint: "0–999. 721+ is often described as good.",
      min: 0,
      max: 999,
      defaultScore: 760,
      bands: [
        { upTo: 560, label: "Poor", rateAddon: 3, status: "not" },
        { upTo: 720, label: "Fair", rateAddon: 1.25, status: "maybe" },
        { upTo: 880, label: "Good", rateAddon: 0.4, status: "eligible" },
        { upTo: 999, label: "Excellent", rateAddon: 0, status: "eligible" },
      ],
    },
    loanTypes: [
      { id: "personal", label: "Personal loan", termPresets: [2, 3, 5], minTermYears: 1, maxTermYears: 7, defaultTermYears: 4, defaultRate: 8.5, defaultRequested: 10_000, showDownPayment: false, defaultDownPercent: 0, eligibleLtv: 100, maybeLtv: 100, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
      { id: "home", label: "Mortgage", termPresets: [15, 25, 35], minTermYears: 5, maxTermYears: 40, defaultTermYears: 25, defaultRate: 4.5, defaultRequested: 250_000, showDownPayment: true, defaultDownPercent: 10, eligibleLtv: 90, maybeLtv: 95, qualifyingRateAddon: 3, qualifyingRateFloor: 0 },
      { id: "auto", label: "Car finance", termPresets: [3, 4, 5], minTermYears: 1, maxTermYears: 7, defaultTermYears: 4, defaultRate: 7.9, defaultRequested: 15_000, showDownPayment: true, defaultDownPercent: 10, eligibleLtv: 90, maybeLtv: 100, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
    ],
    extras: {},
    labels: {
      pageTitle: "UK loan eligibility",
      income: "Gross income",
      incomeHint: "Annual salary before tax is the usual starting point for affordability.",
      existingDebt: "Existing monthly commitments",
      existingDebtHint: "Loans, cards, and other contractual monthly payments.",
      requested: "Amount requested",
      requestedHint: "The borrowing you want, excluding any deposit.",
      term: "Term",
      rate: "Interest rate",
      employment: "Employment type",
      downPayment: "Deposit",
      downPaymentHint: "Cash toward the purchase. A larger deposit usually improves eligibility.",
      ratio: "Affordability ratio",
      ratioHint: "Monthly commitments plus the new payment, as a share of monthly income. Mortgages are also tested at rate + 3%.",
    },
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    currencySymbol: "$",
    locale: "en-CA",
    note: "Mortgages use the federal stress test: the greater of contract rate + 2% or 5.25%. Total debt service (TDS) is modelled at 39% / 44%. Not a lender pre-approval.",
    defaultIncome: 90_000,
    defaultIncomePeriod: "annual",
    defaultExistingDebt: 400,
    defaultLoanType: "personal",
    eligibleRatio: 0.39,
    maybeRatio: 0.44,
    minMonthlyIncome: 1_800,
    employmentTypes: [
      { id: "employed", label: "Employed", incomeFactor: 1, hint: "Salary and stable overtime are typically counted." },
      { id: "self", label: "Self-employed", incomeFactor: 0.8, hint: "Lenders often average two years of net business income." },
    ],
    credit: {
      label: "Credit score",
      hint: "300–900. Around 660+ is a common uninsured-mortgage threshold.",
      min: 300,
      max: 900,
      defaultScore: 720,
      bands: [
        { upTo: 599, label: "Poor", rateAddon: 3, status: "not" },
        { upTo: 659, label: "Fair", rateAddon: 1.25, status: "maybe" },
        { upTo: 724, label: "Good", rateAddon: 0.4, status: "eligible" },
        { upTo: 900, label: "Excellent", rateAddon: 0, status: "eligible" },
      ],
    },
    loanTypes: [
      { id: "personal", label: "Personal loan", termPresets: [3, 4, 5], minTermYears: 1, maxTermYears: 7, defaultTermYears: 5, defaultRate: 9.5, defaultRequested: 20_000, showDownPayment: false, defaultDownPercent: 0, eligibleLtv: 100, maybeLtv: 100, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
      { id: "home", label: "Mortgage", termPresets: [15, 25, 30], minTermYears: 5, maxTermYears: 30, defaultTermYears: 25, defaultRate: 5.2, defaultRequested: 400_000, showDownPayment: true, defaultDownPercent: 20, eligibleLtv: 80, maybeLtv: 95, qualifyingRateAddon: 2, qualifyingRateFloor: 5.25 },
      { id: "auto", label: "Auto loan", termPresets: [3, 5, 7], minTermYears: 1, maxTermYears: 8, defaultTermYears: 5, defaultRate: 6.5, defaultRequested: 30_000, showDownPayment: true, defaultDownPercent: 10, eligibleLtv: 90, maybeLtv: 100, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
    ],
    extras: {},
    labels: {
      pageTitle: "Canada loan eligibility",
      income: "Gross income",
      incomeHint: "Household income before tax, used for total debt service.",
      existingDebt: "Existing monthly debt",
      existingDebtHint: "Loans, cards, and other contractual payments (TDS includes the new housing payment).",
      requested: "Loan amount requested",
      requestedHint: "The principal you want to borrow.",
      term: "Amortization",
      rate: "Contract interest rate",
      employment: "Employment type",
      downPayment: "Down payment",
      downPaymentHint: "20% typically avoids mortgage default insurance. Minimums can be as low as 5% on eligible homes.",
      ratio: "Total debt service (TDS)",
      ratioHint: "All monthly debts plus the new payment, divided by gross monthly income. Guidelines are often 39% / 44%. Mortgages qualify at a stress rate.",
    },
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    currencySymbol: "$",
    locale: "en-AU",
    note: "Home loans are assessed with a 3% serviceability buffer on the rate. The commitment ratio is a simplified stand-in for HEM living-expense tests — not an APRA-compliant assessment.",
    defaultIncome: 95_000,
    defaultIncomePeriod: "annual",
    defaultExistingDebt: 350,
    defaultLoanType: "personal",
    eligibleRatio: 0.3,
    maybeRatio: 0.4,
    minMonthlyIncome: 2_000,
    employmentTypes: [
      { id: "payg", label: "PAYG", incomeFactor: 1, hint: "Permanent PAYG income is usually counted in full." },
      { id: "self", label: "Self-employed", incomeFactor: 0.8, hint: "Lenders often average two years of tax returns." },
    ],
    credit: {
      label: "Equifax score",
      hint: "0–1,200. Around 700+ is generally considered good.",
      min: 0,
      max: 1200,
      defaultScore: 750,
      bands: [
        { upTo: 459, label: "Below average", rateAddon: 3, status: "not" },
        { upTo: 659, label: "Average", rateAddon: 1.5, status: "maybe" },
        { upTo: 734, label: "Good", rateAddon: 0.5, status: "eligible" },
        { upTo: 1200, label: "Excellent", rateAddon: 0, status: "eligible" },
      ],
    },
    loanTypes: [
      { id: "personal", label: "Personal loan", termPresets: [3, 5, 7], minTermYears: 1, maxTermYears: 7, defaultTermYears: 5, defaultRate: 9.5, defaultRequested: 20_000, showDownPayment: false, defaultDownPercent: 0, eligibleLtv: 100, maybeLtv: 100, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
      { id: "home", label: "Home loan", termPresets: [20, 25, 30], minTermYears: 10, maxTermYears: 30, defaultTermYears: 30, defaultRate: 6, defaultRequested: 500_000, showDownPayment: true, defaultDownPercent: 20, eligibleLtv: 80, maybeLtv: 95, qualifyingRateAddon: 3, qualifyingRateFloor: 0 },
      { id: "auto", label: "Car loan", termPresets: [3, 5, 7], minTermYears: 1, maxTermYears: 7, defaultTermYears: 5, defaultRate: 7.5, defaultRequested: 35_000, showDownPayment: true, defaultDownPercent: 10, eligibleLtv: 90, maybeLtv: 100, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
    ],
    extras: {},
    labels: {
      pageTitle: "Australia loan eligibility",
      income: "Gross income",
      incomeHint: "Annual income before tax. Serviceability uses a buffered rate on home loans.",
      existingDebt: "Existing monthly repayments",
      existingDebtHint: "Other loans, cards, and buy-now-pay-later that a lender would count.",
      requested: "Loan amount requested",
      requestedHint: "The amount you want to borrow.",
      term: "Loan term",
      rate: "Interest rate",
      employment: "Employment type",
      downPayment: "Deposit",
      downPaymentHint: "A 20% deposit typically avoids Lenders Mortgage Insurance.",
      ratio: "Serviceability ratio",
      ratioHint: "Monthly debts plus the new repayment as a share of income. Home loans are also tested at rate + 3%.",
    },
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    currency: "AED",
    currencySymbol: "د.إ",
    locale: "en-AE",
    note: "Uses the UAE Central Bank debt-burden ratio (DBR) of 50%. Without salary transfer the cap is tightened to 40% here. Mortgage LTV is 80% for residents and 75% for non-residents in this model.",
    defaultIncome: 18_000,
    defaultIncomePeriod: "monthly",
    defaultExistingDebt: 2_000,
    defaultLoanType: "personal",
    eligibleRatio: 0.5,
    maybeRatio: 0.5,
    noSalaryTransferRatio: 0.4,
    nonResidentMaxLtv: 75,
    minMonthlyIncome: 5_000,
    minEmploymentMonths: 6,
    employmentTypes: [
      { id: "salaried", label: "Salaried", incomeFactor: 1, hint: "Salary-transfer customers are typically easier to underwrite." },
      { id: "self", label: "Self-employed", incomeFactor: 0.75, hint: "Trade-licence income is often averaged and haircut." },
    ],
    credit: {
      label: "AECB score",
      hint: "300–900. Around 680+ is often treated as acceptable.",
      min: 300,
      max: 900,
      defaultScore: 720,
      bands: [
        { upTo: 579, label: "Poor", rateAddon: 3, status: "not" },
        { upTo: 679, label: "Fair", rateAddon: 1.5, status: "maybe" },
        { upTo: 739, label: "Good", rateAddon: 0.5, status: "eligible" },
        { upTo: 900, label: "Excellent", rateAddon: 0, status: "eligible" },
      ],
    },
    loanTypes: [
      { id: "personal", label: "Personal loan", termPresets: [2, 3, 4], minTermYears: 1, maxTermYears: 4, defaultTermYears: 3, defaultRate: 9, defaultRequested: 50_000, showDownPayment: false, defaultDownPercent: 0, eligibleLtv: 100, maybeLtv: 100, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
      { id: "home", label: "Mortgage", termPresets: [15, 20, 25], minTermYears: 5, maxTermYears: 25, defaultTermYears: 20, defaultRate: 5.25, defaultRequested: 1_200_000, showDownPayment: true, defaultDownPercent: 20, eligibleLtv: 80, maybeLtv: 80, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
      { id: "auto", label: "Auto loan", termPresets: [3, 4, 5], minTermYears: 1, maxTermYears: 5, defaultTermYears: 4, defaultRate: 6.5, defaultRequested: 80_000, showDownPayment: true, defaultDownPercent: 20, eligibleLtv: 80, maybeLtv: 90, qualifyingRateAddon: 0, qualifyingRateFloor: 0 },
    ],
    extras: { employmentMonths: true, salaryTransfer: true, residency: true },
    labels: {
      pageTitle: "UAE loan eligibility",
      income: "Monthly salary",
      incomeHint: "Salary credited to your UAE account. Banks usually work from monthly figures.",
      existingDebt: "Existing monthly instalments",
      existingDebtHint: "All EMI / loan instalments counted toward DBR.",
      requested: "Loan amount requested",
      requestedHint: "The facility you want the bank to consider.",
      term: "Tenor",
      rate: "Interest rate",
      employment: "Employment type",
      downPayment: "Down payment",
      downPaymentHint: "Residents often need 20% on a home; non-residents 25% in this model.",
      ratio: "Debt-burden ratio (DBR)",
      ratioHint: "Existing instalments plus the new payment, divided by monthly salary. The Central Bank cap is 50%.",
      employmentMonths: "Months in current job",
      employmentMonthsHint: "Many banks look for at least six months with the current employer.",
      salaryTransfer: "Salary transfer",
      salaryTransferHint: "Transferring salary to the lending bank usually supports the full 50% DBR.",
      residency: "UAE resident",
    },
  },
];

export function getLoanCountry(code: LoanCountryCode) {
  return LOAN_COUNTRIES.find((item) => item.code === code) ?? LOAN_COUNTRIES[0];
}

export function getLoanType(country: LoanCountry, id: LoanTypeId) {
  return country.loanTypes.find((item) => item.id === id) ?? country.loanTypes[0];
}

export function creditBandFor(credit: CreditRules, score: number) {
  return credit.bands.find((band) => score <= band.upTo) ?? credit.bands[credit.bands.length - 1];
}
