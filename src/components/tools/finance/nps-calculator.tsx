"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { Pencil, RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DEFAULT_NPS_INPUT,
  NPS_RULES,
  calculateNps,
  hasNpsErrors,
  minAnnuityPercentForExit,
  validateNps,
  type NpsInput,
  type NpsResult,
} from "@/lib/nps/calculate";
import { formatCompactINR, formatINR } from "@/lib/utils";

const INVESTED_COLOR = "#cc785c";
const RETURNS_COLOR = "#5db8a6";
const LUMP_COLOR = "#cc785c";
const ANNUITY_COLOR = "#e8a55a";

type Draft = {
  currentAge: string;
  retirementAge: string;
  monthlyContribution: string;
  currentCorpus: string;
  returnPercent: string;
  stepUpPercent: string;
  annuityPercent: string;
  annuityRatePercent: string;
};

function formatDraftAmount(value: number) {
  return value.toLocaleString("en-IN");
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function toDraft(input: NpsInput): Draft {
  return {
    currentAge: String(input.currentAge),
    retirementAge: String(input.retirementAge),
    monthlyContribution: formatDraftAmount(input.monthlyContribution),
    currentCorpus: formatDraftAmount(input.currentCorpus),
    returnPercent: String(input.returnPercent),
    stepUpPercent: String(input.stepUpPercent),
    annuityPercent: String(input.annuityPercent),
    annuityRatePercent: String(input.annuityRatePercent),
  };
}

function toInput(draft: Draft): NpsInput {
  return {
    currentAge: parseAmount(draft.currentAge),
    retirementAge: parseAmount(draft.retirementAge),
    monthlyContribution: parseAmount(draft.monthlyContribution),
    currentCorpus: parseAmount(draft.currentCorpus) || 0,
    returnPercent: parseAmount(draft.returnPercent),
    stepUpPercent: parseAmount(draft.stepUpPercent) || 0,
    annuityPercent: parseAmount(draft.annuityPercent),
    annuityRatePercent: parseAmount(draft.annuityRatePercent),
  };
}

function money(value: number) {
  return formatINR(value, 0);
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function NpsCalculator() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_NPS_INPUT));
  const [submitted, setSubmitted] = useState(false);
  const [showAllYears, setShowAllYears] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const ageRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const input = useMemo(() => toInput(draft), [draft]);
  const errors = useMemo(() => validateNps(input), [input]);
  const result = useMemo(() => calculateNps(input), [input]);
  const invalid = hasNpsErrors(errors);
  const minAnnuity = Number.isFinite(input.retirementAge)
    ? minAnnuityPercentForExit(input.retirementAge)
    : NPS_RULES.minAnnuityPercent;

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
  };

  const setRetirementAge = (value: string) => {
    const age = parseAmount(value);
    const annuity = parseAmount(draft.annuityPercent);
    const nextMin = Number.isFinite(age) ? minAnnuityPercentForExit(age) : NPS_RULES.minAnnuityPercent;
    if (Number.isFinite(annuity) && annuity < nextMin) {
      patch({ retirementAge: value, annuityPercent: String(nextMin) });
      return;
    }
    patch({ retirementAge: value });
  };

  const calculate = () => {
    setSubmitted(true);
    if (invalid) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reset = () => {
    setDraft(toDraft(DEFAULT_NPS_INPUT));
    setSubmitted(false);
    setShowAllYears(false);
    setShowChart(true);
  };

  const editInputs = () => {
    ageRef.current?.focus();
    ageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--body)]">
        Estimate your NPS corpus, lump-sum withdrawal, and monthly pension. Figures update as you type — then
        calculate, reset, or edit inputs.
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

          <Section title="1. Age">
            <Field
              id="nps-age"
              label="Current age"
              hint={`${NPS_RULES.minCurrentAge}–${NPS_RULES.maxCurrentAge} years`}
              error={submitted ? errors.currentAge : undefined}
            >
              <Input
                ref={ageRef}
                id="nps-age"
                inputMode="numeric"
                value={draft.currentAge}
                aria-invalid={submitted && Boolean(errors.currentAge)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*$/.test(raw)) patch({ currentAge: raw });
                }}
              />
              <Slider
                className="mt-3"
                min={NPS_RULES.minCurrentAge}
                max={NPS_RULES.maxCurrentAge}
                step={1}
                value={[clamp(parseAmount(draft.currentAge), NPS_RULES.minCurrentAge, NPS_RULES.maxCurrentAge)]}
                onValueChange={([value]) => patch({ currentAge: String(value) })}
                aria-label="Current age"
              />
            </Field>
            <Field
              id="nps-retire"
              label="Retirement age"
              hint={`NPS standard exit is ${NPS_RULES.standardExitAge}. You can continue contributing until ${NPS_RULES.maxContinueAge}.`}
              error={submitted ? errors.retirementAge : undefined}
            >
              <Input
                id="nps-retire"
                inputMode="numeric"
                value={draft.retirementAge}
                aria-invalid={submitted && Boolean(errors.retirementAge)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*$/.test(raw)) setRetirementAge(raw);
                }}
              />
              <Slider
                className="mt-3"
                min={NPS_RULES.minRetirementAge}
                max={NPS_RULES.maxRetirementAge}
                step={1}
                value={[
                  clamp(parseAmount(draft.retirementAge), NPS_RULES.minRetirementAge, NPS_RULES.maxRetirementAge),
                ]}
                onValueChange={([value]) => setRetirementAge(String(value))}
                aria-label="Retirement age"
              />
            </Field>
          </Section>

          <Section title="2. Contribution">
            <Field
              id="nps-monthly"
              label="Monthly contribution (₹)"
              hint={`₹${NPS_RULES.minMonthly.toLocaleString("en-IN")} to ₹${NPS_RULES.maxMonthly.toLocaleString("en-IN")}`}
              error={submitted ? errors.monthlyContribution : undefined}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
                  ₹
                </span>
                <Input
                  id="nps-monthly"
                  inputMode="decimal"
                  value={draft.monthlyContribution}
                  aria-invalid={submitted && Boolean(errors.monthlyContribution)}
                  className="pl-7"
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) patch({ monthlyContribution: raw });
                  }}
                />
              </div>
              <Slider
                className="mt-3"
                min={NPS_RULES.minMonthly}
                max={50_000}
                step={500}
                value={[clamp(parseAmount(draft.monthlyContribution), NPS_RULES.minMonthly, 50_000)]}
                onValueChange={([value]) => patch({ monthlyContribution: formatDraftAmount(value) })}
                aria-label="Monthly contribution"
              />
            </Field>
            <Field
              id="nps-corpus"
              label="Current NPS corpus (₹)"
              hint="Existing Tier I balance. Use 0 if you are starting now."
              error={submitted ? errors.currentCorpus : undefined}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
                  ₹
                </span>
                <Input
                  id="nps-corpus"
                  inputMode="decimal"
                  value={draft.currentCorpus}
                  aria-invalid={submitted && Boolean(errors.currentCorpus)}
                  className="pl-7"
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) patch({ currentCorpus: raw });
                  }}
                />
              </div>
            </Field>
            <Field
              id="nps-step"
              label="Expected annual contribution increase (%)"
              hint="Step-up each year. 0% keeps the same monthly amount."
              error={submitted ? errors.stepUpPercent : undefined}
            >
              <Input
                id="nps-step"
                inputMode="decimal"
                value={draft.stepUpPercent}
                aria-invalid={submitted && Boolean(errors.stepUpPercent)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ stepUpPercent: raw });
                }}
              />
              <Slider
                className="mt-3"
                min={NPS_RULES.minStepUpPercent}
                max={NPS_RULES.maxStepUpPercent}
                step={1}
                value={[clamp(parseAmount(draft.stepUpPercent), NPS_RULES.minStepUpPercent, NPS_RULES.maxStepUpPercent)]}
                onValueChange={([value]) => patch({ stepUpPercent: String(value) })}
                aria-label="Annual contribution increase"
              />
            </Field>
          </Section>

          <Section title="3. Return">
            <Field
              id="nps-return"
              label="Expected annual return (%)"
              hint="Market-linked. Equity-heavy mixes are often modelled around 8–12%."
              error={submitted ? errors.returnPercent : undefined}
            >
              <Input
                id="nps-return"
                inputMode="decimal"
                value={draft.returnPercent}
                aria-invalid={submitted && Boolean(errors.returnPercent)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ returnPercent: raw });
                }}
              />
              <Slider
                className="mt-3"
                min={NPS_RULES.minReturnPercent}
                max={NPS_RULES.maxReturnPercent}
                step={0.1}
                value={[clamp(parseAmount(draft.returnPercent), NPS_RULES.minReturnPercent, NPS_RULES.maxReturnPercent)]}
                onValueChange={([value]) => patch({ returnPercent: String(Math.round(value * 10) / 10) })}
                aria-label="Expected annual return"
              />
            </Field>
          </Section>

          <Section title="4. Annuity">
            <Field
              id="nps-annuity"
              label="Annuity percentage at retirement"
              hint={
                minAnnuity > NPS_RULES.minAnnuityPercent
                  ? `At least ${minAnnuity}% before age ${NPS_RULES.standardExitAge}.`
                  : `At least ${NPS_RULES.minAnnuityPercent}% at age ${NPS_RULES.standardExitAge} or later. The rest can be withdrawn as lump sum.`
              }
              error={submitted ? errors.annuityPercent : undefined}
            >
              <Input
                id="nps-annuity"
                inputMode="numeric"
                value={draft.annuityPercent}
                aria-invalid={submitted && Boolean(errors.annuityPercent)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*$/.test(raw)) patch({ annuityPercent: raw });
                }}
              />
              <Slider
                className="mt-3"
                min={minAnnuity}
                max={NPS_RULES.maxAnnuityPercent}
                step={5}
                value={[clamp(parseAmount(draft.annuityPercent), minAnnuity, NPS_RULES.maxAnnuityPercent)]}
                onValueChange={([value]) => patch({ annuityPercent: String(value) })}
                aria-label="Annuity percentage"
              />
            </Field>
            <Field
              id="nps-annuity-rate"
              label="Expected annuity rate (% p.a.)"
              hint="Rate offered by the Annuity Service Provider at retirement. Typical quotes are around 5–7%."
              error={submitted ? errors.annuityRatePercent : undefined}
            >
              <Input
                id="nps-annuity-rate"
                inputMode="decimal"
                value={draft.annuityRatePercent}
                aria-invalid={submitted && Boolean(errors.annuityRatePercent)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ annuityRatePercent: raw });
                }}
              />
              <Slider
                className="mt-3"
                min={NPS_RULES.minAnnuityRatePercent}
                max={NPS_RULES.maxAnnuityRatePercent}
                step={0.1}
                value={[
                  clamp(
                    parseAmount(draft.annuityRatePercent),
                    NPS_RULES.minAnnuityRatePercent,
                    NPS_RULES.maxAnnuityRatePercent,
                  ),
                ]}
                onValueChange={([value]) => patch({ annuityRatePercent: String(Math.round(value * 10) / 10) })}
                aria-label="Expected annuity rate"
              />
            </Field>
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

        <div ref={resultsRef}>
          {result ? (
            <ResultsPanel result={result} onEdit={editInputs} />
          ) : (
            <div className="flex min-h-64 items-center rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center">
              <p className="mx-auto max-w-sm text-sm text-[var(--muted-ink)]">
                Enter age, contribution, return, and annuity. Estimated corpus and pension appear here as you type.
              </p>
            </div>
          )}
        </div>
      </div>

      {result ? (
        <>
          <TaxCallout result={result} />
          <Breakdown result={result} />
          <YearTable result={result} showAll={showAllYears} onToggle={() => setShowAllYears((value) => !value)} />
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-ink">Retirement corpus chart</h2>
              <Button
                type="button"
                variant="outline"
                className="min-h-10"
                onClick={() => setShowChart((value) => !value)}
                aria-expanded={showChart}
              >
                {showChart ? "Hide chart" : "Show chart"}
              </Button>
            </div>
            {showChart ? <GrowthChart result={result} /> : null}
          </div>
        </>
      ) : null}

      <p className="text-xs text-[var(--muted-ink)]">
        Estimates only. Actual NPS returns are market-linked and not guaranteed. Lump-sum, annuity, and monthly pension
        depend on PFRDA exit rules and the annuity rate your Annuity Service Provider offers at retirement. Tax savings
        are an old-regime illustration at a {NPS_RULES.illustrationSlabPercent}% slab and ignore other 80C investments.
        This is not investment or tax advice.
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

function ResultsPanel({ result, onEdit }: { result: NpsResult; onEdit: () => void }) {
  const pieData = [
    { name: "Invested", value: Math.max(0, result.totalInvested), color: INVESTED_COLOR },
    { name: "Returns", value: Math.max(0, result.returnsEarned), color: RETURNS_COLOR },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">
            Estimated NPS corpus at retirement
          </p>
          <p className="mt-1 font-display text-[32px] leading-none tracking-[-0.03em] text-ink sm:text-[36px]">
            {money(result.corpus)}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            Age {result.currentAge} → {result.retirementAge} · {result.years} years · {result.returnPercent}% p.a.
            expected
          </p>
        </div>
        <Button type="button" variant="outline" className="min-h-10" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Edit Inputs
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Total invested" value={money(result.totalInvested)} />
        <Stat label="Total interest / returns" value={money(result.returnsEarned)} />
        <Stat
          label="Lump-sum withdrawal"
          value={money(result.lumpSumWithdrawal)}
          hint={`${100 - result.annuityPercent}% of corpus`}
        />
        <Stat
          label="Annuity amount"
          value={money(result.annuityCorpus)}
          hint={`${result.annuityPercent}% of corpus`}
        />
        <Stat
          label="Estimated monthly pension"
          value={`${money(result.monthlyPension)}/mo`}
          hint={`${result.annuityRatePercent}% of annuity corpus ÷ 12`}
        />
        <Stat label="Total retirement value" value={money(result.totalRetirementValue)} hint="Same as estimated corpus" />
      </div>

      <div className="rounded-lg border border-[var(--hairline)] bg-canvas p-3">
        <p className="text-sm font-medium text-ink">Lump sum vs annuity</p>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-canvas" aria-hidden>
          <div className="bg-coral" style={{ width: `${Math.max(4, 100 - result.annuityPercent)}%` }} />
          <div className="bg-amber" style={{ width: `${Math.max(4, result.annuityPercent)}%` }} />
        </div>
        <ul className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--body)]">
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: LUMP_COLOR }} aria-hidden />
            Lump sum {money(result.lumpSumWithdrawal)}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: ANNUITY_COLOR }} aria-hidden />
            Annuity {money(result.annuityCorpus)}
          </li>
        </ul>
        {result.fullLumpSumAllowed ? (
          <p className="mt-2 text-xs text-[var(--muted-ink)]">
            Corpus is within the full-withdrawal limit, so a 100% lump-sum exit may be allowed.
          </p>
        ) : result.prematureExit ? (
          <p className="mt-2 text-xs text-[var(--muted-ink)]">
            Exit before {NPS_RULES.standardExitAge} typically needs at least {NPS_RULES.prematureAnnuityPercent}% as
            annuity.
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-[var(--hairline)] bg-canvas p-3">
        <p className="text-sm font-medium text-ink">Contributions vs returns</p>
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
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-ink)]">Corpus</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{formatCompactINR(result.corpus)}</p>
          </div>
        </div>
        <ul className="flex flex-wrap justify-center gap-4 text-xs text-[var(--body)]">
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-coral" aria-hidden />
            Invested {money(result.totalInvested)} ({result.investedShare.toFixed(0)}%)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal" aria-hidden />
            Returns {money(result.returnsEarned)} ({result.returnsShare.toFixed(0)}%)
          </li>
        </ul>
      </div>
    </div>
  );
}

function TaxCallout({ result }: { result: NpsResult }) {
  const tax = result.taxSavings;
  return (
    <section className="space-y-2 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">
        Annual tax savings illustration (old regime, {tax.slabPercent}% slab)
      </h2>
      <ul className="space-y-1.5 text-sm text-[var(--body)]">
        <li>
          80CCD(1) deduction (up to ₹{NPS_RULES.ccd1Limit.toLocaleString("en-IN")}):{" "}
          {money(tax.ccd1Deduction)} — saves {money(tax.taxSavedCcd1)}/year
        </li>
        <li>
          80CCD(1B) extra deduction (up to ₹{NPS_RULES.ccd1bLimit.toLocaleString("en-IN")}):{" "}
          {money(tax.ccd1bDeduction)} — saves {money(tax.taxSavedCcd1b)}/year
        </li>
        <li className="font-medium text-ink">Total estimated tax savings: {money(tax.totalTaxSaved)}/year</li>
      </ul>
      <p className="text-xs text-[var(--muted-ink)]">
        Based on this year’s monthly contribution only. Under the new tax regime, your own NPS contribution is not
        deductible — only employer NPS (Sec 80CCD(2)) is.
      </p>
    </section>
  );
}

function Breakdown({ result }: { result: NpsResult }) {
  const investedWidth = Math.max(8, result.investedShare);
  return (
    <section className="space-y-3 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">Contributions vs returns</h2>
      <div className="flex h-3 overflow-hidden rounded-full bg-canvas" aria-hidden>
        <div className="bg-coral" style={{ width: `${investedWidth}%` }} />
        <div className="bg-teal" style={{ width: `${Math.max(0, 100 - investedWidth)}%` }} />
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[var(--muted-ink)]">Invested</dt>
          <dd className="mt-1 font-semibold tabular-nums">{money(result.totalInvested)}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-ink)]">Returns</dt>
          <dd className="mt-1 font-semibold tabular-nums">{money(result.returnsEarned)}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-ink)]">Estimated corpus</dt>
          <dd className="mt-1 font-semibold tabular-nums">{money(result.corpus)}</dd>
        </div>
      </dl>
    </section>
  );
}

function YearTable({
  result,
  showAll,
  onToggle,
}: {
  result: NpsResult;
  showAll: boolean;
  onToggle: () => void;
}) {
  const rows = showAll ? result.yearly : result.yearly.slice(0, 10);
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Year-by-year growth</h2>
        {result.yearly.length > 10 ? (
          <Button type="button" variant="outline" className="min-h-10" onClick={onToggle} aria-expanded={showAll}>
            {showAll ? "Show first 10 years" : `Show all ${result.yearly.length} years`}
          </Button>
        ) : null}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Invested</TableHead>
            <TableHead>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.year}>
              <TableCell>{row.year}</TableCell>
              <TableCell>{row.age}</TableCell>
              <TableCell className="tabular-nums">{money(row.invested)}</TableCell>
              <TableCell className="tabular-nums font-medium">{money(row.balance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

function GrowthChart({ result }: { result: NpsResult }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const tick = dark ? "#a09d96" : "#6c6a64";
  const grid = dark ? "#3a3833" : "#e6dfd8";
  const data = result.yearly.map((row) => ({
    year: `Y${row.year}`,
    "Estimated corpus": row.balance,
    Invested: row.invested,
  }));

  return (
    <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <p className="text-xs text-[var(--muted-ink)]">How invested amount and estimated corpus could grow each year.</p>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: tick, fontSize: 12 }} />
            <YAxis tick={{ fill: tick, fontSize: 12 }} tickFormatter={(value) => formatCompactINR(Number(value))} width={56} />
            <Tooltip
              formatter={(value) => money(Number(value ?? 0))}
              contentStyle={{
                background: "var(--canvas, #faf9f5)",
                border: "1px solid var(--hairline)",
                borderRadius: 8,
              }}
            />
            <Area type="monotone" dataKey="Invested" stroke={INVESTED_COLOR} fill={INVESTED_COLOR} fillOpacity={0.18} strokeWidth={2} />
            <Area
              type="monotone"
              dataKey="Estimated corpus"
              stroke={RETURNS_COLOR}
              fill={RETURNS_COLOR}
              fillOpacity={0.22}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        Area chart of invested amount versus estimated NPS corpus for each year from 1 to {result.years}.
      </p>
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
