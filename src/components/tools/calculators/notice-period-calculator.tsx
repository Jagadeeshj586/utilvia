"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/utils";

const PRESETS = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "custom", label: "Custom" },
] as const;

function startOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function addWorkingDays(start: Date, days: number) {
  const next = new Date(start);
  let counted = 0;
  while (counted < days) {
    next.setDate(next.getDate() + 1);
    if (!isWeekend(next)) counted += 1;
  }
  return next;
}

function addCalendarDays(start: Date, days: number) {
  const next = new Date(start);
  next.setDate(next.getDate() + days);
  return next;
}

function monthDays(year: number, month: number) {
  const days: Date[] = [];
  const cursor = new Date(year, month, 1);
  while (cursor.getMonth() === month) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function sameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function NoticePeriodCalculator() {
  const [resignation, setResignation] = useState(() => new Date().toISOString().slice(0, 10));
  const [preset, setPreset] = useState<(typeof PRESETS)[number]["value"]>("60");
  const [customDays, setCustomDays] = useState("60");
  const [workingOnly, setWorkingOnly] = useState(false);
  const [salary, setSalary] = useState("");

  const noticeDays = preset === "custom" ? Number(customDays) || 0 : Number(preset);

  const result = useMemo(() => {
    if (!resignation || noticeDays <= 0) return null;
    const start = startOfDay(new Date(resignation));
    if (Number.isNaN(start.getTime())) return null;
    const lastWorkingDay = workingOnly ? addWorkingDays(start, noticeDays) : addCalendarDays(start, noticeDays);
    const today = startOfDay(new Date());
    const daysRemaining = Math.max(0, Math.round((startOfDay(lastWorkingDay).getTime() - today.getTime()) / 86_400_000));
    const calendar = monthDays(start.getFullYear(), start.getMonth());
    if (lastWorkingDay.getMonth() !== start.getMonth() || lastWorkingDay.getFullYear() !== start.getFullYear()) {
      calendar.push(...monthDays(lastWorkingDay.getFullYear(), lastWorkingDay.getMonth()));
    }
    return { start, lastWorkingDay, daysRemaining, weeksRemaining: daysRemaining / 7, calendar };
  }, [noticeDays, resignation, workingOnly]);

  const buyout = result && Number(salary) > 0 && result.daysRemaining > 0 ? (Number(salary) / 30) * result.daysRemaining : null;

  const uniqueDays = result
    ? Array.from(new Map(result.calendar.map((day) => [day.toDateString(), day])).values())
    : [];
  const leadingBlanks = uniqueDays[0] ? uniqueDays[0].getDay() : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="resignation-date">Resignation Date</Label>
          <Input id="resignation-date" type="date" value={resignation} onChange={(e) => setResignation(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="notice-days">Notice Period</Label>
          <select
            id="notice-days"
            value={preset}
            onChange={(e) => setPreset(e.target.value as (typeof PRESETS)[number]["value"])}
            className="mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm"
          >
            {PRESETS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        {preset === "custom" ? (
          <div>
            <Label htmlFor="custom-notice">Custom Notice Days</Label>
            <Input id="custom-notice" value={customDays} onChange={(e) => setCustomDays(e.target.value)} className="mt-1" placeholder="60" />
          </div>
        ) : null}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={workingOnly} onChange={(e) => setWorkingOnly(e.target.checked)} />
          Count working days only (skip weekends)
        </label>
        <div>
          <Label htmlFor="monthly-salary">Monthly Salary (optional, for buyout)</Label>
          <Input id="monthly-salary" value={salary} onChange={(e) => setSalary(e.target.value)} className="mt-1" placeholder="80,000" />
        </div>
      </div>

      {result ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Last Working Day" value={result.lastWorkingDay.toDateString()} highlight />
            <Stat label="Days Remaining" value={String(result.daysRemaining)} />
            <Stat label="Weeks Remaining" value={result.weeksRemaining.toFixed(1)} />
            <Stat label="Notice Days" value={String(noticeDays)} />
          </div>
          {buyout != null ? (
            <div className="rounded-lg border border-primary/30 bg-surface-card p-5">
              <p className="text-sm text-[var(--muted-ink)]">Notice Buyout Amount</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{formatINR(buyout)}</p>
            </div>
          ) : null}
          <div>
            <p className="mb-2 text-sm font-medium">Notice Period Calendar</p>
            <p className="mb-3 text-xs text-[var(--muted-ink)]">Highlighted range from resignation date to last working day.</p>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-1 text-[var(--muted-ink)]">
                  {day}
                </div>
              ))}
              {Array.from({ length: leadingBlanks }).map((_, index) => (
                <div key={`blank-${index}`} />
              ))}
              {uniqueDays.map((day) => {
                const inRange = day >= result.start && day <= result.lastWorkingDay;
                const isStart = sameDay(day, result.start);
                const isEnd = sameDay(day, result.lastWorkingDay);
                return (
                  <div
                    key={day.toISOString()}
                    className={`rounded-md py-2 ${
                      isStart || isEnd
                        ? "bg-primary text-primary-foreground"
                        : inRange
                          ? "bg-primary/15 text-ink"
                          : "text-[var(--muted-ink)]"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>
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
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
