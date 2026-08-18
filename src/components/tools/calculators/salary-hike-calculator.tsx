"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/utils";

export function SalaryHikeCalculator() {
  const [mode, setMode] = useState<"forward" | "reverse">("forward");
  const [current, setCurrent] = useState("800000");
  const [hike, setHike] = useState("15");
  const [desired, setDesired] = useState("920000");

  const currentN = Number(current.replace(/,/g, "")) || 0;
  const hikeN = Number(hike) || 0;
  const desiredN = Number(desired.replace(/,/g, "")) || 0;

  const result = useMemo(() => {
    if (mode === "forward") {
      const increment = currentN * (hikeN / 100);
      const next = currentN + increment;
      return { increment, next, monthly: increment / 12, hikePct: hikeN };
    }
    const increment = desiredN - currentN;
    const hikePct = currentN === 0 ? 0 : (increment / currentN) * 100;
    return { increment, next: desiredN, monthly: increment / 12, hikePct };
  }, [currentN, desiredN, hikeN, mode]);

  return (
    <div className="space-y-6">
      <div>
        <Label>Calculator Mode</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" variant={mode === "forward" ? "default" : "outline"} onClick={() => setMode("forward")}>
            Hike % → New Salary
          </Button>
          <Button size="sm" variant={mode === "reverse" ? "default" : "outline"} onClick={() => setMode("reverse")}>
            New Salary → Hike %
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="current-salary">Current Salary (₹)</Label>
          <Input id="current-salary" value={current} onChange={(event) => setCurrent(event.target.value)} className="mt-1" placeholder="8,00,000" />
        </div>
        {mode === "forward" ? (
          <div>
            <Label htmlFor="hike-percent">Hike Percentage (%)</Label>
            <Input id="hike-percent" value={hike} onChange={(event) => setHike(event.target.value)} className="mt-1" placeholder="15" />
          </div>
        ) : (
          <div>
            <Label htmlFor="desired-salary">Desired New Salary (₹)</Label>
            <Input id="desired-salary" value={desired} onChange={(event) => setDesired(event.target.value)} className="mt-1" placeholder="9,20,000" />
          </div>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Hike Amount" value={formatINR(result.increment)} />
        <Stat label="New Salary" value={formatINR(result.next)} highlight />
        <Stat label="Monthly Increase" value={formatINR(result.monthly)} />
      </div>
      {mode === "reverse" ? (
        <p className="text-sm text-[var(--muted-ink)]">
          Hike percentage: <span className="font-semibold tabular-nums text-ink">{result.hikePct.toFixed(2)}%</span>
        </p>
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
