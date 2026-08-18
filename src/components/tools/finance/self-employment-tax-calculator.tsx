"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SELF_EMPLOYMENT_COUNTRIES,
  SELF_EMPLOYMENT_FILING_STATUSES,
  calculateSelfEmployment,
  defaultsFromCountry,
  formatAmountDraft,
  formatSelfEmploymentMoney,
  getSelfEmploymentCountry,
  hasSelfEmploymentErrors,
  parseAmount,
  validateSelfEmployment,
  type SelfEmploymentCountry,
  type SelfEmploymentCountryCode,
  type SelfEmploymentInput,
  type SelfEmploymentResult,
} from "@/lib/self-employment/calculate";
import type { FilingStatus } from "@/lib/paycheck/types";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

export function SelfEmploymentTaxCalculator() {
  const [countryCode, setCountryCode] = useState<SelfEmploymentCountryCode>("US");
  const country = getSelfEmploymentCountry(countryCode);
  const [gross, setGross] = useState(String(country.defaultGross));
  const [expenses, setExpenses] = useState("0");
  const [otherDeductions, setOtherDeductions] = useState("0");
  const [retirement, setRetirement] = useState("0");
  const [region, setRegion] = useState(country.defaultRegion);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [result, setResult] = useState<SelfEmploymentResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const input: SelfEmploymentInput = {
    country: countryCode,
    grossAnnual: parseAmount(gross),
    expenses: expenses.trim() === "" ? 0 : parseAmount(expenses),
    otherDeductions: otherDeductions.trim() === "" ? 0 : parseAmount(otherDeductions),
    retirement: retirement.trim() === "" ? 0 : parseAmount(retirement),
    regionCode: region,
    filingStatus,
  };

  const errors = useMemo(
    () => validateSelfEmployment(input),
    [
      input.country,
      input.grossAnnual,
      input.expenses,
      input.otherDeductions,
      input.retirement,
      input.regionCode,
      input.filingStatus,
    ],
  );
  const invalid = hasSelfEmploymentErrors(errors);

  const applyCountry = (code: SelfEmploymentCountryCode) => {
    const next = getSelfEmploymentCountry(code);
    const defaults = defaultsFromCountry(next);
    setCountryCode(code);
    setGross(formatAmountDraft(defaults.grossAnnual, next.locale));
    setExpenses("0");
    setOtherDeductions("0");
    setRetirement("0");
    setRegion(defaults.regionCode);
    setFilingStatus("single");
    setResult(null);
    setSubmitted(false);
  };

  const calculate = () => {
    setSubmitted(true);
    setResult(calculateSelfEmployment(input));
  };

  const reset = () => {
    applyCountry(countryCode);
  };

  const money = (value: number) => formatSelfEmploymentMoney(value, country);

  return (
    <div className="space-y-6">
      <p role="note" className="flex items-start gap-2 rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--body)]">
        <span aria-hidden="true" className="text-base leading-none">
          {country.flag}
        </span>
        <span>{country.note}</span>
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <form
          className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            calculate();
          }}
        >
          <CountrySelect value={country} onChange={applyCountry} />

          <p className="font-display text-lg tracking-[-0.02em] text-ink">{country.labels.pageTitle}</p>

          <Field
            id="se-gross"
            label={`${country.labels.income} (${country.currencySymbol})`}
            hint={country.labels.incomeHint}
            error={submitted ? errors.grossAnnual : undefined}
          >
            <Input
              id="se-gross"
              inputMode="decimal"
              value={gross}
              aria-invalid={submitted && Boolean(errors.grossAnnual)}
              onChange={(event) => setGross(event.target.value)}
              onBlur={() => {
                const parsed = parseAmount(gross);
                if (Number.isFinite(parsed)) setGross(formatAmountDraft(parsed, country.locale));
              }}
            />
          </Field>

          {country.showFilingStatus ? (
            <div>
              <Label htmlFor="se-filing">Filing status</Label>
              <select
                id="se-filing"
                value={filingStatus}
                onChange={(event) => setFilingStatus(event.target.value as FilingStatus)}
                className={selectClass}
              >
                {SELF_EMPLOYMENT_FILING_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {country.regionLabel && country.regions.length > 0 ? (
            <div>
              <Label htmlFor="se-region">{country.regionLabel}</Label>
              <select
                id="se-region"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className={selectClass}
              >
                {country.regions.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <Field
            id="se-expenses"
            label={`${country.labels.expenses} (${country.currencySymbol})`}
            hint={country.labels.expensesHint}
            error={submitted ? errors.expenses : undefined}
          >
            <Input
              id="se-expenses"
              inputMode="decimal"
              value={expenses}
              placeholder="0"
              aria-invalid={submitted && Boolean(errors.expenses)}
              onChange={(event) => setExpenses(event.target.value)}
            />
          </Field>

          <Field
            id="se-other"
            label={`${country.labels.otherDeductions} (${country.currencySymbol})`}
            hint={country.labels.otherDeductionsHint}
            error={submitted ? errors.otherDeductions : undefined}
          >
            <Input
              id="se-other"
              inputMode="decimal"
              value={otherDeductions}
              placeholder="0"
              aria-invalid={submitted && Boolean(errors.otherDeductions)}
              onChange={(event) => setOtherDeductions(event.target.value)}
            />
          </Field>

          <Field
            id="se-retirement"
            label={`${country.labels.retirement} (${country.currencySymbol} / year)`}
            hint={country.labels.retirementHint}
            error={submitted ? errors.retirement : undefined}
          >
            <Input
              id="se-retirement"
              inputMode="decimal"
              value={retirement}
              placeholder="0"
              aria-invalid={submitted && Boolean(errors.retirement)}
              onChange={(event) => setRetirement(event.target.value)}
            />
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" className="min-h-10 min-w-28 px-6">
              Calculate
            </Button>
            <Button type="button" variant="outline" className="min-h-10" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {submitted && invalid ? (
            <p className="text-sm text-destructive" role="alert">
              Fix the highlighted fields to calculate.
            </p>
          ) : null}
        </form>

        <div className="space-y-4">
          {result ? (
            <ResultsPanel result={result} country={country} money={money} />
          ) : (
            <div className="flex min-h-64 items-center rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center">
              <p className="mx-auto max-w-sm text-sm text-[var(--muted-ink)]">
                Choose a country, enter self-employment income and optional deductions, then press Calculate for an
                estimated tax and contribution breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CountrySelect({
  value,
  onChange,
}: {
  value: SelfEmploymentCountry;
  onChange: (code: SelfEmploymentCountryCode) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="se-country">Country</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            id="se-country"
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--hairline)] bg-canvas px-3 text-left text-sm text-ink outline-none transition-colors hover:border-coral/40 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15"
            aria-label="Country"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span aria-hidden="true" className="text-base leading-none">
                {value.flag}
              </span>
              <span className="truncate">{value.name}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-ink)]" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-64">
          {SELF_EMPLOYMENT_COUNTRIES.map((item) => (
            <DropdownMenuItem key={item.code} className="justify-between gap-3 py-2" onSelect={() => onChange(item.code)}>
              <span className="flex items-center gap-2.5">
                <span aria-hidden="true" className="text-base leading-none">
                  {item.flag}
                </span>
                <span>{item.name}</span>
              </span>
              {item.code === value.code ? <Check className="h-4 w-4 text-coral" aria-hidden /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ResultsPanel({
  result,
  country,
  money,
}: {
  result: SelfEmploymentResult;
  country: SelfEmploymentCountry;
  money: (value: number) => string;
}) {
  const taxTotal = result.incomeTax + result.socialTax + result.regionalTax;

  return (
    <section className="space-y-4" aria-live="polite">
      <div className="rounded-xl border border-primary/30 bg-surface-card p-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted-ink)]">Estimated net income</p>
        <p className="mt-2 font-display text-[28px] leading-tight tracking-[-0.03em] text-ink sm:text-[32px]">
          {money(result.netAnnual)}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-ink)]">
          {money(result.netMonthly)} / month · {result.effectiveRate.toFixed(1)}% effective rate on gross
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label={country.labels.tax} value={money(result.incomeTax)} />
        <Stat label={country.labels.social} value={money(result.socialTax)} />
        {result.regionalTax > 0 ? <Stat label="Regional tax" value={money(result.regionalTax)} /> : null}
        <Stat label="Total deductions" value={money(result.deductions)} />
        <Stat label="Net monthly income" value={money(result.netMonthly)} />
        <Stat label="Effective tax rate" value={`${result.effectiveRate.toFixed(1)}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--hairline)] bg-canvas p-4">
          <h3 className="text-sm font-medium text-ink">Where the money goes</h3>
          <div className="relative mx-auto mt-2 h-56 w-full max-w-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={result.chart}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="none"
                >
                  {result.chart.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => money(Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-1 space-y-1 text-xs text-[var(--muted-ink)]">
            {result.chart.map((entry) => (
              <li key={entry.name} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} aria-hidden />
                  {entry.name}
                </span>
                <span className="tabular-nums text-ink">{money(entry.value)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[var(--hairline)] bg-canvas p-4">
          <h3 className="text-sm font-medium text-ink">Tax / contribution breakdown</h3>
          <p className="mt-1 text-xs text-[var(--muted-ink)]">
            Total estimated tax and contributions {money(taxTotal)} on {money(result.grossAnnual)} gross.
          </p>
          <dl className="mt-3 space-y-1.5 text-sm">
            <Row label="Gross income" value={money(result.grossAnnual)} />
            <Row label="Net profit" value={money(result.profit)} />
            {result.lines.map((line) => (
              <Row key={line.label} label={line.label} value={money(line.amount)} muted />
            ))}
          </dl>
        </div>
      </div>

      <p role="note" className="rounded-md border border-[var(--hairline)] bg-surface-soft px-3 py-2 text-xs leading-5 text-[var(--muted-ink)]">
        These calculations are estimates for planning, not professional tax advice. Credits, GST/VAT, visas, and local
        elections can change the outcome.
      </p>
    </section>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className={muted ? "text-[var(--muted-ink)]" : "text-[var(--body)]"}>{label}</dt>
      <dd className="tabular-nums text-ink">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-canvas px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{value}</p>
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
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-[var(--muted-ink)]">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
