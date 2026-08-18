export const SWP_RULES = {
  rulesLabel: "Based on Indian mutual fund SWP conventions — illustrative returns",
  fdRatePercent: 7,
  ltcgExempt: 1_25_000,
  ltcgLongRate: 12.5,
  stcgRate: 20,
  defaultCorpus: 50_00_000,
  defaultWithdrawal: 25_000,
  defaultReturn: 8,
  defaultYears: 20,
  minCorpus: 1,
  maxCorpus: 100_00_00_000,
  minWithdrawal: 1,
  maxWithdrawal: 1_00_00_000,
  minReturn: 0,
  maxReturn: 20,
  minYears: 1,
  maxYears: 50,
  maxSimMonths: 100 * 12,
  neverDepletePreviewYears: 15,
} as const;

export type SwpMode = "duration" | "corpus";

export type SwpYearRow = {
  year: number;
  opening: number;
  withdrawn: number;
  returns: number;
  closing: number;
};

export type SwpInput = {
  mode: SwpMode;
  corpus: number;
  monthlyWithdrawal: number;
  returnPercent: number;
  years: number;
};

export type SwpDurationResult = {
  mode: "duration";
  neverDepletes: boolean;
  monthlyReturn: number;
  fdMonthly: number;
  months: number;
  years: number;
  extraMonths: number;
  totalWithdrawn: number;
  returnsEarned: number;
  yearly: SwpYearRow[];
};

export type SwpCorpusResult = {
  mode: "corpus";
  corpusRequired: number;
  totalWithdrawn: number;
  returnsFundingGap: number;
  monthlyIncome: number;
  years: number;
  yearly: SwpYearRow[];
};

export type SwpResult = SwpDurationResult | SwpCorpusResult;

export type SwpErrors = Partial<Record<"corpus" | "monthlyWithdrawal" | "returnPercent" | "years", string>>;

export const DEFAULT_SWP_INPUT: SwpInput = {
  mode: "duration",
  corpus: SWP_RULES.defaultCorpus,
  monthlyWithdrawal: SWP_RULES.defaultWithdrawal,
  returnPercent: SWP_RULES.defaultReturn,
  years: SWP_RULES.defaultYears,
};

function rupees(value: number) {
  return Math.round(value);
}

export function monthlyRate(annualPercent: number) {
  return annualPercent / 100 / 12;
}

export function formatDuration(months: number) {
  if (months <= 0) return "0 months";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const yearPart = years === 0 ? "" : years === 1 ? "1 year" : `${years} years`;
  const monthPart = rem === 0 ? "" : rem === 1 ? "1 month" : `${rem} months`;
  return [yearPart, monthPart].filter(Boolean).join(" ");
}

function simulate(
  starting: number,
  withdrawal: number,
  annualPercent: number,
  monthCap: number,
): { months: number; totalWithdrawn: number; returnsEarned: number; yearly: SwpYearRow[]; remaining: number } {
  const r = monthlyRate(annualPercent);
  let balance = starting;
  let months = 0;
  let totalWithdrawn = 0;
  let returnsEarned = 0;
  const yearly: SwpYearRow[] = [];
  let yearOpening = starting;
  let yearWithdrawn = 0;
  let yearReturns = 0;

  const pushYear = () => {
    yearly.push({
      year: yearly.length + 1,
      opening: rupees(yearOpening),
      withdrawn: rupees(yearWithdrawn),
      returns: rupees(yearReturns),
      closing: rupees(Math.max(0, balance)),
    });
    yearOpening = Math.max(0, balance);
    yearWithdrawn = 0;
    yearReturns = 0;
  };

  while (balance > 0.01 && months < monthCap) {
    const growth = balance * r;
    balance += growth;
    returnsEarned += growth;
    yearReturns += growth;
    const take = Math.min(withdrawal, balance);
    balance -= take;
    totalWithdrawn += take;
    yearWithdrawn += take;
    months += 1;
    if (months % 12 === 0 || balance <= 0.01) pushYear();
  }

  return {
    months,
    totalWithdrawn: rupees(totalWithdrawn),
    returnsEarned: rupees(returnsEarned),
    yearly,
    remaining: Math.max(0, balance),
  };
}

export function validateSwp(input: SwpInput): SwpErrors {
  const errors: SwpErrors = {};
  if (input.mode === "duration") {
    if (!Number.isFinite(input.corpus) || input.corpus < SWP_RULES.minCorpus || input.corpus > SWP_RULES.maxCorpus) {
      errors.corpus = "Enter a starting corpus in rupees.";
    }
  }
  if (
    !Number.isFinite(input.monthlyWithdrawal) ||
    input.monthlyWithdrawal < SWP_RULES.minWithdrawal ||
    input.monthlyWithdrawal > SWP_RULES.maxWithdrawal
  ) {
    errors.monthlyWithdrawal = "Enter a monthly withdrawal amount.";
  }
  if (
    !Number.isFinite(input.returnPercent) ||
    input.returnPercent < SWP_RULES.minReturn ||
    input.returnPercent > SWP_RULES.maxReturn
  ) {
    errors.returnPercent = `Enter an annual return from ${SWP_RULES.minReturn}% to ${SWP_RULES.maxReturn}%.`;
  }
  if (input.mode === "corpus") {
    if (!Number.isFinite(input.years) || input.years < SWP_RULES.minYears || input.years > SWP_RULES.maxYears) {
      errors.years = `Enter a period from ${SWP_RULES.minYears} to ${SWP_RULES.maxYears} years.`;
    }
  }
  return errors;
}

export function hasSwpErrors(errors: SwpErrors) {
  return Object.keys(errors).length > 0;
}

export function corpusRequired(monthlyIncome: number, years: number, annualPercent: number) {
  const n = years * 12;
  if (n <= 0) return 0;
  const r = monthlyRate(annualPercent);
  if (r === 0) return rupees(monthlyIncome * n);
  return rupees(monthlyIncome * ((1 - Math.pow(1 + r, -n)) / r));
}

export function calculateSwp(input: SwpInput): SwpResult | null {
  if (hasSwpErrors(validateSwp(input))) return null;

  if (input.mode === "corpus") {
    const required = corpusRequired(input.monthlyWithdrawal, input.years, input.returnPercent);
    const totalWithdrawn = rupees(input.monthlyWithdrawal * input.years * 12);
    const sim = simulate(required, input.monthlyWithdrawal, input.returnPercent, input.years * 12);
    return {
      mode: "corpus",
      corpusRequired: required,
      totalWithdrawn,
      returnsFundingGap: Math.max(0, totalWithdrawn - required),
      monthlyIncome: input.monthlyWithdrawal,
      years: input.years,
      yearly: sim.yearly,
    };
  }

  const monthlyReturn = input.corpus * monthlyRate(input.returnPercent);
  const fdMonthly = rupees(input.corpus * (SWP_RULES.fdRatePercent / 100) / 12);
  const neverDepletes = monthlyReturn + 1e-9 >= input.monthlyWithdrawal;

  if (neverDepletes) {
    const preview = simulate(
      input.corpus,
      input.monthlyWithdrawal,
      input.returnPercent,
      SWP_RULES.neverDepletePreviewYears * 12,
    );
    return {
      mode: "duration",
      neverDepletes: true,
      monthlyReturn: rupees(monthlyReturn),
      fdMonthly,
      months: 0,
      years: 0,
      extraMonths: 0,
      totalWithdrawn: 0,
      returnsEarned: 0,
      yearly: preview.yearly,
    };
  }

  const sim = simulate(input.corpus, input.monthlyWithdrawal, input.returnPercent, SWP_RULES.maxSimMonths);
  return {
    mode: "duration",
    neverDepletes: false,
    monthlyReturn: rupees(monthlyReturn),
    fdMonthly,
    months: sim.months,
    years: Math.floor(sim.months / 12),
    extraMonths: sim.months % 12,
    totalWithdrawn: sim.totalWithdrawn,
    returnsEarned: sim.returnsEarned,
    yearly: sim.yearly,
  };
}

export function swpCopyText(result: SwpResult) {
  if (result.mode === "corpus") {
    return `Corpus required: ₹${result.corpusRequired.toLocaleString("en-IN")}`;
  }
  if (result.neverDepletes) return "Corpus never depletes";
  return formatDuration(result.months);
}

export const SWP_FAQS = [
  {
    question: "How does SWP work in mutual funds?",
    answer:
      "A systematic withdrawal plan sells fund units on a schedule so you receive a fixed monthly amount. The remaining corpus stays invested and can grow. This calculator models that with a constant return — actual NAV movement will differ.",
  },
  {
    question: "How much corpus do I need for SWP of ₹25,000 per month?",
    answer:
      "It depends on return and how long you need the income. At 8% for 20 years the present-value estimate is about ₹29.9 lakh. To keep the corpus from shrinking, you need enough that monthly return covers ₹25,000 — about ₹37.5 lakh at 8%.",
  },
  {
    question: "Is SWP from mutual funds taxable?",
    answer: `Equity funds: the first ₹${SWP_RULES.ltcgExempt.toLocaleString("en-IN")} of long-term gains each year is exempt; gains above that are taxed at ${SWP_RULES.ltcgLongRate}% if held over 12 months, or ${SWP_RULES.stcgRate}% if held 12 months or less. Debt funds are taxed at your slab rate. This tool does not subtract tax from the corpus path.`,
  },
  {
    question: "SWP or FD interest — which is better for retirement income?",
    answer: `An FD at ${SWP_RULES.fdRatePercent}% pays interest and keeps capital intact, but the monthly amount is usually lower. SWP can pay more if equity returns are higher, at the cost of dipping into corpus and market risk. Use both views here to compare.`,
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Your numbers stay on your device.",
  },
];
