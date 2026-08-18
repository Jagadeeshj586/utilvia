import {
  creditBandFor,
  getLoanCountry,
  getLoanType,
  type EligibilityStatus,
  type IncomePeriod,
  type LoanCountry,
  type LoanCountryCode,
  type LoanTypeId,
  type LoanTypeRules,
} from "./countries";

export type {
  CreditRules,
  EligibilityStatus,
  EmploymentOption,
  ExtraFlags,
  IncomePeriod,
  LoanCountry,
  LoanCountryCode,
  LoanLabels,
  LoanTypeId,
  LoanTypeRules,
} from "./countries";
export { LOAN_COUNTRIES, creditBandFor, getLoanCountry, getLoanType } from "./countries";

export type LoanEligibilityInput = {
  country: LoanCountryCode;
  loanType: LoanTypeId;
  income: number;
  incomePeriod: IncomePeriod;
  existingDebt: number;
  requestedAmount: number;
  termYears: number;
  interestRatePercent: number;
  employmentId: string;
  creditScore: number;
  downPayment: number;
  age: number;
  employmentMonths: number;
  salaryTransfer: boolean;
  resident: boolean;
};

export type LoanValidation = {
  income?: string;
  existingDebt?: string;
  requestedAmount?: string;
  termYears?: string;
  interestRatePercent?: string;
  creditScore?: string;
  downPayment?: string;
  age?: string;
  employmentMonths?: string;
};

export type Factor = {
  label: string;
  detail: string;
  tone: EligibilityStatus | "neutral";
};

export type LoanEligibilityResult = {
  country: LoanCountryCode;
  loanType: LoanTypeId;
  status: EligibilityStatus;
  monthlyIncome: number;
  assessableMonthlyIncome: number;
  existingDebt: number;
  requestedAmount: number;
  requestedPayment: number;
  maxAffordablePayment: number;
  eligibleLoanAmount: number;
  maybeLoanAmount: number;
  ratioPercent: number;
  eligibleRatioPercent: number;
  maybeRatioPercent: number;
  quotedRate: number;
  estimatedRate: number;
  qualifyingRate: number;
  creditLabel: string | null;
  ltvPercent: number | null;
  remainingIncome: number;
  factors: Factor[];
};

export const LOAN_LIMITS = {
  interestRatePercent: { min: 0, max: 40 },
  income: { min: 0, max: 1_000_000_000 },
} as const;

export const STATUS_LABEL: Record<EligibilityStatus, string> = {
  eligible: "Eligible",
  maybe: "May Be Eligible",
  not: "Not Eligible",
};

export const LOAN_ELIGIBILITY_FAQS = [
  {
    question: "Does the calculator change when I pick another country?",
    answer:
      "Yes. Country selection updates currency, labels (DTI, FOIR, TDS, DBR), credit-score scales, employment types, loan-term presets, and eligibility caps. Canada and Australia also apply a higher qualifying rate on home loans.",
  },
  {
    question: "How is eligible loan amount calculated?",
    answer:
      "The calculator finds the monthly payment you can still take on after existing debts, using that country’s ratio cap and any employment haircut. It then converts that payment into a loan principal at the qualifying interest rate and term.",
  },
  {
    question: "What do Eligible, May Be Eligible, and Not Eligible mean?",
    answer:
      "Eligible means the requested loan sits inside typical planning guidelines. May Be Eligible means at least one factor is in a stretch band (ratio, credit, or LTV). Not Eligible means a hard cap is missed. Lenders still apply their own policy.",
  },
  {
    question: "Is this a loan approval?",
    answer:
      "No. Results are simplified estimates for planning. They are not a pre-approval, sanction letter, or credit decision. Speak with a licensed lender for an offer.",
  },
  {
    question: "Is the Loan Eligibility Calculator free?",
    answer: "Yes. It runs entirely in your browser with no signup. Your figures stay on your device.",
  },
] as const;

export function parseMoney(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  const firstDot = cleaned.indexOf(".");
  const normalized =
    firstDot === -1 ? cleaned : `${cleaned.slice(0, firstDot + 1)}${cleaned.slice(firstDot + 1).replace(/\./g, "")}`;
  return Number(normalized);
}

export function formatMoneyDraft(value: number, locale = "en-US", digits = 0) {
  if (!Number.isFinite(value)) return "";
  return value.toLocaleString(locale, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits > 0 && !Number.isInteger(value) ? Math.min(digits, 2) : 0,
  });
}

export function moneyDigits(currency: LoanCountry["currency"]) {
  return currency === "INR" ? 0 : 2;
}

export function formatLoanMoney(value: number, country: LoanCountry, digits?: number) {
  const fraction = digits ?? moneyDigits(country.currency);
  const formatted = new Intl.NumberFormat(country.locale, {
    maximumFractionDigits: fraction,
    minimumFractionDigits: fraction,
  }).format(Number.isFinite(value) ? value : 0);
  if (country.currency === "AED") return `${country.currencySymbol} ${formatted}`;
  return `${country.currencySymbol}${formatted}`;
}

export function monthlyPayment(principal: number, annualRatePercent: number, termYears: number) {
  const periods = Math.round(termYears * 12);
  if (periods <= 0 || principal <= 0 || !Number.isFinite(principal)) return 0;
  const periodRate = annualRatePercent / 12 / 100;
  if (periodRate === 0) return principal / periods;
  const factor = Math.pow(1 + periodRate, periods);
  return (principal * periodRate * factor) / (factor - 1);
}

export function principalFromPayment(payment: number, annualRatePercent: number, termYears: number) {
  const periods = Math.round(termYears * 12);
  if (periods <= 0 || payment <= 0 || !Number.isFinite(payment)) return 0;
  const periodRate = annualRatePercent / 12 / 100;
  if (periodRate === 0) return payment * periods;
  return (payment * (1 - Math.pow(1 + periodRate, -periods))) / periodRate;
}

export function toMonthlyIncome(income: number, period: IncomePeriod) {
  if (!Number.isFinite(income)) return NaN;
  return period === "annual" ? income / 12 : income;
}

export function qualifyingRatePercent(loanType: LoanTypeRules, contractRate: number) {
  if (loanType.qualifyingRateAddon <= 0 && loanType.qualifyingRateFloor <= 0) return contractRate;
  return Math.max(contractRate + loanType.qualifyingRateAddon, loanType.qualifyingRateFloor);
}

export function ratioCaps(country: LoanCountry, salaryTransfer: boolean) {
  const eligible =
    country.extras.salaryTransfer && !salaryTransfer && country.noSalaryTransferRatio != null
      ? country.noSalaryTransferRatio
      : country.eligibleRatio;
  const maybe = Math.max(eligible, country.maybeRatio);
  return { eligible, maybe };
}

function worseStatus(a: EligibilityStatus, b: EligibilityStatus): EligibilityStatus {
  const rank = { eligible: 0, maybe: 1, not: 2 };
  return rank[a] >= rank[b] ? a : b;
}

function ltvPercent(requested: number, downPayment: number) {
  const property = requested + downPayment;
  if (property <= 0) return null;
  return (requested / property) * 100;
}

export function defaultsFromCountry(country: LoanCountry, loanTypeId = country.defaultLoanType): LoanEligibilityInput {
  const loanType = getLoanType(country, loanTypeId);
  const downPayment = loanType.showDownPayment ? (loanType.defaultRequested * loanType.defaultDownPercent) / (100 - loanType.defaultDownPercent) : 0;
  return {
    country: country.code,
    loanType: loanType.id,
    income: country.defaultIncome,
    incomePeriod: country.defaultIncomePeriod,
    existingDebt: country.defaultExistingDebt,
    requestedAmount: loanType.defaultRequested,
    termYears: loanType.defaultTermYears,
    interestRatePercent: loanType.defaultRate,
    employmentId: country.employmentTypes[0].id,
    creditScore: country.credit?.defaultScore ?? 0,
    downPayment,
    age: country.extras.age ? 32 : 0,
    employmentMonths: country.extras.employmentMonths ? 18 : 0,
    salaryTransfer: true,
    resident: true,
  };
}

export function validateLoanEligibility(input: LoanEligibilityInput): LoanValidation {
  const country = getLoanCountry(input.country);
  const loanType = getLoanType(country, input.loanType);
  const errors: LoanValidation = {};

  if (!Number.isFinite(input.income)) errors.income = `Enter a valid ${country.labels.income.toLowerCase()}.`;
  else if (input.income <= 0) errors.income = `${country.labels.income} must be greater than 0.`;
  else if (input.income > LOAN_LIMITS.income.max) errors.income = `${country.labels.income} is too large.`;

  if (!Number.isFinite(input.existingDebt)) errors.existingDebt = `Enter a valid ${country.labels.existingDebt.toLowerCase()}.`;
  else if (input.existingDebt < 0) errors.existingDebt = `${country.labels.existingDebt} cannot be negative.`;

  if (!Number.isFinite(input.requestedAmount)) errors.requestedAmount = `Enter a valid ${country.labels.requested.toLowerCase()}.`;
  else if (input.requestedAmount <= 0) errors.requestedAmount = `${country.labels.requested} must be greater than 0.`;

  if (!Number.isFinite(input.termYears)) errors.termYears = `Enter a valid ${country.labels.term.toLowerCase()}.`;
  else if (input.termYears < loanType.minTermYears || input.termYears > loanType.maxTermYears) {
    errors.termYears = `${country.labels.term} must be between ${loanType.minTermYears} and ${loanType.maxTermYears} years.`;
  }

  if (!Number.isFinite(input.interestRatePercent)) errors.interestRatePercent = "Enter a valid interest rate.";
  else if (input.interestRatePercent < 0) errors.interestRatePercent = "Interest rate cannot be negative.";
  else if (input.interestRatePercent > LOAN_LIMITS.interestRatePercent.max) {
    errors.interestRatePercent = "Interest rate must be 40% or less.";
  }

  if (country.credit) {
    if (!Number.isFinite(input.creditScore)) errors.creditScore = `Enter a valid ${country.credit.label.toLowerCase()}.`;
    else if (input.creditScore < country.credit.min || input.creditScore > country.credit.max) {
      errors.creditScore = `${country.credit.label} must be between ${country.credit.min} and ${country.credit.max}.`;
    }
  }

  if (loanType.showDownPayment) {
    if (!Number.isFinite(input.downPayment)) errors.downPayment = `Enter a valid ${country.labels.downPayment.toLowerCase()}.`;
    else if (input.downPayment < 0) errors.downPayment = `${country.labels.downPayment} cannot be negative.`;
  }

  if (country.extras.age) {
    if (!Number.isFinite(input.age)) errors.age = "Enter a valid age.";
    else if (country.minAge != null && input.age < country.minAge) errors.age = `Age should be at least ${country.minAge}.`;
    else if (country.maxAge != null && input.age > country.maxAge) errors.age = `Age should be ${country.maxAge} or under.`;
  }

  if (country.extras.employmentMonths) {
    if (!Number.isFinite(input.employmentMonths)) errors.employmentMonths = "Enter months in the current job.";
    else if (input.employmentMonths < 0) errors.employmentMonths = "Months in the current job cannot be negative.";
  }

  return errors;
}

export function hasLoanErrors(errors: LoanValidation) {
  return Object.values(errors).some(Boolean);
}

export function calculateLoanEligibility(input: LoanEligibilityInput): LoanEligibilityResult {
  const country = getLoanCountry(input.country);
  const loanType = getLoanType(country, input.loanType);
  const employment = country.employmentTypes.find((item) => item.id === input.employmentId) ?? country.employmentTypes[0];
  const monthlyIncome = toMonthlyIncome(input.income, input.incomePeriod);
  const assessable = monthlyIncome * employment.incomeFactor;
  const caps = ratioCaps(country, input.salaryTransfer);
  const quotedRate = input.interestRatePercent;
  const band = country.credit ? creditBandFor(country.credit, input.creditScore) : null;
  const estimatedRate = quotedRate + (band?.rateAddon ?? 0);
  const qualifyRate = qualifyingRatePercent(loanType, quotedRate);

  const maxAffordablePayment = Math.max(0, assessable * caps.eligible - input.existingDebt);
  const maybeAffordablePayment = Math.max(0, assessable * caps.maybe - input.existingDebt);
  const eligibleLoanAmount = principalFromPayment(maxAffordablePayment, qualifyRate, input.termYears);
  const maybeLoanAmount = principalFromPayment(maybeAffordablePayment, qualifyRate, input.termYears);
  const requestedPayment = monthlyPayment(input.requestedAmount, quotedRate, input.termYears);
  const ratio = monthlyIncome > 0 ? (input.existingDebt + requestedPayment) / monthlyIncome : Infinity;
  const remainingIncome = monthlyIncome - input.existingDebt - requestedPayment;
  const ltv = loanType.showDownPayment ? ltvPercent(input.requestedAmount, input.downPayment) : null;

  let maxLtv = loanType.maybeLtv;
  let eligibleLtv = loanType.eligibleLtv;
  if (loanType.id === "home" && country.extras.residency && !input.resident && country.nonResidentMaxLtv != null) {
    maxLtv = Math.min(maxLtv, country.nonResidentMaxLtv);
    eligibleLtv = Math.min(eligibleLtv, country.nonResidentMaxLtv);
  }

  let status: EligibilityStatus = "eligible";
  const factors: Factor[] = [];

  if (monthlyIncome < country.minMonthlyIncome) {
    status = worseStatus(status, "not");
    factors.push({
      label: "Income below typical minimum",
      detail: `${country.labels.income} is under the planning floor used here.`,
      tone: "not",
    });
  }

  if (maxAffordablePayment <= 0) {
    status = worseStatus(status, "not");
    factors.push({
      label: "Existing debts use the full cap",
      detail: `${country.labels.existingDebt} already reach the ${country.labels.ratio} guideline, so there is no room for a new payment.`,
      tone: "not",
    });
  } else if (ratio > caps.maybe + 1e-6) {
    status = worseStatus(status, "not");
    factors.push({
      label: `${country.labels.ratio} above the ceiling`,
      detail: `${(ratio * 100).toFixed(1)}% is above the ${(caps.maybe * 100).toFixed(0)}% planning ceiling.`,
      tone: "not",
    });
  } else if (ratio > caps.eligible + 1e-6) {
    status = worseStatus(status, "maybe");
    factors.push({
      label: `${country.labels.ratio} in the stretch band`,
      detail: `${(ratio * 100).toFixed(1)}% is above the ${(caps.eligible * 100).toFixed(0)}% guideline but within ${(caps.maybe * 100).toFixed(0)}%.`,
      tone: "maybe",
    });
  } else {
    factors.push({
      label: `${country.labels.ratio} within guidelines`,
      detail: `${(ratio * 100).toFixed(1)}% vs a ${(caps.eligible * 100).toFixed(0)}% guideline.`,
      tone: "eligible",
    });
  }

  if (input.requestedAmount > maybeLoanAmount + 1) {
    status = worseStatus(status, "not");
    factors.push({
      label: "Requested amount above stretch capacity",
      detail: "Even the upper planning payment cannot support this principal at the qualifying rate.",
      tone: "not",
    });
  } else if (input.requestedAmount > eligibleLoanAmount + 1) {
    status = worseStatus(status, "maybe");
    factors.push({
      label: "Requested amount above standard eligibility",
      detail: "The amount sits between the standard and stretch loan caps.",
      tone: "maybe",
    });
  }

  if (band) {
    status = worseStatus(status, band.status);
    factors.push({
      label: `${country.credit!.label}: ${band.label}`,
      detail: `Score ${Math.round(input.creditScore)} is in the ${band.label.toLowerCase()} band${band.rateAddon ? ` (+${band.rateAddon.toFixed(1)}% estimated rate)` : ""}.`,
      tone: band.status,
    });
  }

  if (ltv != null) {
    if (ltv > maxLtv + 1e-6) {
      status = worseStatus(status, "not");
      factors.push({
        label: "Loan-to-value above the cap",
        detail: `${ltv.toFixed(1)}% LTV is above the ${maxLtv}% planning maximum for this product.`,
        tone: "not",
      });
    } else if (ltv > eligibleLtv + 1e-6) {
      status = worseStatus(status, "maybe");
      factors.push({
        label: "Loan-to-value in the stretch band",
        detail: `${ltv.toFixed(1)}% LTV is above the ${eligibleLtv}% standard but within ${maxLtv}%.`,
        tone: "maybe",
      });
    } else {
      factors.push({
        label: "Loan-to-value within guidelines",
        detail: `${ltv.toFixed(1)}% LTV vs a ${eligibleLtv}% standard.`,
        tone: "eligible",
      });
    }
  }

  if (employment.incomeFactor < 1) {
    factors.push({
      label: `${employment.label} income adjustment`,
      detail: `This model counts ${(employment.incomeFactor * 100).toFixed(0)}% of income for ${employment.label.toLowerCase()} applicants.`,
      tone: "neutral",
    });
  }

  if (qualifyRate > quotedRate + 1e-9) {
    factors.push({
      label: "Qualifying / assessment rate",
      detail: `Maximum loan is sized at ${qualifyRate.toFixed(2)}% (quoted ${quotedRate.toFixed(2)}%).`,
      tone: "neutral",
    });
  }

  if (country.extras.salaryTransfer && !input.salaryTransfer && country.noSalaryTransferRatio != null) {
    factors.push({
      label: "No salary transfer",
      detail: `Without salary transfer this model uses a ${(country.noSalaryTransferRatio * 100).toFixed(0)}% DBR cap.`,
      tone: "maybe",
    });
    status = worseStatus(status, "maybe");
  }

  if (country.extras.employmentMonths && country.minEmploymentMonths != null && input.employmentMonths < country.minEmploymentMonths) {
    status = worseStatus(status, "maybe");
    factors.push({
      label: "Short time with current employer",
      detail: `${input.employmentMonths} months vs a typical ${country.minEmploymentMonths}-month minimum.`,
      tone: "maybe",
    });
  }

  if (country.extras.age && country.maxAge != null && input.age + input.termYears > country.maxAge) {
    status = worseStatus(status, "maybe");
    factors.push({
      label: "Term may run past typical age limits",
      detail: `Age ${input.age} plus a ${input.termYears}-year term exceeds ${country.maxAge}.`,
      tone: "maybe",
    });
  }

  if (country.extras.residency && loanType.id === "home" && !input.resident) {
    factors.push({
      label: "Non-resident mortgage",
      detail: `LTV is capped at ${country.nonResidentMaxLtv ?? eligibleLtv}% for non-residents in this model.`,
      tone: "maybe",
    });
  }

  return {
    country: country.code,
    loanType: loanType.id,
    status,
    monthlyIncome,
    assessableMonthlyIncome: assessable,
    existingDebt: input.existingDebt,
    requestedAmount: input.requestedAmount,
    requestedPayment,
    maxAffordablePayment,
    eligibleLoanAmount,
    maybeLoanAmount,
    ratioPercent: ratio * 100,
    eligibleRatioPercent: caps.eligible * 100,
    maybeRatioPercent: caps.maybe * 100,
    quotedRate,
    estimatedRate,
    qualifyingRate: qualifyRate,
    creditLabel: band ? band.label : null,
    ltvPercent: ltv,
    remainingIncome,
    factors,
  };
}
