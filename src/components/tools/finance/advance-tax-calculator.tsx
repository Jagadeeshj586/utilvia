"use client";

import { useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import { Check, Copy, Pencil, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ADVANCE_TAX_RULES,
  DEFAULT_ADVANCE_TAX_INPUT,
  calculateAdvanceTax,
  hasAdvanceTaxErrors,
  validateAdvanceTax,
  type AdvanceTaxIncomeType,
  type AdvanceTaxInput,
  type AdvanceTaxInstallment,
  type AdvanceTaxRegime,
  type AdvanceTaxResult,
} from "@/lib/advance-tax/calculate";
import { cn, formatINR } from "@/lib/utils";

type Draft = {
  income: string;
  incomeType: AdvanceTaxIncomeType;
  tds: string;
  regime: AdvanceTaxRegime;
};

const INCOME_TYPES: Array<{ id: AdvanceTaxIncomeType; label: string }> = [
  { id: "salaried", label: "Salaried + other" },
  { id: "business", label: "Business/Freelancer" },
  { id: "44ada", label: "Section 44ADA" },
];

const REGIMES: Array<{ id: AdvanceTaxRegime; label: string }> = [
  { id: "new", label: "New Regime" },
  { id: "old", label: "Old Regime" },
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

function toDraft(input: AdvanceTaxInput): Draft {
  return {
    income: formatDraftAmount(input.income),
    incomeType: input.incomeType,
    tds: formatDraftAmount(input.tds),
    regime: input.regime,
  };
}

function toInput(draft: Draft): AdvanceTaxInput {
  return {
    income: parseAmount(draft.income),
    incomeType: draft.incomeType,
    tds: parseAmount(draft.tds) || 0,
    regime: draft.regime,
  };
}

function money(value: number) {
  return formatINR(value, 0);
}

export function AdvanceTaxCalculator() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_ADVANCE_TAX_INPUT));
  const [submitted, setSubmitted] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const incomeRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const input = useMemo(() => toInput(draft), [draft]);
  const errors = useMemo(() => validateAdvanceTax(input), [input]);
  const result = useMemo(() => calculateAdvanceTax(input), [input]);
  const invalid = hasAdvanceTaxErrors(errors);

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setCopiedKey(null);
  };

  const calculate = () => {
    setSubmitted(true);
    if (invalid) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reset = () => {
    setDraft(toDraft(DEFAULT_ADVANCE_TAX_INPUT));
    setSubmitted(false);
    setCopiedKey(null);
  };

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--body)]">
        Estimate FY 2026-27 tax, check whether advance tax is required, and see amounts due on 15 June, 15 September, 15
        December, and 15 March. Section 44ADA uses a single March payment.
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

          <MoneyField
            id="advance-tax-income"
            label="Estimated annual income (₹)"
            hint={
              draft.incomeType === "44ada"
                ? "Gross professional receipts. 50% is treated as taxable income."
                : draft.incomeType === "salaried"
                  ? "Salary plus other income before standard deduction."
                  : "Estimated business or freelance profit for the year."
            }
            inputRef={incomeRef}
            value={draft.income}
            error={submitted ? errors.income : undefined}
            onChange={(income) => patch({ income })}
          />

          <div>
            <p className="text-sm font-medium text-ink">Income type</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Income type">
              {INCOME_TYPES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={draft.incomeType === item.id}
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    draft.incomeType === item.id
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => patch({ incomeType: item.id })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <MoneyField
            id="advance-tax-tds"
            label="TDS already deducted (₹)"
            hint="Tax already withheld. Advance tax is calculated on the remaining liability."
            value={draft.tds}
            error={submitted ? errors.tds : undefined}
            onChange={(tds) => patch({ tds })}
          />

          <div>
            <p className="text-sm font-medium text-ink">Tax regime</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Tax regime">
              {REGIMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={draft.regime === item.id}
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    draft.regime === item.id
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => patch({ regime: item.id })}
                >
                  {item.label}
                </button>
              ))}
            </div>
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

        <div ref={resultsRef} className="lg:sticky lg:top-24 lg:self-start">
          {result ? (
            <ResultsPanel
              result={result}
              copiedKey={copiedKey}
              onCopy={(key, value) => void copyText(key, value)}
              onEdit={() => {
                incomeRef.current?.focus();
                incomeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            />
          ) : (
            <div className="flex min-h-64 items-center rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center">
              <p className="mx-auto max-w-sm text-sm text-[var(--muted-ink)]">
                Enter income, type, TDS, and regime. Tax, eligibility, and installment amounts appear here as you type.
              </p>
            </div>
          )}
        </div>
      </div>

      {result ? <InstallmentTable result={result} copiedKey={copiedKey} onCopy={(key, value) => void copyText(key, value)} /> : null}

      <p className="text-xs text-[var(--muted-ink)]">
        Estimates only. {ADVANCE_TAX_RULES.rulesLabel}. If you miss an installment, interest under Sections 234B and 234C
        can apply. Update the estimate if actual income changes. This is not tax advice.
      </p>
    </div>
  );
}

function ResultsPanel({
  result,
  copiedKey,
  onCopy,
  onEdit,
}: {
  result: AdvanceTaxResult;
  copiedKey: string | null;
  onCopy: (key: string, value: string) => void;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Total tax</p>
          <p className="mt-1 font-display text-[32px] leading-none tracking-[-0.03em] text-ink sm:text-[36px]">
            {money(result.totalTax)}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            Net tax payable {money(result.netTax)} after TDS of {money(result.tds)}
          </p>
        </div>
        <Button type="button" variant="outline" className="min-h-10" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Edit Inputs
        </Button>
      </div>

      <p
        className={cn(
          "rounded-lg border px-3 py-2 text-sm",
          result.required
            ? "border-coral/30 bg-coral/10 text-[var(--body)]"
            : "border-teal/30 bg-teal/10 text-[var(--body)]",
        )}
      >
        Advance tax is{" "}
        <span className="font-medium text-ink">{result.required ? "required" : "not required"}</span>
        {result.required
          ? result.singleMarchPayment
            ? " — pay 100% by 15 March 2027 under Section 44ADA."
            : " — pay in four cumulative installments."
          : ` — net tax after TDS is ₹${ADVANCE_TAX_RULES.threshold.toLocaleString("en-IN")} or less.`}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Taxable income" value={money(result.taxableIncome)} />
        <Stat label="TDS deducted" value={`- ${money(result.tds)}`} />
        <Stat label="Net tax payable" value={money(result.netTax)} />
        {result.standardDeduction > 0 ? (
          <Stat label="Standard deduction" value={money(result.standardDeduction)} />
        ) : null}
      </div>

      {result.adaOverCap ? (
        <p className="text-sm text-[var(--body)]">
          Gross receipts are above the typical Section 44ADA cap of{" "}
          {money(ADVANCE_TAX_RULES.adaReceiptsSoftCap)}. Confirm whether the presumptive scheme still applies.
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="min-h-10 w-full"
        onClick={() => onCopy("net", money(result.netTax))}
      >
        {copiedKey === "net" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copiedKey === "net" ? "Copied" : "Copy net tax payable"}
      </Button>
    </div>
  );
}

function InstallmentTable({
  result,
  copiedKey,
  onCopy,
}: {
  result: AdvanceTaxResult;
  copiedKey: string | null;
  onCopy: (key: string, value: string) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-ink">
        {result.singleMarchPayment ? "Section 44ADA payment" : "Installment schedule"}
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Installment</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Cumulative %</TableHead>
            <TableHead>Amount due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.installments.map((row) => (
            <InstallmentRow
              key={row.id}
              row={row}
              copied={copiedKey === row.id}
              onCopy={() => onCopy(row.id, money(row.amountDue))}
            />
          ))}
        </TableBody>
      </Table>
      <p className="text-sm text-[var(--muted-ink)]">
        If you miss any installment, interest under Section 234B (1% per month on unpaid tax) and Section 234C (1% per
        month per quarter for shortfall) can apply.
      </p>
    </section>
  );
}

function InstallmentRow({
  row,
  copied,
  onCopy,
}: {
  row: AdvanceTaxInstallment;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{row.label}</TableCell>
      <TableCell>{row.dueDate}</TableCell>
      <TableCell className="tabular-nums">{row.cumulativePercent}%</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="tabular-nums font-medium">{money(row.amountDue)}</span>
          <Button type="button" variant="ghost" className="h-8 px-2" onClick={onCopy} aria-label={`Copy ${row.label}`}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function MoneyField({
  id,
  label,
  value,
  hint,
  error,
  onChange,
  inputRef,
}: {
  id: string;
  label: string;
  value: string;
  hint?: string;
  error?: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
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
