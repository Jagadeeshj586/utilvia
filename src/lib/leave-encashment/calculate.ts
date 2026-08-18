import {
  LEAVE_ENCASHMENT_RULES,
  type LeaveEncashmentBasis,
  type LeaveEncashmentType,
} from "./rules";

export { LEAVE_ENCASHMENT_RULES } from "./rules";
export type { LeaveEncashmentBasis, LeaveEncashmentType } from "./rules";

export type LeaveEncashmentInput = {
  monthlyBasic: number;
  leaveDays: number;
  encashmentType: LeaveEncashmentType;
  basis: LeaveEncashmentBasis;
  slabPercent: number;
};

export type LeaveEncashmentErrors = Partial<
  Record<"monthlyBasic" | "leaveDays" | "slabPercent", string>
>;

export type LeaveEncashmentResult = {
  monthlyBasic: number;
  leaveDays: number;
  encashmentType: LeaveEncashmentType;
  basis: LeaveEncashmentBasis;
  slabPercent: number;
  privateSectorAmount: number;
  governmentAmount: number;
  encashmentAmount: number;
  taxExemption: number;
  taxableAmount: number;
  taxPayable: number;
  netAfterTax: number;
  tenMonthsSalary: number;
  statutoryLimit: number;
};

export const DEFAULT_LEAVE_ENCASHMENT_INPUT: LeaveEncashmentInput = {
  monthlyBasic: LEAVE_ENCASHMENT_RULES.defaultMonthlyBasic,
  leaveDays: LEAVE_ENCASHMENT_RULES.defaultLeaveDays,
  encashmentType: LEAVE_ENCASHMENT_RULES.defaultEncashmentType,
  basis: LEAVE_ENCASHMENT_RULES.defaultBasis,
  slabPercent: LEAVE_ENCASHMENT_RULES.defaultSlabPercent,
};

function rupees(value: number) {
  return Math.round(value);
}

export function privateEncashment(monthlyBasic: number, leaveDays: number) {
  return (monthlyBasic / LEAVE_ENCASHMENT_RULES.privateWorkingDays) * leaveDays;
}

export function governmentEncashment(monthlyBasic: number, leaveDays: number) {
  return ((monthlyBasic * 12) / LEAVE_ENCASHMENT_RULES.governmentYearDays) * leaveDays;
}

export function validateLeaveEncashment(input: LeaveEncashmentInput): LeaveEncashmentErrors {
  const errors: LeaveEncashmentErrors = {};

  if (!Number.isFinite(input.monthlyBasic) || input.monthlyBasic < LEAVE_ENCASHMENT_RULES.minMonthlyBasic) {
    errors.monthlyBasic = "Enter a monthly basic salary greater than ₹0.";
  } else if (input.monthlyBasic > LEAVE_ENCASHMENT_RULES.maxMonthlyBasic) {
    errors.monthlyBasic = `Salary cannot exceed ₹${LEAVE_ENCASHMENT_RULES.maxMonthlyBasic.toLocaleString("en-IN")}.`;
  }

  if (
    !Number.isFinite(input.leaveDays) ||
    input.leaveDays < LEAVE_ENCASHMENT_RULES.minLeaveDays ||
    input.leaveDays > LEAVE_ENCASHMENT_RULES.maxLeaveDays
  ) {
    errors.leaveDays = `Enter leave days between ${LEAVE_ENCASHMENT_RULES.minLeaveDays} and ${LEAVE_ENCASHMENT_RULES.maxLeaveDays}.`;
  }

  if (
    !Number.isFinite(input.slabPercent) ||
    input.slabPercent < 0 ||
    input.slabPercent > LEAVE_ENCASHMENT_RULES.defaultSlabPercent
  ) {
    errors.slabPercent = "Choose a tax slab between 0% and 30%.";
  }

  return errors;
}

export function hasLeaveEncashmentErrors(errors: LeaveEncashmentErrors) {
  return Object.keys(errors).length > 0;
}

export function calculateLeaveEncashment(input: LeaveEncashmentInput): LeaveEncashmentResult | null {
  if (hasLeaveEncashmentErrors(validateLeaveEncashment(input))) return null;

  const privateSectorAmount = rupees(privateEncashment(input.monthlyBasic, input.leaveDays));
  const governmentAmount = rupees(governmentEncashment(input.monthlyBasic, input.leaveDays));
  const encashmentAmount = input.basis === "government" ? governmentAmount : privateSectorAmount;
  const tenMonthsSalary = rupees(input.monthlyBasic * LEAVE_ENCASHMENT_RULES.monthsSalaryCap);
  const statutoryLimit = LEAVE_ENCASHMENT_RULES.statutoryExemptionLimit;
  const taxExemption =
    input.encashmentType === "retirement"
      ? Math.min(encashmentAmount, tenMonthsSalary, statutoryLimit)
      : 0;
  const taxableAmount = Math.max(0, encashmentAmount - taxExemption);
  const taxPayable = rupees((input.slabPercent / 100) * taxableAmount);
  const netAfterTax = encashmentAmount - taxPayable;

  return {
    monthlyBasic: input.monthlyBasic,
    leaveDays: input.leaveDays,
    encashmentType: input.encashmentType,
    basis: input.basis,
    slabPercent: input.slabPercent,
    privateSectorAmount,
    governmentAmount,
    encashmentAmount,
    taxExemption,
    taxableAmount,
    taxPayable,
    netAfterTax,
    tenMonthsSalary,
    statutoryLimit,
  };
}

export const LEAVE_ENCASHMENT_FAQS = [
  {
    question: "Is leave encashment taxable in India?",
    answer:
      "Leave encashment during service is fully taxable as income. Leave encashment at retirement or resignation is partially exempt — the exemption is the minimum of the actual amount received, 10 months' salary, or ₹25 lakhs (the limit was raised from ₹3 lakhs to ₹25 lakhs in Budget 2023).",
  },
  {
    question: "How is leave encashment calculated for private sector employees?",
    answer: `For private sector employees, leave encashment is typically calculated as: (Monthly Basic Salary ÷ ${LEAVE_ENCASHMENT_RULES.privateWorkingDays} working days) × number of leave days to be encashed. Government employees often use (Basic × 12 ÷ ${LEAVE_ENCASHMENT_RULES.governmentYearDays}) × days. Some companies use 30 days per month — check your HR policy.`,
  },
  {
    question: "What is the ₹25 lakh leave encashment exemption?",
    answer: `Budget 2023 raised the tax exemption limit for leave encashment at retirement or resignation from ₹${(LEAVE_ENCASHMENT_RULES.previousExemptionLimit / 1_00_000).toFixed(0)} lakhs to ₹${(LEAVE_ENCASHMENT_RULES.statutoryExemptionLimit / 1_00_000).toFixed(0)} lakhs for non-government employees. The exempt amount is the lowest of actual encashment received, 10 months' salary, or that statutory limit.`,
  },
  {
    question: "Are casual leaves and sick leaves encashable?",
    answer:
      "Generally, only Earned Leave (EL) or Privilege Leave (PL) is eligible for encashment. Casual Leave (CL) and Sick Leave (SL) typically lapse unused and cannot be encashed, though specific rules depend on your employer's leave policy and applicable state labour laws.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Salary figures stay on your device.",
  },
] as const;
