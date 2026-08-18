"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ymdDiff(from: Date, to: Date) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AgeCalculator() {
  const [dob, setDob] = useState("1998-08-15");
  const [asOf, setAsOf] = useState("");

  const result = useMemo(() => {
    const birth = new Date(dob);
    const end = new Date(asOf || todayIso());
    if (Number.isNaN(birth.getTime()) || Number.isNaN(end.getTime()) || end < birth) return null;
    const parts = ymdDiff(birth, end);
    const totalDays = Math.round(Math.abs(end.getTime() - birth.getTime()) / 86_400_000);
    return {
      ...parts,
      totalMonths: parts.years * 12 + parts.months,
      totalWeeks: Math.floor(totalDays / 7),
      totalDays,
      totalHours: totalDays * 24,
    };
  }, [asOf, dob]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dob-input">Date of Birth</Label>
          <Input id="dob-input" type="date" value={dob} onChange={(event) => setDob(event.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="as-of-input">Calculate age as of</Label>
          <Input id="as-of-input" type="date" value={asOf} onChange={(event) => setAsOf(event.target.value)} className="mt-1" />
          <p className="mt-1 text-xs text-[var(--muted-ink)]">Age on date (for govt exam cutoff, leave blank for today)</p>
        </div>
      </div>
      {result ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Years", result.years],
            ["Months", result.months],
            ["Days", result.days],
            ["Total months", result.totalMonths],
            ["Total weeks", result.totalWeeks],
            ["Total days", result.totalDays],
            ["Total hours (approx.)", result.totalHours],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
              <p className="text-sm text-[var(--muted-ink)]">{label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-destructive">Enter a valid date of birth on or before the as-of date.</p>
      )}
    </div>
  );
}
