"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateDaysBetween,
  defaultDatePair,
  relativeToToday,
  toDateInputValue,
} from "@/lib/days-between/calculate";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-4 text-center">
      <p className="font-display text-[1.75rem] leading-none tracking-[-0.03em] text-ink tabular-nums sm:text-[2rem]">
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function DaysBetweenDatesTool() {
  const defaults = useMemo(() => defaultDatePair(), []);
  const [start, setStart] = useState(defaults.start);
  const [end, setEnd] = useState(defaults.end);

  const result = useMemo(() => calculateDaysBetween(start, end), [start, end]);
  const relative = useMemo(() => relativeToToday(start, end), [start, end]);

  const swapDates = () => {
    setStart(end);
    setEnd(start);
  };

  const setToday = (which: "start" | "end") => {
    const today = toDateInputValue(new Date());
    if (which === "start") setStart(today);
    else setEnd(today);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="days-start">Start date</Label>
            <button
              type="button"
              onClick={() => setToday("start")}
              className="text-xs font-medium text-primary transition-colors hover:underline"
            >
              Today
            </button>
          </div>
          <Input
            id="days-start"
            type="date"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="mx-auto h-10 w-10 shrink-0"
          onClick={swapDates}
          aria-label="Swap start and end dates"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="days-end">End date</Label>
            <button
              type="button"
              onClick={() => setToday("end")}
              className="text-xs font-medium text-primary transition-colors hover:underline"
            >
              Today
            </button>
          </div>
          <Input
            id="days-end"
            type="date"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
          />
        </div>
      </div>

      {result ? (
        <>
          <div
            className="rounded-lg border border-[var(--hairline)] bg-canvas px-5 py-6 text-center sm:px-6"
            aria-live="polite"
          >
            <p className="text-sm font-medium text-muted-foreground">Total days between dates</p>
            <p className="mt-1 font-display text-[2.75rem] leading-none tracking-[-0.03em] text-ink sm:text-[3.25rem]">
              {result.totalDays.toLocaleString()}
            </p>
            <p className="mt-3 text-sm text-[var(--body)]">
              {result.totalDays === 0
                ? "Start and end are the same day"
                : result.swapped
                  ? `${result.totalDays.toLocaleString()} day${result.totalDays === 1 ? "" : "s"} from end back to start`
                  : `${result.totalDays.toLocaleString()} day${result.totalDays === 1 ? "" : "s"} from start to end`}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Years" value={result.years} />
            <StatCard label="Months" value={result.months} />
            <StatCard label="Days" value={result.days} />
          </div>

          {relative ? (
            <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-4 text-center sm:px-5">
              <p className="text-sm font-medium text-ink">Relative to today</p>
              <p className="mt-1 text-sm text-[var(--body)]">{relative.label}</p>
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--hairline)] bg-surface-soft px-5 py-8 text-center text-sm text-muted-foreground">
          Choose a valid start and end date to see the difference.
        </div>
      )}

      <p className="text-sm leading-[1.65] text-muted-foreground">
        Convention: the day count is end date minus start date. The start date is not counted as a full
        elapsed day — so Jan 1 to Jan 3 is 2 days, not 3.
      </p>
    </div>
  );
}
