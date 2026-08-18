"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DEFAULT_ROTH_COMPARE_INPUT,
  ROTH_COMPARE_RULES,
  calculateRothCompare,
  hasRothCompareErrors,
  validateRothCompare,
  type RothCompareAccount,
  type RothCompareInput,
} from "@/lib/roth-compare/calculate";
import { copyText } from "@/lib/security/clipboard";
import { cn, formatUSD } from "@/lib/utils";

const FEDERAL_BRACKETS = ROTH_COMPARE_RULES.federalBrackets;

type Draft = {
  currentAge: number;
  retirementAge: number;
  contribution: string;
  federalNow: number;
  federalLater: number;
  stateTax: string;
  returnPercent: string;
};

function toDraft(input: RothCompareInput): Draft {
  return {
    currentAge: input.currentAge,
    retirementAge: input.retirementAge,
    contribution: String(input.contribution),
    federalNow: input.federalNow,
    federalLater: input.federalLater,
    stateTax: String(input.stateTax),
    returnPercent: String(input.returnPercent),
  };
}

function parseNumber(raw: string) {
  const cleaned = raw.replace(/[$,%\s,]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function toInput(draft: Draft): RothCompareInput {
  return {
    currentAge: draft.currentAge,
    retirementAge: draft.retirementAge,
    contribution: parseNumber(draft.contribution),
    federalNow: draft.federalNow,
    federalLater: draft.federalLater,
    stateTax: parseNumber(draft.stateTax),
    returnPercent: parseNumber(draft.returnPercent),
  };
}

const ROWS: Array<{ key: keyof Pick<RothCompareAccount, "annualContribution" | "taxSavingToday" | "netAnnualCost" | "futureBalance" | "taxOnWithdrawal" | "netRetirement">; label: string; money: true } | { key: "rmdsRequired"; label: string; money: false }> = [
  { key: "annualContribution", label: "Annual contribution", money: true },
  { key: "taxSavingToday", label: "Tax saving today", money: true },
  { key: "netAnnualCost", label: "Net annual cost", money: true },
  { key: "futureBalance", label: "Future balance", money: true },
  { key: "taxOnWithdrawal", label: "Tax on withdrawal", money: true },
  { key: "netRetirement", label: "Net retirement money", money: true },
  { key: "rmdsRequired", label: "RMDs required?", money: false },
];

function BracketPills({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <Label id={`${id}-label`}>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby={`${id}-label`}>
        {FEDERAL_BRACKETS.map((bracket) => (
          <button
            key={bracket}
            type="button"
            className={cn(
              "min-h-10 rounded-lg border px-3 text-sm font-medium tabular-nums transition-colors",
              value === bracket
                ? "border-coral bg-coral text-white"
                : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
            )}
            onClick={() => onChange(bracket)}
          >
            {bracket}%
          </button>
        ))}
      </div>
    </div>
  );
}

export function RothCompareCalculator() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_ROTH_COMPARE_INPUT));
  const [copied, setCopied] = useState(false);

  const input = useMemo(() => toInput(draft), [draft]);
  const errors = useMemo(() => validateRothCompare(input), [input]);
  const result = useMemo(() => calculateRothCompare(input), [input]);
  const invalid = hasRothCompareErrors(errors);

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setCopied(false);
  };

  const copyNet = async () => {
    if (!result) return;
    const ok = await copyText(formatUSD(result.copyValue));
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(true);
    toast.success("Copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const maxNet = result ? Math.max(...result.accounts.map((item) => item.netRetirement), 1) : 1;

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted-ink)]">
        2026 limits: 401k ${ROTH_COMPARE_RULES.k401LimitUnder50.toLocaleString("en-US")} (under 50) | IRA $
        {ROTH_COMPARE_RULES.iraLimitUnder50.toLocaleString("en-US")} (under 50)
        {draft.currentAge >= ROTH_COMPARE_RULES.iraCatchUpAge
          ? `, IRA $${(ROTH_COMPARE_RULES.iraLimitUnder50 + ROTH_COMPARE_RULES.iraCatchUp).toLocaleString("en-US")} at age 50+`
          : ""}
        . Contribution limit not enforced on 401k — enter any amount for planning.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <form
          className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <div>
            <Label>Current Age — {draft.currentAge}</Label>
            <Slider
              className="mt-3"
              min={ROTH_COMPARE_RULES.minCurrentAge}
              max={ROTH_COMPARE_RULES.maxCurrentAge}
              step={1}
              value={[draft.currentAge]}
              onValueChange={([value]) =>
                patch({
                  currentAge: value,
                  retirementAge: Math.max(value + 1, draft.retirementAge),
                })
              }
              aria-label="Current age"
            />
          </div>

          <div>
            <Label>Retirement Age — {draft.retirementAge}</Label>
            <Slider
              className="mt-3"
              min={Math.max(ROTH_COMPARE_RULES.minRetirementAge, draft.currentAge + 1)}
              max={ROTH_COMPARE_RULES.maxRetirementAge}
              step={1}
              value={[draft.retirementAge]}
              onValueChange={([value]) => patch({ retirementAge: value })}
              aria-label="Retirement age"
            />
            {errors.retirementAge ? <p className="mt-1 text-xs text-[var(--error)]">{errors.retirementAge}</p> : null}
          </div>

          <div>
            <Label htmlFor="roth-contrib">Annual Contribution ($)</Label>
            <Input
              id="roth-contrib"
              className="mt-1"
              inputMode="decimal"
              value={draft.contribution}
              aria-invalid={Boolean(errors.contribution)}
              onChange={(event) => patch({ contribution: event.target.value })}
            />
            {errors.contribution ? <p className="mt-1 text-xs text-[var(--error)]">{errors.contribution}</p> : null}
          </div>

          <BracketPills
            id="roth-fed-now"
            label="Current Federal Tax Bracket"
            value={draft.federalNow}
            onChange={(federalNow) => patch({ federalNow })}
          />
          <BracketPills
            id="roth-fed-later"
            label="Expected Retirement Tax Bracket"
            value={draft.federalLater}
            onChange={(federalLater) => patch({ federalLater })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="roth-state">State Income Tax Rate (%)</Label>
              <Input
                id="roth-state"
                className="mt-1"
                inputMode="decimal"
                value={draft.stateTax}
                aria-invalid={Boolean(errors.stateTax)}
                onChange={(event) => patch({ stateTax: event.target.value })}
              />
              {errors.stateTax ? <p className="mt-1 text-xs text-[var(--error)]">{errors.stateTax}</p> : null}
            </div>
            <div>
              <Label htmlFor="roth-return">Expected Annual Return (%)</Label>
              <Input
                id="roth-return"
                className="mt-1"
                inputMode="decimal"
                value={draft.returnPercent}
                aria-invalid={Boolean(errors.returnPercent)}
                onChange={(event) => patch({ returnPercent: event.target.value })}
              />
              {errors.returnPercent ? <p className="mt-1 text-xs text-[var(--error)]">{errors.returnPercent}</p> : null}
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setDraft(toDraft(DEFAULT_ROTH_COMPARE_INPUT))}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </form>

        <div className="space-y-4">
          {invalid || !result ? (
            <p className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-8 text-center text-sm text-[var(--muted-ink)]">
              Adjust the inputs to compare Traditional 401k, Roth 401k, and Roth IRA.
            </p>
          ) : (
            <>
              <div
                className={cn(
                  "rounded-xl border px-4 py-4",
                  result.verdict === "equal" && "border-amber/40 bg-amber/10",
                  result.verdict === "roth" && "border-teal/40 bg-teal/10",
                  result.verdict === "traditional" && "border-coral/40 bg-coral/10",
                )}
              >
                <p className="flex items-start gap-2 text-sm font-medium text-ink">
                  <Scale className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    {result.verdictTitle} {result.verdictBody}
                  </span>
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[var(--hairline)] bg-surface-card">
                <table className="w-full min-w-[36rem] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--hairline)] text-left">
                      <th className="px-3 py-3 font-medium text-[var(--muted-ink)]" />
                      {result.accounts.map((account) => (
                        <th key={account.id} className="px-3 py-3 font-semibold text-ink">
                          {account.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row) => (
                      <tr key={row.key} className="border-b border-[var(--hairline)] last:border-0">
                        <th className="whitespace-nowrap px-3 py-2.5 text-left font-medium text-[var(--body)]">{row.label}</th>
                        {result.accounts.map((account) => {
                          const emphasize = row.key === "netRetirement";
                          const winner = emphasize && account.id === result.winnerNetId;
                          return (
                            <td
                              key={account.id}
                              className={cn(
                                "px-3 py-2.5 tabular-nums",
                                emphasize && "font-semibold",
                                winner && "text-coral",
                              )}
                            >
                              {row.money
                                ? formatUSD(account[row.key])
                                : account.rmdsRequired
                                  ? `Yes (age ${ROTH_COMPARE_RULES.rmdAge})`
                                  : "No"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">Net at retirement</p>
                {result.accounts.map((account) => (
                  <div key={account.id} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-2">
                    <p className="text-xs text-[var(--body)]">{account.label}</p>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          account.id === "traditional" && "bg-coral",
                          account.id === "roth401k" && "bg-teal",
                          account.id === "rothIra" && "bg-amber",
                        )}
                        style={{ width: `${Math.max(4, (account.netRetirement / maxNet) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs font-medium tabular-nums">{formatUSD(account.netRetirement)}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--body)]">
                  Combined rate: <span className="font-medium tabular-nums">{result.combinedNow}%</span> now →{" "}
                  <span className="font-medium tabular-nums">{result.combinedLater}%</span> at retirement
                  {result.iraCapped ? (
                    <span className="block text-xs text-[var(--muted-ink)]">
                      Roth IRA contribution capped at ${result.iraLimit.toLocaleString("en-US")} for your age.
                    </span>
                  ) : null}
                </p>
                <Button type="button" size="sm" variant="outline" onClick={() => void copyNet()}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : result.copyLabel}
                </Button>
              </div>

              <p className="rounded-lg border border-teal/30 bg-teal/10 px-4 py-3 text-sm text-[var(--body)]">
                Roth 401k eliminated Required Minimum Distributions in 2024 (SECURE 2.0). Your Roth 401k can continue
                growing tax-free without forced withdrawals at age {ROTH_COMPARE_RULES.rmdAge}.
              </p>
              <p className="rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-[var(--body)]">
                Roth IRA income limit {ROTH_COMPARE_RULES.taxYear}: $
                {ROTH_COMPARE_RULES.rothIraSingleUpper.toLocaleString("en-US")} (single) / $
                {ROTH_COMPARE_RULES.rothIraMfjUpper.toLocaleString("en-US")} (MFJ). If above, you may need a Backdoor Roth
                strategy.
              </p>
              <p className="text-xs text-[var(--muted-ink)]">
                Based on {ROTH_COMPARE_RULES.taxYear} IRS rules. Tax laws change. Consult a CFP or CPA for personalized
                retirement planning. Figures are estimates, not advice.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "3 scenarios", desc: "Traditional, Roth 401k, Roth IRA" },
          { title: "Tax bracket", desc: "Dynamic verdict box" },
          { title: "No RMDs", desc: "Roth 401k since 2024" },
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
