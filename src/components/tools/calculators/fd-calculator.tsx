"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/utils";

type Freq = "monthly" | "quarterly" | "yearly";

function freqN(freq: Freq) {
  if (freq === "monthly") return 12;
  if (freq === "quarterly") return 4;
  return 1;
}

export function FdCalculator() {
  const [principalRaw, setPrincipalRaw] = useState("500000");
  const [rateRaw, setRateRaw] = useState("7.25");
  const [tenureRaw, setTenureRaw] = useState("5");
  const [unit, setUnit] = useState<"years" | "months">("years");
  const [freq, setFreq] = useState<Freq>("quarterly");

  const principal = Number(String(principalRaw).replace(/,/g, "")) || 0;
  const rate = Number(rateRaw) || 0;
  const tenureYears = unit === "months" ? (Number(tenureRaw) || 0) / 12 : Number(tenureRaw) || 0;

  const result = useMemo(() => {
    if (principal <= 0 || tenureYears <= 0 || rate < 0) return null;
    const n = freqN(freq);
    const r = rate / 100;
    const maturityAmount = principal * Math.pow(1 + r / n, n * tenureYears);
    const years = Math.max(1, Math.ceil(tenureYears));
    const yearlyGrowth = Array.from({ length: years }, (_, index) => {
      const year = index + 1;
      return { year, amount: principal * Math.pow(1 + r / n, n * Math.min(year, tenureYears)) };
    });
    return {
      maturityAmount,
      interestEarned: maturityAmount - principal,
      effectiveAnnualRate: (Math.pow(maturityAmount / principal, 1 / tenureYears) - 1) * 100,
      yearlyGrowth,
    };
  }, [freq, principal, rate, tenureYears]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="fd-principal">Principal Amount (₹)</Label>
          <Input id="fd-principal" value={principalRaw} onChange={(e) => setPrincipalRaw(e.target.value)} className="mt-1" placeholder="5,00,000" />
        </div>
        <div>
          <Label htmlFor="fd-rate">Interest Rate (% per annum)</Label>
          <Input id="fd-rate" value={rateRaw} onChange={(e) => setRateRaw(e.target.value)} className="mt-1" placeholder="7.25" />
        </div>
        <div>
          <Label htmlFor="fd-tenure">Tenure</Label>
          <Input id="fd-tenure" value={tenureRaw} onChange={(e) => setTenureRaw(e.target.value)} className="mt-1" placeholder={unit === "years" ? "5" : "60"} />
          <div className="mt-2 flex gap-2">
            <button type="button" className={`h-9 rounded-md border px-3 text-sm ${unit === "years" ? "border-primary bg-primary text-primary-foreground" : "border-[var(--hairline)]"}`} onClick={() => setUnit("years")}>
              Years
            </button>
            <button type="button" className={`h-9 rounded-md border px-3 text-sm ${unit === "months" ? "border-primary bg-primary text-primary-foreground" : "border-[var(--hairline)]"}`} onClick={() => setUnit("months")}>
              Months
            </button>
          </div>
        </div>
        <div>
          <Label htmlFor="fd-frequency">Compounding Frequency</Label>
          <select
            id="fd-frequency"
            value={freq}
            onChange={(e) => setFreq(e.target.value as Freq)}
            className="mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      {result ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Maturity Amount" value={formatINR(result.maturityAmount)} highlight />
            <Stat label="Total Interest Earned" value={formatINR(result.interestEarned)} />
            <Stat label="Effective Annual Rate" value={`${result.effectiveAnnualRate.toFixed(2)}%`} />
          </div>
          <div className="h-72 rounded-lg border border-[var(--hairline)] p-3">
            <p className="mb-2 text-sm font-medium">Growth Chart</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.yearlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="year" tickFormatter={(value) => `Year ${value}`} fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(value) => `${Math.round(Number(value) / 100000)}L`} />
                <Tooltip formatter={(value) => formatINR(Number(value ?? 0))} />
                <Bar dataKey="amount" fill="#cc785c" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-primary/30 bg-surface-card" : "border-[var(--hairline)] bg-surface-soft"}`}>
      <p className="text-sm text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
