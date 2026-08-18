"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FREQUENCY_OPTIONS,
  calculateCompoundInterest,
  type CompoundingFrequency,
  type CompoundInterestResult,
} from "@/lib/compound-interest/calculate";
import { formatINR } from "@/lib/utils";

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("10");
  const [frequency, setFrequency] = useState<CompoundingFrequency>("annually");
  const [monthly, setMonthly] = useState("0");
  const [result, setResult] = useState<CompoundInterestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    const p = parseAmount(principal);
    const r = parseAmount(rate);
    const t = parseAmount(years);
    const m = monthly.trim() === "" ? 0 : parseAmount(monthly);

    if (![p, r, t, m].every((value) => Number.isFinite(value))) {
      setResult(null);
      setError("Enter valid numbers for all fields.");
      return;
    }
    if (p < 0 || r < 0 || t <= 0 || m < 0) {
      setResult(null);
      setError("Principal, rate, and contribution must be ≥ 0, and years must be greater than 0.");
      return;
    }

    const next = calculateCompoundInterest({
      principal: p,
      annualRatePercent: r,
      years: t,
      frequency,
      monthlyContribution: m,
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
      <section className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ci-principal">Principal (₹)</Label>
            <Input
              id="ci-principal"
              inputMode="decimal"
              value={principal}
              onChange={(event) => setPrincipal(event.target.value)}
              placeholder="1,00,000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ci-rate">Annual Rate (%)</Label>
            <Input
              id="ci-rate"
              inputMode="decimal"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
              placeholder="8"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ci-years">Years</Label>
            <Input
              id="ci-years"
              inputMode="decimal"
              value={years}
              onChange={(event) => setYears(event.target.value)}
              placeholder="10"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ci-freq">Compounding Frequency</Label>
            <select
              id="ci-freq"
              value={frequency}
              onChange={(event) => setFrequency(event.target.value as CompoundingFrequency)}
              className="mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink"
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ci-monthly">Monthly Contribution (₹) — optional</Label>
            <Input
              id="ci-monthly"
              inputMode="decimal"
              value={monthly}
              onChange={(event) => setMonthly(event.target.value)}
              placeholder="0"
              className="mt-1"
            />
          </div>
        </div>

        <Button type="button" onClick={calculate} className="min-h-10 px-6">
          Calculate
        </Button>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      {result ? (
        <section className="space-y-4" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Final Amount" value={formatINR(Math.round(result.finalAmount))} highlight />
            <Stat label="Total Interest" value={formatINR(Math.round(result.totalInterest))} />
            <Stat label="Total Contributions" value={formatINR(Math.round(result.totalContributions))} />
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-surface-card">
            <div className="border-b border-[var(--hairline)] px-4 py-3">
              <h3 className="text-sm font-medium text-ink">Year-by-Year Growth</h3>
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-surface-soft text-[var(--muted-ink)]">
                  <tr>
                    <th className="px-4 py-2 font-medium">Year</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearly.map((row) => (
                    <tr key={row.year} className="border-t border-[var(--hairline)]">
                      <td className="px-4 py-2 tabular-nums text-[var(--body)]">{row.year}</td>
                      <td className="px-4 py-2 tabular-nums font-medium text-ink">
                        {formatINR(Math.round(row.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-primary/30 bg-surface-card" : "border-[var(--hairline)] bg-surface-soft"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
