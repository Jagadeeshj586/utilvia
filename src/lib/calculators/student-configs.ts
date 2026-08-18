import { formatNum } from "@/lib/utils";
import { toWordsIndian } from "@/lib/number-to-words/convert";
import type { CalcConfig } from "@/components/tools/shared/formula-calculator";

const n = (values: Record<string, string | number>, id: string) => Number(values[id]) || 0;
const s = (values: Record<string, string | number>, id: string) => String(values[id] ?? "");

export const STUDENT_CONFIGS: Record<string, CalcConfig> = {
  "cgpa-to-percentage": {
    fields: [
      { id: "cgpa", label: "CGPA", kind: "number", default: 8.2, step: 0.01, max: 10 },
      { id: "scale", label: "Conversion", kind: "select", default: "9.5", options: [
        { label: "CGPA × 9.5 (CBSE)", value: "9.5" },
        { label: "CGPA × 10", value: "10" },
        { label: "(CGPA − 0.75) × 10", value: "vtus" },
      ] },
    ],
    compute: (v) => {
      const cgpa = n(v, "cgpa");
      const pct = s(v, "scale") === "vtus" ? (cgpa - 0.75) * 10 : cgpa * Number(s(v, "scale"));
      return [{ label: "Percentage", value: `${formatNum(pct)}%`, emphasize: true }];
    },
  },
  "bmi-calculator": {
    fields: [
      { id: "cm", label: "Height (cm)", kind: "number", default: 170 },
      { id: "kg", label: "Weight (kg)", kind: "number", default: 68 },
    ],
    compute: (v) => {
      const m = n(v, "cm") / 100;
      const bmi = n(v, "kg") / Math.max(m * m, 0.0001);
      const label = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
      return [
        { label: "BMI", value: formatNum(bmi, 1), emphasize: true },
        { label: "Category", value: label },
      ];
    },
  },
  "number-to-words": {
    fields: [
      { id: "amount", label: "Number / amount", kind: "number", default: 125430.5 },
      { id: "style", label: "Style", kind: "select", default: "inr", options: [
        { label: "Indian rupees", value: "inr" }, { label: "Plain English", value: "en" },
      ] },
    ],
    compute: (v) => {
      const whole = Math.floor(Math.abs(n(v, "amount")));
      const paise = Math.round((Math.abs(n(v, "amount")) - whole) * 100);
      const words = toWordsIndian(whole) || "zero";
      const text = s(v, "style") === "inr"
        ? `${words} rupees${paise ? ` and ${toWordsIndian(paise)} paise` : ""} only`
        : words;
      return [{ label: "In words", value: text, emphasize: true }];
    },
  },
};
