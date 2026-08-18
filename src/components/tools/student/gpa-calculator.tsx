"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LETTER_GRADES,
  US_GRADE_POINTS,
  calculateWeightedGpa,
  createDefaultCourses,
  parseCreditHours,
  type LetterGrade,
} from "@/lib/gpa/calculate";
import { formatNum } from "@/lib/utils";

type CourseRow = {
  id: string;
  name: string;
  credits: string;
  grade: LetterGrade;
};

const selectClass =
  "h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

export function GpaCalculatorTool() {
  const [rows, setRows] = useState<CourseRow[]>(() => createDefaultCourses());

  const result = useMemo(
    () =>
      calculateWeightedGpa(
        rows
          .map((row) => {
            const credits = parseCreditHours(row.credits);
            if (credits == null) return null;
            return { credits, grade: row.grade };
          })
          .filter((course): course is { credits: number; grade: LetterGrade } => course != null),
      ),
    [rows],
  );

  const updateRow = (id: string, patch: Partial<CourseRow>) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addCourse = () => {
    setRows((current) => [
      ...current,
      { id: crypto.randomUUID(), name: "", credits: "3", grade: "B" },
    ]);
  };

  const removeCourse = (id: string) => {
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.id !== id)));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">Course {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-destructive"
                onClick={() => removeCourse(row.id)}
                disabled={rows.length <= 1}
                aria-label={`Remove course ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
              <div className="space-y-2">
                <Label htmlFor={`course-name-${row.id}`}>Course name</Label>
                <Input
                  id={`course-name-${row.id}`}
                  value={row.name}
                  onChange={(event) => updateRow(row.id, { name: event.target.value })}
                  placeholder="e.g. Calculus I"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`course-grade-${row.id}`}>Grade</Label>
                <select
                  id={`course-grade-${row.id}`}
                  value={row.grade}
                  onChange={(event) => updateRow(row.id, { grade: event.target.value as LetterGrade })}
                  className={selectClass}
                >
                  {LETTER_GRADES.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`course-credits-${row.id}`}>Credit hours</Label>
                <Input
                  id={`course-credits-${row.id}`}
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  value={row.credits}
                  onChange={(event) => updateRow(row.id, { credits: event.target.value })}
                  placeholder="3"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addCourse} className="gap-2">
        <Plus className="h-4 w-4" />
        Add course
      </Button>

      <div
        className="rounded-lg border border-[var(--hairline)] bg-canvas px-5 py-6 text-center sm:px-6"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-muted-foreground">Weighted GPA</p>
        <p className="mt-1 font-display text-[2.5rem] leading-none tracking-[-0.03em] text-ink sm:text-[3rem]">
          {formatNum(result.weightedGpa, 2)}
        </p>
        <p className="mt-3 text-sm text-[var(--body)]">
          {formatNum(result.totalCredits, result.totalCredits % 1 === 0 ? 0 : 1)} credit hour
          {result.totalCredits === 1 ? "" : "s"} · {formatNum(result.totalGradePoints, 1)} total grade points
        </p>
        {result.courseCount === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Enter credit hours for at least one course to calculate GPA.
          </p>
        ) : null}
      </div>

      <details className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--body)]">
        <summary className="cursor-pointer font-medium text-ink">Grade scale reference</summary>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {LETTER_GRADES.map((grade) => (
            <li key={grade} className="flex justify-between gap-4 pr-2">
              <span>{grade}</span>
              <span className="tabular-nums text-muted-foreground">{US_GRADE_POINTS[grade].toFixed(1)}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
