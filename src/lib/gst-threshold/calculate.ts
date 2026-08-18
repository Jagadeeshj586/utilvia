export const GST_THRESHOLD_RULES = {
  rulesLabel: "Based on GST registration thresholds — FY 2026-27",
  fyLabel: "FY 2026-27",
  regularServices: 20_00_000,
  regularGoods: 40_00_000,
  specialServices: 10_00_000,
  specialGoods: 20_00_000,
  defaultTurnover: 15_00_000,
  minTurnover: 0,
  maxTurnover: 10_00_00_000,
  portal: "gst.gov.in",
} as const;

export type GstSupplyType = "services" | "goods" | "both";
export type GstStateKind = "regular" | "special";

export type GstThresholdInput = {
  turnover: number;
  supply: GstSupplyType;
  state: GstStateKind;
  interstate: boolean;
  exportSupply: boolean;
  digitalOverseas: boolean;
};

export type GstMandatoryReason = "interstate" | "export" | "digital" | "threshold";

export type GstThresholdResult = {
  threshold: number;
  turnover: number;
  mandatory: boolean;
  reason: GstMandatoryReason | null;
  headline: string;
  detail: string;
};

export type GstThresholdErrors = Partial<Record<"turnover", string>>;

export const SUPPLY_OPTIONS: { id: GstSupplyType; label: string }[] = [
  { id: "services", label: "Services" },
  { id: "goods", label: "Goods" },
  { id: "both", label: "Both" },
];

export const STATE_OPTIONS: { id: GstStateKind; label: string }[] = [
  { id: "regular", label: "Regular state (Delhi, Maharashtra, Karnataka, etc.)" },
  { id: "special", label: "Special Category State (J&K, NE states, HP, Uttarakhand)" },
];

export const DEFAULT_GST_THRESHOLD_INPUT: GstThresholdInput = {
  turnover: GST_THRESHOLD_RULES.defaultTurnover,
  supply: "services",
  state: "regular",
  interstate: false,
  exportSupply: false,
  digitalOverseas: false,
};

export function gstThresholdAmount(supply: GstSupplyType, state: GstStateKind) {
  const goods = supply === "goods";
  if (state === "special") {
    return goods ? GST_THRESHOLD_RULES.specialGoods : GST_THRESHOLD_RULES.specialServices;
  }
  return goods ? GST_THRESHOLD_RULES.regularGoods : GST_THRESHOLD_RULES.regularServices;
}

export function validateGstThreshold(input: GstThresholdInput): GstThresholdErrors {
  const errors: GstThresholdErrors = {};
  if (
    !Number.isFinite(input.turnover) ||
    input.turnover < GST_THRESHOLD_RULES.minTurnover ||
    input.turnover > GST_THRESHOLD_RULES.maxTurnover
  ) {
    errors.turnover = "Enter your annual aggregate turnover in rupees.";
  }
  return errors;
}

export function hasGstThresholdErrors(errors: GstThresholdErrors) {
  return Object.keys(errors).length > 0;
}

function formatRupees(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function calculateGstThreshold(input: GstThresholdInput): GstThresholdResult | null {
  if (hasGstThresholdErrors(validateGstThreshold(input))) return null;

  const threshold = gstThresholdAmount(input.supply, input.state);
  const over = input.turnover >= threshold;

  let reason: GstMandatoryReason | null = null;
  if (input.interstate) reason = "interstate";
  else if (input.digitalOverseas) reason = "digital";
  else if (input.exportSupply) reason = "export";
  else if (over) reason = "threshold";

  const situation = `Threshold for your situation: ${formatRupees(threshold)}. Your turnover: ${formatRupees(input.turnover)}.`;
  const register =
    "You must register on the GST portal (gst.gov.in) within 30 days of becoming liable.";

  if (reason === null) {
    return {
      threshold,
      turnover: input.turnover,
      mandatory: false,
      reason: null,
      headline: "GST registration is NOT mandatory for you.",
      detail: `${situation} Registration not required. Note: You can voluntarily register for GST if you have B2B clients who need GST invoices or if you plan to export.`,
    };
  }

  const reasonText: Record<GstMandatoryReason, string> = {
    interstate: "Inter-state supply requires GST registration regardless of turnover.",
    export: "Export of services/goods requires GST registration regardless of turnover (zero-rated with LUT).",
    digital: "Digital/IT services to overseas clients require GST registration regardless of turnover.",
    threshold: "Your annual aggregate turnover exceeds the GST registration threshold.",
  };

  return {
    threshold,
    turnover: input.turnover,
    mandatory: true,
    reason,
    headline: "GST Registration is MANDATORY for you.",
    detail: `Reason: ${reasonText[reason]} ${situation} ${register}`,
  };
}

export function gstThresholdCopyText(result: GstThresholdResult) {
  return result.headline;
}

export const GST_THRESHOLD_FAQS = [
  {
    question: "What is the GST registration threshold for freelancers in India?",
    answer:
      "For service providers in regular states, GST registration is mandatory when annual aggregate turnover exceeds ₹20 lakhs. For special category states, the threshold is ₹10 lakhs. Goods in regular states use a ₹40 lakh limit.",
  },
  {
    question: "Do IT freelancers who export services need GST registration?",
    answer:
      "If aggregate turnover exceeds ₹20 lakhs, yes. Exports are zero-rated — no GST charged to foreign clients, but registration is needed for LUT. This checker also flags overseas digital/IT work as requiring registration.",
  },
  {
    question: "Is GST mandatory for inter-state supply regardless of turnover?",
    answer: "Yes — any inter-state taxable supply requires GST registration regardless of annual turnover.",
  },
  {
    question: "Can I register for GST voluntarily below ₹20 lakhs?",
    answer:
      "Yes — voluntary registration allows Input Tax Credit and proper GST invoices for B2B clients.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes. It runs in your browser with no signup. Your numbers stay on your device.",
  },
];
