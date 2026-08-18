"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  HOURLY_SALARY_DEFAULTS,
  calculateHourlySalary,
  type HourlySalaryMode,
} from "@/lib/hourly-salary/calculate";
import { cn, formatINR, formatUSD } from "@/lib/utils";

type CurrencyCode = "USD" | "INR";

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function formatMoney(value: number, currency: CurrencyCode, digits: number) {
  const rounded = digits === 0 ? Math.round(value) : value;
  return currency === "USD" ? formatUSD(rounded, digits) : formatINR(rounded, digits);
}

export function HourlySalaryCalculator() {
  const [mode, setMode] = useState<HourlySalaryMode>(HOURLY_SALARY_DEFAULTS.mode);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [hourly, setHourly] = useState(String(HOURLY_SALARY_DEFAULTS.hourlyRate));
  const [annual, setAnnual] = useState(String(HOURLY_SALARY_DEFAULTS.annualSalary));
  const [hours, setHours] = useState(String(HOURLY_SALARY_DEFAULTS.hoursPerWeek));
  const [weeks, setWeeks] = useState(String(HOURLY_SALARY_DEFAULTS.weeksPerYear));

  const result = useMemo(() => {
    return calculateHourlySalary({
      mode,
      hourlyRate: parseAmount(hourly),
      annualSalary: parseAmount(annual),
      hoursPerWeek: parseAmount(hours),
      weeksPerYear: parseAmount(weeks),
    });
  }, [annual, hourly, hours, mode, weeks]);

  const symbol = currency === "USD" ? "$" : "₹";
  const rows = result
    ? [
        { label: "Hourly", value: formatMoney(result.hourly, currency, 2) },
        { label: "Daily", value: formatMoney(result.daily, currency, 0) },
        { label: "Weekly", value: formatMoney(result.weekly, currency, 0) },
        { label: "Bi-weekly", value: formatMoney(result.biweekly, currency, 0) },
        { label: "Monthly", value: formatMoney(result.monthly, currency, 0) },
        { label: "Annual", value: formatMoney(result.annual, currency, 0) },
      ]
    : [];

  return (
    <div className="space-y-6">
      <section className="mx-auto max-w-xl space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Currency</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Currency">
            {(
              [
                { value: "USD", label: "USD ($)" },
                { value: "INR", label: "INR (₹)" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "h-9 rounded-md border px-3 text-sm transition-colors",
                  currency === option.value
                    ? "border-coral bg-coral text-white"
                    : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                )}
                aria-pressed={currency === option.value}
                onClick={() => setCurrency(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Conversion mode</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Conversion mode">
            {(
              [
                { value: "hourly", label: "Hourly → Salary" },
                { value: "salary", label: "Salary → Hourly" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "h-9 rounded-md border px-3 text-sm transition-colors",
                  mode === option.value
                    ? "border-coral bg-coral text-white"
                    : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                )}
                aria-pressed={mode === option.value}
                onClick={() => setMode(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "hourly" ? (
          <div>
            <Label htmlFor="hts-hourly">Hourly Rate ({symbol})</Label>
            <Input
              id="hts-hourly"
              inputMode="decimal"
              value={hourly}
              onChange={(event) => setHourly(event.target.value)}
              placeholder="25"
              className="mt-1 min-h-11"
            />
          </div>
        ) : (
          <div>
            <Label htmlFor="hts-annual">Annual Salary ({symbol})</Label>
            <Input
              id="hts-annual"
              inputMode="decimal"
              value={annual}
              onChange={(event) => setAnnual(event.target.value)}
              placeholder="52000"
              className="mt-1 min-h-11"
            />
          </div>
        )}

        <div>
          <Label htmlFor="hts-hpw">Hours per Week</Label>
          <Input
            id="hts-hpw"
            inputMode="decimal"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            placeholder="40"
            className="mt-1 min-h-11"
          />
        </div>

        <div>
          <Label htmlFor="hts-wpy">Weeks per Year</Label>
          <Input
            id="hts-wpy"
            inputMode="decimal"
            value={weeks}
            onChange={(event) => setWeeks(event.target.value)}
            placeholder="52"
            className="mt-1 min-h-11"
          />
        </div>
      </section>

      {result ? (
        <section className="mx-auto grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3" aria-live="polite">
          {rows.map((row) => (
            <div key={row.label} className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 text-center">
              <p className="text-xs text-muted-foreground">{row.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-coral">{row.value}</p>
            </div>
          ))}
        </section>
      ) : (
        <p className="mx-auto max-w-xl text-center text-sm text-destructive" role="alert">
          Enter a valid rate or salary to see conversions.
        </p>
      )}
    </div>
  );
}
