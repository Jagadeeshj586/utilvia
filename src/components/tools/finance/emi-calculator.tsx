"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatINR } from "@/lib/utils";

function calculateEmi(principal: number, annualRate: number, months: number) {
  const tenureMonths = Math.max(1, Math.round(months));
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    const emi = principal / tenureMonths;
    return { emi, months: tenureMonths, totalPayment: principal, totalInterest: 0 };
  }
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  const totalPayment = emi * tenureMonths;
  return { emi, months: tenureMonths, totalPayment, totalInterest: totalPayment - principal };
}

export function EmiCalculator() {
  const [principal, setPrincipal] = useState(2500000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [unit, setUnit] = useState<"years" | "months">("years");
  const months = unit === "years" ? tenure * 12 : tenure;
  const result = useMemo(() => calculateEmi(principal, rate, months), [principal, rate, months]);

  const pieData = [
    { name: "Principal", value: principal, color: "#cc785c" },
    { name: "Interest", value: Math.max(0, result.totalInterest), color: "#e8a55a" },
  ];

  const yearly = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    let balance = principal;
    const rows = [];
    for (let year = 1; year <= Math.ceil(result.months / 12); year += 1) {
      let interest = 0;
      let principalPaid = 0;
      for (let month = 0; month < 12 && (year - 1) * 12 + month < result.months; month += 1) {
        const interestPart = monthlyRate === 0 ? 0 : balance * monthlyRate;
        const principalPart = Math.min(result.emi - interestPart, balance);
        interest += interestPart;
        principalPaid += principalPart;
        balance = Math.max(0, balance - principalPart);
      }
      rows.push({
        year: `Y${year}`,
        principal: Math.round(principalPaid),
        interest: Math.round(interest),
      });
    }
    return rows;
  }, [principal, rate, result.emi, result.months]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Loan amount</Label>
              <span className="text-sm tabular-nums text-muted-foreground">{formatINR(principal)}</span>
            </div>
            <Slider min={100000} max={20000000} step={50000} value={[principal]} onValueChange={([v]) => setPrincipal(v)} />
            <Input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Interest rate (p.a.)</Label>
              <span className="text-sm tabular-nums text-muted-foreground">{rate.toFixed(2)}%</span>
            </div>
            <Slider min={1} max={24} step={0.1} value={[rate]} onValueChange={([v]) => setRate(v)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="loan-tenure">Loan Tenure</Label>
              <span className="text-sm tabular-nums text-muted-foreground">
                {tenure} {unit}
              </span>
            </div>
            <Input
              id="loan-tenure"
              type="number"
              min={1}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value) || 0)}
              placeholder={unit === "years" ? "20" : "240"}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className={`h-9 rounded-md border px-3 text-sm ${unit === "years" ? "border-primary bg-primary text-primary-foreground" : "border-[var(--hairline)]"}`}
                onClick={() => {
                  if (unit === "months") setTenure(Math.max(1, Math.round(tenure / 12)));
                  setUnit("years");
                }}
              >
                Years
              </button>
              <button
                type="button"
                className={`h-9 rounded-md border px-3 text-sm ${unit === "months" ? "border-primary bg-primary text-primary-foreground" : "border-[var(--hairline)]"}`}
                onClick={() => {
                  if (unit === "years") setTenure(Math.max(1, tenure * 12));
                  setUnit("months");
                }}
              >
                Months
              </button>
            </div>
            <Slider
              min={1}
              max={unit === "years" ? 30 : 360}
              step={1}
              value={[tenure]}
              onValueChange={([v]) => setTenure(v)}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <Stat label="Monthly EMI" value={formatINR(result.emi)} highlight />
          <Stat label="Total Interest Payable" value={formatINR(result.totalInterest)} />
          <Stat label="Total Amount Payable" value={formatINR(result.totalPayment)} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-lg border border-[var(--hairline)] p-3">
          <p className="mb-2 text-sm font-medium">Principal vs interest</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatINR(Number(value ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-lg border border-[var(--hairline)] p-3">
          <p className="mb-2 text-sm font-medium">Amortization Summary</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="year" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `${Math.round(v / 100000)}L`} />
              <Tooltip formatter={(value) => formatINR(Number(value ?? 0))} />
              <Bar dataKey="principal" stackId="a" fill="#cc785c" name="Principal" />
              <Bar dataKey="interest" stackId="a" fill="#e8a55a" name="Interest" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-3 ${highlight ? "border-primary/30 bg-surface-card" : "border-[var(--hairline)]"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
