import {
  K401_RULES,
  catchUpRoom,
  employeeElectiveLimit,
  type K401AccountType,
  type K401ContributionMode,
} from "./rules";

export {
  K401_RULES,
  catchUpRoom,
  employeeElectiveLimit,
} from "./rules";
export type { K401AccountType, K401ContributionMode } from "./rules";

export type K401Input = {
  currentAge: number;
  retirementAge: number;
  annualSalary: number;
  currentBalance: number;
  contributionMode: K401ContributionMode;
  contributionPercent: number;
  contributionDollars: number;
  employerMatchPercent: number;
  employerMatchUpToPercent: number;
  salaryGrowthPercent: number;
  returnPercent: number;
  contributionIncreasePercent: number;
  accountType: K401AccountType;
  currentTaxPercent: number;
  retirementTaxPercent: number;
};

export type K401YearRow = {
  year: number;
  age: number;
  salary: number;
  employee: number;
  employer: number;
  employeeCumulative: number;
  employerCumulative: number;
  intendedEmployee: number;
  irsLimit: number;
  capped: boolean;
  balance: number;
};

export type K401Errors = Partial<
  Record<
    | "currentAge"
    | "retirementAge"
    | "annualSalary"
    | "currentBalance"
    | "contributionPercent"
    | "contributionDollars"
    | "employerMatchPercent"
    | "employerMatchUpToPercent"
    | "salaryGrowthPercent"
    | "returnPercent"
    | "contributionIncreasePercent"
    | "currentTaxPercent"
    | "retirementTaxPercent",
    string
  >
>;

export type K401Result = {
  years: number;
  currentAge: number;
  retirementAge: number;
  startingIrsLimit: number;
  startingEmployeeContribution: number;
  startingEmployerContribution: number;
  contributionCapped: boolean;
  yearsCapped: number;
  missedMatchThisYear: number;
  fullMatchThisYear: number;
  projectedBalance: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  totalContributions: number;
  investmentGrowth: number;
  annualRetirementIncome: number;
  monthlyRetirementIncome: number;
  traditionalTaxSavedThisYear: number;
  traditionalMonthlyTakeHomeReduction: number;
  traditionalAfterTaxAnnualIncome: number;
  rothAfterTaxAnnualIncome: number;
  employeeShare: number;
  employerShare: number;
  growthShare: number;
  contributionShare: number;
  yearly: K401YearRow[];
};

export const DEFAULT_K401_INPUT: K401Input = {
  currentAge: K401_RULES.defaultCurrentAge,
  retirementAge: K401_RULES.defaultRetirementAge,
  annualSalary: K401_RULES.defaultSalary,
  currentBalance: K401_RULES.defaultBalance,
  contributionMode: "percent",
  contributionPercent: K401_RULES.defaultContributionPercent,
  contributionDollars: Math.round(
    (K401_RULES.defaultSalary * K401_RULES.defaultContributionPercent) / 100,
  ),
  employerMatchPercent: K401_RULES.defaultMatchPercent,
  employerMatchUpToPercent: K401_RULES.defaultMatchUpToPercent,
  salaryGrowthPercent: K401_RULES.defaultSalaryGrowthPercent,
  returnPercent: K401_RULES.defaultReturnPercent,
  contributionIncreasePercent: K401_RULES.defaultContributionIncreasePercent,
  accountType: "traditional",
  currentTaxPercent: K401_RULES.defaultCurrentTaxPercent,
  retirementTaxPercent: K401_RULES.defaultRetirementTaxPercent,
};

function dollars(value: number) {
  return Math.round(value);
}

export function intendedEmployeeContribution(
  input: Pick<
    K401Input,
    "contributionMode" | "contributionPercent" | "contributionDollars" | "contributionIncreasePercent"
  >,
  salary: number,
  yearIndex: number,
) {
  const step = Math.pow(1 + input.contributionIncreasePercent / 100, yearIndex);
  if (input.contributionMode === "dollars") {
    return Math.max(0, input.contributionDollars * step);
  }
  const rate = Math.min(100, Math.max(0, input.contributionPercent * step));
  return Math.max(0, (rate / 100) * salary);
}

export function employerMatchOn(salary: number, employeeContribution: number, matchPercent: number, matchUpToPercent: number) {
  if (salary <= 0 || matchPercent <= 0 || matchUpToPercent <= 0) return 0;
  const matchable = Math.min(employeeContribution, (matchUpToPercent / 100) * salary);
  return (matchPercent / 100) * matchable;
}

export function applyAnnualCaps(age: number, salary: number, intendedEmployee: number, intendedEmployer: number) {
  const electiveLimit = employeeElectiveLimit(age);
  const maxEmployee = Math.min(electiveLimit, Math.max(0, salary));
  const employee = Math.min(Math.max(0, intendedEmployee), maxEmployee);
  const catchUp = catchUpRoom(age);
  const employeeBase = Math.min(employee, K401_RULES.electiveDeferralLimit);
  const remainingAdditions = Math.max(0, K401_RULES.annualAdditionsLimit - employeeBase);
  const employer = Math.min(Math.max(0, intendedEmployer), remainingAdditions);
  return {
    employee,
    employer,
    irsLimit: electiveLimit,
    capped: intendedEmployee > maxEmployee + 0.5,
    catchUpUsed: Math.max(0, employee - employeeBase),
    catchUp,
  };
}

export function validateK401(input: K401Input): K401Errors {
  const errors: K401Errors = {};
  if (!Number.isFinite(input.currentAge) || input.currentAge < K401_RULES.minCurrentAge) {
    errors.currentAge = `Enter your age (${K401_RULES.minCurrentAge} or older).`;
  } else if (input.currentAge > K401_RULES.maxCurrentAge) {
    errors.currentAge = `Current age cannot exceed ${K401_RULES.maxCurrentAge}.`;
  }

  if (!Number.isFinite(input.retirementAge) || input.retirementAge < K401_RULES.minRetirementAge) {
    errors.retirementAge = `Retirement age should be at least ${K401_RULES.minRetirementAge}.`;
  } else if (input.retirementAge > K401_RULES.maxRetirementAge) {
    errors.retirementAge = `Retirement age cannot exceed ${K401_RULES.maxRetirementAge}.`;
  } else if (Number.isFinite(input.currentAge) && input.retirementAge <= input.currentAge) {
    errors.retirementAge = "Retirement age must be greater than your current age.";
  }

  if (!Number.isFinite(input.annualSalary) || input.annualSalary < K401_RULES.minSalary) {
    errors.annualSalary = "Enter an annual salary greater than $0.";
  } else if (input.annualSalary > K401_RULES.maxSalary) {
    errors.annualSalary = `Salary cannot exceed $${K401_RULES.maxSalary.toLocaleString("en-US")}.`;
  }

  if (!Number.isFinite(input.currentBalance) || input.currentBalance < K401_RULES.minBalance) {
    errors.currentBalance = "Current balance cannot be negative.";
  } else if (input.currentBalance > K401_RULES.maxBalance) {
    errors.currentBalance = "Current balance is above the amount this calculator can model.";
  }

  if (input.contributionMode === "percent") {
    if (!Number.isFinite(input.contributionPercent) || input.contributionPercent < 0) {
      errors.contributionPercent = "Contribution rate cannot be negative.";
    } else if (input.contributionPercent > K401_RULES.maxContributionPercent) {
      errors.contributionPercent = "Contribution rate cannot exceed 100% of salary.";
    }
  } else if (!Number.isFinite(input.contributionDollars) || input.contributionDollars < 0) {
    errors.contributionDollars = "Annual contribution cannot be negative.";
  } else if (input.contributionDollars > K401_RULES.maxContributionDollars) {
    errors.contributionDollars = `Annual contribution cannot exceed $${K401_RULES.maxContributionDollars.toLocaleString("en-US")}.`;
  }

  if (!Number.isFinite(input.employerMatchPercent) || input.employerMatchPercent < 0) {
    errors.employerMatchPercent = "Employer match cannot be negative.";
  } else if (input.employerMatchPercent > K401_RULES.maxMatchPercent) {
    errors.employerMatchPercent = `Employer match cannot exceed ${K401_RULES.maxMatchPercent}%.`;
  }

  if (!Number.isFinite(input.employerMatchUpToPercent) || input.employerMatchUpToPercent < 0) {
    errors.employerMatchUpToPercent = "Match limit cannot be negative.";
  } else if (input.employerMatchUpToPercent > K401_RULES.maxMatchUpToPercent) {
    errors.employerMatchUpToPercent = "Match limit cannot exceed 100% of salary.";
  }

  if (!Number.isFinite(input.salaryGrowthPercent) || input.salaryGrowthPercent < 0) {
    errors.salaryGrowthPercent = "Salary growth cannot be negative.";
  } else if (input.salaryGrowthPercent > K401_RULES.maxGrowthPercent) {
    errors.salaryGrowthPercent = `Salary growth cannot exceed ${K401_RULES.maxGrowthPercent}%.`;
  }

  if (!Number.isFinite(input.returnPercent) || input.returnPercent < 0) {
    errors.returnPercent = "Expected return cannot be negative.";
  } else if (input.returnPercent > K401_RULES.maxReturnPercent) {
    errors.returnPercent = `Expected return cannot exceed ${K401_RULES.maxReturnPercent}%.`;
  }

  if (!Number.isFinite(input.contributionIncreasePercent) || input.contributionIncreasePercent < 0) {
    errors.contributionIncreasePercent = "Contribution increase cannot be negative.";
  } else if (input.contributionIncreasePercent > K401_RULES.maxGrowthPercent) {
    errors.contributionIncreasePercent = `Contribution increase cannot exceed ${K401_RULES.maxGrowthPercent}%.`;
  }

  if (!Number.isFinite(input.currentTaxPercent) || input.currentTaxPercent < 0 || input.currentTaxPercent > K401_RULES.maxTaxPercent) {
    errors.currentTaxPercent = `Enter a federal tax rate between 0% and ${K401_RULES.maxTaxPercent}%.`;
  }
  if (
    !Number.isFinite(input.retirementTaxPercent) ||
    input.retirementTaxPercent < 0 ||
    input.retirementTaxPercent > K401_RULES.maxTaxPercent
  ) {
    errors.retirementTaxPercent = `Enter a retirement tax rate between 0% and ${K401_RULES.maxTaxPercent}%.`;
  }

  return errors;
}

export function hasK401Errors(errors: K401Errors) {
  return Object.keys(errors).length > 0;
}

export function calculateK401(input: K401Input): K401Result | null {
  if (hasK401Errors(validateK401(input))) return null;

  const years = input.retirementAge - input.currentAge;
  const growth = input.returnPercent / 100;
  const salaryGrowth = input.salaryGrowthPercent / 100;
  const yearly: K401YearRow[] = [];
  let balance = input.currentBalance;
  let employeeCumulative = 0;
  let employerCumulative = 0;
  let yearsCapped = 0;

  for (let year = 1; year <= years; year += 1) {
    const age = input.currentAge + year - 1;
    const salary = input.annualSalary * Math.pow(1 + salaryGrowth, year - 1);
    const intended = intendedEmployeeContribution(input, salary, year - 1);
    const uncappedEmployer = employerMatchOn(
      salary,
      Math.min(intended, employeeElectiveLimit(age)),
      input.employerMatchPercent,
      input.employerMatchUpToPercent,
    );
    const capped = applyAnnualCaps(age, salary, intended, uncappedEmployer);
    if (capped.capped) yearsCapped += 1;
    employeeCumulative += capped.employee;
    employerCumulative += capped.employer;
    balance = balance * (1 + growth) + capped.employee + capped.employer;
    yearly.push({
      year,
      age,
      salary: dollars(salary),
      employee: dollars(capped.employee),
      employer: dollars(capped.employer),
      employeeCumulative: dollars(employeeCumulative),
      employerCumulative: dollars(employerCumulative),
      intendedEmployee: dollars(intended),
      irsLimit: capped.irsLimit,
      capped: capped.capped,
      balance: dollars(balance),
    });
  }

  const projectedBalance = dollars(balance);
  const totalEmployee = dollars(employeeCumulative);
  const totalEmployer = dollars(employerCumulative);
  const totalContributions = totalEmployee + totalEmployer;
  const investmentGrowth = dollars(projectedBalance - input.currentBalance - employeeCumulative - employerCumulative);
  const annualRetirementIncome = dollars((K401_RULES.withdrawalRatePercent / 100) * projectedBalance);
  const first = yearly[0];
  const startingEmployee = first?.employee ?? 0;
  const startingEmployer = first?.employer ?? 0;
  const traditionalTaxSavedThisYear = dollars((input.currentTaxPercent / 100) * startingEmployee);
  const denom = projectedBalance <= 0 ? 1 : projectedBalance;

  const firstIntended = intendedEmployeeContribution(input, input.annualSalary, 0);
  const firstUncappedEmployer = employerMatchOn(
    input.annualSalary,
    Math.min(firstIntended, employeeElectiveLimit(input.currentAge)),
    input.employerMatchPercent,
    input.employerMatchUpToPercent,
  );
  const fullMatchThisYear = dollars(
    employerMatchOn(
      input.annualSalary,
      (input.employerMatchUpToPercent / 100) * input.annualSalary,
      input.employerMatchPercent,
      input.employerMatchUpToPercent,
    ),
  );

  return {
    years,
    currentAge: input.currentAge,
    retirementAge: input.retirementAge,
    startingIrsLimit: employeeElectiveLimit(input.currentAge),
    startingEmployeeContribution: startingEmployee,
    startingEmployerContribution: startingEmployer,
    contributionCapped: yearsCapped > 0,
    yearsCapped,
    missedMatchThisYear: Math.max(0, fullMatchThisYear - dollars(firstUncappedEmployer)),
    fullMatchThisYear,
    projectedBalance,
    totalEmployeeContributions: totalEmployee,
    totalEmployerContributions: totalEmployer,
    totalContributions,
    investmentGrowth,
    annualRetirementIncome,
    monthlyRetirementIncome: dollars(annualRetirementIncome / 12),
    traditionalTaxSavedThisYear,
    traditionalMonthlyTakeHomeReduction: dollars((startingEmployee - traditionalTaxSavedThisYear) / 12),
    traditionalAfterTaxAnnualIncome: dollars(annualRetirementIncome * (1 - input.retirementTaxPercent / 100)),
    rothAfterTaxAnnualIncome: annualRetirementIncome,
    employeeShare: (totalEmployee / denom) * 100,
    employerShare: (totalEmployer / denom) * 100,
    growthShare: (Math.max(0, investmentGrowth) / denom) * 100,
    contributionShare: (totalContributions / denom) * 100,
    yearly,
  };
}

export const K401_FAQS = [
  {
    question: `What is the 401(k) contribution limit for ${K401_RULES.taxYear}?`,
    answer: `The ${K401_RULES.taxYear} employee elective deferral limit is $${K401_RULES.electiveDeferralLimit.toLocaleString("en-US")}. Age 50+ catch-up is $${K401_RULES.catchUpLimit.toLocaleString("en-US")}. Ages ${K401_RULES.superCatchUpMinAge}–${K401_RULES.superCatchUpMaxAge} can use the higher SECURE 2.0 catch-up of $${K401_RULES.superCatchUpLimit.toLocaleString("en-US")}. The annual additions limit (employee + employer, excluding catch-up) is $${K401_RULES.annualAdditionsLimit.toLocaleString("en-US")}.`,
  },
  {
    question: "How much should I contribute to my 401(k)?",
    answer:
      "A common starting point is at least enough to capture the full employer match, then work toward the IRS maximum if your budget allows. This calculator shows when you hit the annual limit and how match, salary growth, and returns change the projected balance.",
  },
  {
    question: "What is the employer 401(k) match and why does it matter?",
    answer:
      "Many employers match a percentage of what you defer, up to a share of salary (for example 50% up to 6%). That match is additional compensation. Contributing below the match cap means leaving part of it unclaimed.",
  },
  {
    question: "What is the SECURE 2.0 super catch-up contribution?",
    answer: `For ages ${K401_RULES.superCatchUpMinAge}–${K401_RULES.superCatchUpMaxAge}, ${K401_RULES.taxYear} allows a higher catch-up of $${K401_RULES.superCatchUpLimit.toLocaleString("en-US")} instead of the regular age-50 catch-up of $${K401_RULES.catchUpLimit.toLocaleString("en-US")}. The calculator applies the matching limit automatically in those years.`,
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Salary and balance figures stay on your device.",
  },
] as const;
