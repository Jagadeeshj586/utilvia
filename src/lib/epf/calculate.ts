export const EPF_EMPLOYEE_RATE = 0.12;
export const EPF_EMPLOYER_RATE = 0.0367;
export const DEFAULT_EPF_INTEREST_RATE = 8.25;

export type EpfCalculatorInput = {
  basicSalaryMonthly: number;
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  annualIncrementPercent: number;
  interestRatePercent: number;
};

export type EpfYearlyBalance = {
  year: number;
  balance: number;
};

export type EpfCalculatorResult = {
  maturityAmount: number;
  employeeContribution: number;
  employerContribution: number;
  interestEarned: number;
  years: number;
  yearly: EpfYearlyBalance[];
};

export const EPF_FAQS = [
  {
    question: "What is the default EPF interest rate?",
    answer: "The calculator defaults to 8.25% but you can edit it to match current EPFO rates.",
  },
  {
    question: "How is employer contribution calculated?",
    answer:
      "Employer contribution is split as 3.67% to EPF and 8.33% to EPS (Employee Pension Scheme). This calculator includes only the 3.67% EPF portion.",
  },
  {
    question: "Does it include salary increments?",
    answer: "Yes. Enter an annual salary increment percentage to increase basic salary each year before contributions are calculated.",
  },
  {
    question: "What retirement age is used?",
    answer: "You choose the retirement age. The default is 58, which is common for private-sector employees in India.",
  },
  {
    question: "Is EPF calculator free?",
    answer: "Yes. The Utilvia EPF Calculator is free with no signup required.",
  },
] as const;

export function calculateEpf(input: EpfCalculatorInput): EpfCalculatorResult | null {
  const {
    basicSalaryMonthly,
    currentAge,
    retirementAge,
    currentBalance,
    annualIncrementPercent,
    interestRatePercent,
  } = input;

  if (
    !Number.isFinite(basicSalaryMonthly) ||
    !Number.isFinite(currentAge) ||
    !Number.isFinite(retirementAge) ||
    !Number.isFinite(currentBalance) ||
    !Number.isFinite(annualIncrementPercent) ||
    !Number.isFinite(interestRatePercent)
  ) {
    return null;
  }

  if (basicSalaryMonthly < 0 || currentBalance < 0 || annualIncrementPercent < 0 || interestRatePercent < 0) {
    return null;
  }

  const years = Math.floor(retirementAge - currentAge);
  if (years <= 0) return null;

  let balance = currentBalance;
  let basic = basicSalaryMonthly;
  let employeeContribution = 0;
  let employerContribution = 0;
  const monthlyRate = interestRatePercent / 100 / 12;
  const incrementFactor = 1 + annualIncrementPercent / 100;
  const yearly: EpfYearlyBalance[] = [];

  for (let year = 1; year <= years; year += 1) {
    for (let month = 0; month < 12; month += 1) {
      const employee = basic * EPF_EMPLOYEE_RATE;
      const employer = basic * EPF_EMPLOYER_RATE;
      employeeContribution += employee;
      employerContribution += employer;
      balance += employee + employer;
      balance *= 1 + monthlyRate;
    }
    yearly.push({ year, balance: Math.round(balance) });
    basic *= incrementFactor;
  }

  const maturityAmount = Math.round(balance);
  const employeeRounded = Math.round(employeeContribution);
  const employerRounded = Math.round(employerContribution);
  const interestEarned = maturityAmount - currentBalance - employeeRounded - employerRounded;

  return {
    maturityAmount,
    employeeContribution: employeeRounded,
    employerContribution: employerRounded,
    interestEarned,
    years,
    yearly,
  };
}
