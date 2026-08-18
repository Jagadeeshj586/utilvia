"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkLeapYear, parseYearInput } from "@/lib/leap-year/check";
import { cn } from "@/lib/utils";

export function LeapYearCheckerTool() {
  const [yearInput, setYearInput] = useState(String(new Date().getFullYear()));

  const year = useMemo(() => parseYearInput(yearInput), [yearInput]);
  const result = useMemo(() => (year == null ? null : checkLeapYear(year)), [year]);

  return (
    <div className="space-y-6">
      <div className="mx-auto w-full max-w-sm space-y-2">
        <Label htmlFor="leap-year-input">Year</Label>
        <Input
          id="leap-year-input"
          inputMode="numeric"
          value={yearInput}
          onChange={(event) => setYearInput(event.target.value)}
          placeholder="e.g. 2026"
          className="text-center text-lg tabular-nums"
          spellCheck={false}
        />
        {yearInput.trim() && year == null ? (
          <p className="text-center text-sm text-destructive">Enter a whole number year.</p>
        ) : null}
      </div>

      {result ? (
        <>
          <div
            className={cn(
              "rounded-lg border px-5 py-6 text-center sm:px-6",
              result.isLeap
                ? "border-teal/40 bg-[color-mix(in_srgb,var(--accent-teal)_10%,var(--canvas))]"
                : "border-[var(--hairline)] bg-canvas",
            )}
            aria-live="polite"
          >
            <p
              className={cn(
                "font-display text-[2rem] leading-none tracking-[-0.03em] sm:text-[2.5rem]",
                result.isLeap ? "text-teal" : "text-ink",
              )}
            >
              {result.headline}
            </p>
            <p className="mt-3 text-sm leading-[1.65] text-[var(--body)]">{result.explanation}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-4 text-center">
              <p className="text-sm text-muted-foreground">Previous leap year</p>
              <p className="mt-2 font-display text-[1.75rem] leading-none tracking-[-0.03em] text-ink tabular-nums">
                {result.previousLeapYear}
              </p>
              <button
                type="button"
                className="mt-3 text-xs font-medium text-primary hover:underline"
                onClick={() => setYearInput(String(result.previousLeapYear))}
              >
                Check this year
              </button>
            </div>
            <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-4 text-center">
              <p className="text-sm text-muted-foreground">Next leap year</p>
              <p className="mt-2 font-display text-[1.75rem] leading-none tracking-[-0.03em] text-ink tabular-nums">
                {result.nextLeapYear}
              </p>
              <button
                type="button"
                className="mt-3 text-xs font-medium text-primary hover:underline"
                onClick={() => setYearInput(String(result.nextLeapYear))}
              >
                Check this year
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--hairline)] bg-surface-soft px-5 py-8 text-center text-sm text-muted-foreground">
          Enter a year to see if it is a leap year.
        </div>
      )}

      <p className="text-center text-sm leading-[1.65] text-muted-foreground">
        Rule: divisible by 4 → leap year, except century years, except those divisible by 400.
      </p>
    </div>
  );
}
