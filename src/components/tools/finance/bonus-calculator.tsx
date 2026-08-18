"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Check, CheckCircle2, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  BONUS_RULES,
  DEFAULT_BONUS_INPUT,
  calculateBonus,
  hasBonusErrors,
  validateBonus,
  type BonusInput,
} from "@/lib/bonus/calculate";
import { copyText } from "@/lib/security/clipboard";
import { cn, formatINR } from "@/lib/utils";

type Draft = {
  monthlySalary: string;
  ratePercent: number;
  months: number;
};

function toDraft(input: BonusInput): Draft {
  return {
    monthlySalary: String(input.monthlySalary),
    ratePercent: input.ratePercent,
    months: input.months,
  };
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[₹\s,]/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function toInput(draft: Draft): BonusInput {
  return {
    monthlySalary: parseAmount(draft.monthlySalary),
    ratePercent: draft.ratePercent,
    months: draft.months,
  };
}

function rateLabel(value: number) {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(2)}%`;
}

export function BonusCalculatorIndia() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_BONUS_INPUT));
  const [copied, setCopied] = useState(false);

  const input = useMemo(() => toInput(draft), [draft]);
  const errors = useMemo(() => validateBonus(input), [input]);
  const result = useMemo(() => calculateBonus(input), [input]);
  const invalid = hasBonusErrors(errors);

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setCopied(false);
  };

  const copyBonus = async () => {
    if (!result) return;
    const ok = await copyText(formatINR(result.yours));
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(true);
    toast.success("Copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <form className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5" onSubmit={(event) => event.preventDefault()}>
          <div>
            <Label htmlFor="bonus-salary">Monthly Gross Salary (₹)</Label>
            <Input
              id="bonus-salary"
              className="mt-1"
              inputMode="decimal"
              value={draft.monthlySalary}
              aria-invalid={Boolean(errors.monthlySalary)}
              onChange={(event) => patch({ monthlySalary: event.target.value })}
            />
            {errors.monthlySalary ? <p className="mt-1 text-xs text-[var(--error)]">{errors.monthlySalary}</p> : null}
          </div>

          <div>
            <Label>Bonus Rate — {rateLabel(draft.ratePercent)}</Label>
            <Slider
              className="mt-3"
              min={BONUS_RULES.minRate}
              max={BONUS_RULES.maxRate}
              step={0.01}
              value={[draft.ratePercent]}
              onValueChange={([value]) => patch({ ratePercent: Number(value.toFixed(2)) })}
              aria-label="Bonus rate"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={cn(
                  "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                  draft.ratePercent === BONUS_RULES.minRate
                    ? "border-coral bg-coral text-white"
                    : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                )}
                onClick={() => patch({ ratePercent: BONUS_RULES.minRate })}
              >
                Minimum ({rateLabel(BONUS_RULES.minRate)})
              </button>
              <button
                type="button"
                className={cn(
                  "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                  draft.ratePercent === BONUS_RULES.maxRate
                    ? "border-coral bg-coral text-white"
                    : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                )}
                onClick={() => patch({ ratePercent: BONUS_RULES.maxRate })}
              >
                Maximum ({rateLabel(BONUS_RULES.maxRate)})
              </button>
            </div>
          </div>

          <div>
            <Label>Employment Duration — {draft.months} {draft.months === 1 ? "month" : "months"}</Label>
            <Slider
              className="mt-3"
              min={BONUS_RULES.minMonths}
              max={BONUS_RULES.maxMonths}
              step={1}
              value={[draft.months]}
              onValueChange={([value]) => patch({ months: value })}
              aria-label="Employment duration in months"
            />
          </div>

          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setDraft(toDraft(DEFAULT_BONUS_INPUT))}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </form>

        <div className="space-y-4">
          {invalid || !result ? (
            <p className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-8 text-center text-sm text-[var(--muted-ink)]">
              Enter monthly salary to estimate statutory bonus.
            </p>
          ) : (
            <>
              <div
                className={cn(
                  "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
                  result.eligible ? "border-teal/40 bg-teal/10 text-ink" : "border-amber/40 bg-amber/10 text-ink",
                )}
              >
                {result.eligible ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
                )}
                <p>
                  {result.eligible
                    ? "Eligible for statutory bonus under Payment of Bonus Act, 1965"
                    : `Above ₹${BONUS_RULES.eligibilityThreshold.toLocaleString("en-IN")}/month — statutory bonus not applicable. Any bonus paid is ex-gratia (goodwill) at the employer's discretion.`}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <ResultCard title={`Minimum (${rateLabel(BONUS_RULES.minRate)})`} value={result.minimum} />
                <ResultCard
                  title={`Your Bonus (${rateLabel(result.ratePercent)})`}
                  value={result.yours}
                  emphasize
                />
                <ResultCard title={`Maximum (${rateLabel(BONUS_RULES.maxRate)})`} value={result.maximum} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--body)]">
                  Calculation wage: {formatINR(result.calculationWage)}/month
                  {result.cappedAtCeiling ? ` (ceiling ${formatINR(BONUS_RULES.wageCeiling)})` : ""}
                </p>
                <Button type="button" size="sm" variant="outline" onClick={() => void copyBonus()}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              {result.cappedAtCeiling ? (
                <p className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--body)]">
                  The wage ceiling for bonus calculation is {formatINR(BONUS_RULES.wageCeiling)}/month. Even if your
                  salary is higher, bonus is calculated on {formatINR(BONUS_RULES.wageCeiling)}. This ceiling was last
                  revised in {BONUS_RULES.amendedYear}.
                </p>
              ) : (
                <p className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--body)]">
                  Your monthly salary is below the {formatINR(BONUS_RULES.wageCeiling)} ceiling, so bonus uses the full
                  salary as the calculation wage.
                </p>
              )}

              <p className="text-xs text-[var(--muted-ink)]">
                Based on Payment of Bonus Act, 1965 (amended {BONUS_RULES.amendedYear}). Wage ceiling{" "}
                {formatINR(BONUS_RULES.wageCeiling)} and eligibility threshold{" "}
                {formatINR(BONUS_RULES.eligibilityThreshold)} have not been revised since {BONUS_RULES.amendedYear}.
                Consult HR for actual company policy.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "8.33–20%", desc: "Statutory bonus range" },
          { title: "₹7,000 ceiling", desc: "Wage cap for calculation" },
          { title: "Eligibility", desc: "₹21,000 salary threshold" },
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

function ResultCard({ title, value, emphasize = false }: { title: string; value: number; emphasize?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-4",
        emphasize ? "border-coral/50 bg-coral/10" : "border-[var(--hairline)] bg-surface-card",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">{title}</p>
      <p className={cn("mt-2 font-display text-2xl font-semibold tabular-nums", emphasize ? "text-coral" : "text-ink")}>
        {formatINR(value)}
      </p>
    </div>
  );
}
