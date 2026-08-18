"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNum } from "@/lib/utils";

export function BmiCalculator() {
  const [metric, setMetric] = useState(true);
  const [cm, setCm] = useState("170");
  const [kg, setKg] = useState("68");
  const [ft, setFt] = useState("5");
  const [inch, setInch] = useState("7");
  const [lb, setLb] = useState("150");

  const heightM = metric ? Number(cm) / 100 : (Number(ft) * 12 + Number(inch)) * 0.0254;
  const weightKg = metric ? Number(kg) : Number(lb) * 0.45359237;
  const bmi = heightM > 0 && weightKg > 0 ? weightKg / (heightM * heightM) : null;
  const category = bmi == null ? "-" : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const low = heightM > 0 ? 18.5 * heightM * heightM : 0;
  const high = heightM > 0 ? 24.9 * heightM * heightM : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="group" aria-label="Unit system">
        <Button type="button" size="sm" variant={metric ? "default" : "outline"} onClick={() => setMetric(true)}>Metric</Button>
        <Button type="button" size="sm" variant={!metric ? "default" : "outline"} onClick={() => setMetric(false)}>Imperial</Button>
      </div>
      {metric ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="bmi-cm">Height (cm)</Label>
            <Input id="bmi-cm" inputMode="decimal" value={cm} onChange={(e) => setCm(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="bmi-kg">Weight (kg)</Label>
            <Input id="bmi-kg" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} className="mt-1" />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="bmi-ft">Height (ft)</Label>
            <Input id="bmi-ft" inputMode="decimal" value={ft} onChange={(e) => setFt(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="bmi-in">Inches</Label>
            <Input id="bmi-in" inputMode="decimal" value={inch} onChange={(e) => setInch(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="bmi-lb">Weight (lb)</Label>
            <Input id="bmi-lb" inputMode="decimal" value={lb} onChange={(e) => setLb(e.target.value)} className="mt-1" />
          </div>
        </div>
      )}
      <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5" aria-live="polite">
        <p className="text-sm text-[var(--muted-ink)]">BMI</p>
        <p className="text-3xl font-semibold tabular-nums">{bmi == null ? "-" : formatNum(bmi, 1)}</p>
        <p className="mt-2 text-sm">{category}</p>
        <p className="mt-1 text-xs text-[var(--muted-ink)]">Healthy range: {formatNum(low, 1)}–{formatNum(high, 1)} kg</p>
      </div>
    </div>
  );
}

