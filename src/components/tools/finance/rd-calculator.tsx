"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { Pencil, RotateCcw } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DEFAULT_RD_INPUT,
  RD_COMPOUNDING,
  RD_METHODS,
  RD_RULES,
  calculateRd,
  hasRdErrors,
  validateRd,
  type RdCompoundingId,
  type RdInput,
  type RdMethodId,
  type RdResult,
  type RdTenureUnit,
} from "@/lib/rd/calculate";
import { cn, formatCompactINR, formatINR } from "@/lib/utils";

const PRINCIPAL_COLOR = "#cc785c";
const INTEREST_COLOR = "#5db8a6";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

type Draft = {
  monthlyDeposit: string;
  ratePercent: string;
  tenureValue: string;
  tenureUnit: RdTenureUnit;
  compounding: RdCompoundingId;
  method: RdMethodId;
};

function formatDraftAmount(value: number) {
  return value.toLocaleString("en-IN");
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function toDraft(input: RdInput): Draft {
  return {
    monthlyDeposit: formatDraftAmount(input.monthlyDeposit),
    ratePercent: String(input.ratePercent),
    tenureValue: String(input.tenureValue),
    tenureUnit: input.tenureUnit,
    compounding: input.compounding,
    method: input.method,
  };
}

function toInput(draft: Draft): RdInput {
  return {
    monthlyDeposit: parseAmount(draft.monthlyDeposit),
    ratePercent: parseAmount(draft.ratePercent),
    tenureValue: parseAmount(draft.tenureValue),
    tenureUnit: draft.tenureUnit,
    compounding: draft.compounding,
    method: draft.method,
  };
}

function money(value: number) {
  return formatINR(value, 0);
}

export function RdCalculator() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_RD_INPUT));
  const [submitted, setSubmitted] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const monthlyRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const input = useMemo(() => toInput(draft), [draft]);
  const errors = useMemo(() => validateRd(input), [input]);
  const result = useMemo(() => calculateRd(input), [input]);
  const invalid = hasRdErrors(errors);

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
  };

  const setTenureUnit = (unit: RdTenureUnit) => {
    if (unit === draft.tenureUnit) return;
    const current = parseAmount(draft.tenureValue);
    if (!Number.isFinite(current) || current <= 0) {
      patch({ tenureUnit: unit, tenureValue: unit === "years" ? "1" : "12" });
      return;
    }
    if (unit === "months") {
      const months = Math.round(current * 12);
      patch({ tenureUnit: unit, tenureValue: String(Math.min(RD_RULES.maxMonths, Math.max(RD_RULES.minMonths, months))) });
      return;
    }
    const years = Math.max(RD_RULES.minYears, Math.min(RD_RULES.maxYears, Math.round(current / 12) || 1));
    patch({ tenureUnit: unit, tenureValue: String(years) });
  };

  const calculate = () => {
    setSubmitted(true);
    if (invalid) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reset = () => {
    setDraft(toDraft(DEFAULT_RD_INPUT));
    setSubmitted(false);
    setShowSchedule(false);
  };

  const editInputs = () => {
    monthlyRef.current?.focus();
    monthlyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const tenureMin = draft.tenureUnit === "years" ? RD_RULES.minYears : RD_RULES.minMonths;
  const tenureMax = draft.tenureUnit === "years" ? RD_RULES.maxYears : RD_RULES.maxMonths;
  const tenureNumber = Number.isFinite(parseAmount(draft.tenureValue)) ? parseAmount(draft.tenureValue) : tenureMin;

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--body)]">
        Enter a monthly deposit, interest rate, and tenure to estimate recurring-deposit maturity. Figures update as you
        type.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <form
          className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            calculate();
          }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Configure</p>

          <Field
            id="rd-monthly"
            label="Monthly deposit (₹)"
            hint={`₹${RD_RULES.minMonthly.toLocaleString("en-IN")} to ₹${RD_RULES.maxMonthly.toLocaleString("en-IN")}`}
            error={submitted ? errors.monthlyDeposit : undefined}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">₹</span>
              <Input
                ref={monthlyRef}
                id="rd-monthly"
                inputMode="decimal"
                value={draft.monthlyDeposit}
                aria-invalid={submitted && Boolean(errors.monthlyDeposit)}
                className="pl-7"
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) patch({ monthlyDeposit: raw });
                }}
              />
            </div>
            <Slider
              className="mt-3"
              min={RD_RULES.minMonthly}
              max={RD_RULES.maxMonthly}
              step={500}
              value={[clamp(parseAmount(draft.monthlyDeposit), RD_RULES.minMonthly, RD_RULES.maxMonthly)]}
              onValueChange={([value]) => patch({ monthlyDeposit: formatDraftAmount(value) })}
              aria-label="Monthly deposit"
            />
          </Field>

          <Field
            id="rd-rate"
            label="Annual interest rate (%)"
            hint="Bank RD rates are typically 6–8% p.a."
            error={submitted ? errors.ratePercent : undefined}
          >
            <Input
              id="rd-rate"
              inputMode="decimal"
              value={draft.ratePercent}
              aria-invalid={submitted && Boolean(errors.ratePercent)}
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ ratePercent: raw });
              }}
            />
            <Slider
              className="mt-3"
              min={RD_RULES.minRatePercent}
              max={RD_RULES.maxRatePercent}
              step={0.05}
              value={[clamp(parseAmount(draft.ratePercent), RD_RULES.minRatePercent, RD_RULES.maxRatePercent)]}
              onValueChange={([value]) => patch({ ratePercent: String(Math.round(value * 100) / 100) })}
              aria-label="Annual interest rate"
            />
          </Field>

          <Field
            id="rd-tenure"
            label={`Tenure (${draft.tenureUnit})`}
            error={submitted ? errors.tenureValue : undefined}
          >
            <Input
              id="rd-tenure"
              inputMode="numeric"
              value={draft.tenureValue}
              aria-invalid={submitted && Boolean(errors.tenureValue)}
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === "" || /^\d*$/.test(raw)) patch({ tenureValue: raw });
              }}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {(["years", "months"] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  aria-pressed={draft.tenureUnit === unit}
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium capitalize transition-colors",
                    draft.tenureUnit === unit
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => setTenureUnit(unit)}
                >
                  {unit}
                </button>
              ))}
            </div>
            <Slider
              className="mt-3"
              min={tenureMin}
              max={tenureMax}
              step={1}
              value={[clamp(tenureNumber, tenureMin, tenureMax)]}
              onValueChange={([value]) => patch({ tenureValue: String(value) })}
              aria-label={`Tenure in ${draft.tenureUnit}`}
            />
          </Field>

          <div>
            <Label>Compounding frequency</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {RD_COMPOUNDING.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  title={item.hint}
                  aria-pressed={draft.compounding === item.id}
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    draft.compounding === item.id
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => patch({ compounding: item.id })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="rd-method">Calculation method</Label>
            <select
              id="rd-method"
              className={selectClass}
              value={draft.method}
              onChange={(event) => patch({ method: event.target.value as RdMethodId })}
            >
              {RD_METHODS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-ink)]">
              {RD_METHODS.find((item) => item.id === draft.method)?.hint}
            </p>
          </div>

          {submitted && invalid ? (
            <p className="text-sm text-destructive" role="alert">
              Fix the highlighted fields to calculate.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" className="min-h-10 min-w-28 px-6">
              Calculate
            </Button>
            <Button type="button" variant="outline" className="min-h-10" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </form>

        <div ref={resultsRef}>
          {result ? (
            <ResultsPanel result={result} onEdit={editInputs} />
          ) : (
            <div className="flex min-h-64 items-center rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center">
              <p className="mx-auto max-w-sm text-sm text-[var(--muted-ink)]">
                Enter a valid monthly deposit, rate, and tenure. Estimated maturity appears here as you type.
              </p>
            </div>
          )}
        </div>
      </div>

      {result ? (
        <>
          <Breakdown result={result} />
          <YearTable result={result} />
          <ScheduleTable result={result} open={showSchedule} onToggle={() => setShowSchedule((value) => !value)} />
        </>
      ) : null}

      <p className="text-xs text-[var(--muted-ink)]">
        Estimates only. Actual maturity can vary by bank, interest-rate reset, compounding day, rounding, TDS, and
        premature-withdrawal rules. This is not investment advice.
      </p>
    </div>
  );
}

function ResultsPanel({ result, onEdit }: { result: RdResult; onEdit: () => void }) {
  const pieData = [
    { name: "Principal", value: Math.max(0, result.totalDeposited), color: PRINCIPAL_COLOR },
    { name: "Interest", value: Math.max(0, result.interestEarned), color: INTEREST_COLOR },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Maturity amount</p>
          <p className="mt-1 font-display text-[32px] leading-none tracking-[-0.03em] text-ink sm:text-[36px]">
            {money(result.maturityAmount)}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            {result.compoundingLabel} compounding · {result.methodLabel} · {result.months} months
          </p>
        </div>
        <Button type="button" variant="outline" className="min-h-10" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Edit Inputs
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Total deposited" value={money(result.totalDeposited)} />
        <Stat label="Interest earned" value={money(result.interestEarned)} />
        <Stat label="Avg. monthly growth" value={money(result.averageMonthlyGrowth)} hint="Interest ÷ tenure months" />
        <Stat label="Avg. yearly growth" value={money(result.averageYearlyGrowth)} hint="Interest ÷ tenure years" />
      </div>

      <div className="rounded-lg border border-[var(--hairline)] bg-canvas p-3">
        <p className="text-sm font-medium text-ink">Principal vs interest</p>
        <div className="relative mx-auto h-52 w-full max-w-xs">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={76} paddingAngle={2} stroke="none">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => money(Number(value ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-ink)]">Maturity</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{formatCompactINR(result.maturityAmount)}</p>
          </div>
        </div>
        <ul className="flex flex-wrap justify-center gap-4 text-xs text-[var(--body)]">
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-coral" aria-hidden />
            Principal {money(result.totalDeposited)} ({result.principalShare.toFixed(0)}%)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal" aria-hidden />
            Interest {money(result.interestEarned)} ({result.interestShare.toFixed(0)}%)
          </li>
        </ul>
      </div>
    </div>
  );
}

function Breakdown({ result }: { result: RdResult }) {
  const depositedWidth = Math.max(8, result.principalShare);
  return (
    <section className="space-y-3 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">Deposit vs interest</h2>
      <div className="flex h-3 overflow-hidden rounded-full bg-canvas" aria-hidden>
        <div className="bg-coral" style={{ width: `${depositedWidth}%` }} />
        <div className="bg-teal" style={{ width: `${Math.max(0, 100 - depositedWidth)}%` }} />
      </div>
      <dl className="grid gap-3 sm:grid-cols-3 text-sm">
        <div>
          <dt className="text-[var(--muted-ink)]">Principal</dt>
          <dd className="mt-1 font-semibold tabular-nums">{money(result.totalDeposited)}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-ink)]">Interest</dt>
          <dd className="mt-1 font-semibold tabular-nums">{money(result.interestEarned)}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-ink)]">Maturity</dt>
          <dd className="mt-1 font-semibold tabular-nums">{money(result.maturityAmount)}</dd>
        </div>
      </dl>
    </section>
  );
}

function YearTable({ result }: { result: RdResult }) {
  if (result.yearly.length < 1) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-ink">Year-by-year growth</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year</TableHead>
            <TableHead>Deposited</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.yearly.map((row) => (
            <TableRow key={row.year}>
              <TableCell>{row.year}</TableCell>
              <TableCell className="tabular-nums">{money(row.invested)}</TableCell>
              <TableCell className="tabular-nums">{money(row.interest)}</TableCell>
              <TableCell className="tabular-nums font-medium">{money(row.balance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

function ScheduleTable({ result, open, onToggle }: { result: RdResult; open: boolean; onToggle: () => void }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Month-by-month schedule</h2>
        <Button type="button" variant="outline" className="min-h-10" onClick={onToggle} aria-expanded={open}>
          {open ? "Hide schedule" : "Show schedule"}
        </Button>
      </div>
      {open ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Deposit</TableHead>
              <TableHead>Interest credited</TableHead>
              <TableHead>Invested</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.schedule.map((row) => (
              <TableRow key={row.month}>
                <TableCell>{row.month}</TableCell>
                <TableCell className="tabular-nums">{money(row.deposit)}</TableCell>
                <TableCell className="tabular-nums">{money(row.interestCredited)}</TableCell>
                <TableCell className="tabular-nums">{money(row.invested)}</TableCell>
                <TableCell className="tabular-nums font-medium">{money(row.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-[var(--muted-ink)]">Optional. Open to see each month’s deposit, interest, and running balance.</p>
      )}
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">{children}</div>
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-[var(--muted-ink)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-4">
      <p className="text-sm text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted-ink)]">{hint}</p> : null}
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
