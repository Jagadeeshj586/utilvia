export type TaxRegime = "new" | "old";
export type TaxAgeGroup = "below60" | "60-80" | "above80";
export type TaxFy = "2024-25" | "2025-26";

export type IndiaTaxInput = {
  ctc: number;
  regime: TaxRegime;
  deduction80c?: number;
  deduction80d?: number;
  homeLoanInterest?: number;
  nps80ccd1b?: number;
  hraExemption?: number;
  includeEpf?: boolean;
  age?: TaxAgeGroup;
  fy?: TaxFy;
};

export type IndiaTaxResult = {
  taxable: number;
  taxBeforeRebate: number;
  rebate: number;
  taxBeforeCess: number;
  cess: number;
  annualTax: number;
  epfAnnual: number;
  standardDeduction: number;
  extraDeductions: number;
  takeHomeAnnual: number;
  takeHomeMonthly: number;
  effectiveRate: number;
  rebateApplied: boolean;
};

function slabTax(income: number, slabs: Array<[number, number]>) {
  let tax = 0;
  let previous = 0;
  for (const [limit, rate] of slabs) {
    if (income <= previous) break;
    tax += (Math.min(income, limit) - previous) * rate;
    previous = limit;
  }
  return tax;
}

function oldRegimeSlabs(age: TaxAgeGroup): Array<[number, number]> {
  const nil = age === "above80" ? 500_000 : age === "60-80" ? 300_000 : 250_000;
  return [
    [nil, 0],
    [500_000, 0.05],
    [1_000_000, 0.2],
    [Infinity, 0.3],
  ];
}

export function calculateIndiaTax({
  ctc,
  regime,
  deduction80c = 0,
  deduction80d = 0,
  homeLoanInterest = 0,
  nps80ccd1b = 0,
  hraExemption = 0,
  includeEpf = true,
  age = "below60",
  fy = "2025-26",
}: IndiaTaxInput): IndiaTaxResult {
  const income = Math.max(0, ctc);
  const standardDeduction = regime === "new" ? 75_000 : 50_000;
  const epfAnnual = includeEpf ? Math.min(income * 0.4, 180_000) * 0.12 : 0;
  const extraDeductions =
    regime === "old"
      ? Math.min(Math.max(0, deduction80c), 150_000) +
        Math.min(Math.max(0, deduction80d), age === "below60" ? 25_000 : 50_000) +
        Math.min(Math.max(0, homeLoanInterest), 200_000) +
        Math.min(Math.max(0, nps80ccd1b), 50_000) +
        Math.max(0, hraExemption) +
        epfAnnual
      : 0;
  const taxable = Math.max(0, income - standardDeduction - extraDeductions);

  let taxBeforeRebate = 0;
  let rebate = 0;
  if (regime === "new") {
    if (fy === "2024-25") {
      taxBeforeRebate = slabTax(taxable, [
        [300_000, 0],
        [700_000, 0.05],
        [1_000_000, 0.1],
        [1_200_000, 0.15],
        [1_500_000, 0.2],
        [Infinity, 0.3],
      ]);
      if (taxable <= 700_000) rebate = taxBeforeRebate;
    } else {
      taxBeforeRebate = slabTax(taxable, [
        [400_000, 0],
        [800_000, 0.05],
        [1_200_000, 0.1],
        [1_600_000, 0.15],
        [2_000_000, 0.2],
        [2_400_000, 0.25],
        [Infinity, 0.3],
      ]);
      if (taxable <= 1_200_000) rebate = taxBeforeRebate;
    }
  } else {
    taxBeforeRebate = slabTax(taxable, oldRegimeSlabs(age));
    if (taxable <= 500_000) rebate = taxBeforeRebate;
  }

  const taxBeforeCess = Math.max(0, taxBeforeRebate - rebate);
  const cess = taxBeforeCess * 0.04;
  const annualTax = taxBeforeCess + cess;
  const takeHomeAnnual = income - annualTax - epfAnnual;
  return {
    taxable,
    taxBeforeRebate,
    rebate,
    taxBeforeCess,
    cess,
    annualTax,
    epfAnnual,
    standardDeduction,
    extraDeductions,
    takeHomeAnnual,
    takeHomeMonthly: takeHomeAnnual / 12,
    effectiveRate: income ? (annualTax / income) * 100 : 0,
    rebateApplied: rebate > 0,
  };
}
