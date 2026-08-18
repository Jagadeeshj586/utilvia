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
  DEFAULT_K401_INPUT,
  K401_RULES,
  calculateK401,
  employeeElectiveLimit,
  hasK401Errors,
  validateK401,
  type K401AccountType,
  type K401ContributionMode,
  type K401Input,
  type K401Result,
} from "@/lib/us-401k/calculate";
import { cn, formatCompactUSD, formatUSD } from "@/lib/utils";

const EMPLOYEE_COLOR = "#cc785c";
const EMPLOYER_COLOR = "#e8a55a";
const GROWTH_COLOR = "#5db8a6";

type Draft = {
  currentAge: string;
  retirementAge: string;
  annualSalary: string;
  currentBalance: string;
  contributionMode: K401ContributionMode;
  contributionPercent: string;
  contributionDollars: string;
  employerMatchPercent: string;
  employerMatchUpToPercent: string;
  salaryGrowthPercent: string;
  returnPercent: string;
  contributionIncreasePercent: string;
  accountType: K401AccountType;
  currentTaxPercent: string;
  retirementTaxPercent: string;
};

function formatDraftAmount(value: number) {
  return value.toLocaleString("en-US");
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function toDraft(input: K401Input): Draft {
  return {
    currentAge: String(input.currentAge),
    retirementAge: String(input.retirementAge),
    annualSalary: formatDraftAmount(input.annualSalary),
    currentBalance: formatDraftAmount(input.currentBalance),
    contributionMode: input.contributionMode,
    contributionPercent: String(input.contributionPercent),
    contributionDollars: formatDraftAmount(input.contributionDollars),
    employerMatchPercent: String(input.employerMatchPercent),
    employerMatchUpToPercent: String(input.employerMatchUpToPercent),
    salaryGrowthPercent: String(input.salaryGrowthPercent),
    returnPercent: String(input.returnPercent),
    contributionIncreasePercent: String(input.contributionIncreasePercent),
    accountType: input.accountType,
    currentTaxPercent: String(input.currentTaxPercent),
    retirementTaxPercent: String(input.retirementTaxPercent),
  };
}

function toInput(draft: Draft): K401Input {
  return {
    currentAge: parseAmount(draft.currentAge),
    retirementAge: parseAmount(draft.retirementAge),
    annualSalary: parseAmount(draft.annualSalary),
    currentBalance: parseAmount(draft.currentBalance) || 0,
    contributionMode: draft.contributionMode,
    contributionPercent: parseAmount(draft.contributionPercent) || 0,
    contributionDollars: parseAmount(draft.contributionDollars) || 0,
    employerMatchPercent: parseAmount(draft.employerMatchPercent) || 0,
    employerMatchUpToPercent: parseAmount(draft.employerMatchUpToPercent) || 0,
    salaryGrowthPercent: parseAmount(draft.salaryGrowthPercent) || 0,
    returnPercent: parseAmount(draft.returnPercent),
    contributionIncreasePercent: parseAmount(draft.contributionIncreasePercent) || 0,
    accountType: draft.accountType,
    currentTaxPercent: parseAmount(draft.currentTaxPercent),
    retirementTaxPercent: parseAmount(draft.retirementTaxPercent),
  };
}

function money(value: number) {
  return formatUSD(value, 0);
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function K401Calculator() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_K401_INPUT));
  const [submitted, setSubmitted] = useState(false);
  const [showAllYears, setShowAllYears] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const ageRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const input = useMemo(() => toInput(draft), [draft]);
  const errors = useMemo(() => validateK401(input), [input]);
  const result = useMemo(() => calculateK401(input), [input]);
  const invalid = hasK401Errors(errors);
  const salary = Number.isFinite(input.annualSalary) ? input.annualSalary : 0;
  const previewEmployee =
    input.contributionMode === "percent" ? (salary * input.contributionPercent) / 100 : input.contributionDollars;
  const irsLimit = Number.isFinite(input.currentAge) ? employeeElectiveLimit(input.currentAge) : K401_RULES.electiveDeferralLimit;

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
  };

  const setContributionMode = (mode: K401ContributionMode) => {
    if (mode === draft.contributionMode) return;
    if (mode === "dollars") {
      const amount = Number.isFinite(previewEmployee) ? Math.round(previewEmployee) : 0;
      patch({ contributionMode: mode, contributionDollars: formatDraftAmount(Math.max(0, amount)) });
      return;
    }
    const percent = salary > 0 && Number.isFinite(previewEmployee) ? Math.round((previewEmployee / salary) * 1000) / 10 : 0;
    patch({
      contributionMode: mode,
      contributionPercent: String(clamp(percent, 0, 100)),
    });
  };

  const calculate = () => {
    setSubmitted(true);
    if (invalid) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reset = () => {
    setDraft(toDraft(DEFAULT_K401_INPUT));
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
        Project a 401(k) balance at retirement with {K401_RULES.taxYear} IRS limits, employer match, and Traditional vs
        Roth tax treatment. Figures update as you type.
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
          <p className="text-xs text-[var(--muted-ink)]">
            Personal details → Contributions → Employer match → Investment assumptions → Results
          </p>

          <Section title="1. Personal details">
            <Field id="k401-age" label="Current age" error={submitted ? errors.currentAge : undefined}>
              <Input
                ref={ageRef}
                id="k401-age"
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
                min={K401_RULES.minCurrentAge}
                max={K401_RULES.maxCurrentAge}
                step={1}
                value={[clamp(parseAmount(draft.currentAge), K401_RULES.minCurrentAge, K401_RULES.maxCurrentAge)]}
                onValueChange={([value]) => patch({ currentAge: String(value) })}
                aria-label="Current age"
              />
            </Field>
            <Field
              id="k401-retire"
              label="Retirement age"
              hint="Full Social Security age is often 67 for people born in 1960 or later."
              error={submitted ? errors.retirementAge : undefined}
            >
              <Input
                id="k401-retire"
                inputMode="numeric"
                value={draft.retirementAge}
                aria-invalid={submitted && Boolean(errors.retirementAge)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*$/.test(raw)) patch({ retirementAge: raw });
                }}
              />
              <Slider
                className="mt-3"
                min={K401_RULES.minRetirementAge}
                max={K401_RULES.maxRetirementAge}
                step={1}
                value={[clamp(parseAmount(draft.retirementAge), K401_RULES.minRetirementAge, K401_RULES.maxRetirementAge)]}
                onValueChange={([value]) => patch({ retirementAge: String(value) })}
                aria-label="Retirement age"
              />
            </Field>
            <Field id="k401-salary" label="Annual salary ($)" error={submitted ? errors.annualSalary : undefined}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">$</span>
                <Input
                  id="k401-salary"
                  inputMode="decimal"
                  value={draft.annualSalary}
                  aria-invalid={submitted && Boolean(errors.annualSalary)}
                  className="pl-7"
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) patch({ annualSalary: raw });
                  }}
                />
              </div>
            </Field>
            <Field
              id="k401-balance"
              label="Current 401(k) balance ($)"
              hint="Use 0 if you are starting this year."
              error={submitted ? errors.currentBalance : undefined}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">$</span>
                <Input
                  id="k401-balance"
                  inputMode="decimal"
                  value={draft.currentBalance}
                  aria-invalid={submitted && Boolean(errors.currentBalance)}
                  className="pl-7"
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) patch({ currentBalance: raw });
                  }}
                />
              </div>
            </Field>
          </Section>

          <Section title="2. Contributions">
            <div>
              <p className="text-sm font-medium text-ink">Account type</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Account type">
                {(
                  [
                    ["traditional", "Traditional"],
                    ["roth", "Roth"],
                    ["compare", "Compare"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={draft.accountType === id}
                    className={cn(
                      "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                      draft.accountType === id
                        ? "border-coral bg-coral text-white"
                        : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                    )}
                    onClick={() => patch({ accountType: id })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Employee contribution</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Contribution mode">
                {(
                  [
                    ["percent", "% of salary"],
                    ["dollars", "Annual $"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={draft.contributionMode === id}
                    className={cn(
                      "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                      draft.contributionMode === id
                        ? "border-coral bg-coral text-white"
                        : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                    )}
                    onClick={() => setContributionMode(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {draft.contributionMode === "percent" ? (
              <Field
                id="k401-rate"
                label="Contribution rate (%)"
                hint={
                  Number.isFinite(previewEmployee)
                    ? `${input.contributionPercent}% = ${money(previewEmployee)}/year = ${money(previewEmployee / 12)}/month`
                    : undefined
                }
                error={submitted ? errors.contributionPercent : undefined}
              >
                <Input
                  id="k401-rate"
                  inputMode="decimal"
                  value={draft.contributionPercent}
                  aria-invalid={submitted && Boolean(errors.contributionPercent)}
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ contributionPercent: raw });
                  }}
                />
                <Slider
                  className="mt-3"
                  min={0}
                  max={50}
                  step={0.5}
                  value={[clamp(parseAmount(draft.contributionPercent), 0, 50)]}
                  onValueChange={([value]) => patch({ contributionPercent: String(value) })}
                  aria-label="Contribution rate"
                />
              </Field>
            ) : (
              <Field
                id="k401-dollars"
                label="Annual employee contribution ($)"
                error={submitted ? errors.contributionDollars : undefined}
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">$</span>
                  <Input
                    id="k401-dollars"
                    inputMode="decimal"
                    value={draft.contributionDollars}
                    aria-invalid={submitted && Boolean(errors.contributionDollars)}
                    className="pl-7"
                    onChange={(event) => {
                      const raw = event.target.value;
                      if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) patch({ contributionDollars: raw });
                    }}
                  />
                </div>
              </Field>
            )}
            <p className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-[var(--body)]">
              {K401_RULES.taxYear} IRS elective limit for your age:{" "}
              <span className="font-medium text-ink">{money(irsLimit)}</span>
              {Number.isFinite(previewEmployee) && previewEmployee > irsLimit
                ? " — this year’s deferral is capped at that amount."
                : `. Catch-up and the ${money(K401_RULES.annualAdditionsLimit)} annual additions cap apply automatically.`}
            </p>
            <Field
              id="k401-step"
              label="Annual contribution increase (%)"
              hint="Raises your contribution each year. 0% keeps the starting rate or dollar amount."
              error={submitted ? errors.contributionIncreasePercent : undefined}
            >
              <Input
                id="k401-step"
                inputMode="decimal"
                value={draft.contributionIncreasePercent}
                aria-invalid={submitted && Boolean(errors.contributionIncreasePercent)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ contributionIncreasePercent: raw });
                }}
              />
              <Slider
                className="mt-3"
                min={0}
                max={K401_RULES.maxGrowthPercent}
                step={1}
                value={[clamp(parseAmount(draft.contributionIncreasePercent), 0, K401_RULES.maxGrowthPercent)]}
                onValueChange={([value]) => patch({ contributionIncreasePercent: String(value) })}
                aria-label="Annual contribution increase"
              />
            </Field>
          </Section>

          <Section title="3. Employer match">
            <Field
              id="k401-match"
              label="Employer match (%)"
              hint="Example: 50% means the employer adds $0.50 per $1 you defer."
              error={submitted ? errors.employerMatchPercent : undefined}
            >
              <Input
                id="k401-match"
                inputMode="decimal"
                value={draft.employerMatchPercent}
                aria-invalid={submitted && Boolean(errors.employerMatchPercent)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ employerMatchPercent: raw });
                }}
              />
              <Slider
                className="mt-3"
                min={0}
                max={100}
                step={5}
                value={[clamp(parseAmount(draft.employerMatchPercent), 0, 100)]}
                onValueChange={([value]) => patch({ employerMatchPercent: String(value) })}
                aria-label="Employer match percent"
              />
            </Field>
            <Field
              id="k401-match-up-to"
              label="Match up to (% of salary)"
              hint="Match applies only up to this share of salary."
              error={submitted ? errors.employerMatchUpToPercent : undefined}
            >
              <Input
                id="k401-match-up-to"
                inputMode="decimal"
                value={draft.employerMatchUpToPercent}
                aria-invalid={submitted && Boolean(errors.employerMatchUpToPercent)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ employerMatchUpToPercent: raw });
                }}
              />
              <Slider
                className="mt-3"
                min={0}
                max={15}
                step={1}
                value={[clamp(parseAmount(draft.employerMatchUpToPercent), 0, 15)]}
                onValueChange={([value]) => patch({ employerMatchUpToPercent: String(value) })}
                aria-label="Match up to percent of salary"
              />
            </Field>
          </Section>

          <Section title="4. Investment assumptions">
            <Field
              id="k401-return"
              label="Expected annual investment return (%)"
              error={submitted ? errors.returnPercent : undefined}
            >
              <Input
                id="k401-return"
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
                min={0}
                max={K401_RULES.maxReturnPercent}
                step={0.1}
                value={[clamp(parseAmount(draft.returnPercent), 0, K401_RULES.maxReturnPercent)]}
                onValueChange={([value]) => patch({ returnPercent: String(Math.round(value * 10) / 10) })}
                aria-label="Expected annual return"
              />
            </Field>
            <Field
              id="k401-salary-growth"
              label="Expected annual salary growth (%)"
              error={submitted ? errors.salaryGrowthPercent : undefined}
            >
              <Input
                id="k401-salary-growth"
                inputMode="decimal"
                value={draft.salaryGrowthPercent}
                aria-invalid={submitted && Boolean(errors.salaryGrowthPercent)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ salaryGrowthPercent: raw });
                }}
              />
              <Slider
                className="mt-3"
                min={0}
                max={K401_RULES.maxGrowthPercent}
                step={0.5}
                value={[clamp(parseAmount(draft.salaryGrowthPercent), 0, K401_RULES.maxGrowthPercent)]}
                onValueChange={([value]) => patch({ salaryGrowthPercent: String(value) })}
                aria-label="Expected annual salary growth"
              />
            </Field>
            {draft.accountType !== "roth" ? (
              <Field
                id="k401-tax-now"
                label="Current federal tax bracket (%)"
                hint="Used to illustrate Traditional 401(k) tax savings this year."
                error={submitted ? errors.currentTaxPercent : undefined}
              >
                <Input
                  id="k401-tax-now"
                  inputMode="decimal"
                  value={draft.currentTaxPercent}
                  aria-invalid={submitted && Boolean(errors.currentTaxPercent)}
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ currentTaxPercent: raw });
                  }}
                />
              </Field>
            ) : null}
            {draft.accountType !== "traditional" ? (
              <Field
                id="k401-tax-later"
                label="Expected retirement tax bracket (%)"
                hint="Used to compare after-tax withdrawals from a Traditional account."
                error={submitted ? errors.retirementTaxPercent : undefined}
              >
                <Input
                  id="k401-tax-later"
                  inputMode="decimal"
                  value={draft.retirementTaxPercent}
                  aria-invalid={submitted && Boolean(errors.retirementTaxPercent)}
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === "" || /^\d*\.?\d*$/.test(raw)) patch({ retirementTaxPercent: raw });
                  }}
                />
              </Field>
            ) : null}
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
            <ResultsPanel result={result} accountType={draft.accountType} onEdit={editInputs} />
          ) : (
            <div className="flex min-h-64 items-center rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center">
              <p className="mx-auto max-w-sm text-sm text-[var(--muted-ink)]">
                Enter age, salary, contributions, match, and return. Estimated balance and income appear here as you
                type.
              </p>
            </div>
          )}
        </div>
      </div>

      {result ? (
        <>
          <TaxCallout result={result} accountType={draft.accountType} />
          <Breakdown result={result} />
          <YearTable result={result} showAll={showAllYears} onToggle={() => setShowAllYears((value) => !value)} />
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-ink">Retirement growth chart</h2>
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
        Estimates only. Actual balances depend on plan rules, vesting, fees, investment returns, and IRS limits that
        change each year. Traditional withdrawals are generally taxable; Roth qualified withdrawals are not. The{" "}
        {K401_RULES.withdrawalRatePercent}% rule is a planning shortcut, not a guarantee. This is not tax or investment
        advice.
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
  accountType,
  onEdit,
}: {
  result: K401Result;
  accountType: K401AccountType;
  onEdit: () => void;
}) {
  const pieData = [
    { name: "Employee", value: Math.max(0, result.totalEmployeeContributions), color: EMPLOYEE_COLOR },
    { name: "Employer", value: Math.max(0, result.totalEmployerContributions), color: EMPLOYER_COLOR },
    { name: "Growth", value: Math.max(0, result.investmentGrowth), color: GROWTH_COLOR },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">
            Estimated retirement balance
          </p>
          <p className="mt-1 font-display text-[32px] leading-none tracking-[-0.03em] text-ink sm:text-[36px]">
            {money(result.projectedBalance)}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            Age {result.currentAge} → {result.retirementAge} · {result.years} years · {K401_RULES.withdrawalRatePercent}%
            rule income
          </p>
        </div>
        <Button type="button" variant="outline" className="min-h-10" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Edit Inputs
        </Button>
      </div>

      {result.contributionCapped ? (
        <p className="rounded-lg border border-amber/40 bg-[color-mix(in_srgb,var(--amber,#e8a55a)_12%,var(--canvas))] px-3 py-2 text-sm text-ink">
          Employee deferrals hit the {K401_RULES.taxYear} IRS limit in {result.yearsCapped}{" "}
          {result.yearsCapped === 1 ? "year" : "years"}. Extra intended contributions are not added.
        </p>
      ) : null}

      {result.missedMatchThisYear > 0 ? (
        <p className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-ink">
          This year’s match is below the plan maximum by {money(result.missedMatchThisYear)}. Raising your deferral can
          capture that employer money.
        </p>
      ) : result.startingEmployerContribution > 0 ? (
        <p className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-[var(--body)]">
          Your employer adds {money(result.startingEmployerContribution)} this year at the current match formula.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Total employee contributions" value={money(result.totalEmployeeContributions)} />
        <Stat label="Total employer contributions" value={money(result.totalEmployerContributions)} />
        <Stat label="Total investment growth" value={money(result.investmentGrowth)} />
        <Stat
          label="Estimated annual retirement income"
          value={money(result.annualRetirementIncome)}
          hint={`${K401_RULES.withdrawalRatePercent}% of ending balance`}
        />
        <Stat label="Monthly retirement income" value={`${money(result.monthlyRetirementIncome)}/mo`} />
        {accountType === "compare" ? (
          <Stat
            label="After-tax income (Traditional vs Roth)"
            value={`${money(result.traditionalAfterTaxAnnualIncome)} vs ${money(result.rothAfterTaxAnnualIncome)}`}
            hint="Same balance; Roth withdrawals are modeled as tax-free."
          />
        ) : accountType === "roth" ? (
          <Stat
            label="After-tax annual income (Roth)"
            value={money(result.rothAfterTaxAnnualIncome)}
            hint="Qualified Roth withdrawals are generally tax-free."
          />
        ) : (
          <Stat
            label="This year’s Traditional tax savings"
            value={money(result.traditionalTaxSavedThisYear)}
            hint={`Federal illustration at your current bracket`}
          />
        )}
      </div>

      <div className="rounded-lg border border-[var(--hairline)] bg-canvas p-3">
        <p className="text-sm font-medium text-ink">Contribution vs growth</p>
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
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-ink)]">Balance</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{formatCompactUSD(result.projectedBalance)}</p>
          </div>
        </div>
        <ul className="flex flex-wrap justify-center gap-4 text-xs text-[var(--body)]">
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: EMPLOYEE_COLOR }} aria-hidden />
            Employee {money(result.totalEmployeeContributions)}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: EMPLOYER_COLOR }} aria-hidden />
            Employer {money(result.totalEmployerContributions)}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: GROWTH_COLOR }} aria-hidden />
            Growth {money(result.investmentGrowth)}
          </li>
        </ul>
      </div>
    </div>
  );
}

function TaxCallout({ result, accountType }: { result: K401Result; accountType: K401AccountType }) {
  return (
    <section className="space-y-2 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">
        {accountType === "roth"
          ? "Roth 401(k) tax note"
          : accountType === "compare"
            ? "Traditional vs Roth tax illustration"
            : "Traditional 401(k) tax illustration"}
      </h2>
      {accountType === "roth" ? (
        <p className="text-sm text-[var(--body)]">
          Roth deferrals are after-tax, so they do not reduce this year’s taxable income. Qualified withdrawals in
          retirement are generally tax-free, so the {K401_RULES.withdrawalRatePercent}% income figure is modeled as
          after-tax.
        </p>
      ) : (
        <ul className="space-y-1.5 text-sm text-[var(--body)]">
          <li>
            This year’s employee deferral of {money(result.startingEmployeeContribution)} can reduce taxable income now.
          </li>
          <li>
            Illustrated federal savings: {money(result.traditionalTaxSavedThisYear)} this year. Estimated take-home
            reduction: {money(result.traditionalMonthlyTakeHomeReduction)}/month after that savings.
          </li>
          {accountType === "compare" ? (
            <li className="font-medium text-ink">
              After-tax retirement income: Traditional {money(result.traditionalAfterTaxAnnualIncome)}/year vs Roth{" "}
              {money(result.rothAfterTaxAnnualIncome)}/year, assuming the same account balance.
            </li>
          ) : null}
        </ul>
      )}
      <p className="text-xs text-[var(--muted-ink)]">
        Brackets, state tax, NIIT, and Roth vs Traditional conversion rules are simplified. Catch-up and annual-additions
        caps are applied automatically.
      </p>
    </section>
  );
}

function Breakdown({ result }: { result: K401Result }) {
  const contributionWidth = Math.max(8, result.contributionShare);
  return (
    <section className="space-y-3 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">Contribution vs growth</h2>
      <div className="flex h-3 overflow-hidden rounded-full bg-canvas" aria-hidden>
        <div className="bg-coral" style={{ width: `${contributionWidth}%` }} />
        <div className="bg-teal" style={{ width: `${Math.max(0, 100 - contributionWidth)}%` }} />
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[var(--muted-ink)]">Contributions</dt>
          <dd className="mt-1 font-semibold tabular-nums">{money(result.totalContributions)}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-ink)]">Growth</dt>
          <dd className="mt-1 font-semibold tabular-nums">{money(result.investmentGrowth)}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-ink)]">Ending balance</dt>
          <dd className="mt-1 font-semibold tabular-nums">{money(result.projectedBalance)}</dd>
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
  result: K401Result;
  showAll: boolean;
  onToggle: () => void;
}) {
  const rows = showAll ? result.yearly : result.yearly.slice(0, 10);
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Year-by-year balance</h2>
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
            <TableHead>Employee (this year)</TableHead>
            <TableHead>Employer (this year)</TableHead>
            <TableHead>Estimated balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.year}>
              <TableCell>{row.year}</TableCell>
              <TableCell>{row.age}</TableCell>
              <TableCell className="tabular-nums">{money(row.employee)}</TableCell>
              <TableCell className="tabular-nums">{money(row.employer)}</TableCell>
              <TableCell className="tabular-nums font-medium">
                {money(row.balance)}
                {row.capped ? <span className="ml-2 text-xs font-normal text-[var(--muted-ink)]">limit</span> : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

function GrowthChart({ result }: { result: K401Result }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const tick = dark ? "#a09d96" : "#6c6a64";
  const grid = dark ? "#3a3833" : "#e6dfd8";
  const data = result.yearly.map((row) => ({
    year: `Y${row.year}`,
    Balance: row.balance,
    Contributions: row.employeeCumulative + row.employerCumulative,
  }));

  return (
    <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <p className="text-xs text-[var(--muted-ink)]">How contributions and estimated balance could grow each year.</p>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: tick, fontSize: 12 }} />
            <YAxis tick={{ fill: tick, fontSize: 12 }} tickFormatter={(value) => formatCompactUSD(Number(value))} width={56} />
            <Tooltip
              formatter={(value) => money(Number(value ?? 0))}
              contentStyle={{
                background: "var(--canvas, #faf9f5)",
                border: "1px solid var(--hairline)",
                borderRadius: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="Contributions"
              stroke={EMPLOYEE_COLOR}
              fill={EMPLOYEE_COLOR}
              fillOpacity={0.18}
              strokeWidth={2}
            />
            <Area type="monotone" dataKey="Balance" stroke={GROWTH_COLOR} fill={GROWTH_COLOR} fillOpacity={0.22} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        Area chart of cumulative contributions versus estimated 401(k) balance for each year from 1 to {result.years}.
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
