"use client";

import { CgpaCalculator } from "@/components/tools/calculators/cgpa-calculator";
import { CompoundInterestCalculator } from "@/components/tools/calculators/compound-interest-calculator";
import { FormulaCalculator } from "@/components/tools/shared/formula-calculator";
import { CalorieDeficitCalculatorTool } from "@/components/tools/student/calorie-deficit-calculator";
import { NumberToWordsTool } from "@/components/tools/student/number-to-words";
import { TimeZoneConverterTool } from "@/components/tools/student/time-zone-converter";
import { GpaCalculatorTool } from "@/components/tools/student/gpa-calculator";
import { DaysBetweenDatesTool } from "@/components/tools/student/days-between-dates";
import { LeapYearCheckerTool } from "@/components/tools/student/leap-year-checker";
import {
  BmiCalculator,
} from "@/components/tools/student/student-suite";
import { UnitConverter } from "@/components/tools/student/unit-converter";
import { STUDENT_CONFIGS } from "@/lib/calculators/student-configs";

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
