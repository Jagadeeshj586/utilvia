"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_EPF_INTEREST_RATE,
  calculateEpf,
  type EpfCalculatorResult,
} from "@/lib/epf/calculate";
import { formatINR } from "@/lib/utils";

function parseNumber(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--hairline)] bg-surface-soft px-4 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={highlight ? "mt-1 font-display text-3xl font-semibold tabular-nums text-coral" : "mt-1 text-xl font-semibold tabular-nums text-ink"}>
        {value}
      </p>
    </div>
  );
}

export function EpfCalculator() {
  const [basicSalary, setBasicSalary] = useState("30000");
  const [currentAge, setCurrentAge] = useState("25");
  const [retirementAge, setRetirementAge] = useState("58");
  const [currentBalance, setCurrentBalance] = useState("50000");
  const [annualIncrement, setAnnualIncrement] = useState("5");
  const [interestRate, setInterestRate] = useState(String(DEFAULT_EPF_INTEREST_RATE));
  const [result, setResult] = useState<EpfCalculatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    const input = {
      basicSalaryMonthly: parseNumber(basicSalary),
      currentAge: parseNumber(currentAge),
      retirementAge: parseNumber(retirementAge),
      currentBalance: parseNumber(currentBalance),
      annualIncrementPercent: parseNumber(annualIncrement),
      interestRatePercent: parseNumber(interestRate),
    };

    if (Object.values(input).some((value) => !Number.isFinite(value))) {
      setResult(null);
      setError("Enter valid numbers for all fields.");
      return;
    }

    if (input.retirementAge <= input.currentAge) {
      setResult(null);
      setError("Retirement age must be greater than current age.");
      return;
    }

    const next = calculateEpf(input);
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
        <div className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-[var(--body)]">
          Based on Indian EPF rules — FY2025-26
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="epf-basic">Basic Salary (₹/month)</Label>
            <Input
              id="epf-basic"
              inputMode="decimal"
              value={basicSalary}
              onChange={(event) => setBasicSalary(event.target.value)}
              placeholder="30,000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="epf-current-age">Current Age</Label>
            <Input
              id="epf-current-age"
              inputMode="numeric"
              value={currentAge}
              onChange={(event) => setCurrentAge(event.target.value)}
              placeholder="25"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="epf-retirement-age">Retirement Age</Label>
            <Input
              id="epf-retirement-age"
              inputMode="numeric"
              value={retirementAge}
              onChange={(event) => setRetirementAge(event.target.value)}
              placeholder="58"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="epf-balance">Current EPF Balance (₹)</Label>
            <Input
              id="epf-balance"
              inputMode="decimal"
              value={currentBalance}
              onChange={(event) => setCurrentBalance(event.target.value)}
              placeholder="50,000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="epf-increment">Annual Salary Increment (%)</Label>
            <Input
              id="epf-increment"
              inputMode="decimal"
              value={annualIncrement}
              onChange={(event) => setAnnualIncrement(event.target.value)}
              placeholder="5"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="epf-rate">Interest Rate (% p.a.)</Label>
            <Input
              id="epf-rate"
              inputMode="decimal"
              value={interestRate}
              onChange={(event) => setInterestRate(event.target.value)}
              placeholder="8.25"
              className="mt-1"
            />
          </div>
        </div>

        <Button type="button" onClick={calculate} className="min-h-11 px-6">
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Maturity Amount" value={formatINR(result.maturityAmount)} highlight />
            <Stat label="Employee" value={formatINR(result.employeeContribution)} />
            <Stat label="Employer (EPF)" value={formatINR(result.employerContribution)} />
            <Stat label="Interest" value={formatINR(result.interestEarned)} />
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-surface-card">
            <div className="border-b border-[var(--hairline)] px-4 py-3">
              <h3 className="font-display text-lg font-semibold text-ink">Year-by-Year Balance</h3>
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-surface-soft text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Year</th>
                    <th className="px-4 py-2 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearly.map((row) => (
                    <tr key={row.year} className="border-t border-[var(--hairline)]">
                      <td className="px-4 py-2 tabular-nums text-[var(--body)]">{row.year}</td>
                      <td className="px-4 py-2 tabular-nums font-medium text-ink">{formatINR(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Employer contribution split — 3.67% to EPF, 8.33% to EPS (Employee Pension Scheme), as per current rules.
          </p>
        </section>
      ) : null}
    </div>
  );
}
