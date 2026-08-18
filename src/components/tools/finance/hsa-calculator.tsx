"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  COVERAGE_OPTIONS,
  DEFAULT_HSA_INPUT,
  FEDERAL_BRACKETS,
  HSA_RULES,
  calculateHsa,
  hasHsaErrors,
  hsaContributionLimit,
  hsaCopyText,
  validateHsa,
  type HsaCoverage,
  type HsaInput,
} from "@/lib/hsa/calculate";
import { copyText } from "@/lib/security/clipboard";
import { cn, formatUSD } from "@/lib/utils";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

type Draft = {
  coverage: HsaCoverage;
  currentAge: number;
  contribution: string;
  federalTaxPercent: number;
  stateTaxPercent: string;
  returnPercent: string;
};

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[$,\s]/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function formatDraftAmount(value: number) {
  if (!Number.isFinite(value)) return "";
  return Math.round(value).toLocaleString("en-US");
}

function toDraft(input: HsaInput): Draft {
  return {
    coverage: input.coverage,
    currentAge: input.currentAge,
    contribution: formatDraftAmount(input.contribution),
    federalTaxPercent: input.federalTaxPercent,
    stateTaxPercent: String(input.stateTaxPercent),
    returnPercent: String(input.returnPercent),
  };
}

export function HsaCalculator() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_HSA_INPUT));
  const [copied, setCopied] = useState(false);

  const input = useMemo<HsaInput>(
    () => ({
      coverage: draft.coverage,
      currentAge: draft.currentAge,
      contribution: parseAmount(draft.contribution),
      federalTaxPercent: draft.federalTaxPercent,
      stateTaxPercent: parseAmount(draft.stateTaxPercent),
      returnPercent: parseAmount(draft.returnPercent),
    }),
    [draft],
  );
  const errors = useMemo(() => validateHsa(input), [input]);
  const result = useMemo(() => calculateHsa(input), [input]);
  const invalid = hasHsaErrors(errors);
  const maxContribution = hsaContributionLimit(draft.coverage, draft.currentAge);

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setCopied(false);
  };

  const copyResult = async () => {
    if (!result) return;
    const ok = await copyText(hsaCopyText(result));
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
      <p className="text-sm text-[var(--body)]">
        Calculate HSA contribution limits, tax savings, and projected retirement balance with the triple tax
        advantage. {HSA_RULES.taxYear} IRS limit: {formatUSD(HSA_RULES.individualLimit)} (individual) /{" "}
        {formatUSD(HSA_RULES.familyLimit)} (family). Age {HSA_RULES.catchUpAge}+: +{formatUSD(HSA_RULES.catchUpAmount)}{" "}
        catch-up.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <form
          className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Configure</p>

          <div>
            <p className="text-sm font-medium">Coverage</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="HSA coverage">
              {COVERAGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={cn(
                    "min-h-10 rounded-lg border px-4 text-sm font-medium transition-colors",
                    draft.coverage === option.id
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => patch({ coverage: option.id })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="hsa-age">Current Age — {draft.currentAge}</Label>
            <Slider
              className="mt-3"
              min={HSA_RULES.minAge}
              max={HSA_RULES.maxAge}
              step={1}
              value={[draft.currentAge]}
              onValueChange={([value]) => patch({ currentAge: value })}
              aria-label={`Current Age — ${draft.currentAge}`}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-ink)]">
              Projection runs from your current age through {HSA_RULES.retirementAge - 1}, retiring at{" "}
              {HSA_RULES.retirementAge}.
            </p>
          </div>

          <Field
            id="hsa-contribution"
            label={`Annual HSA Contribution ($) — max ${formatUSD(maxContribution)}`}
            error={errors.contribution}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
                $
              </span>
              <Input
                id="hsa-contribution"
                inputMode="decimal"
                value={draft.contribution}
                aria-invalid={Boolean(errors.contribution)}
                className="pl-7 tabular-nums"
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) patch({ contribution: raw });
                }}
                onBlur={() => {
                  const value = parseAmount(draft.contribution);
                  if (Number.isFinite(value)) patch({ contribution: formatDraftAmount(value) });
                }}
              />
            </div>
            <button
              type="button"
              className="mt-2 text-xs font-medium text-coral hover:underline"
              onClick={() => patch({ contribution: formatDraftAmount(maxContribution) })}
            >
              Use max {formatUSD(maxContribution)}
            </button>
          </Field>

          <Field id="hsa-federal" label="Federal Tax Bracket" error={errors.federalTaxPercent}>
            <select
              id="hsa-federal"
              className={selectClass}
              value={draft.federalTaxPercent}
              onChange={(event) => patch({ federalTaxPercent: Number(event.target.value) })}
            >
              {FEDERAL_BRACKETS.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}%
                </option>
              ))}
            </select>
          </Field>

          <Field id="hsa-state" label="State Tax Rate (%)" error={errors.stateTaxPercent}>
            <Input
              id="hsa-state"
              inputMode="decimal"
              value={draft.stateTaxPercent}
              aria-invalid={Boolean(errors.stateTaxPercent)}
              className="tabular-nums"
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ stateTaxPercent: raw });
              }}
            />
          </Field>

          <Field id="hsa-return" label="Expected Annual Return (%)" error={errors.returnPercent}>
            <Input
              id="hsa-return"
              inputMode="decimal"
              value={draft.returnPercent}
              aria-invalid={Boolean(errors.returnPercent)}
              className="tabular-nums"
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ returnPercent: raw });
              }}
            />
          </Field>

          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setDraft(toDraft(DEFAULT_HSA_INPUT))}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </form>

        <div className="space-y-4">
          {invalid || !result ? (
            <p className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-8 text-center text-sm text-[var(--muted-ink)]">
              Enter your coverage, contribution, and tax rates to see HSA room and retirement projection.
            </p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Stat label="2026 Contribution Room" value={formatUSD(result.contributionLimit)} />
                <Stat
                  label="Remaining Room"
                  value={formatUSD(result.remainingRoom)}
                  tone={result.remainingRoom > 0 ? "amber" : "teal"}
                />
                <Stat label="Total Annual Tax Savings" value={formatUSD(result.totalTaxSavings)} emphasize />
                <Stat label="Effective Cost" value={formatUSD(result.effectiveCost)} />
                <Stat label="Federal Tax Savings" value={formatUSD(result.federalTaxSavings)} />
                <Stat label="State Tax Savings" value={formatUSD(result.stateTaxSavings)} />
              </div>

              <div className="rounded-xl border border-teal/40 bg-teal/10 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">
                  Projected HSA at Retirement
                </p>
                <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-ink">
                  {formatUSD(result.projectedBalance)}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">
                  Monthly Healthcare Budget (est.)
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">
                  {formatUSD(result.monthlyHealthcareBudget)}
                </p>
                <Button type="button" size="sm" variant="outline" className="mt-4" onClick={() => void copyResult()}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy projected balance"}
                </Button>
              </div>

              {result.overLimit ? (
                <p className="rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-[var(--body)]">
                  Contribution is above the {HSA_RULES.taxYear} IRS limit. Tax savings and projection use{" "}
                  {formatUSD(result.contributionLimit)}.
                </p>
              ) : null}

              {result.catchUpApplies ? (
                <p className="rounded-lg border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-[var(--body)]">
                  Age {HSA_RULES.catchUpAge}+ catch-up of {formatUSD(HSA_RULES.catchUpAmount)} is included in your{" "}
                  {formatUSD(result.contributionLimit)} limit.
                </p>
              ) : null}

              <div className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-4">
                <p className="text-sm font-semibold text-ink">HSA’s Triple Tax Advantage</p>
                <ul className="mt-2 space-y-1.5 text-sm text-[var(--body)]">
                  <li>Tax-free contributions — saves {formatUSD(result.totalTaxSavings)} /year</li>
                  <li>Tax-free growth — no capital gains inside HSA</li>
                  <li>Tax-free withdrawals for qualified medical expenses</li>
                </ul>
                <p className="mt-3 text-sm text-[var(--body)]">
                  After age {HSA_RULES.retirementAge}: withdraw for any purpose — taxed like Traditional IRA (no
                  penalty).
                </p>
              </div>

              <p className="rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-[var(--body)]">
                California and New Jersey do not recognize HSA state tax benefits — state income tax still applies if
                you live in CA or NJ.
              </p>
            </>
          )}

          <p className="text-xs text-[var(--muted-ink)]">
            Based on {HSA_RULES.taxYear} IRS HSA contribution limits. You must be enrolled in a qualifying High
            Deductible Health Plan (HDHP) to contribute to an HSA. Not financial advice.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "2026 limits", desc: `${formatUSD(HSA_RULES.individualLimit)} / ${formatUSD(HSA_RULES.familyLimit)}` },
          { title: "Triple tax", desc: "Contribute, grow, withdraw" },
          { title: "HDHP required", desc: "Qualifying plan needed" },
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

function Stat({
  label,
  value,
  emphasize,
  tone,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  tone?: "teal" | "amber";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        tone === "teal"
          ? "border-teal/40 bg-teal/10"
          : tone === "amber"
            ? "border-amber/40 bg-amber/10"
            : "border-[var(--hairline)] bg-surface-card",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">{label}</p>
      <p
        className={cn(
          "mt-1 font-display font-semibold tabular-nums",
          emphasize ? "text-2xl text-coral" : "text-2xl text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1 text-xs text-[var(--error)]">{error}</p> : null}
    </div>
  );
}
