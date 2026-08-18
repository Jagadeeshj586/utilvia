"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Check, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DEFAULT_SWP_INPUT,
  SWP_RULES,
  calculateSwp,
  formatDuration,
  hasSwpErrors,
  monthlyRate,
  swpCopyText,
  validateSwp,
  type SwpInput,
  type SwpMode,
} from "@/lib/swp/calculate";
import { copyText } from "@/lib/security/clipboard";
import { cn, formatCompactINR, formatINR } from "@/lib/utils";

const CORAL = "#cc785c";
const TEAL = "#5db8a6";

const CORPUS_PRESETS = [10_00_000, 25_00_000, 50_00_000, 1_00_00_000];
const WITHDRAWAL_PRESETS = [15_000, 25_000, 50_000, 1_00_000];

type Draft = {
  mode: SwpMode;
  corpus: string;
  monthlyWithdrawal: string;
  returnPercent: string;
  years: string;
};

function formatDraftAmount(value: number) {
  if (!Number.isFinite(value)) return "";
  return Math.round(value).toLocaleString("en-IN");
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[₹\s,]/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function toDraft(input: SwpInput): Draft {
  return {
    mode: input.mode,
    corpus: formatDraftAmount(input.corpus),
    monthlyWithdrawal: formatDraftAmount(input.monthlyWithdrawal),
    returnPercent: String(input.returnPercent),
    years: String(input.years),
  };
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function SwpCalculator() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_SWP_INPUT));
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const input = useMemo<SwpInput>(
    () => ({
      mode: draft.mode,
      corpus: parseAmount(draft.corpus),
      monthlyWithdrawal: parseAmount(draft.monthlyWithdrawal),
      returnPercent: parseAmount(draft.returnPercent),
      years: parseAmount(draft.years),
    }),
    [draft],
  );
  const errors = useMemo(() => validateSwp(input), [input]);
  const result = useMemo(() => calculateSwp(input), [input]);
  const invalid = hasSwpErrors(errors);

  const monthlyReturnPreview = Number.isFinite(input.corpus) && Number.isFinite(input.returnPercent)
    ? Math.round(input.corpus * monthlyRate(input.returnPercent))
    : NaN;

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setCopied(false);
  };

  const copyResult = async () => {
    if (!result) return;
    const ok = await copyText(swpCopyText(result));
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(true);
    toast.success("Copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const formatMoneyField = (key: "corpus" | "monthlyWithdrawal") => {
    const value = parseAmount(draft[key]);
    if (Number.isFinite(value)) patch({ [key]: formatDraftAmount(value) });
  };

  const tick = dark ? "#a09d96" : "#6c6a64";
  const grid = dark ? "#3a3833" : "#e6dfd8";
  const chartColor = result?.mode === "duration" && result.neverDepletes ? TEAL : CORAL;

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--body)]">
        See how long a corpus lasts with monthly SWP withdrawals, or how much you need for a target income. Figures
        update as you type.
      </p>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="SWP mode">
        {(
          [
            { id: "duration", label: "How long will it last?" },
            { id: "corpus", label: "Corpus needed" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={draft.mode === item.id}
            className={cn(
              "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
              draft.mode === item.id
                ? "border-coral bg-coral text-white"
                : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
            )}
            onClick={() => patch({ mode: item.id })}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <form
          className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Configure</p>

          {draft.mode === "duration" ? (
            <Field id="swp-corpus" label="Corpus (₹)" hint="Starting mutual fund balance" error={errors.corpus}>
              <MoneyInput
                id="swp-corpus"
                value={draft.corpus}
                invalid={Boolean(errors.corpus)}
                onChange={(value) => patch({ corpus: value })}
                onBlur={() => formatMoneyField("corpus")}
              />
              <PresetRow
                values={CORPUS_PRESETS}
                current={input.corpus}
                onSelect={(value) => patch({ corpus: formatDraftAmount(value) })}
              />
            </Field>
          ) : (
            <Field
              id="swp-pmt"
              label="Monthly Income Needed (₹)"
              hint="Amount you want every month"
              error={errors.monthlyWithdrawal}
            >
              <MoneyInput
                id="swp-pmt"
                value={draft.monthlyWithdrawal}
                invalid={Boolean(errors.monthlyWithdrawal)}
                onChange={(value) => patch({ monthlyWithdrawal: value })}
                onBlur={() => formatMoneyField("monthlyWithdrawal")}
              />
              <PresetRow
                values={WITHDRAWAL_PRESETS}
                current={input.monthlyWithdrawal}
                onSelect={(value) => patch({ monthlyWithdrawal: formatDraftAmount(value) })}
              />
            </Field>
          )}

          {draft.mode === "duration" ? (
            <Field
              id="swp-pmt"
              label="Monthly Withdrawal (₹)"
              hint="Fixed SWP amount each month"
              error={errors.monthlyWithdrawal}
            >
              <MoneyInput
                id="swp-pmt"
                value={draft.monthlyWithdrawal}
                invalid={Boolean(errors.monthlyWithdrawal)}
                onChange={(value) => patch({ monthlyWithdrawal: value })}
                onBlur={() => formatMoneyField("monthlyWithdrawal")}
              />
              <PresetRow
                values={WITHDRAWAL_PRESETS}
                current={input.monthlyWithdrawal}
                onSelect={(value) => patch({ monthlyWithdrawal: formatDraftAmount(value) })}
              />
            </Field>
          ) : (
            <Field
              id="swp-years"
              label="Withdrawal Period (years)"
              hint={`${SWP_RULES.minYears}–${SWP_RULES.maxYears} years`}
              error={errors.years}
            >
              <Input
                id="swp-years"
                inputMode="numeric"
                value={draft.years}
                aria-invalid={Boolean(errors.years)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*$/.test(raw)) patch({ years: raw });
                }}
              />
              <Slider
                className="mt-3"
                min={SWP_RULES.minYears}
                max={SWP_RULES.maxYears}
                step={1}
                value={[clamp(parseAmount(draft.years), SWP_RULES.minYears, SWP_RULES.maxYears)]}
                onValueChange={([value]) => patch({ years: String(value) })}
                aria-label="Withdrawal period in years"
              />
            </Field>
          )}

          <Field
            id="swp-rate"
            label="Expected Annual Return (%)"
            hint={`${SWP_RULES.minReturn}%–${SWP_RULES.maxReturn}% illustrative`}
            error={errors.returnPercent}
          >
            <Input
              id="swp-rate"
              inputMode="decimal"
              value={draft.returnPercent}
              aria-invalid={Boolean(errors.returnPercent)}
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ returnPercent: raw });
              }}
            />
            <Slider
              className="mt-3"
              min={SWP_RULES.minReturn}
              max={SWP_RULES.maxReturn}
              step={0.5}
              value={[clamp(parseAmount(draft.returnPercent), SWP_RULES.minReturn, SWP_RULES.maxReturn)]}
              onValueChange={([value]) => patch({ returnPercent: String(value) })}
              aria-label="Expected annual return"
            />
            {draft.mode === "duration" && Number.isFinite(monthlyReturnPreview) ? (
              <p className="mt-2 text-xs text-[var(--muted-ink)]">
                Monthly return at this rate: {formatINR(monthlyReturnPreview)}
              </p>
            ) : null}
          </Field>

          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setDraft(toDraft({ ...DEFAULT_SWP_INPUT, mode: draft.mode }))}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </form>

        <div className="space-y-4">
          {invalid || !result ? (
            <p className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-8 text-center text-sm text-[var(--muted-ink)]">
              Enter corpus, withdrawal, and return to project your SWP.
            </p>
          ) : result.mode === "duration" ? (
            <>
              <div
                className={cn(
                  "rounded-xl border px-4 py-4",
                  result.neverDepletes ? "border-teal/40 bg-teal/10" : "border-coral/40 bg-coral/10",
                )}
              >
                {result.neverDepletes ? (
                  <>
                    <p className="font-display text-2xl font-semibold text-ink">Corpus never depletes</p>
                    <p className="mt-2 text-sm text-[var(--body)]">
                      Monthly return ({formatINR(result.monthlyReturn)}) ≥ withdrawal (
                      {formatINR(input.monthlyWithdrawal)}). Your corpus is self-sustaining at this return rate.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">
                      Corpus will last
                    </p>
                    <p className="mt-1 font-display text-3xl font-semibold text-ink">{formatDuration(result.months)}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <MiniStat label="Total withdrawn" value={formatINR(result.totalWithdrawn)} />
                      <MiniStat label="Returns earned" value={formatINR(result.returnsEarned)} />
                    </div>
                  </>
                )}
                <Button type="button" size="sm" variant="outline" className="mt-4" onClick={() => void copyResult()}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy duration"}
                </Button>
              </div>

              <p className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--body)]">
                Vs Fixed Deposit: {formatINR(input.corpus)} FD at {SWP_RULES.fdRatePercent}% generates{" "}
                {formatINR(result.fdMonthly)}/month interest but never depletes capital. SWP withdraws from corpus but
                can earn higher returns in equity MFs (historically 10–12%).
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">Corpus required</p>
              <p className="mt-1 font-display text-3xl font-semibold text-coral">{formatINR(result.corpusRequired)}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MiniStat label="Total you'll withdraw" value={formatINR(result.totalWithdrawn)} />
                <MiniStat label="Returns funding the gap" value={formatINR(result.returnsFundingGap)} />
              </div>
              <Button type="button" size="sm" variant="outline" className="mt-4" onClick={() => void copyResult()}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy corpus"}
              </Button>
            </div>
          )}

          {result && result.yearly.length > 0 ? (
            <>
              <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
                <p className="text-sm font-semibold">Corpus over time</p>
                <div className="mt-4 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={result.yearly.map((row) => ({ year: `Y${row.year}`, Balance: row.closing }))}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid stroke={grid} strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{ fill: tick, fontSize: 12 }} />
                      <YAxis
                        tick={{ fill: tick, fontSize: 12 }}
                        tickFormatter={(value) => formatCompactINR(Number(value))}
                        width={56}
                      />
                      <Tooltip
                        formatter={(value) => formatINR(Number(value ?? 0))}
                        contentStyle={{
                          background: "var(--canvas, #faf9f5)",
                          border: "1px solid var(--hairline)",
                          borderRadius: 8,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Balance"
                        stroke={chartColor}
                        fill={chartColor}
                        fillOpacity={0.22}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[var(--hairline)] bg-surface-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Opening</TableHead>
                      <TableHead>Withdrawn</TableHead>
                      <TableHead>Returns</TableHead>
                      <TableHead>Closing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.yearly.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell className="tabular-nums">{formatINR(row.opening)}</TableCell>
                        <TableCell className="tabular-nums">{formatINR(row.withdrawn)}</TableCell>
                        <TableCell className="tabular-nums">{formatINR(row.returns)}</TableCell>
                        <TableCell className="tabular-nums">{formatINR(row.closing)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : null}

          <p className="rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-[var(--body)]">
            SWP from equity mutual funds: First {formatINR(SWP_RULES.ltcgExempt)} annual gains are exempt (LTCG). Beyond
            that, gains taxed at {SWP_RULES.ltcgLongRate}% (held &gt; 12 months) or {SWP_RULES.stcgRate}% (held ≤ 12
            months). Debt mutual funds: taxed at slab rate regardless of holding period.
          </p>
          <p className="text-xs text-[var(--muted-ink)]">
            SWP projections assume constant returns — actual mutual fund returns vary. Capital gains tax on withdrawals
            is not included in corpus depletion math.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "Depletion", desc: "Year-by-year table + chart" },
          { title: "Corpus needed", desc: "Target income mode" },
          { title: "Vs FD", desc: "Compare fixed deposit income" },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3">
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-[var(--muted-ink)]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MoneyInput({
  id,
  value,
  invalid,
  onChange,
  onBlur,
}: {
  id: string;
  value: string;
  invalid?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
        ₹
      </span>
      <Input
        id={id}
        inputMode="decimal"
        value={value}
        aria-invalid={invalid}
        className="pl-7 tabular-nums"
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) onChange(raw);
        }}
        onBlur={onBlur}
      />
    </div>
  );
}

function PresetRow({
  values,
  current,
  onSelect,
}: {
  values: number[];
  current: number;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {values.map((value) => (
        <button
          key={value}
          type="button"
          className={cn(
            "min-h-9 rounded-lg border px-2.5 text-xs font-medium transition-colors",
            current === value
              ? "border-coral bg-coral text-white"
              : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
          )}
          onClick={() => onSelect(value)}
        >
          {formatCompactINR(value)}
        </button>
      ))}
    </div>
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
      {hint ? <p className="mt-0.5 text-xs text-[var(--muted-ink)]">{hint}</p> : null}
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1 text-xs text-[var(--error)]">{error}</p> : null}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-surface-card px-3 py-3">
      <p className="text-xs text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
