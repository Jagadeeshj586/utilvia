export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "lightly-active"
  | "moderately-active"
  | "very-active"
  | "extra-active";

export type GoalLevel = "maintain" | "mild" | "moderate" | "aggressive";

export type UnitSystem = "metric" | "imperial";

export const ACTIVITY_OPTIONS: Array<{ id: ActivityLevel; label: string; multiplier: number }> = [
  { id: "sedentary", label: "Sedentary (little or no exercise)", multiplier: 1.2 },
  { id: "lightly-active", label: "Lightly active (1–3 days/week)", multiplier: 1.375 },
  { id: "moderately-active", label: "Moderately active (3–5 days/week)", multiplier: 1.55 },
  { id: "very-active", label: "Very active (6–7 days/week)", multiplier: 1.725 },
  { id: "extra-active", label: "Extra active (physical job or 2× training)", multiplier: 1.9 },
];

export const GOAL_OPTIONS: Array<{ id: GoalLevel; label: string; deficit: number }> = [
  { id: "maintain", label: "Maintain weight", deficit: 0 },
  { id: "mild", label: "Mild deficit (~250 cal/day)", deficit: 250 },
  { id: "moderate", label: "Moderate deficit (~500 cal/day)", deficit: 500 },
  { id: "aggressive", label: "Aggressive deficit (~750+ cal/day)", deficit: 750 },
];

export const KG_PER_LB = 0.453592;
export const CM_PER_INCH = 2.54;

export type CalorieInput = {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityLevel;
  goal: GoalLevel;
};

export type CalorieResult = {
  bmr: number;
  tdee: number;
  deficit: number;
  dailyTarget: number;
};

export function toKg(weight: number, unit: UnitSystem) {
  return unit === "metric" ? weight : weight * KG_PER_LB;
}

export function toCm(height: number, unit: UnitSystem) {
  return unit === "metric" ? height : height * CM_PER_INCH;
}

export function fromKg(weightKg: number, unit: UnitSystem) {
  return unit === "metric" ? weightKg : weightKg / KG_PER_LB;
}

export function fromCm(heightCm: number, unit: UnitSystem) {
  return unit === "metric" ? heightCm : heightCm / CM_PER_INCH;
}

export function calculateBmr(weightKg: number, heightCm: number, age: number, sex: Sex) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateCalorieDeficit(input: CalorieInput): CalorieResult | null {
  const { sex, age, weightKg, heightCm, activity, goal } = input;
  if (![age, weightKg, heightCm].every((value) => Number.isFinite(value) && value > 0)) return null;

  const activityMultiplier = ACTIVITY_OPTIONS.find((item) => item.id === activity)?.multiplier ?? 1.55;
  const deficit = GOAL_OPTIONS.find((item) => item.id === goal)?.deficit ?? 500;
  const bmr = Math.round(calculateBmr(weightKg, heightCm, age, sex));
  const tdee = Math.round(bmr * activityMultiplier);
  const dailyTarget = Math.max(0, tdee - deficit);

  return {
    bmr,
    tdee,
    deficit,
    dailyTarget,
  };
}

export const CALORIE_DEFICIT_FAQS = [
  {
    question: "What's the difference between BMR and TDEE?",
    answer:
      "BMR is an estimate of calories burned at complete rest. TDEE multiplies BMR by an activity factor to estimate daily maintenance calories.",
  },
  {
    question: "How big a deficit is reasonable?",
    answer:
      "A mild (~250) or moderate (~500) daily deficit is commonly used for gradual weight loss. Larger deficits can be harder to sustain — estimates are not medical advice.",
  },
  {
    question: "Is Mifflin-St Jeor exact?",
    answer:
      "No. Mifflin–St Jeor is a widely used estimation formula. Individual metabolism, body composition, and activity can differ from the estimate.",
  },
  {
    question: "Should I consult a doctor?",
    answer:
      "Yes, if you have a medical condition, are pregnant or breastfeeding, are under 18, or have concerns about nutrition or weight. This tool is informational only.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. This calculator is free to use with no signup required.",
  },
] as const;
