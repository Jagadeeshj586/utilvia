import {
  RD_RULES,
  getRdCompounding,
  getRdMethod,
  type RdCompoundingId,
  type RdMethodId,
} from "./rules";

export {
  RD_COMPOUNDING,
  RD_METHODS,
  RD_RULES,
  getRdCompounding,
  getRdMethod,
  tenureToMonths,
} from "./rules";
export type { RdCompoundingId, RdMethodId } from "./rules";

export type RdTenureUnit = "years" | "months";

export type RdInput = {
  monthlyDeposit: number;
  ratePercent: number;
  tenureValue: number;
  tenureUnit: RdTenureUnit;
  compounding: RdCompoundingId;
  method: RdMethodId;
};

export type RdMonthRow = {
  month: number;
  deposit: number;
  invested: number;
  interestCredited: number;
  balance: number;
};

export type RdYearRow = {
  year: number;
  invested: number;
  interest: number;
  balance: number;
};

export type RdErrors = Partial<Record<"monthlyDeposit" | "ratePercent" | "tenureValue", string>>;

export type RdResult = {
  months: number;
  monthlyDeposit: number;
  ratePercent: number;
  compoundingLabel: string;
  methodLabel: string;
  methodHint: string;
  totalDeposited: number;
  interestEarned: number;
  maturityAmount: number;
  averageMonthlyGrowth: number;
  averageYearlyGrowth: number;
  principalShare: number;
  interestShare: number;
  schedule: RdMonthRow[];
  yearly: RdYearRow[];
};

export const DEFAULT_RD_INPUT: RdInput = {
  monthlyDeposit: RD_RULES.defaultMonthly,
  ratePercent: RD_RULES.defaultRatePercent,
  tenureValue: 1,
  tenureUnit: "years",
  compounding: RD_RULES.defaultCompounding,
  method: RD_RULES.defaultMethod,
};

function rupees(value: number) {
  return Math.round(value);
}

export function monthsFromInput(input: Pick<RdInput, "tenureValue" | "tenureUnit">) {
  if (!Number.isFinite(input.tenureValue) || input.tenureValue <= 0) return NaN;
  return input.tenureUnit === "years" ? Math.round(input.tenureValue * 12) : Math.round(input.tenureValue);
}

export function validateRd(input: RdInput): RdErrors {
  const errors: RdErrors = {};
  if (!Number.isFinite(input.monthlyDeposit) || input.monthlyDeposit < RD_RULES.minMonthly) {
    errors.monthlyDeposit = `Enter a monthly deposit of at least ₹${RD_RULES.minMonthly.toLocaleString("en-IN")}.`;
  } else if (input.monthlyDeposit > RD_RULES.maxMonthly) {
    errors.monthlyDeposit = `Monthly deposit cannot exceed ₹${RD_RULES.maxMonthly.toLocaleString("en-IN")}.`;
  }
  if (!Number.isFinite(input.ratePercent) || input.ratePercent < RD_RULES.minRatePercent) {
    errors.ratePercent = "Enter an annual interest rate of 0% or more.";
  } else if (input.ratePercent > RD_RULES.maxRatePercent) {
    errors.ratePercent = `Interest rate cannot exceed ${RD_RULES.maxRatePercent}%.`;
  }
  const months = monthsFromInput(input);
  if (!Number.isFinite(months) || months < RD_RULES.minMonths) {
    errors.tenureValue =
      input.tenureUnit === "years"
        ? `Enter a tenure of at least ${RD_RULES.minYears} year.`
        : `Enter a tenure of at least ${RD_RULES.minMonths} months.`;
  } else if (months > RD_RULES.maxMonths) {
    errors.tenureValue =
      input.tenureUnit === "years"
        ? `Tenure cannot exceed ${RD_RULES.maxYears} years.`
        : `Tenure cannot exceed ${RD_RULES.maxMonths} months.`;
  }
  return errors;
}

export function hasRdErrors(errors: RdErrors) {
  return Object.keys(errors).length > 0;
}

/** Closed-form Indian RD installment formula for any compounding frequency. */
export function installmentFormulaMaturity(
  monthlyDeposit: number,
  months: number,
  ratePercent: number,
  periodsPerYear: number,
) {
  if (months <= 0 || monthlyDeposit === 0) return 0;
  if (ratePercent === 0) return monthlyDeposit * months;
  const i = ratePercent / 100 / periodsPerYear;
  const compoundingPeriods = periodsPerYear * (months / 12);
  const monthExponent = periodsPerYear / 12;
  const denom = 1 - Math.pow(1 + i, -monthExponent);
  if (Math.abs(denom) < 1e-15) return monthlyDeposit * months;
  return (monthlyDeposit * (Math.pow(1 + i, compoundingPeriods) - 1)) / denom;
}

function simulateEquivalentMonthly(
  monthlyDeposit: number,
  months: number,
  ratePercent: number,
  periodsPerYear: number,
): RdMonthRow[] {
  const i = ratePercent / 100 / periodsPerYear;
  const monthlyFactor = ratePercent === 0 ? 0 : Math.pow(1 + i, periodsPerYear / 12) - 1;
  let balance = 0;
  let invested = 0;
  const schedule: RdMonthRow[] = [];
  for (let month = 1; month <= months; month += 1) {
    balance += monthlyDeposit;
    invested += monthlyDeposit;
    const interestCredited = balance * monthlyFactor;
    balance += interestCredited;
    schedule.push({ month, deposit: monthlyDeposit, invested, interestCredited, balance });
  }
  return schedule;
}

function simulatePeriodCredit(
  monthlyDeposit: number,
  months: number,
  ratePercent: number,
  periodsPerYear: number,
): RdMonthRow[] {
  const i = ratePercent / 100 / periodsPerYear;
  const monthsPerPeriod = 12 / periodsPerYear;
  let balance = 0;
  let invested = 0;
  let elapsedInPeriod = 0;
  const schedule: RdMonthRow[] = [];
  for (let month = 1; month <= months; month += 1) {
    balance += monthlyDeposit;
    invested += monthlyDeposit;
    elapsedInPeriod += 1;
    let interestCredited = 0;
    const periodComplete = elapsedInPeriod >= monthsPerPeriod - 1e-9;
    const lastMonth = month === months;
    if ((periodComplete || lastMonth) && i !== 0) {
      const fraction = periodComplete ? 1 : elapsedInPeriod / monthsPerPeriod;
      const next = balance * Math.pow(1 + i, fraction);
      interestCredited = next - balance;
      balance = next;
      elapsedInPeriod = 0;
    }
    schedule.push({ month, deposit: monthlyDeposit, invested, interestCredited, balance });
  }
  return schedule;
}

function yearlyFromSchedule(schedule: RdMonthRow[]): RdYearRow[] {
  const years = Math.ceil(schedule.length / 12);
  const rows: RdYearRow[] = [];
  for (let year = 1; year <= years; year += 1) {
    const row = schedule[Math.min(year * 12, schedule.length) - 1];
    if (!row) continue;
    rows.push({
      year,
      invested: row.invested,
      interest: row.balance - row.invested,
      balance: row.balance,
    });
  }
  return rows;
}

export function calculateRd(input: RdInput): RdResult | null {
  if (hasRdErrors(validateRd(input))) return null;
  const months = monthsFromInput(input);
  const compounding = getRdCompounding(input.compounding);
  const method = getRdMethod(input.method);
  const n = compounding.periodsPerYear;
  const monthlyDeposit = input.monthlyDeposit;

  const schedule =
    input.method === "period-credit"
      ? simulatePeriodCredit(monthlyDeposit, months, input.ratePercent, n)
      : simulateEquivalentMonthly(monthlyDeposit, months, input.ratePercent, n);

  const formulaMaturity = installmentFormulaMaturity(monthlyDeposit, months, input.ratePercent, n);
  const rawMaturity =
    input.method === "installment-formula" ? formulaMaturity : (schedule[schedule.length - 1]?.balance ?? 0);
  const totalDeposited = monthlyDeposit * months;
  const maturityAmount = rupees(rawMaturity);
  const interestEarned = rupees(maturityAmount - totalDeposited);
  const years = months / 12;

  const roundedSchedule = schedule.map((row) => ({
    ...row,
    deposit: rupees(row.deposit),
    invested: rupees(row.invested),
    interestCredited: rupees(row.interestCredited),
    balance: rupees(row.balance),
  }));
  if (roundedSchedule.length) {
    const last = roundedSchedule[roundedSchedule.length - 1]!;
    last.balance = maturityAmount;
  }

  const principalShare = maturityAmount <= 0 ? 0 : (totalDeposited / maturityAmount) * 100;
  const interestShare = 100 - principalShare;

  return {
    months,
    monthlyDeposit,
    ratePercent: input.ratePercent,
    compoundingLabel: compounding.label,
    methodLabel: method.label,
    methodHint: method.hint,
    totalDeposited,
    interestEarned,
    maturityAmount,
    averageMonthlyGrowth: months ? rupees(interestEarned / months) : 0,
    averageYearlyGrowth: years > 0 ? rupees(interestEarned / years) : interestEarned,
    principalShare,
    interestShare,
    schedule: roundedSchedule,
    yearly: yearlyFromSchedule(schedule).map((row) => ({
      year: row.year,
      invested: rupees(row.invested),
      interest: rupees(row.interest),
      balance: rupees(row.balance),
    })),
  };
}

export const RD_FAQS = [
  {
    question: "How is RD maturity calculated?",
    answer:
      "The default method is the Indian installment formula with quarterly compounding, which most bank RD calculators use. You can switch to monthly or yearly compounding, or to a model that credits interest only at compounding dates.",
  },
  {
    question: "Why do banks show a slightly different maturity value?",
    answer:
      "Banks may round interest monthly, use a 365-day year, apply a senior-citizen spread, or credit interest on a slightly different day. Treat this result as an estimate.",
  },
  {
    question: "What tenure can I enter?",
    answer: `Most bank RDs run from ${RD_RULES.minMonths} months to ${RD_RULES.maxYears} years. Enter tenure in years or months within that range.`,
  },
  {
    question: "Is RD interest taxable?",
    answer:
      "Yes. RD interest is added to your income and taxed at your slab rate. Banks may deduct TDS above the applicable threshold. This calculator does not subtract tax.",
  },
  {
    question: "Is this processed on a server?",
    answer: "No. Maturity, interest, and the deposit schedule are calculated in your browser. Nothing is uploaded to Utilvia.",
  },
] as const;
