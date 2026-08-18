"use client";

import { useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import { Check, Copy, Pencil, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CAGR_RULES,
  DEFAULT_CAGR_INPUT,
  calculateCagr,
  hasCagrErrors,
  validateCagr,
  type CagrInput,
  type CagrMode,
  type CagrResult,
} from "@/lib/cagr/calculate";
import { cn, formatINR } from "@/lib/utils";

type Draft = {
  mode: CagrMode;
  initial: string;
  final: string;
  target: string;
  cagrPercent: string;
  years: string;
  inflationPercent: string;
};

const MODES: Array<{ id: CagrMode; label: string }> = [
  { id: "find-cagr", label: "Find CAGR" },
  { id: "find-fv", label: "Future Value" },
  { id: "find-required", label: "Required CAGR" },
];

function formatDraftAmount(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[₹\s,]/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  const first = cleaned.indexOf(".");
  const normalized =
    first === -1 ? cleaned : `${cleaned.slice(0, first + 1)}${cleaned.slice(first + 1).replace(/\./g, "")}`;
  return Number(normalized);
}

function toDraft(input: CagrInput): Draft {
  return {
    mode: input.mode,
    initial: formatDraftAmount(input.initial),
    final: formatDraftAmount(input.final),
    target: formatDraftAmount(input.target),
    cagrPercent: String(input.cagrPercent),
    years: String(input.years),
    inflationPercent: String(input.inflationPercent),
  };
}

function toInput(draft: Draft): CagrInput {
  return {
    mode: draft.mode,
    initial: parseAmount(draft.initial),
    final: parseAmount(draft.final),
    target: parseAmount(draft.target),
    cagrPercent: parseAmount(draft.cagrPercent),
    years: parseAmount(draft.years),
    inflationPercent: parseAmount(draft.inflationPercent),
  };
}

function money(value: number) {
  return formatINR(value, 0);
}

function pct(value: number, digits = 2) {
  return `${value.toFixed(digits)}%`;
}

export function CagrCalculator() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_CAGR_INPUT));
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showYears, setShowYears] = useState(false);
  const initialRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const input = useMemo(() => toInput(draft), [draft]);
  const errors = useMemo(() => validateCagr(input), [input]);
  const result = useMemo(() => calculateCagr(input), [input]);
  const invalid = hasCagrErrors(errors);

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setCopied(false);
  };

  const calculate = () => {
    setSubmitted(true);
    if (invalid) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reset = () => {
    setDraft(toDraft(DEFAULT_CAGR_INPUT));
    setSubmitted(false);
    setCopied(false);
    setShowYears(false);
  };

  const copyPrimary = async () => {
    if (!result) return;
    const text =
      result.mode === "find-cagr"
        ? pct(result.cagr)
        : result.mode === "find-fv"
          ? money(result.futureValue)
          : pct(result.requiredCagr);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--body)]">
        Find CAGR from two values, project a future value, or see the rate needed to hit a target. Compare absolute
        return, inflation-adjusted real CAGR, and Rule of 72 doubling time.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <form
          className="space-y-6 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            calculate();
          }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Configure</p>

          <div>
            <p className="text-sm font-medium text-ink">Calculation mode</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Calculation mode">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={draft.mode === item.id}
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
          </div>

          <MoneyField
            id="cagr-initial"
            label="Initial value (₹)"
            inputRef={initialRef}
            value={draft.initial}
            error={submitted ? errors.initial : undefined}
            onChange={(initial) => patch({ initial })}
          />

          {draft.mode === "find-cagr" ? (
            <MoneyField
              id="cagr-final"
              label="Final value (₹)"
              value={draft.final}
              error={submitted ? errors.final : undefined}
              onChange={(final) => patch({ final })}
            />
          ) : null}

          {draft.mode === "find-fv" ? (
            <Field id="cagr-rate" label="Expected CAGR (% p.a.)" error={submitted ? errors.cagrPercent : undefined}>
              <Input
                id="cagr-rate"
                inputMode="decimal"
                value={draft.cagrPercent}
                aria-invalid={submitted && Boolean(errors.cagrPercent)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ cagrPercent: raw });
                }}
              />
            </Field>
          ) : null}

          {draft.mode === "find-required" ? (
            <MoneyField
              id="cagr-target"
              label="Target value (₹)"
              value={draft.target}
              error={submitted ? errors.target : undefined}
              onChange={(target) => patch({ target })}
            />
          ) : null}

          <Field
            id="cagr-years"
            label="Time period (years)"
            hint={draft.mode === "find-cagr" ? "Use the holding period of the lump-sum investment." : "How long you will stay invested."}
            error={submitted ? errors.years : undefined}
          >
            <Input
              id="cagr-years"
              inputMode="decimal"
              value={draft.years}
              aria-invalid={submitted && Boolean(errors.years)}
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ years: raw });
              }}
            />
          </Field>

          {draft.mode === "find-cagr" ? (
            <Field
              id="cagr-inflation"
              label="Inflation rate (%)"
              hint="Used only for real CAGR. Default is 6%."
              error={submitted ? errors.inflationPercent : undefined}
            >
              <Input
                id="cagr-inflation"
                inputMode="decimal"
                value={draft.inflationPercent}
                aria-invalid={submitted && Boolean(errors.inflationPercent)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ inflationPercent: raw });
                }}
              />
            </Field>
          ) : null}

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

        <div ref={resultsRef} className="lg:sticky lg:top-24 lg:self-start">
          {result ? (
            <ResultsPanel
              result={result}
              copied={copied}
              onCopy={() => void copyPrimary()}
              onEdit={() => {
                initialRef.current?.focus();
                initialRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            />
          ) : (
            <div className="flex min-h-64 items-center rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center">
              <p className="mx-auto max-w-sm text-sm text-[var(--muted-ink)]">
                Choose a mode and enter values. CAGR, future value, or the required rate appear here as you type.
              </p>
            </div>
          )}
        </div>
      </div>

      {result?.mode === "find-fv" ? (
        <YearTable result={result} show={showYears} onToggle={() => setShowYears((value) => !value)} />
      ) : null}

      <Benchmarks />

      <p className="text-xs text-[var(--muted-ink)]">
        Estimates only. {CAGR_RULES.rulesLabel}. CAGR is for lump-sum start and end values, not SIPs. Past returns do
        not guarantee future results. This is not investment advice.
      </p>
    </div>
  );
}

function ResultsPanel({
  result,
  copied,
  onCopy,
  onEdit,
}: {
  result: CagrResult;
  copied: boolean;
  onCopy: () => void;
  onEdit: () => void;
}) {
  const headline =
    result.mode === "find-cagr"
      ? pct(result.cagr)
      : result.mode === "find-fv"
        ? money(result.futureValue)
        : pct(result.requiredCagr);
  const headlineLabel =
    result.mode === "find-cagr" ? "CAGR" : result.mode === "find-fv" ? "Future value" : "Required CAGR";
  const copyLabel =
    result.mode === "find-cagr" ? "Copy CAGR" : result.mode === "find-fv" ? "Copy future value" : "Copy required CAGR";

  return (
    <div className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">{headlineLabel}</p>
          <p className="mt-1 font-display text-[32px] leading-none tracking-[-0.03em] text-ink sm:text-[36px]">
            {headline}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            {result.mode === "find-cagr"
              ? `${money(result.initial)} → ${money(result.final)} · ${result.years} years`
              : result.mode === "find-fv"
                ? `${money(result.initial)} at ${pct(result.cagr, 1)} for ${result.years} years`
                : `${money(result.initial)} → ${money(result.target)} · ${result.years} years`}
          </p>
        </div>
        <Button type="button" variant="outline" className="min-h-10" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Edit Inputs
        </Button>
      </div>

      {result.mode === "find-cagr" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Absolute return" value={pct(result.absoluteReturn)} />
          <Stat
            label={`Real CAGR (${result.inflationPercent}% inflation)`}
            value={pct(result.realCagr)}
          />
          <Stat
            label="Rule of 72"
            value={result.doublingYears != null ? `${result.doublingYears.toFixed(1)} yrs to double` : "—"}
          />
        </div>
      ) : null}

      {result.mode === "find-fv" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Total gain" value={money(result.totalGain)} />
          <Stat label="Absolute return" value={pct(result.absoluteReturn)} />
          <Stat
            label="Rule of 72"
            value={result.doublingYears != null ? `${result.doublingYears.toFixed(1)} yrs to double` : "—"}
          />
        </div>
      ) : null}

      {result.mode === "find-required" ? (
        <>
          <Stat
            label="Rule of 72"
            value={result.doublingYears != null ? `${result.doublingYears.toFixed(1)} yrs to double` : "—"}
          />
          <p className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-[var(--body)]">
            This is{" "}
            <span className="font-medium text-ink">
              {result.niftyComparison === "above"
                ? "above"
                : result.niftyComparison === "below"
                  ? "below"
                  : "within"}
            </span>{" "}
            Nifty 50’s historical 10-year CAGR of ~{CAGR_RULES.niftyMinPercent}–{CAGR_RULES.niftyMaxPercent}%.
          </p>
        </>
      ) : null}

      {result.doublingYears != null ? (
        <p className="text-sm text-[var(--body)]">
          At {pct(result.mode === "find-fv" ? result.cagr : result.mode === "find-cagr" ? result.cagr : result.requiredCagr, 1)}{" "}
          CAGR, money doubles every {result.doublingYears.toFixed(1)} years.
        </p>
      ) : null}

      <Button type="button" variant="outline" className="min-h-10 w-full" onClick={onCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : copyLabel}
      </Button>
    </div>
  );
}

function YearTable({
  result,
  show,
  onToggle,
}: {
  result: Extract<CagrResult, { mode: "find-fv" }>;
  show: boolean;
  onToggle: () => void;
}) {
  if (result.yearRows.length === 0) return null;
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Year-by-year growth</h2>
        <Button type="button" variant="outline" className="min-h-10" onClick={onToggle} aria-expanded={show}>
          {show ? "Hide table" : "Show year-by-year growth table"}
        </Button>
      </div>
      {show ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Gain</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.yearRows.map((row) => (
              <TableRow key={row.year}>
                <TableCell>{row.year}</TableCell>
                <TableCell className="tabular-nums">{money(row.balance)}</TableCell>
                <TableCell className="tabular-nums">{money(row.gain)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </section>
  );
}

function Benchmarks() {
  return (
    <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">CAGR benchmarks for India</h2>
      <p className="mt-1 text-sm text-[var(--muted-ink)]">Use this to judge whether a CAGR looks strong or weak.</p>
      <div className="mt-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Investment type</TableHead>
              <TableHead>Typical CAGR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CAGR_RULES.benchmarks.map((row) => (
              <TableRow key={row.name}>
                <TableCell>{row.name}</TableCell>
                <TableCell className="tabular-nums font-medium">{row.range}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function MoneyField({
  id,
  label,
  value,
  error,
  onChange,
  inputRef,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <Field id={id} label={label} error={error}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
          ₹
        </span>
        <Input
          ref={inputRef}
          id={id}
          inputMode="decimal"
          value={value}
          aria-invalid={Boolean(error)}
          className="pl-7"
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) onChange(raw);
          }}
        />
      </div>
    </Field>
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
      {hint && !error ? <p className="mt-1 text-xs text-[var(--muted-ink)]">{hint}</p> : null}
      {error ? (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-4">
      <p className="text-sm text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
