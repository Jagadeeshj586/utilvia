"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Pencil, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DEFAULT_LEAVE_ENCASHMENT_INPUT,
  LEAVE_ENCASHMENT_RULES,
  calculateLeaveEncashment,
  hasLeaveEncashmentErrors,
  validateLeaveEncashment,
  type LeaveEncashmentBasis,
  type LeaveEncashmentInput,
  type LeaveEncashmentResult,
  type LeaveEncashmentType,
} from "@/lib/leave-encashment/calculate";
import { cn, formatINR } from "@/lib/utils";

type Draft = {
  monthlyBasic: string;
  leaveDays: string;
  encashmentType: LeaveEncashmentType;
  basis: LeaveEncashmentBasis;
  slabPercent: string;
};

function formatDraftAmount(value: number) {
  return value.toLocaleString("en-IN");
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function toDraft(input: LeaveEncashmentInput): Draft {
  return {
    monthlyBasic: formatDraftAmount(input.monthlyBasic),
    leaveDays: String(input.leaveDays),
    encashmentType: input.encashmentType,
    basis: input.basis,
    slabPercent: String(input.slabPercent),
  };
}

function toInput(draft: Draft): LeaveEncashmentInput {
  return {
    monthlyBasic: parseAmount(draft.monthlyBasic),
    leaveDays: parseAmount(draft.leaveDays),
    encashmentType: draft.encashmentType,
    basis: draft.basis,
    slabPercent: parseAmount(draft.slabPercent),
  };
}

function money(value: number) {
  return formatINR(value, 0);
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function LeaveEncashmentCalculator() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_LEAVE_ENCASHMENT_INPUT));
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const salaryRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const input = useMemo(() => toInput(draft), [draft]);
  const errors = useMemo(() => validateLeaveEncashment(input), [input]);
  const result = useMemo(() => calculateLeaveEncashment(input), [input]);
  const invalid = hasLeaveEncashmentErrors(errors);

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
    setDraft(toDraft(DEFAULT_LEAVE_ENCASHMENT_INPUT));
    setSubmitted(false);
    setCopied(false);
  };

  const editInputs = () => {
    salaryRef.current?.focus();
    salaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const copyNet = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(money(result.netAfterTax));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--body)]">
        Estimate leave encashment for private and government formulas, then see tax exemption at retirement under the
        Budget 2023 ₹25 lakh limit. Figures update as you type.
      </p>

      <div className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-[var(--body)]">
        Budget 2023 raised the retirement leave-encashment exemption from{" "}
        {money(LEAVE_ENCASHMENT_RULES.previousExemptionLimit)} to{" "}
        <span className="font-medium text-ink">{money(LEAVE_ENCASHMENT_RULES.statutoryExemptionLimit)}</span>. Encashment
        during service is fully taxable.
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <form
          className="space-y-6 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            calculate();
          }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Configure</p>

          <Section title="1. Salary and leave">
            <Field id="leave-basic" label="Monthly basic salary (₹)" error={submitted ? errors.monthlyBasic : undefined}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
                  ₹
                </span>
                <Input
                  ref={salaryRef}
                  id="leave-basic"
                  inputMode="decimal"
                  value={draft.monthlyBasic}
                  aria-invalid={submitted && Boolean(errors.monthlyBasic)}
                  className="pl-7"
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) patch({ monthlyBasic: raw });
                  }}
                />
              </div>
            </Field>
            <Field
              id="leave-days"
              label={`Leave balance — ${Number.isFinite(input.leaveDays) ? input.leaveDays : "—"} days`}
              hint="Usually earned / privilege leave only. Range 1–300 days."
              error={submitted ? errors.leaveDays : undefined}
            >
              <Input
                id="leave-days"
                inputMode="numeric"
                value={draft.leaveDays}
                aria-invalid={submitted && Boolean(errors.leaveDays)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*$/.test(raw)) patch({ leaveDays: raw });
                }}
              />
              <Slider
                className="mt-3"
                min={LEAVE_ENCASHMENT_RULES.minLeaveDays}
                max={LEAVE_ENCASHMENT_RULES.maxLeaveDays}
                step={1}
                value={[
                  clamp(
                    parseAmount(draft.leaveDays),
                    LEAVE_ENCASHMENT_RULES.minLeaveDays,
                    LEAVE_ENCASHMENT_RULES.maxLeaveDays,
                  ),
                ]}
                onValueChange={([value]) => patch({ leaveDays: String(value) })}
                aria-label="Leave days to encash"
              />
            </Field>
          </Section>

          <Section title="2. Encashment type">
            <div>
              <p className="text-sm font-medium text-ink">When are you encashing?</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Encashment type">
                {(
                  [
                    ["during-service", "During service (taxable)"],
                    ["retirement", "Retirement / resignation"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={draft.encashmentType === id}
                    className={cn(
                      "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                      draft.encashmentType === id
                        ? "border-coral bg-coral text-white"
                        : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                    )}
                    onClick={() => patch({ encashmentType: id })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Calculation basis</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Calculation basis">
                {(
                  [
                    ["private", `Private (÷${LEAVE_ENCASHMENT_RULES.privateWorkingDays} days)`],
                    ["government", `Government (÷${LEAVE_ENCASHMENT_RULES.governmentYearDays})`],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={draft.basis === id}
                    className={cn(
                      "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                      draft.basis === id
                        ? "border-coral bg-coral text-white"
                        : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                    )}
                    onClick={() => patch({ basis: id })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="3. Tax slab">
            <div>
              <p className="text-sm font-medium text-ink">Income tax slab rate (%)</p>
              <p className="mt-1 text-xs text-[var(--muted-ink)]">
                Applied only to the taxable portion after exemption.
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Income tax slab">
                {LEAVE_ENCASHMENT_RULES.slabPercents.map((rate) => {
                  const selected = draft.slabPercent === String(rate);
                  return (
                    <button
                      key={rate}
                      type="button"
                      aria-pressed={selected}
                      className={cn(
                        "min-h-10 min-w-14 rounded-lg border px-3 text-sm font-medium transition-colors",
                        selected
                          ? "border-coral bg-coral text-white"
                          : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                      )}
                      onClick={() => patch({ slabPercent: String(rate) })}
                    >
                      {rate}%
                    </button>
                  );
                })}
              </div>
              {submitted && errors.slabPercent ? (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {errors.slabPercent}
                </p>
              ) : null}
            </div>
          </Section>

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
            <ResultsPanel result={result} copied={copied} onCopy={() => void copyNet()} onEdit={editInputs} />
          ) : (
            <div className="flex min-h-64 items-center rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center">
              <p className="mx-auto max-w-sm text-sm text-[var(--muted-ink)]">
                Enter salary, leave days, type, and tax slab. Estimated encashment and tax appear here as you type.
              </p>
            </div>
          )}
        </div>
      </div>

      {result ? (
        <>
          {result.encashmentType === "retirement" ? <ExemptionBreakdown result={result} /> : <DuringServiceNote />}
          <FormulaNote result={result} />
        </>
      ) : null}

      <p className="text-xs text-[var(--muted-ink)]">
        Estimates only. {LEAVE_ENCASHMENT_RULES.rulesLabel}. Encashment during service is fully taxable. Confirm the day
        basis and leave type with your employer HR policy. This is not tax advice.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}

function ResultsPanel({
  result,
  copied,
  onCopy,
  onEdit,
}: {
  result: LeaveEncashmentResult;
  copied: boolean;
  onCopy: () => void;
  onEdit: () => void;
}) {
  const exemptShare = result.encashmentAmount <= 0 ? 0 : (result.taxExemption / result.encashmentAmount) * 100;

  return (
    <div className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">
            Leave encashment amount
          </p>
          <p className="mt-1 font-display text-[32px] leading-none tracking-[-0.03em] text-ink sm:text-[36px]">
            {money(result.encashmentAmount)}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            {result.leaveDays} days · {result.basis === "private" ? "private" : "government"} formula ·{" "}
            {result.encashmentType === "retirement" ? "retirement / resignation" : "during service"}
          </p>
        </div>
        <Button type="button" variant="outline" className="min-h-10" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Edit Inputs
        </Button>
      </div>

      {result.encashmentType === "during-service" ? (
        <p className="rounded-lg border border-amber/40 bg-[color-mix(in_srgb,var(--amber,#e8a55a)_12%,var(--canvas))] px-3 py-2 text-sm text-ink">
          Encashment during service is fully taxable at your {result.slabPercent}% slab.
        </p>
      ) : result.taxableAmount === 0 ? (
        <p className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-[var(--body)]">
          This estimate falls within the retirement exemption, so illustrated tax is ₹0.
        </p>
      ) : (
        <p className="rounded-lg border border-amber/40 bg-[color-mix(in_srgb,var(--amber,#e8a55a)_12%,var(--canvas))] px-3 py-2 text-sm text-ink">
          Amount above the exemption is taxable at {result.slabPercent}%.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Tax exemption" value={money(result.taxExemption)} />
        <Stat label="Taxable leave encashment" value={money(result.taxableAmount)} />
        <Stat label="Tax payable" value={money(result.taxPayable)} hint={`${result.slabPercent}% of taxable amount`} />
        <Stat label="Net amount after tax" value={money(result.netAfterTax)} />
      </div>

      <div className="rounded-lg border border-[var(--hairline)] bg-canvas p-3">
        <p className="text-sm font-medium text-ink">Exempt vs taxable</p>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-surface-soft" aria-hidden>
          <div className="bg-teal" style={{ width: `${exemptShare}%` }} />
          <div className="bg-coral" style={{ width: `${Math.max(0, 100 - exemptShare)}%` }} />
        </div>
        <ul className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--body)]">
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal" aria-hidden />
            Exempt {money(result.taxExemption)}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-coral" aria-hidden />
            Taxable {money(result.taxableAmount)}
          </li>
        </ul>
      </div>

      <Button type="button" variant="outline" className="min-h-10 w-full" onClick={onCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy net amount"}
      </Button>
    </div>
  );
}

function ExemptionBreakdown({ result }: { result: LeaveEncashmentResult }) {
  const rows = [
    { label: "Actual received", value: result.encashmentAmount },
    { label: "10 months' salary", value: result.tenMonthsSalary },
    { label: "Statutory limit", value: result.statutoryLimit },
  ];

  return (
    <section className="space-y-3 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">Exemption breakdown (minimum of)</h2>
      <ul className="space-y-2 text-sm text-[var(--body)]">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-3">
            <span>{row.label}</span>
            <span className="tabular-nums font-medium text-ink">{money(row.value)}</span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-3 border-t border-[var(--hairline)] pt-2 font-medium text-ink">
          <span>Exempt amount applied</span>
          <span className="tabular-nums">{money(result.taxExemption)}</span>
        </li>
      </ul>
    </section>
  );
}

function DuringServiceNote() {
  return (
    <section className="space-y-2 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">During-service tax note</h2>
      <p className="text-sm text-[var(--body)]">
        Leave encashment while you are still employed is treated as salary income. The ₹25 lakh retirement exemption
        does not apply, so the full encashment is illustrated as taxable at your selected slab.
      </p>
    </section>
  );
}

function FormulaNote({ result }: { result: LeaveEncashmentResult }) {
  return (
    <section className="space-y-2 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">How this amount is calculated</h2>
      <p className="text-sm text-[var(--body)]">
        Private sector formula: (Basic ÷ {LEAVE_ENCASHMENT_RULES.privateWorkingDays}) × {result.leaveDays} days ={" "}
        <span className="font-medium text-ink">{money(result.privateSectorAmount)}</span>
      </p>
      <p className="text-sm text-[var(--body)]">
        Government formula: (Basic × 12 ÷ {LEAVE_ENCASHMENT_RULES.governmentYearDays}) × {result.leaveDays} days ={" "}
        <span className="font-medium text-ink">{money(result.governmentAmount)}</span>
      </p>
      <p className="text-xs text-[var(--muted-ink)]">
        The highlighted result uses the {result.basis === "private" ? "private" : "government"} basis. Some employers
        use 30 days per month instead — verify with HR.
      </p>
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
      {hint && !error ? <p className="mt-1 text-xs text-[var(--muted-ink)]">{hint}</p> : null}
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
