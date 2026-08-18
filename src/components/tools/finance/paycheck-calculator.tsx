"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateIndiaTax, type TaxRegime } from "@/lib/calculators/india-tax";
import { formatINR } from "@/lib/utils";

export function PaycheckCalculator() {
  const [ctc, setCtc] = useState(1200000);
  const [regime, setRegime] = useState<TaxRegime>("new");
  const [deduction80c, setDeduction80c] = useState(0);
  const [includeEpf, setIncludeEpf] = useState(true);
  const result = useMemo(
    () => calculateIndiaTax({ ctc, regime, deduction80c, includeEpf }),
    [ctc, regime, deduction80c, includeEpf],
  );

  const pieData = [
    { name: "Take-home", value: Math.max(0, result.takeHomeAnnual), color: "#cc785c" },
    { name: "Tax + cess", value: Math.max(0, result.annualTax), color: "#c64545" },
    { name: "EPF", value: Math.max(0, result.epfAnnual), color: "#5db8a6" },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <Tabs value={regime} onValueChange={(value) => setRegime(value as TaxRegime)}>
        <TabsList>
          <TabsTrigger value="new">New regime</TabsTrigger>
          <TabsTrigger value="old">Old regime</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Annual CTC</Label>
              <span className="text-sm tabular-nums text-muted-foreground">{formatINR(ctc)}</span>
            </div>
            <Slider min={300000} max={10000000} step={25000} value={[ctc]} onValueChange={([v]) => setCtc(v)} />
            <Input type="number" value={ctc} onChange={(e) => setCtc(Number(e.target.value) || 0)} />
          </div>
          {regime === "old" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>80C deductions</Label>
                <span className="text-sm tabular-nums text-muted-foreground">{formatINR(deduction80c)}</span>
              </div>
              <Slider min={0} max={150000} step={5000} value={[deduction80c]} onValueChange={([v]) => setDeduction80c(v)} />
            </div>
          ) : null}
          <div className="flex items-center justify-between rounded-lg border border-[var(--hairline)] px-4 py-3">
            <div>
              <p className="text-sm font-medium">Include employee EPF</p>
              <p className="text-xs text-muted-foreground">12% of assumed basic (40% of CTC, capped)</p>
            </div>
            <Switch checked={includeEpf} onCheckedChange={setIncludeEpf} />
          </div>
          <p className="text-xs text-muted-foreground">
            Estimate only. Uses Budget 2025 new-regime slabs, standard deduction, 4% cess, and section 87A rebate. Not tax advice.
          </p>
        </div>
        <div className="grid gap-3">
          <div className="rounded-lg border border-primary/30 bg-surface-card px-3 py-3">
            <p className="text-xs text-muted-foreground">Monthly take-home</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{formatINR(result.takeHomeMonthly)}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Annual tax" value={formatINR(result.annualTax)} />
            <MiniStat label="EPF / year" value={formatINR(result.epfAnnual)} />
            <MiniStat label="Effective rate" value={`${result.effectiveRate.toFixed(1)}%`} />
          </div>
          <div className="h-56 rounded-lg border border-[var(--hairline)] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatINR(Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] px-3 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
