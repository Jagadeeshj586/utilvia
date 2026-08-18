import {
  PT_NON_LEVYING_STATES,
  PT_NO_STATE_KEY,
  PT_RULES,
  PT_STATES,
  type PtGender,
  type PtStateConfig,
} from "./rules";

export { PT_NON_LEVYING_STATES, PT_NO_STATE_KEY, PT_RULES, PT_STATE_OPTIONS, PT_STATES } from "./rules";
export type { PtGender, PtSlab, PtStateConfig } from "./rules";

export type ProfessionalTaxInput = {
  stateKey: string;
  monthlySalary: number;
  gender: PtGender;
};

export type ProfessionalTaxResult = {
  stateKey: string;
  stateName: string;
  monthlySalary: number;
  gender: PtGender;
  noPtState: boolean;
  exempt: boolean;
  exemptReason?: string;
  monthlyPT: number;
  februaryPT: number | null;
  annualPT: number;
  incomeTaxSaving: number;
  halfYearlyNote?: string;
  stateNotes?: string;
  februaryNote?: string;
};

export const DEFAULT_PT_INPUT: ProfessionalTaxInput = {
  stateKey: PT_RULES.defaultState,
  monthlySalary: PT_RULES.defaultSalary,
  gender: PT_RULES.defaultGender,
};

function applyGenderExemption(salary: number, config: PtStateConfig, gender: PtGender) {
  if (config.womenExemptUpto && gender === "female" && salary <= config.womenExemptUpto) {
    return {
      pt: 0,
      exempt: true,
      exemptReason: `Maharashtra women earning up to ₹${config.womenExemptUpto.toLocaleString("en-IN")}/month are exempt from Professional Tax.`,
    };
  }
  const slab = config.slabs.find(
    (item) => salary >= item.minSalary && (item.maxSalary === null || salary <= item.maxSalary),
  );
  return { pt: slab?.monthlyPT ?? 0, exempt: false as const, exemptReason: undefined };
}

function annualFromMonthly(monthly: number, config: PtStateConfig) {
  if (monthly === 0) return 0;
  if (config.hasFebruaryExtra) {
    const february = monthly + (config.extraFebruaryAmount ?? 0);
    return 11 * monthly + february;
  }
  return 12 * monthly;
}

export function parsePtSalary(raw: string) {
  const cleaned = raw.replace(/[₹$,\s]/g, "");
  if (!cleaned) return 0;
  const value = Number.parseFloat(cleaned.replace(/,/g, ""));
  return Number.isFinite(value) ? value : 0;
}

export function calculateProfessionalTax(input: ProfessionalTaxInput): ProfessionalTaxResult | null {
  if (input.monthlySalary < 0) return null;

  if (input.stateKey === PT_NO_STATE_KEY) {
    return {
      stateKey: PT_NO_STATE_KEY,
      stateName: "No PT State",
      monthlySalary: input.monthlySalary,
      gender: input.gender,
      noPtState: true,
      exempt: true,
      exemptReason: `Your state does not levy Professional Tax. States without PT include ${PT_NON_LEVYING_STATES.slice(0, 5).join(", ")}, and others.`,
      monthlyPT: 0,
      februaryPT: null,
      annualPT: 0,
      incomeTaxSaving: 0,
    };
  }

  const config = PT_STATES[input.stateKey];
  if (!config) return null;

  const { pt, exempt, exemptReason } = applyGenderExemption(input.monthlySalary, config, input.gender);
  const februaryPT = config.hasFebruaryExtra && pt !== 0 ? pt + (config.extraFebruaryAmount ?? 0) : null;
  const annualPT = annualFromMonthly(pt, config);

  return {
    stateKey: input.stateKey,
    stateName: config.name,
    monthlySalary: input.monthlySalary,
    gender: input.gender,
    noPtState: false,
    exempt,
    exemptReason,
    monthlyPT: pt,
    februaryPT,
    annualPT,
    incomeTaxSaving: PT_RULES.taxSavingRate * annualPT,
    halfYearlyNote: config.halfYearly
      ? `${config.name} levies PT half-yearly. Consult your employer for exact billing cycle.`
      : undefined,
    stateNotes: config.notes,
    februaryNote: config.hasFebruaryExtra && pt > 0 ? PT_RULES.februaryNote : undefined,
  };
}

export const PROFESSIONAL_TAX_FAQS = [
  {
    question: "What is the maximum Professional Tax in India?",
    answer:
      "Article 276 of the Constitution caps professional tax at ₹2,500 per person per year. Maharashtra reaches that cap with ₹200 for eleven months and ₹300 in February.",
  },
  {
    question: "Which states in India don't have Professional Tax?",
    answer: `States and UTs without professional tax include ${PT_NON_LEVYING_STATES.join(", ")}. Choose “My state doesn't levy PT” in the calculator if you work in one of these.`,
  },
  {
    question: "Why is Maharashtra PT ₹300 in February?",
    answer:
      "Maharashtra deducts ₹200 for eleven months (₹2,200) and ₹300 in February so the annual total is exactly ₹2,500, the constitutional maximum.",
  },
  {
    question: "Are women exempt from Professional Tax in Maharashtra?",
    answer:
      "Yes. Women earning up to ₹25,000 per month are exempt in Maharashtra. Above that, the same ₹200 / February ₹300 slab as other employees applies.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Salary figures stay on your device.",
  },
] as const;
