"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
  EMPLOYMENT_COUNTRIES,
  EMPLOYMENT_FILING_STATUSES,
  calculateEmploymentCompare,
  defaultsFromCountry,
  formatAmountDraft,
  formatEmploymentMoney,
  getEmploymentCountry,
  hasEmploymentErrors,
  parseAmount,
  validateEmploymentCompare,
  type EmploymentCompareInput,
  type EmploymentCompareResult,
  type EmploymentCountry,
  type EmploymentCountryCode,
  type SideResult,
} from "@/lib/employment-compare/calculate";
import type { FilingStatus } from "@/lib/paycheck/types";
import { cn } from "@/lib/utils";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

const COLORS = { employee: "#cc785c", contractor: "#5db8a6", tax: "#e8a55a" };

export function W2Vs1099Calculator() {
  const [countryCode, setCountryCode] = useState<EmploymentCountryCode>("US");
  const country = getEmploymentCountry(countryCode);
  const [gross, setGross] = useState(String(country.defaultGross));
  const [expenses, setExpenses] = useState("0");
  const [benefits, setBenefits] = useState("0");
  const [retirement, setRetirement] = useState(String(country.defaultRetirementPercent));
  const [region, setRegion] = useState(country.defaultRegion);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [result, setResult] = useState<EmploymentCompareResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showChart, setShowChart] = useState(true);

  const input: EmploymentCompareInput = {
    country: countryCode,
    grossAnnual: parseAmount(gross),
    expenses: expenses.trim() === "" ? 0 : parseAmount(expenses),
    benefits: benefits.trim() === "" ? 0 : parseAmount(benefits),
    retirementPercent: retirement.trim() === "" ? 0 : parseAmount(retirement),
    regionCode: region,
    filingStatus,
  };

  const errors = useMemo(() => validateEmploymentCompare(input), [input]);
  const invalid = hasEmploymentErrors(errors);

  const applyCountry = (code: EmploymentCountryCode) => {
    const next = getEmploymentCountry(code);
    const defaults = defaultsFromCountry(next);
    setCountryCode(code);
    setGross(formatAmountDraft(defaults.grossAnnual, next.locale));
    setExpenses("0");
    setBenefits("0");
    setRetirement(String(defaults.retirementPercent));
    setRegion(defaults.regionCode);
    setFilingStatus("single");
    setResult(null);
    setSubmitted(false);
  };

  const calculate = () => {
    setSubmitted(true);
    setResult(calculateEmploymentCompare(input));
  };

  const reset = () => {
    applyCountry(countryCode);
  };

  const money = (value: number) => formatEmploymentMoney(value, country);

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--body)]">
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
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-coral/30 bg-coral/5 px-3 py-1 text-xs font-medium text-ink">
              {country.labels.employee}
            </span>
            <span className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-medium text-ink">
              {country.labels.contractor}
            </span>
          </div>

          <Field
            id="emp-gross"
            label={`${country.labels.income} (${country.currencySymbol})`}
            hint="Same gross for both options so the comparison stays apples-to-apples."
            error={submitted ? errors.grossAnnual : undefined}
          >
            <Input
              id="emp-gross"
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
              <Label htmlFor="emp-filing">Filing status</Label>
              <select
                id="emp-filing"
                value={filingStatus}
                onChange={(event) => setFilingStatus(event.target.value as FilingStatus)}
                className={selectClass}
              >
                {EMPLOYMENT_FILING_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {country.regionLabel && country.regions.length > 0 ? (
            <div>
              <Label htmlFor="emp-region">{country.regionLabel}</Label>
              <select
                id="emp-region"
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
            id="emp-expenses"
            label={`${country.labels.expenses} (${country.currencySymbol})`}
            hint={country.labels.expensesHint}
            error={submitted ? errors.expenses : undefined}
          >
            <Input
              id="emp-expenses"
              inputMode="decimal"
              value={expenses}
              placeholder="0"
              aria-invalid={submitted && Boolean(errors.expenses)}
              onChange={(event) => setExpenses(event.target.value)}
            />
          </Field>

          <Field
            id="emp-benefits"
            label={`${country.labels.benefits} (${country.currencySymbol} / year)`}
            hint={country.labels.benefitsHint}
            error={submitted ? errors.benefits : undefined}
          >
            <Input
              id="emp-benefits"
              inputMode="decimal"
              value={benefits}
              placeholder="0"
              aria-invalid={submitted && Boolean(errors.benefits)}
              onChange={(event) => setBenefits(event.target.value)}
            />
          </Field>

          <Field
            id="emp-retirement"
            label={`${country.labels.retirement} (%)`}
            hint={country.labels.retirementHint}
            error={submitted ? errors.retirementPercent : undefined}
          >
            <Input
              id="emp-retirement"
              inputMode="decimal"
              value={retirement}
              placeholder="0"
              aria-invalid={submitted && Boolean(errors.retirementPercent)}
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
            <ResultsPanel
              result={result}
              country={country}
              money={money}
              showChart={showChart}
              onToggleChart={() => setShowChart((open) => !open)}
            />
          ) : (
            <div className="flex min-h-64 items-center rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center">
              <p className="mx-auto max-w-sm text-sm text-[var(--muted-ink)]">
                Choose a country, enter income and optional deductions, then press Calculate to compare{" "}
                {country.labels.employee.toLowerCase()} vs {country.labels.contractor.toLowerCase()}.
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
  value: EmploymentCountry;
  onChange: (code: EmploymentCountryCode) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="emp-country">Country</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            id="emp-country"
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
          {EMPLOYMENT_COUNTRIES.map((item) => (
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
  showChart,
  onToggleChart,
}: {
  result: EmploymentCompareResult;
  country: EmploymentCountry;
  money: (value: number) => string;
  showChart: boolean;
  onToggleChart: () => void;
}) {
  const ahead = result.employeeComesOutAhead ? result.employee : result.contractor;
  const behind = result.employeeComesOutAhead ? result.contractor : result.employee;
  const gap = Math.abs(result.netDifference);
  const barData = [
    { name: result.employee.label, net: Math.round(result.employee.netAnnual), fill: COLORS.employee },
    { name: result.contractor.label, net: Math.round(result.contractor.netAnnual), fill: COLORS.contractor },
  ];
  const pieData = [
    { name: result.employee.label, value: Math.max(0, result.employee.netAnnual), color: COLORS.employee },
    { name: result.contractor.label, value: Math.max(0, result.contractor.netAnnual), color: COLORS.contractor },
  ];

  return (
    <section className="space-y-4" aria-live="polite">
      <div className="rounded-xl border border-primary/30 bg-surface-card p-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted-ink)]">Estimated difference</p>
        <p className="mt-2 font-display text-[28px] leading-tight tracking-[-0.03em] text-ink sm:text-[32px]">
          {ahead.label} keeps {money(gap)} more per year
        </p>
        <p className="mt-2 text-sm text-[var(--muted-ink)]">
          {behind.label} estimated net {money(behind.netAnnual)} · {ahead.label} {money(ahead.netAnnual)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SideCard side={result.employee} country={country} money={money} accent="coral" />
        <SideCard side={result.contractor} country={country} money={money} accent="teal" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Net annual gap" value={money(gap)} />
        <Stat label={`${result.employee.label} effective rate`} value={`${result.employee.effectiveRate.toFixed(1)}%`} />
        <Stat label={`${result.contractor.label} effective rate`} value={`${result.contractor.effectiveRate.toFixed(1)}%`} />
      </div>

      <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onToggleChart} aria-expanded={showChart}>
        {showChart ? "Hide comparison chart" : "Show comparison chart"}
      </Button>

      {showChart ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--hairline)] bg-canvas p-4">
            <h3 className="text-sm font-medium text-ink">Net annual income</h3>
            <div className="mt-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={11} interval={0} />
                  <YAxis fontSize={11} tickFormatter={(value) => formatEmploymentMoney(Number(value), country, 0)} width={72} />
                  <Tooltip formatter={(value) => money(Number(value ?? 0))} />
                  <Bar dataKey="net" radius={[6, 6, 0, 0]}>
                    {barData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--hairline)] bg-canvas p-4">
            <h3 className="text-sm font-medium text-ink">Share of combined take-home</h3>
            <div className="relative mx-auto h-56 w-full max-w-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2} stroke="none">
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => money(Number(value ?? 0))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}

      <p role="note" className="rounded-md border border-[var(--hairline)] bg-surface-soft px-3 py-2 text-xs leading-5 text-[var(--muted-ink)]">
        These calculations are estimates for planning, not professional tax advice. Credits, visas, GST/VAT, and local elections can change the outcome.
      </p>
    </section>
  );
}

function SideCard({
  side,
  country,
  money,
  accent,
}: {
  side: SideResult;
  country: EmploymentCountry;
  money: (value: number) => string;
  accent: "coral" | "teal";
}) {
  return (
    <article className={cn("rounded-xl border p-4", accent === "coral" ? "border-coral/30 bg-coral/5" : "border-teal/30 bg-teal/10")}>
      <h3 className="text-sm font-medium text-ink">{side.label}</h3>
      <p className={cn("mt-2 font-display text-2xl tabular-nums", accent === "coral" ? "text-coral" : "text-teal")}>
        {money(side.netAnnual)}
      </p>
      <p className="text-xs text-[var(--muted-ink)]">{money(side.netMonthly)} / month</p>
      <dl className="mt-3 space-y-1.5 text-sm">
        <Row label="Estimated income tax" value={money(side.incomeTax)} />
        <Row label={side.key === "employee" ? country.labels.socialEmployee : country.labels.socialContractor} value={money(side.socialTax)} />
        {side.regionalTax > 0 ? <Row label="Regional tax" value={money(side.regionalTax)} /> : null}
        <Row label="Estimated deductions" value={money(side.deductions)} />
        <Row label={country.labels.employerCost} value={money(side.employerCost)} />
        <Row label="Effective tax rate" value={`${side.effectiveRate.toFixed(1)}%`} />
      </dl>
      {side.lines.length > 0 ? (
        <ul className="mt-3 space-y-1 border-t border-[var(--hairline)] pt-3 text-xs text-[var(--muted-ink)]">
          {side.lines.map((line) => (
            <li key={line.label} className="flex items-start justify-between gap-3">
              <span>{line.label}</span>
              <span className="tabular-nums text-ink">{money(line.amount)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[var(--body)]">{label}</dt>
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
