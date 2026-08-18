"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, Check, CheckCircle2, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_ESI_INPUT,
  ESI_RULES,
  calculateEsi,
  esiCopyText,
  hasEsiErrors,
  validateEsi,
  type EsiInput,
} from "@/lib/esi/calculate";
import { copyText } from "@/lib/security/clipboard";
import { cn, formatINR } from "@/lib/utils";

type Draft = {
  monthlyWages: string;
  disabled: boolean;
};

function toDraft(input: EsiInput): Draft {
  return {
    monthlyWages: String(input.monthlyWages),
    disabled: input.disabled,
  };
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[₹\s,]/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

const BENEFITS = [
  "Medical treatment for you and family (ESIC & empanelled hospitals)",
  "Sickness benefit: 70% of daily wages for up to 91 days",
  "Maternity benefit: 100% wages for 26 weeks",
  "Disability benefit: permanent or temporary",
  "Dependent benefit: to family on death due to injury",
  "Funeral expenses: lump sum payment",
];

export function EsiCalculator() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_ESI_INPUT));
  const [copied, setCopied] = useState(false);

  const input = useMemo(
    () => ({
      monthlyWages: parseAmount(draft.monthlyWages),
      disabled: draft.disabled,
    }),
    [draft],
  );
  const errors = useMemo(() => validateEsi(input), [input]);
  const result = useMemo(() => calculateEsi(input), [input]);
  const invalid = hasEsiErrors(errors);

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setCopied(false);
  };

  const copyResult = async () => {
    if (!result) return;
    const ok = await copyText(esiCopyText(input.monthlyWages, result));
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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <form className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5" onSubmit={(event) => event.preventDefault()}>
          <div>
            <Label htmlFor="esi-wages">Monthly Gross Wages (₹)</Label>
            <Input
              id="esi-wages"
              className="mt-1"
              inputMode="decimal"
              value={draft.monthlyWages}
              aria-invalid={Boolean(errors.monthlyWages)}
              onChange={(event) => patch({ monthlyWages: event.target.value })}
            />
            {errors.monthlyWages ? <p className="mt-1 text-xs text-[var(--error)]">{errors.monthlyWages}</p> : null}
          </div>

          <div>
            <Label id="esi-disabled-label">Disabled employee?</Label>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="esi-disabled-label">
              {[
                { value: false, label: "No" },
                { value: true, label: "Yes (₹25,000 limit)" },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    draft.disabled === option.value
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => patch({ disabled: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setDraft(toDraft(DEFAULT_ESI_INPUT))}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </form>

        <div className="space-y-4">
          {invalid || !result ? (
            <p className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-8 text-center text-sm text-[var(--muted-ink)]">
              Enter monthly gross wages to calculate ESI.
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
                    ? "ESI applicable — you and your employer both contribute"
                    : "ESI not applicable — gross wages exceed the ESI wage ceiling"}
                </p>
              </div>

              {result.eligible ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <ResultCard title="Your contribution (0.75%)" value={result.employeeMonthly} emphasize />
                    <ResultCard title="Employer (3.25%)" value={result.employerMonthly} />
                    <ResultCard title="Total ESI (4%)" value={result.totalMonthly} />
                    <ResultCard title="Your annual" value={result.employeeAnnual} />
                    <ResultCard title="Employer annual" value={result.employerAnnual} />
                    <ResultCard title="Total annual" value={result.totalAnnual} />
                  </div>

                  <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4">
                    <p className="text-sm font-semibold">Net Salary Impact (estimated)</p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <Row label="Gross Wages" value={formatINR(input.monthlyWages)} />
                      <Row label="Less: Employee ESI" value={`-${formatINR(result.employeeMonthly)}`} />
                      <Row label="Less: Professional Tax (est.)" value={`-${formatINR(result.professionalTaxEst)}`} />
                      <Row
                        label="Less: EPF Employee (est.)"
                        value={`-${formatINR(result.epfEmployeeEst)}`}
                        href="/tools/finance/epf-calculator"
                      />
                      <Row label="Net Take-Home (est.)" value={formatINR(result.netTakeHomeEst)} strong />
                    </dl>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-[var(--muted-ink)]">
                        Professional Tax varies by state. EPF applies if basic ≤ ₹
                        {ESI_RULES.epfWageCeiling.toLocaleString("en-IN")}.
                      </p>
                      <Button type="button" size="sm" variant="outline" onClick={() => void copyResult()}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}

              <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4">
                <p className="text-sm font-semibold">What ESI covers for you</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--body)]">
                  {BENEFITS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-[var(--muted-ink)]">
                Note: New/small establishments (less than 10 employees in manufacturing / 20 in others) may be exempt
                from ESI registration.
              </p>
              <p className="text-xs text-[var(--muted-ink)]">
                ESI rates and wage ceiling per ESIC guidelines {ESI_RULES.financialYear}. Professional Tax and EPF
                estimates are illustrative — verify with your employer.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "0.75% + 3.25%", desc: "Employee & employer rates" },
          { title: "₹21,000 ceiling", desc: "Wage eligibility limit" },
          { title: "ESI benefits", desc: "Medical, maternity, disability" },
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

function Row({
  label,
  value,
  strong = false,
  href,
}: {
  label: string;
  value: string;
  strong?: boolean;
  href?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", strong && "border-t border-[var(--hairline)] pt-2")}>
      <dt className={cn(strong ? "font-medium text-ink" : "text-[var(--body)]")}>{label}</dt>
      <dd className={cn("flex items-center gap-1 tabular-nums", strong ? "font-semibold text-ink" : "text-ink")}>
        {value}
        {href ? (
          <Link href={href} className="text-coral hover:text-[var(--coral-active)]" aria-label="Open EPF calculator">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </dd>
    </div>
  );
}
