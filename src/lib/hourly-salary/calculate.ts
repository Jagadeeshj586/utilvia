export type HourlySalaryMode = "hourly" | "salary";

export type HourlySalaryInput = {
  mode: HourlySalaryMode;
  hourlyRate: number;
  annualSalary: number;
  hoursPerWeek: number;
  weeksPerYear: number;
};

export type HourlySalaryResult = {
  hourly: number;
  daily: number;
  weekly: number;
  biweekly: number;
  monthly: number;
  annual: number;
};

export const HOURLY_SALARY_DEFAULTS = {
  mode: "hourly" as HourlySalaryMode,
  hourlyRate: 25,
  annualSalary: 52_000,
  hoursPerWeek: 40,
  weeksPerYear: 52,
};

export const HOURLY_SALARY_FAQS = [
  {
    question: "How is annual salary calculated?",
    answer:
      "Annual salary = hourly rate × hours per week × weeks per year. With the defaults (40 hours × 52 weeks), that is hourly rate × 2,080.",
  },
  {
    question: "What are default hours?",
    answer: "The calculator defaults to 40 hours per week and 52 weeks per year — a common full-time schedule. You can change both.",
  },
  {
    question: "Can I convert salary to hourly?",
    answer:
      "Yes. Switch to Salary → Hourly, enter an annual salary, and the calculator shows the equivalent hourly rate plus daily, weekly, bi-weekly, and monthly amounts.",
  },
  {
    question: "Does it support INR and USD?",
    answer: "Yes. Choose USD or INR to format results in that currency. The conversion math is the same either way.",
  },
  {
    question: "Is hourly to salary calculator free?",
    answer: "Yes. The Utilvia Hourly to Salary Calculator is free with no signup required.",
  },
] as const;

export function salaryToHourly(annualSalary: number, hoursPerWeek = 40, weeksPerYear = 52): number {
  const yearlyHours = hoursPerWeek * weeksPerYear;
  if (yearlyHours <= 0) return 0;
  return annualSalary / yearlyHours;
}

export function calculateFromHourly(
  hourlyRate: number,
  hoursPerWeek = 40,
  weeksPerYear = 52,
): HourlySalaryResult {
  const weekly = hourlyRate * hoursPerWeek;
  const annual = weekly * weeksPerYear;
  return {
    hourly: hourlyRate,
    daily: weekly / 5,
    weekly,
    biweekly: weekly * 2,
    monthly: annual / 12,
    annual,
  };
}

export function calculateHourlySalary(input: HourlySalaryInput): HourlySalaryResult | null {
  const hoursPerWeek = Number.isFinite(input.hoursPerWeek) && input.hoursPerWeek > 0 ? input.hoursPerWeek : 40;
  const weeksPerYear = Number.isFinite(input.weeksPerYear) && input.weeksPerYear > 0 ? input.weeksPerYear : 52;

  if (input.mode === "hourly") {
    if (!Number.isFinite(input.hourlyRate) || input.hourlyRate < 0) return null;
    return calculateFromHourly(input.hourlyRate, hoursPerWeek, weeksPerYear);
  }

  if (!Number.isFinite(input.annualSalary) || input.annualSalary < 0) return null;
  const hourly = salaryToHourly(input.annualSalary, hoursPerWeek, weeksPerYear);
  return calculateFromHourly(hourly, hoursPerWeek, weeksPerYear);
}
