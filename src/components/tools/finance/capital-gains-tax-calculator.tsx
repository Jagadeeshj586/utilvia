"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Pencil, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ASSET_TYPES,
  CAPITAL_GAINS_RULES,
  DEFAULT_CAPITAL_GAINS_INPUT,
  SLAB_RATE_OPTIONS,
  calculateCapitalGains,
  classifyHolding,
  getAssetRule,
  hasCapitalGainsErrors,
  validateCapitalGains,
  type AssetTypeId,
  type CapitalGainsInput,
  type CapitalGainsResult,
} from "@/lib/capital-gains/calculate";
import { cn, formatINR } from "@/lib/utils";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

type Draft = {
  assetType: AssetTypeId;
  purchaseDate: string;
  purchaseCost: string;
  saleDate: string;
  saleValue: string;
  expenses: string;
  improvementCost: string;
  improvementDate: string;
  exemptionClaimed: string;
  other112AUsed: string;
  slabRatePercent: string;
  residentIndividual: boolean;
};

function toDraft(input: CapitalGainsInput): Draft {
  return {
    assetType: input.assetType,
    purchaseDate: input.purchaseDate,
    purchaseCost: formatDraftAmount(input.purchaseCost),
    saleDate: input.saleDate,
    saleValue: formatDraftAmount(input.saleValue),
    expenses: formatDraftAmount(input.expenses),
    improvementCost: formatDraftAmount(input.improvementCost),
    improvementDate: input.improvementDate,
    exemptionClaimed: formatDraftAmount(input.exemptionClaimed),
    other112AUsed: formatDraftAmount(input.other112AUsed),
    slabRatePercent: String(input.slabRatePercent),
    residentIndividual: input.residentIndividual,
  };
}

function formatDraftAmount(value: number) {
  return value === 0 ? "0" : value.toLocaleString("en-IN");
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function toInput(draft: Draft): CapitalGainsInput {
  return {
    assetType: draft.assetType,
    purchaseDate: draft.purchaseDate,
    purchaseCost: parseAmount(draft.purchaseCost),
    saleDate: draft.saleDate,
    saleValue: parseAmount(draft.saleValue),
    expenses: draft.expenses.trim() === "" ? 0 : parseAmount(draft.expenses),
    improvementCost: draft.improvementCost.trim() === "" ? 0 : parseAmount(draft.improvementCost),
    improvementDate: draft.improvementDate,
    exemptionClaimed: draft.exemptionClaimed.trim() === "" ? 0 : parseAmount(draft.exemptionClaimed),
    other112AUsed: draft.other112AUsed.trim() === "" ? 0 : parseAmount(draft.other112AUsed),
    slabRatePercent: Number(draft.slabRatePercent),
    residentIndividual: draft.residentIndividual,
  };
}

function money(value: number) {
  return formatINR(value, 0);
}

export function CapitalGainsTaxCalculator() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_CAPITAL_GAINS_INPUT));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<CapitalGainsResult | null>(null);
  const [view, setView] = useState<"form" | "result">("form");

  const input = useMemo(() => toInput(draft), [draft]);
  const asset = getAssetRule(draft.assetType);
  const errors = useMemo(() => validateCapitalGains(input), [input]);
  const holding = useMemo(
    () => classifyHolding(draft.assetType, draft.purchaseDate, draft.saleDate),
    [draft.assetType, draft.purchaseDate, draft.saleDate],
  );

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setSubmitted(false);
  };

  const calculate = () => {
    setSubmitted(true);
    if (hasCapitalGainsErrors(errors)) {
      setResult(null);
      setView("form");
      return;
    }
    const next = calculateCapitalGains(input);
    setResult(next);
    if (next) setView("result");
  };

  const reset = () => {
    setDraft(toDraft(DEFAULT_CAPITAL_GAINS_INPUT));
    setResult(null);
    setSubmitted(false);
    setView("form");
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--body)]">
        Choose an asset, enter purchase and sale details, then calculate estimated STCG or LTCG for{" "}
        {CAPITAL_GAINS_RULES.assessmentYear}.
      </p>

      {view === "form" ? (
        <form
          className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            calculate();
          }}
        >
          <Section title="Asset">
            <div>
              <Label>Asset type</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ASSET_TYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    title={item.hint}
                    aria-pressed={draft.assetType === item.id}
                    className={cn(
                      "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                      draft.assetType === item.id
                        ? "border-coral bg-coral text-white"
                        : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                    )}
                    onClick={() => patch({ assetType: item.id })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--muted-ink)]">
                {asset.hint}. {asset.sectionLabel}. Long-term after more than {asset.holdingMonthsForLtcg} months.
              </p>
            </div>
          </Section>

          <Section title="Purchase details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="cg-purchase-date" label="Purchase date" error={submitted ? errors.purchaseDate || errors.dates : undefined}>
                <Input
                  id="cg-purchase-date"
                  type="date"
                  value={draft.purchaseDate}
                  aria-invalid={submitted && Boolean(errors.purchaseDate || errors.dates)}
                  onChange={(event) => patch({ purchaseDate: event.target.value })}
                />
              </Field>
              <RupeeField
                id="cg-purchase-cost"
                label="Purchase cost"
                value={draft.purchaseCost}
                error={submitted ? errors.purchaseCost : undefined}
                onChange={(value) => patch({ purchaseCost: value })}
              />
              {asset.allowsImprovement ? (
                <>
                  <RupeeField
                    id="cg-improvement"
                    label="Improvement cost"
                    hint="Optional. Cost of additions or improvements."
                    value={draft.improvementCost}
                    error={submitted ? errors.improvementCost : undefined}
                    onChange={(value) => patch({ improvementCost: value })}
                  />
                  <Field
                    id="cg-improvement-date"
                    label="Improvement date"
                    hint="Optional. Used for indexation when applicable."
                    error={submitted ? errors.improvementDate : undefined}
                  >
                    <Input
                      id="cg-improvement-date"
                      type="date"
                      value={draft.improvementDate}
                      onChange={(event) => patch({ improvementDate: event.target.value })}
                    />
                  </Field>
                </>
              ) : null}
            </div>
          </Section>

          <Section title="Sale details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="cg-sale-date" label="Sale date" error={submitted ? errors.saleDate || errors.dates : undefined}>
                <Input
                  id="cg-sale-date"
                  type="date"
                  value={draft.saleDate}
                  aria-invalid={submitted && Boolean(errors.saleDate || errors.dates)}
                  onChange={(event) => patch({ saleDate: event.target.value })}
                />
              </Field>
              <RupeeField
                id="cg-sale-value"
                label="Sale value"
                value={draft.saleValue}
                error={submitted ? errors.saleValue : undefined}
                onChange={(value) => patch({ saleValue: value })}
              />
              <RupeeField
                id="cg-expenses"
                label="Transfer / selling expenses"
                hint="Brokerage, STT shown as expense, stamp duty, and similar costs."
                value={draft.expenses}
                error={submitted ? errors.expenses : undefined}
                onChange={(value) => patch({ expenses: value })}
              />
              {asset.uses112AExemption ? (
                <RupeeField
                  id="cg-other-112a"
                  label="Other 112A LTCG already used this year"
                  hint="Reduces the remaining ₹1.25 lakh exemption."
                  value={draft.other112AUsed}
                  error={submitted ? errors.other112AUsed : undefined}
                  onChange={(value) => patch({ other112AUsed: value })}
                />
              ) : null}
              {asset.allowsSection54Exemption ? (
                <RupeeField
                  id="cg-exemption"
                  label="Exemption claimed"
                  hint="Optional. Section 54 / 54F / 54EC amount you expect to claim."
                  value={draft.exemptionClaimed}
                  error={submitted ? errors.exemptionClaimed : undefined}
                  onChange={(value) => patch({ exemptionClaimed: value })}
                />
              ) : null}
              {asset.stcgMethod === "slab" ? (
                <Field
                  id="cg-slab"
                  label="Expected slab rate for STCG"
                  hint="Used only if this sale is short-term. Actual tax depends on your other income."
                  error={submitted ? errors.slabRatePercent : undefined}
                >
                  <select
                    id="cg-slab"
                    className={selectClass}
                    value={draft.slabRatePercent}
                    onChange={(event) => patch({ slabRatePercent: event.target.value })}
                  >
                    {SLAB_RATE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}
              {asset.ltcgMethod === "section-112-indexation-choice" ? (
                <fieldset>
                  <legend className="text-sm font-medium text-ink">Taxpayer</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      { value: true, label: "Resident individual / HUF" },
                      { value: false, label: "Other taxpayer" },
                    ].map((option) => (
                      <button
                        key={String(option.value)}
                        type="button"
                        aria-pressed={draft.residentIndividual === option.value}
                        className={cn(
                          "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                          draft.residentIndividual === option.value
                            ? "border-coral bg-coral text-white"
                            : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                        )}
                        onClick={() => patch({ residentIndividual: option.value })}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : null}
            </div>
          </Section>

          {holding ? (
            <p
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                holding.kind === "ltcg" ? "border-teal/40 bg-teal/10 text-ink" : "border-amber/50 bg-[#e8a55a]/15 text-ink",
              )}
            >
              Holding period: <span className="font-medium">{holding.label}</span>
              {" · "}
              Classified as{" "}
              <span className="font-medium">{holding.kind === "ltcg" ? "long-term (LTCG)" : "short-term (STCG)"}</span>
            </p>
          ) : null}

          {submitted && hasCapitalGainsErrors(errors) ? (
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
      ) : result ? (
        <ResultsPanel result={result} onEdit={() => setView("form")} onReset={reset} />
      ) : null}

      <p className="text-xs text-[var(--muted-ink)]">
        Estimates for {CAPITAL_GAINS_RULES.assessmentYear} using {CAPITAL_GAINS_RULES.sourceLabel}. Tax treatment can
        vary by asset, transaction, taxpayer status, exemptions, surcharge, and the applicable tax year. This is not tax
        advice.
      </p>
    </div>
  );
}

function ResultsPanel({
  result,
  onEdit,
  onReset,
}: {
  result: CapitalGainsResult;
  onEdit: () => void;
  onReset: () => void;
}) {
  const gainLabel = result.isLoss ? "Capital loss" : result.holdingKind === "ltcg" ? "Long-term capital gain" : "Short-term capital gain";
  const flow = [
    { label: "Sale value (net)", value: result.netConsideration, tone: "ink" as const },
    { label: gainLabel, value: result.capitalGain, tone: result.isLoss ? ("coral" as const) : ("amber" as const) },
    { label: "Estimated tax", value: result.totalTax, tone: "coral" as const },
    { label: "Net gain after tax", value: result.netGainAfterTax, tone: "teal" as const },
  ];
  const maxAbs = Math.max(...flow.map((item) => Math.abs(item.value)), 1);

  return (
    <div className="space-y-4" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">
            {result.holdingKind === "ltcg" ? "Long-term capital gain" : "Short-term capital gain"}
          </p>
          <p className="mt-1 font-display text-[32px] leading-none tracking-[-0.03em] text-ink sm:text-[36px]">
            {money(result.totalTax)}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            Estimated tax including cess · {result.assetLabel} · held {result.holdingLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="min-h-10" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit Inputs
          </Button>
          <Button type="button" variant="outline" className="min-h-10" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {flow.map((item) => (
          <div key={item.label} className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4">
            <p className="text-sm text-[var(--muted-ink)]">{item.label}</p>
            <p
              className={cn(
                "mt-1 text-xl font-semibold tabular-nums",
                item.tone === "coral" && "text-coral",
                item.tone === "teal" && "text-teal",
                item.tone === "amber" && "text-ink",
              )}
            >
              {money(item.value)}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-canvas">
              <div
                className={cn(
                  "h-full rounded-full",
                  item.tone === "coral" && "bg-coral",
                  item.tone === "teal" && "bg-teal",
                  item.tone === "amber" && "bg-[#e8a55a]",
                  item.tone === "ink" && "bg-ink/40",
                )}
                style={{ width: `${Math.max(8, (Math.abs(item.value) / maxAbs) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Applicable rate" value={result.rateLabel} />
        <Stat label="Taxable gain" value={money(result.taxableGain)} />
        <Stat label="Capital gains tax" value={money(result.tax)} />
        <Stat label="Health & education cess (4%)" value={money(result.cess)} />
      </div>

      <div className="rounded-xl border border-[var(--hairline)] bg-surface-card">
        <p className="border-b border-[var(--hairline)] px-4 py-3 text-sm font-semibold text-ink">Calculation breakdown</p>
        <div className="divide-y divide-[var(--hairline)] text-sm">
          <Row label="Net sale consideration" value={money(result.netConsideration)} />
          <Row label="Cost of acquisition + improvement" value={money(result.costBase)} />
          {result.indexedCostBase != null && result.taxPaths.some((path) => path.label.includes("indexation") && path.selected) ? (
            <Row label="Indexed cost of acquisition" value={money(result.indexedCostBase)} />
          ) : null}
          <Row label={gainLabel} value={money(result.capitalGain)} />
          {result.exemptionApplied > 0 ? <Row label="Exemption applied" value={money(result.exemptionApplied)} /> : null}
          <Row label="Taxable capital gain" value={money(result.taxableGain)} />
          <Row label="Tax before cess" value={money(result.tax)} />
          <Row label="Health & education cess" value={money(result.cess)} />
          <Row label="Estimated total tax" value={money(result.totalTax)} emphasize />
          <Row label="Net gain after tax" value={money(result.netGainAfterTax)} emphasize />
        </div>
      </div>

      {result.taxPaths.length > 1 ? (
        <div className="rounded-xl border border-[var(--hairline)] bg-surface-card">
          <p className="border-b border-[var(--hairline)] px-4 py-3 text-sm font-semibold text-ink">Rate comparison</p>
          <div className="divide-y divide-[var(--hairline)] text-sm">
            {result.taxPaths.map((path) => (
              <div key={path.label} className="flex justify-between gap-3 px-4 py-2.5">
                <span className={cn(path.selected ? "font-medium text-ink" : "text-[var(--muted-ink)]")}>
                  {path.label}
                  {path.selected ? " (used)" : ""}
                </span>
                <span className="tabular-nums font-medium">{money(path.tax)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-[var(--hairline)] bg-surface-soft p-4 text-sm text-[var(--body)]">
        <p className="font-medium text-ink">Assumptions</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {result.assumptions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {result.notes.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--muted-ink)]">
            {result.notes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">{title}</p>
      {children}
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

function RupeeField({
  id,
  label,
  hint,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field id={id} label={`${label} (₹)`} hint={hint} error={error}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">₹</span>
        <Input
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-4">
      <p className="text-sm text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 text-base font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-3 px-4 py-2.5", emphasize && "font-medium text-ink")}>
      <span className={emphasize ? "text-ink" : "text-[var(--muted-ink)]"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
