export type PtGender = "male" | "female";

export type PtSlab = {
  minSalary: number;
  maxSalary: number | null;
  monthlyPT: number;
};

export type PtStateConfig = {
  name: string;
  slabs: PtSlab[];
  hasFebruaryExtra?: boolean;
  extraFebruaryAmount?: number;
  womenExemptUpto?: number;
  halfYearly?: boolean;
  notes?: string;
};

export const PT_NO_STATE_KEY = "no_pt";

export const PT_NON_LEVYING_STATES = [
  "Delhi",
  "Uttar Pradesh",
  "Rajasthan",
  "Haryana",
  "Punjab",
  "Uttarakhand",
  "Himachal Pradesh",
  "Goa",
  "Chhattisgarh",
  "Nagaland",
  "Arunachal Pradesh",
  "J&K",
  "Ladakh",
] as const;

export const PT_STATES: Record<string, PtStateConfig> = {
  maharashtra: {
    name: "Maharashtra",
    slabs: [
      { minSalary: 0, maxSalary: 7_500, monthlyPT: 0 },
      { minSalary: 7_501, maxSalary: 10_000, monthlyPT: 175 },
      { minSalary: 10_001, maxSalary: null, monthlyPT: 200 },
    ],
    hasFebruaryExtra: true,
    extraFebruaryAmount: 100,
    womenExemptUpto: 25_000,
    notes:
      "Women earning ≤ ₹25,000/month are exempt. February PT is ₹300 (₹200 + ₹100 extra) for annual total of ₹2,500.",
  },
  karnataka: {
    name: "Karnataka",
    slabs: [
      { minSalary: 0, maxSalary: 14_999, monthlyPT: 0 },
      { minSalary: 15_000, maxSalary: 24_999, monthlyPT: 150 },
      { minSalary: 25_000, maxSalary: null, monthlyPT: 200 },
    ],
    notes: "Annual max: ₹2,400",
  },
  telangana: {
    name: "Telangana",
    slabs: [
      { minSalary: 0, maxSalary: 14_999, monthlyPT: 0 },
      { minSalary: 15_000, maxSalary: 19_999, monthlyPT: 150 },
      { minSalary: 20_000, maxSalary: null, monthlyPT: 200 },
    ],
  },
  andhra_pradesh: {
    name: "Andhra Pradesh",
    slabs: [
      { minSalary: 0, maxSalary: 14_999, monthlyPT: 0 },
      { minSalary: 15_000, maxSalary: 19_999, monthlyPT: 150 },
      { minSalary: 20_000, maxSalary: null, monthlyPT: 200 },
    ],
  },
  west_bengal: {
    name: "West Bengal",
    slabs: [
      { minSalary: 0, maxSalary: 10_000, monthlyPT: 0 },
      { minSalary: 10_001, maxSalary: 15_000, monthlyPT: 110 },
      { minSalary: 15_001, maxSalary: 25_000, monthlyPT: 130 },
      { minSalary: 25_001, maxSalary: 40_000, monthlyPT: 150 },
      { minSalary: 40_001, maxSalary: null, monthlyPT: 200 },
    ],
    notes: "Annual max: ₹2,400",
  },
  gujarat: {
    name: "Gujarat",
    slabs: [
      { minSalary: 0, maxSalary: 5_999, monthlyPT: 0 },
      { minSalary: 6_000, maxSalary: 8_999, monthlyPT: 80 },
      { minSalary: 9_000, maxSalary: 11_999, monthlyPT: 150 },
      { minSalary: 12_000, maxSalary: null, monthlyPT: 200 },
    ],
  },
  tamil_nadu: {
    name: "Tamil Nadu",
    slabs: [
      { minSalary: 0, maxSalary: 3_500, monthlyPT: 0 },
      { minSalary: 3_501, maxSalary: 5_000, monthlyPT: 22 },
      { minSalary: 5_001, maxSalary: 7_500, monthlyPT: 37 },
      { minSalary: 7_501, maxSalary: 10_000, monthlyPT: 57 },
      { minSalary: 10_001, maxSalary: 12_500, monthlyPT: 67 },
      { minSalary: 12_501, maxSalary: null, monthlyPT: 208 },
    ],
    halfYearly: true,
    notes: "Half-yearly basis (April-Sept and Oct-March). Monthly values shown for display only.",
  },
  kerala: {
    name: "Kerala",
    slabs: [
      { minSalary: 0, maxSalary: 1_999, monthlyPT: 0 },
      { minSalary: 2_000, maxSalary: 3_999, monthlyPT: 20 },
      { minSalary: 4_000, maxSalary: 5_999, monthlyPT: 30 },
      { minSalary: 6_000, maxSalary: 8_999, monthlyPT: 50 },
      { minSalary: 9_000, maxSalary: 11_999, monthlyPT: 75 },
      { minSalary: 12_000, maxSalary: 17_999, monthlyPT: 100 },
      { minSalary: 18_000, maxSalary: null, monthlyPT: 125 },
    ],
    halfYearly: true,
    notes: "Half-yearly payment. Monthly values shown for display.",
  },
  madhya_pradesh: {
    name: "Madhya Pradesh",
    slabs: [
      { minSalary: 0, maxSalary: 18_749, monthlyPT: 0 },
      { minSalary: 18_750, maxSalary: null, monthlyPT: 208 },
    ],
  },
  assam: {
    name: "Assam",
    slabs: [
      { minSalary: 0, maxSalary: 9_999, monthlyPT: 0 },
      { minSalary: 10_000, maxSalary: 14_999, monthlyPT: 150 },
      { minSalary: 15_000, maxSalary: null, monthlyPT: 208 },
    ],
  },
  odisha: {
    name: "Odisha",
    slabs: [
      { minSalary: 0, maxSalary: 13_304, monthlyPT: 0 },
      { minSalary: 13_305, maxSalary: null, monthlyPT: 125 },
    ],
  },
  jharkhand: {
    name: "Jharkhand",
    slabs: [
      { minSalary: 0, maxSalary: 24_999, monthlyPT: 0 },
      { minSalary: 25_000, maxSalary: 41_666, monthlyPT: 100 },
      { minSalary: 41_667, maxSalary: null, monthlyPT: 150 },
    ],
  },
  bihar: {
    name: "Bihar",
    slabs: [
      { minSalary: 0, maxSalary: 24_999, monthlyPT: 0 },
      { minSalary: 25_000, maxSalary: null, monthlyPT: 208 },
    ],
  },
  meghalaya: {
    name: "Meghalaya",
    slabs: [
      { minSalary: 0, maxSalary: 4_166, monthlyPT: 0 },
      { minSalary: 4_167, maxSalary: 6_250, monthlyPT: 16 },
      { minSalary: 6_251, maxSalary: 8_333, monthlyPT: 25 },
      { minSalary: 8_334, maxSalary: null, monthlyPT: 208 },
    ],
  },
  tripura: {
    name: "Tripura",
    slabs: [
      { minSalary: 0, maxSalary: 7_500, monthlyPT: 0 },
      { minSalary: 7_501, maxSalary: 15_000, monthlyPT: 150 },
      { minSalary: 15_001, maxSalary: null, monthlyPT: 208 },
    ],
  },
  sikkim: {
    name: "Sikkim",
    slabs: [
      { minSalary: 0, maxSalary: 19_999, monthlyPT: 0 },
      { minSalary: 20_000, maxSalary: null, monthlyPT: 208 },
    ],
  },
  manipur: {
    name: "Manipur",
    slabs: [
      { minSalary: 0, maxSalary: 5_000, monthlyPT: 0 },
      { minSalary: 5_001, maxSalary: 9_000, monthlyPT: 50 },
      { minSalary: 9_001, maxSalary: null, monthlyPT: 100 },
    ],
  },
  mizoram: {
    name: "Mizoram",
    slabs: [
      { minSalary: 0, maxSalary: 4_999, monthlyPT: 0 },
      { minSalary: 5_000, maxSalary: 8_333, monthlyPT: 125 },
      { minSalary: 8_334, maxSalary: null, monthlyPT: 208 },
    ],
  },
};

export const PT_STATE_OPTIONS = [
  ...Object.entries(PT_STATES).map(([value, config]) => ({ value, label: config.name })),
  { value: PT_NO_STATE_KEY, label: "My state doesn't levy PT (Delhi, UP, Haryana…)" },
];

export const PT_RULES = {
  rulesLabel: "Based on Indian state Professional Tax slabs — FY 2026-27",
  financialYear: "FY 2026-27",
  defaultState: "maharashtra",
  defaultSalary: 50_000,
  defaultGender: "male" as PtGender,
  taxSavingRate: 0.312,
  februaryNote:
    "February PT is ₹300 (not ₹200) — this is the Maharashtra annual total adjustment to reach ₹2,500.",
} as const;
