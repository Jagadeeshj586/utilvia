export const DEFAULT_PPF_INTEREST_RATE = 7.1;
export const PPF_MIN_INVESTMENT = 500;
export const PPF_MAX_INVESTMENT = 150_000;
export const PPF_MIN_TENURE = 15;
export const PPF_MAX_TENURE = 50;
export const PPF_TAX_SLAB = 0.3;

export type PpfInvestmentFrequency = "yearly" | "monthly";

export type PpfYearRow = {
  year: number;
  investment: number;
  interest: number;
  balance: number;
};

export type PpfCalculatorInput = {
  annualInvestment: number;
  tenureYears: number;
  interestRatePercent: number;
  /** UI parity with WorkUtilities — frequency toggle is shown but uses the yearly deposit model. */
  frequency?: PpfInvestmentFrequency;
  accountStartYear?: number;
};

export type PpfCalculatorResult = {
  annualInvestment: number;
  tenureYears: number;
  interestRatePercent: number;
  totalInvested: number;
  totalInterest: number;
  maturityValue: number;
  estimatedTaxSaved: number;
  yearRows: PpfYearRow[];
  partialWithdrawalEligibleFromYear: number;
  partialWithdrawalEligibleFy: string;
  loanEligibleFromYear: number;
  loanEligibleUntilYear: number;
  loanEligibleFromFy: string;
  loanEligibleUntilFy: string;
  extensionBlocks: number;
  balanceAtYear2: number;
  balanceAtYear4: number;
};

export const PPF_FAQS = [
  {
    question: "What is the current PPF interest rate in 2026?",
    answer:
      "PPF interest is set quarterly by the Government of India. The calculator defaults to 7.1% p.a. (Q2 FY 2026-27). You can edit the rate to model future changes.",
  },
  {
    question: "Can I invest more than ₹1.5 lakh in PPF per year?",
    answer:
      "No. The maximum eligible PPF contribution is ₹1,50,000 per financial year across all accounts held by an individual. Amounts above this do not earn interest or qualify for 80C deduction.",
  },
  {
    question: "When can I withdraw money from PPF before maturity?",
    answer:
      "Partial withdrawal is allowed from the 7th year, up to 50% of the balance at the end of the 4th year, once per financial year. Full withdrawal is possible only on maturity or under specific conditions such as the account holder's death.",
  },
  {
    question: "Is PPF better than FD for tax saving?",
    answer:
      "PPF offers EEE status — 80C deduction, tax-free interest, and tax-free maturity — while bank FD interest is taxable. PPF has a 15-year lock-in; FDs are more liquid. PPF suits long-term, tax-efficient savings.",
  },
  {
    question: "Is the PPF calculator free?",
    answer: "Yes. The Utilvia PPF Calculator is free with no signup. All calculations run in your browser.",
  },
] as const;

export function formatIndianFy(calendarYear: number): string {
  const suffix = String((calendarYear + 1) % 100).padStart(2, "0");
  return `FY ${calendarYear}-${suffix}`;
}

export function formatPpfMaturityLakh(value: number): string {
  return `₹${(value / 100_000).toFixed(1)} lakh`;
}

export function calculatePpf(input: PpfCalculatorInput): PpfCalculatorResult | null {
  const { annualInvestment, tenureYears, interestRatePercent } = input;
  const accountStartYear = input.accountStartYear ?? new Date().getFullYear();

  if (
    !Number.isFinite(annualInvestment) ||
    !Number.isFinite(tenureYears) ||
    !Number.isFinite(interestRatePercent) ||
    annualInvestment < PPF_MIN_INVESTMENT ||
    annualInvestment > PPF_MAX_INVESTMENT ||
    tenureYears < PPF_MIN_TENURE ||
    tenureYears > PPF_MAX_TENURE ||
    interestRatePercent < 0
  ) {
    return null;
  }

  const rate = interestRatePercent / 100;
  let balance = 0;
  let totalInvested = 0;
  const yearRows: PpfYearRow[] = [];

  for (let year = 1; year <= tenureYears; year += 1) {
    balance += annualInvestment;
    totalInvested += annualInvestment;
    const interestRaw = balance * rate;
    balance += interestRaw;
    yearRows.push({
      year,
      investment: annualInvestment,
      interest: Math.round(interestRaw),
      balance: Math.round(balance),
    });
  }

  const maturityValue = Math.round(balance);
  const totalInterest = maturityValue - totalInvested;

  return {
    annualInvestment,
    tenureYears,
    interestRatePercent,
    totalInvested,
    totalInterest,
    maturityValue,
    estimatedTaxSaved: Math.round(PPF_TAX_SLAB * totalInvested),
    yearRows,
    partialWithdrawalEligibleFromYear: 7,
    partialWithdrawalEligibleFy: formatIndianFy(accountStartYear + 6),
    loanEligibleFromYear: 3,
    loanEligibleUntilYear: 6,
    loanEligibleFromFy: formatIndianFy(accountStartYear + 2),
    loanEligibleUntilFy: formatIndianFy(accountStartYear + 5),
    extensionBlocks: tenureYears > 15 ? Math.ceil((tenureYears - 15) / 5) : 0,
    balanceAtYear2: yearRows[1]?.balance ?? 0,
    balanceAtYear4: yearRows[3]?.balance ?? 0,
  };
}
