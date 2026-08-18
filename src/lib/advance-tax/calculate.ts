import {
  ADVANCE_TAX_RULES,
  type AdvanceTaxIncomeType,
  type AdvanceTaxRegime,
} from "./rules";

export { ADVANCE_TAX_RULES } from "./rules";
export type { AdvanceTaxIncomeType, AdvanceTaxRegime } from "./rules";

export type AdvanceTaxInput = {
  income: number;
  incomeType: AdvanceTaxIncomeType;
  tds: number;
  regime: AdvanceTaxRegime;
};

export type AdvanceTaxErrors = Partial<Record<"income" | "tds", string>>;

export type AdvanceTaxInstallment = {
  id: string;
  label: string;
  dueDate: string;
  cumulativePercent: number;
  cumulativeDue: number;
  amountDue: number;
};

export type AdvanceTaxResult = {
  income: number;
  incomeType: AdvanceTaxIncomeType;
  tds: number;
  regime: AdvanceTaxRegime;
  standardDeduction: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate: number;
  taxBeforeCess: number;
  cess: number;
  totalTax: number;
  netTax: number;
  required: boolean;
  singleMarchPayment: boolean;
  adaOverCap: boolean;
  installments: AdvanceTaxInstallment[];
};

export const DEFAULT_ADVANCE_TAX_INPUT: AdvanceTaxInput = {
  income: ADVANCE_TAX_RULES.defaultIncome,
  incomeType: ADVANCE_TAX_RULES.defaultIncomeType,
  tds: ADVANCE_TAX_RULES.defaultTds,
  regime: ADVANCE_TAX_RULES.defaultRegime,
};

function rupees(value: number) {
  return Math.round(value);
}

function slabTax(income: number, slabs: typeof ADVANCE_TAX_RULES.newSlabs | typeof ADVANCE_TAX_RULES.oldSlabs) {
  let tax = 0;
  let previous = 0;
  for (const slab of slabs) {
    if (income <= previous) break;
    tax += (Math.min(income, slab.upTo) - previous) * slab.rate;
    previous = slab.upTo;
  }
  return tax;
}

export function standardDeductionFor(incomeType: AdvanceTaxIncomeType, regime: AdvanceTaxRegime) {
  if (incomeType !== "salaried") return 0;
  return regime === "new" ? ADVANCE_TAX_RULES.newStandardDeduction : ADVANCE_TAX_RULES.oldStandardDeduction;
}

export function taxableIncomeFor(input: AdvanceTaxInput) {
  if (input.incomeType === "44ada") {
    return Math.max(0, input.income * (ADVANCE_TAX_RULES.adaDeemedPercent / 100));
  }
  return Math.max(0, input.income - standardDeductionFor(input.incomeType, input.regime));
}

export function computeIncomeTax(taxable: number, regime: AdvanceTaxRegime) {
  const slabs = regime === "new" ? ADVANCE_TAX_RULES.newSlabs : ADVANCE_TAX_RULES.oldSlabs;
  const taxBeforeRebate = slabTax(taxable, slabs);
  const rebate =
    regime === "new"
      ? taxable <= ADVANCE_TAX_RULES.newRebateLimit
        ? Math.min(taxBeforeRebate, ADVANCE_TAX_RULES.newRebateCap)
        : 0
      : taxable <= ADVANCE_TAX_RULES.oldRebateLimit
        ? Math.min(taxBeforeRebate, ADVANCE_TAX_RULES.oldRebateCap)
        : 0;
  const taxBeforeCess = Math.max(0, taxBeforeRebate - rebate);
  const cess = taxBeforeCess * (ADVANCE_TAX_RULES.cessPercent / 100);
  return {
    taxBeforeRebate,
    rebate,
    taxBeforeCess,
    cess,
    totalTax: rupees(taxBeforeCess + cess),
  };
}

export function validateAdvanceTax(input: AdvanceTaxInput): AdvanceTaxErrors {
  const errors: AdvanceTaxErrors = {};

  if (!Number.isFinite(input.income) || input.income < ADVANCE_TAX_RULES.minIncome) {
    errors.income = "Enter estimated annual income greater than ₹0.";
  } else if (input.income > ADVANCE_TAX_RULES.maxIncome) {
    errors.income = "Income is above the amount this calculator can model.";
  }

  if (!Number.isFinite(input.tds) || input.tds < ADVANCE_TAX_RULES.minTds) {
    errors.tds = "TDS cannot be negative.";
  } else if (input.tds > ADVANCE_TAX_RULES.maxTds) {
    errors.tds = "TDS is above the amount this calculator can model.";
  }

  return errors;
}

export function hasAdvanceTaxErrors(errors: AdvanceTaxErrors) {
  return Object.keys(errors).length > 0;
}

function installmentsFor(netTax: number, incomeType: AdvanceTaxIncomeType): AdvanceTaxInstallment[] {
  const schedule =
    incomeType === "44ada" ? ADVANCE_TAX_RULES.adaInstallments : ADVANCE_TAX_RULES.quarterlyInstallments;
  let previous = 0;
  return schedule.map((item) => {
    const cumulativeDue = rupees((netTax * item.cumulativePercent) / 100);
    const amountDue = Math.max(0, cumulativeDue - previous);
    previous = cumulativeDue;
    return {
      id: item.id,
      label: item.label,
      dueDate: item.dueDate,
      cumulativePercent: item.cumulativePercent,
      cumulativeDue,
      amountDue,
    };
  });
}

export function calculateAdvanceTax(input: AdvanceTaxInput): AdvanceTaxResult | null {
  if (hasAdvanceTaxErrors(validateAdvanceTax(input))) return null;

  const standardDeduction = standardDeductionFor(input.incomeType, input.regime);
  const taxableIncome = rupees(taxableIncomeFor(input));
  const tax = computeIncomeTax(taxableIncome, input.regime);
  const netTax = Math.max(0, tax.totalTax - rupees(input.tds));

  return {
    income: input.income,
    incomeType: input.incomeType,
    tds: rupees(input.tds),
    regime: input.regime,
    standardDeduction,
    taxableIncome,
    taxBeforeRebate: rupees(tax.taxBeforeRebate),
    rebate: rupees(tax.rebate),
    taxBeforeCess: rupees(tax.taxBeforeCess),
    cess: rupees(tax.cess),
    totalTax: tax.totalTax,
    netTax,
    required: netTax > ADVANCE_TAX_RULES.threshold,
    singleMarchPayment: input.incomeType === "44ada",
    adaOverCap: input.incomeType === "44ada" && input.income > ADVANCE_TAX_RULES.adaReceiptsSoftCap,
    installments: installmentsFor(netTax, input.incomeType),
  };
}

export const ADVANCE_TAX_FAQS = [
  {
    question: "Who needs to pay advance tax in India?",
    answer:
      "Advance tax is due when estimated tax liability after TDS exceeds ₹10,000 in a financial year. Salaried people with extra income (rent, capital gains, freelance), businesses, and professionals typically need it. Senior citizens without business income are generally exempt.",
  },
  {
    question: "What are the advance tax due dates for FY 2026-27?",
    answer:
      "Pay at least 15% by 15 June 2026, 45% by 15 September 2026, 75% by 15 December 2026, and 100% by 15 March 2027. Percentages are cumulative. Under Section 44ADA you may pay 100% in a single installment on or before 15 March 2027.",
  },
  {
    question: "What is the penalty for not paying advance tax?",
    answer:
      "Interest under Section 234B is 1% per month on unpaid tax if you miss advance tax. Section 234C adds 1% per month for each quarter you fall short of the cumulative installment. Paying on time avoids both.",
  },
  {
    question: "Do freelancers under Section 44ADA need to pay quarterly advance tax?",
    answer:
      "No. Presumptive professionals under Section 44ADA can pay 100% of advance tax in one installment on or before 15 March. 50% of gross receipts is treated as taxable income. If receipts exceed the 44ADA cap, maintain books and follow the four-installment schedule.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Income figures stay on your device.",
  },
] as const;
