"use client";

import dynamic from "next/dynamic";
import { STUDENT_CONFIGS } from "@/lib/calculators/student-configs";

const CgpaCalculator = dynamic(() => import("@/components/tools/calculators/cgpa-calculator").then((m) => m.CgpaCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const CompoundInterestCalculator = dynamic(() => import("@/components/tools/calculators/compound-interest-calculator").then((m) => m.CompoundInterestCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const FormulaCalculator = dynamic(() => import("@/components/tools/shared/formula-calculator").then((m) => m.FormulaCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const CalorieDeficitCalculatorTool = dynamic(() => import("@/components/tools/student/calorie-deficit-calculator").then((m) => m.CalorieDeficitCalculatorTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const NumberToWordsTool = dynamic(() => import("@/components/tools/student/number-to-words").then((m) => m.NumberToWordsTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const TimeZoneConverterTool = dynamic(() => import("@/components/tools/student/time-zone-converter").then((m) => m.TimeZoneConverterTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const GpaCalculatorTool = dynamic(() => import("@/components/tools/student/gpa-calculator").then((m) => m.GpaCalculatorTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const DaysBetweenDatesTool = dynamic(() => import("@/components/tools/student/days-between-dates").then((m) => m.DaysBetweenDatesTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const LeapYearCheckerTool = dynamic(() => import("@/components/tools/student/leap-year-checker").then((m) => m.LeapYearCheckerTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const BmiCalculator = dynamic(() => import("@/components/tools/student/student-suite").then((m) => m.BmiCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const UnitConverter = dynamic(() => import("@/components/tools/student/unit-converter").then((m) => m.UnitConverter), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });

export function StudentRouter({ slug }: { slug: string }) {
  switch (slug) {
    case "cgpa-to-percentage":
      return <CgpaCalculator />;
    case "compound-interest":
      return <CompoundInterestCalculator />;
    case "gpa-calculator":
      return <GpaCalculatorTool />;
    case "bmi-calculator":
      return <BmiCalculator />;
    case "calorie-deficit-calculator":
      return <CalorieDeficitCalculatorTool />;
    case "unit-converter":
      return <UnitConverter />;
    case "time-zone-converter":
      return <TimeZoneConverterTool />;
    case "number-to-words":
      return <NumberToWordsTool />;
    case "days-between-dates":
      return <DaysBetweenDatesTool />;
    case "leap-year-checker":
      return <LeapYearCheckerTool />;
    default: {
      const config = STUDENT_CONFIGS[slug];
      if (!config) {
        return (
          <p className="rounded-lg border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-8 text-center text-sm text-muted-foreground">
            No calculator config for “{slug}” yet.
          </p>
        );
      }
      return <FormulaCalculator key={slug} config={config} />;
    }
  }
}
