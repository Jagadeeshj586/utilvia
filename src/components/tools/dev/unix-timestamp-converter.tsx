"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { TimeZoneSelector } from "@/components/tools/student/timezone-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  TIMESTAMP_EXAMPLES,
  dateTimeToUnix,
  formatNow,
  resultCopyText,
  timestampToDate,
  type ConvertedInstant,
  type TimestampUnit,
} from "@/lib/unix-timestamp/convert";
import { copyText } from "@/lib/security/clipboard";
import { getBrowserTimeZone } from "@/lib/timezone/convert";
import { canonicalizeTimeZoneId } from "@/lib/timezone/data";
import { cn } from "@/lib/utils";

const UNITS: Array<{ id: TimestampUnit; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: "seconds", label: "Seconds" },
  { id: "milliseconds", label: "Milliseconds" },
];

function currentStamp(now: number) {
  return String(Math.floor(now / 1000));
}

function wallFromNow(now: number, timeZone: string) {
  const formatted = formatNow(timeZone, now);
  if ("error" in formatted) {
    return { date: "1970-01-01", time: "00:00:00" };
  }
  return { date: formatted.isoDate, time: formatted.time };
}

export function UnixTimestampConverter() {
  const [now, setNow] = useState(() => Date.now());
  const [live, setLive] = useState(true);
  const [timeZone, setTimeZone] = useState("UTC");
  const [unit, setUnit] = useState<TimestampUnit>("auto");
  const [stamp, setStamp] = useState(() => currentStamp(Date.now()));
  const [date, setDate] = useState("1970-01-01");
  const [time, setTime] = useState("00:00:00");
  const [copied, setCopied] = useState<string | null>(null);
  const localZone = canonicalizeTimeZoneId(getBrowserTimeZone());

  useEffect(() => {
    const wall = wallFromNow(Date.now(), "UTC");
    setDate(wall.date);
    setTime(wall.time);
  }, []);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [live]);

  const fromStamp = useMemo(() => timestampToDate(stamp, unit, timeZone), [stamp, unit, timeZone]);
  const fromDate = useMemo(() => dateTimeToUnix(date, time, timeZone), [date, time, timeZone]);
  const liveNow = useMemo(() => formatNow(timeZone, now), [timeZone, now]);

  const copy = async (label: string, value: string) => {
    const ok = await copyText(value);
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(label);
    toast.success("Copied");
    window.setTimeout(() => setCopied((current) => (current === label ? null : current)), 1600);
  };

  const resetStamp = () => {
    const current = Date.now();
    setStamp(currentStamp(current));
    setUnit("auto");
  };

  const resetDate = () => {
    const wall = wallFromNow(Date.now(), timeZone);
    setDate(wall.date);
    setTime(wall.time);
  };

  const useNow = () => {
    const current = Date.now();
    setNow(current);
    setStamp(currentStamp(current));
    setUnit("auto");
    const wall = wallFromNow(current, timeZone);
    setDate(wall.date);
    setTime(wall.time);
  };

  const copyIcon = (key: string) => (copied === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Current Unix time</p>
            <p className="mt-1 font-display text-[28px] leading-none tracking-[-0.03em] text-ink sm:text-[32px]">
              {"error" in liveNow ? "—" : liveNow.seconds.toLocaleString("en-US")}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-ink)]">
              {"error" in liveNow ? liveNow.error : `${liveNow.milliseconds} ms · ${liveNow.weekday}, ${liveNow.date} ${liveNow.time}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="min-h-10" onClick={useNow}>
              Use now
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-10"
              disabled={"error" in liveNow}
              onClick={() => {
                if ("error" in liveNow) return;
                void copy("now-s", String(liveNow.seconds));
              }}
            >
              {copyIcon("now-s")}
              Copy seconds
            </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[var(--hairline)] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">Live update</p>
            <p className="text-xs text-[var(--muted-ink)]">Refresh the current timestamp every second.</p>
          </div>
          <Switch checked={live} onCheckedChange={setLive} aria-label="Live update current timestamp" />
        </div>
      </section>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={timeZone === "UTC"}
            className={cn(
              "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
              timeZone === "UTC" ? "border-coral bg-coral text-white" : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
            )}
            onClick={() => setTimeZone("UTC")}
          >
            UTC
          </button>
          <button
            type="button"
            aria-pressed={timeZone === localZone}
            className={cn(
              "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
              timeZone === localZone ? "border-coral bg-coral text-white" : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
            )}
            onClick={() => setTimeZone(localZone)}
          >
            Local time
          </button>
        </div>
        <TimeZoneSelector
          id="unix-tz"
          label="Time zone"
          value={timeZone}
          onChange={setTimeZone}
          compact
          referenceDate={"error" in liveNow ? new Date(now) : new Date(liveNow.milliseconds)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-lg tracking-[-0.02em] text-ink">Timestamp → Date</h2>
              <p className="mt-1 text-xs text-[var(--muted-ink)]">Paste an epoch value. Auto detects seconds vs milliseconds by length.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-10"
                disabled={!fromStamp.ok}
                onClick={() => {
                  if (fromStamp.ok) void copy("stamp", resultCopyText(fromStamp.result));
                }}
              >
                {copyIcon("stamp")}
                Copy
              </Button>
              <Button type="button" variant="outline" className="min-h-10" onClick={resetStamp}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="unix-stamp">Unix timestamp</Label>
            <Input
              id="unix-stamp"
              value={stamp}
              inputMode="decimal"
              spellCheck={false}
              aria-invalid={stamp.trim().length > 0 && !fromStamp.ok}
              className="mt-1 font-mono"
              placeholder="1609459200"
              onChange={(event) => setStamp(event.target.value)}
            />
            {fromStamp.ok ? (
              <p className="mt-1 text-xs text-[var(--muted-ink)]">
                Detected as {fromStamp.parsed.detected}
                {unit === "auto" ? " from the number of digits" : " (manual)"}.
              </p>
            ) : (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {fromStamp.error}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Timestamp unit</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Timestamp unit">
              {UNITS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={unit === item.id}
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    unit === item.id
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => setUnit(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Examples</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TIMESTAMP_EXAMPLES.map((example) => (
                <button
                  key={example.value}
                  type="button"
                  title={example.hint}
                  className="min-h-10 rounded-lg border border-[var(--hairline)] bg-canvas px-3 text-left text-sm text-ink transition-colors hover:border-coral/40"
                  onClick={() => {
                    setStamp(example.value);
                    setUnit("auto");
                  }}
                >
                  <span className="font-medium">{example.label}</span>
                  <span className="ml-2 font-mono text-xs text-[var(--muted-ink)]">{example.value}</span>
                </button>
              ))}
            </div>
          </div>

          {fromStamp.ok ? <ResultCard result={fromStamp.result} onCopy={copy} copyKey="stamp-field" /> : null}
        </section>

        <section className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-lg tracking-[-0.02em] text-ink">Date → Timestamp</h2>
              <p className="mt-1 text-xs text-[var(--muted-ink)]">Enter a local date and time in the selected time zone.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-10"
                disabled={!fromDate.ok}
                onClick={() => {
                  if (fromDate.ok) void copy("date", resultCopyText(fromDate.result));
                }}
              >
                {copyIcon("date")}
                Copy
              </Button>
              <Button type="button" variant="outline" className="min-h-10" onClick={resetDate}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="unix-date">Date</Label>
              <Input
                id="unix-date"
                type="date"
                value={date}
                aria-invalid={!fromDate.ok}
                className="mt-1"
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="unix-time">Time</Label>
              <Input
                id="unix-time"
                type="time"
                step={1}
                value={time}
                aria-invalid={!fromDate.ok}
                className="mt-1"
                onChange={(event) => setTime(event.target.value)}
              />
            </div>
          </div>
          {!fromDate.ok ? (
            <p className="text-xs text-destructive" role="alert">
              {fromDate.error}
            </p>
          ) : fromDate.warning ? (
            <p className="text-xs text-[var(--muted-ink)]">{fromDate.warning}</p>
          ) : (
            <p className="text-xs text-[var(--muted-ink)]">Seconds are optional. Use HH:MM:SS for a precise epoch.</p>
          )}

          {fromDate.ok ? <ResultCard result={fromDate.result} onCopy={copy} copyKey="date-field" /> : null}
        </section>
      </div>
    </div>
  );
}

function ResultCard({
  result,
  onCopy,
  copyKey,
}: {
  result: ConvertedInstant;
  onCopy: (key: string, value: string) => void;
  copyKey: string;
}) {
  const rows = [
    { label: "Converted date", value: result.date },
    { label: "Time", value: result.time },
    { label: "Day of week", value: result.weekday },
    { label: "Timezone", value: `${result.timeZoneLabel} · ${result.abbreviation} · ${result.offset}` },
    { label: "Unix (seconds)", value: String(result.seconds), copy: true },
    { label: "Unix (milliseconds)", value: String(result.milliseconds), copy: true },
  ];

  return (
    <div className="space-y-2 rounded-lg border border-[var(--hairline)] bg-canvas p-3">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted-ink)]">{row.label}</p>
            <p className="mt-0.5 break-all text-sm tabular-nums text-ink">{row.value}</p>
          </div>
          {row.copy ? (
            <button
              type="button"
              className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--muted-ink)] hover:bg-surface-soft hover:text-ink"
              aria-label={`Copy ${row.label}`}
              onClick={() => onCopy(`${copyKey}-${row.label}`, row.value)}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
