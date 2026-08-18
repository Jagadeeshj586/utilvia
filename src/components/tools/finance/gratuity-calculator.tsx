"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateGratuity, type GratuityCoverage } from "@/lib/gratuity/calculate";
import { GRATUITY_RULES, MAX_GRATUITY_LIMIT } from "@/lib/gratuity/rules";
import { cn, formatINR } from "@/lib/utils";

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

export function GratuityCalculator() {
  const [salary, setSalary] = useState("50000");
  const [years, setYears] = useState("10");
  const [coverage, setCoverage] = useState<GratuityCoverage>("covered");
  const [result, setResult] = useState<ReturnType<typeof calculateGratuity>>(null);
  const [error, setError] = useState<string | null>(null);

  const yearsNum = parseAmount(years);
  const showEligibilityNote = Number.isFinite(yearsNum) && yearsNum > 0 && yearsNum < GRATUITY_RULES.minEligibleYears;

  const calculate = () => {
    const salaryNum = parseAmount(salary);
    const serviceYears = parseAmount(years);

    if (!Number.isFinite(salaryNum) || salaryNum <= 0) {
      setResult(null);
      setError("Enter a valid last drawn salary (Basic + DA).");
      return;
    }

    if (!Number.isFinite(serviceYears) || serviceYears < 0) {
      setResult(null);
      setError("Enter valid years of service.");
      return;
    }

    const next = calculateGratuity({
      salary: salaryNum,
      yearsOfService: serviceYears,
      coveredUnderAct: coverage === "covered",
    });

    if (!next) {
      setResult(null);
      setError("Unable to calculate with the current inputs.");
      return;
    }

    setError(null);
    setResult(next);
  };

  return (
    <div className="space-y-6">
      <section className="mx-auto max-w-xl space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-[var(--body)]">
          Based on the {GRATUITY_RULES.actLabel}
        </div>

        <div>
          <Label htmlFor="grat-salary">Last Drawn Salary Basic+DA (₹/month)</Label>
          <Input
            id="grat-salary"
            inputMode="decimal"
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            placeholder="50000"
            className="mt-1 min-h-11"
          />
        </div>

        <div>
          <Label htmlFor="grat-years">Years of Service</Label>
          <Input
            id="grat-years"
            inputMode="decimal"
            value={years}
            onChange={(event) => setYears(event.target.value)}
            placeholder="10"
            className="mt-1 min-h-11"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Coverage</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Gratuity Act coverage">
            {(
              [
                { value: "covered", label: "Covered under Act" },
                { value: "not-covered", label: "Not covered" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "h-9 rounded-md border px-3 text-sm transition-colors",
                  coverage === option.value
                    ? "border-coral bg-coral text-white"
                    : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                )}
                aria-pressed={coverage === option.value}
                onClick={() => setCoverage(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <Button type="button" onClick={calculate} className="min-h-11 w-full px-6">
          Calculate
        </Button>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      {result ? (
        <section className="mx-auto max-w-xl rounded-xl border border-[var(--hairline)] bg-surface-card p-6 text-center" aria-live="polite">
          <p className="text-sm text-muted-foreground">Gratuity Amount</p>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums text-coral">{formatINR(result.gratuityAmount)}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Formula: {result.formula} · Years used: {result.roundedYears}
          </p>
        </section>
      ) : null}

      <div className="mx-auto max-w-xl space-y-2 text-center text-xs text-muted-foreground">
        <p>
          Minimum {GRATUITY_RULES.minEligibleYears} years of continuous service required to be eligible for gratuity
          (except in case of death or disability).
        </p>
        <p>Tax-free gratuity limit is {formatINR(MAX_GRATUITY_LIMIT)} as per current rules.</p>
      </div>

      {showEligibilityNote ? (
        <p className="mx-auto max-w-xl text-center text-sm text-amber" role="status">
          Note: You may not be eligible with less than {GRATUITY_RULES.minEligibleYears} years of service.
        </p>
      ) : null}
    </div>
  );
}
