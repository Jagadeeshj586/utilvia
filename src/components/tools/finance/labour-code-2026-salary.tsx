"use client";

import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { Check, ChevronDown, Pencil, RotateCcw } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
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
  FILING_STATUS_OPTIONS,
  SALARY_COUNTRIES,
  calculateSalary,
  defaultsFromCountry,
  formatMoneyDraft,
  formatSalaryMoney,
  getSalaryCountry,
  hasSalaryErrors,
  moneyDigits,
  parseMoney,
  splitFromGross,
  validateSalary,
  type IndiaTaxRegime,
  type PfContributionMode,
  type SalaryCountry,
  type SalaryCountryCode,
  type SalaryInput,
  type SalaryResult,
} from "@/lib/labour-salary/calculate";
import type { FilingStatus } from "@/lib/paycheck/types";
import { cn } from "@/lib/utils";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

const CHART_COLORS = {
  takeHome: "#cc785c",
  tax: "#e8a55a",
  contributions: "#5db8a6",
} as const;

type Drafts = {
  gross: string;
  basic: string;
  housing: string;
  other: string;
  bonus: string;
  employeeExtra: string;
  employerExtra: string;
  region: string;
  filingStatus: FilingStatus;
  taxRegime: IndiaTaxRegime;
  pfMode: PfContributionMode;
};

function draftsFrom(country: SalaryCountry): Drafts {
  const defaults = defaultsFromCountry(country);
  const digits = moneyDigits(country.currency);
  const extraDigits = defaults.employeeExtraIsPercent ? 2 : digits;
  return {
    gross: formatMoneyDraft(defaults.gross, country.locale, digits),
    basic: formatMoneyDraft(defaults.basic, country.locale, digits),
    housing: formatMoneyDraft(defaults.housing, country.locale, digits),
    other: formatMoneyDraft(defaults.other, country.locale, digits),
    bonus: formatMoneyDraft(defaults.bonus, country.locale, digits),
    employeeExtra: formatMoneyDraft(defaults.employeeExtra, country.locale, extraDigits),
    employerExtra: formatMoneyDraft(defaults.employerExtra, country.locale, extraDigits),
    region: defaults.region,
    filingStatus: defaults.filingStatus,
    taxRegime: defaults.taxRegime,
    pfMode: defaults.pfMode,
  };
}

function toInput(country: SalaryCountry, drafts: Drafts): SalaryInput {
  const extraIsPercent = country.code !== "IN" && country.code !== "AE";
  return {
    country: country.code,
    gross: parseMoney(drafts.gross),
    basic: parseMoney(drafts.basic),
    housing: parseMoney(drafts.housing),
    other: parseMoney(drafts.other),
    bonus: parseMoney(drafts.bonus),
    employeeExtra: drafts.employeeExtra.trim() === "" ? 0 : parseMoney(drafts.employeeExtra),
    employerExtra: drafts.employerExtra.trim() === "" ? 0 : parseMoney(drafts.employerExtra),
    employeeExtraIsPercent: extraIsPercent,
    employerExtraIsPercent: extraIsPercent,
    region: drafts.region,
    filingStatus: drafts.filingStatus,
    taxRegime: drafts.taxRegime,
    pfMode: drafts.pfMode,
  };
}

export function LabourCode2026SalaryCalculator() {
  const [countryCode, setCountryCode] = useState<SalaryCountryCode>("IN");
  const country = getSalaryCountry(countryCode);
  const initial = draftsFrom(country);
  const [gross, setGross] = useState(initial.gross);
  const [basic, setBasic] = useState(initial.basic);
  const [housing, setHousing] = useState(initial.housing);
  const [other, setOther] = useState(initial.other);
  const [bonus, setBonus] = useState(initial.bonus);
  const [employeeExtra, setEmployeeExtra] = useState(initial.employeeExtra);
  const [employerExtra, setEmployerExtra] = useState(initial.employerExtra);
  const [region, setRegion] = useState(initial.region);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(initial.filingStatus);
  const [taxRegime, setTaxRegime] = useState<IndiaTaxRegime>(initial.taxRegime);
  const [pfMode, setPfMode] = useState<PfContributionMode>(initial.pfMode);
  const [result, setResult] = useState<SalaryResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formCollapsed, setFormCollapsed] = useState(false);

  const drafts: Drafts = {
    gross,
    basic,
    housing,
    other,
    bonus,
    employeeExtra,
    employerExtra,
    region,
    filingStatus,
    taxRegime,
    pfMode,
  };
  const input = toInput(country, drafts);
  const errors = useMemo(() => validateSalary(input), [input]);
  const invalid = hasSalaryErrors(errors);
  const digits = moneyDigits(country.currency);
  const extraIsPercent = country.code !== "IN" && country.code !== "AE";

  const applyDrafts = (next: Drafts) => {
    setGross(next.gross);
    setBasic(next.basic);
    setHousing(next.housing);
    setOther(next.other);
    setBonus(next.bonus);
    setEmployeeExtra(next.employeeExtra);
    setEmployerExtra(next.employerExtra);
    setRegion(next.region);
    setFilingStatus(next.filingStatus);
    setTaxRegime(next.taxRegime);
    setPfMode(next.pfMode);
  };

  const applyCountry = (code: SalaryCountryCode) => {
    const next = getSalaryCountry(code);
    applyDrafts(draftsFrom(next));
    setCountryCode(code);
    setResult(null);
    setSubmitted(false);
    setFormCollapsed(false);
  };

  const applyGross = (raw: string) => {
    setGross(raw);
    const parsed = parseMoney(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const parts = splitFromGross(country, parsed);
    setBasic(formatMoneyDraft(parts.basic, country.locale, digits));
    setHousing(formatMoneyDraft(parts.housing, country.locale, digits));
    setOther(formatMoneyDraft(parts.other, country.locale, digits));
    setBonus(formatMoneyDraft(parts.bonus, country.locale, digits));
  };

  const applyComponent = (field: "basic" | "housing" | "bonus", raw: string) => {
    const next = {
      basic: parseMoney(basic),
      housing: parseMoney(housing),
      bonus: parseMoney(bonus),
      [field]: parseMoney(raw),
    };
    if (field === "basic") setBasic(raw);
    if (field === "housing") setHousing(raw);
    if (field === "bonus") setBonus(raw);
    const remainder = parseMoney(gross) - next.basic - next.housing - next.bonus;
    if (Number.isFinite(remainder)) {
      setOther(formatMoneyDraft(Math.max(0, remainder), country.locale, digits));
    }
  };

  const calculate = () => {
    setSubmitted(true);
    if (hasSalaryErrors(validateSalary(input))) return;
    setResult(calculateSalary(input));
    setFormCollapsed(true);
  };

  const reset = () => {
    applyCountry(countryCode);
  };

  const editInputs = () => {
    setFormCollapsed(false);
    window.setTimeout(() => document.getElementById("labour-salary-country")?.focus(), 0);
  };

  const money = (value: number) => formatSalaryMoney(value, country);

  return (
    <div className="space-y-6">
      <p role="note" className="flex items-start gap-2 rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--body)]">
        <span aria-hidden="true" className="text-base leading-none">
          {country.flag}
        </span>
        <span>{country.note}</span>
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <form
          className={cn(
            "space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5",
            formCollapsed && "max-lg:hidden",
          )}
          onSubmit={(event) => {
            event.preventDefault();
            calculate();
          }}
        >
          <CountrySelect value={country} onChange={applyCountry} />

          <div>
            <p className="font-display text-lg tracking-[-0.02em] text-ink">{country.labels.pageTitle}</p>
            <p className="mt-1 text-xs text-[var(--muted-ink)]">{country.labels.framework}</p>
          </div>

          <Field
            id="labour-salary-gross"
            label={`${country.labels.gross} (${country.currencySymbol})`}
            hint={country.labels.grossHint}
            error={submitted ? errors.gross : undefined}
          >
            <PrefixedInput
              id="labour-salary-gross"
              prefix={country.currencySymbol}
              value={gross}
              aria-invalid={submitted && Boolean(errors.gross)}
              onChange={applyGross}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="labour-salary-basic"
              label={`${country.labels.basic} (${country.currencySymbol})`}
              hint={country.labels.basicHint}
              error={submitted ? errors.basic : undefined}
            >
              <PrefixedInput
                id="labour-salary-basic"
                prefix={country.currencySymbol}
                value={basic}
                aria-invalid={submitted && Boolean(errors.basic)}
                onChange={(raw) => applyComponent("basic", raw)}
              />
            </Field>
            <Field
              id="labour-salary-housing"
              label={`${country.labels.housing} (${country.currencySymbol})`}
              hint={country.labels.housingHint}
              error={submitted ? errors.housing : undefined}
            >
              <PrefixedInput
                id="labour-salary-housing"
                prefix={country.currencySymbol}
                value={housing}
                aria-invalid={submitted && Boolean(errors.housing)}
                onChange={(raw) => applyComponent("housing", raw)}
              />
            </Field>
            <Field
              id="labour-salary-other"
              label={`${country.labels.other} (${country.currencySymbol})`}
              hint={country.labels.otherHint}
              error={submitted ? errors.other : undefined}
            >
              <PrefixedInput
                id="labour-salary-other"
                prefix={country.currencySymbol}
                value={other}
                aria-invalid={submitted && Boolean(errors.other)}
                onChange={setOther}
              />
            </Field>
            <Field
              id="labour-salary-bonus"
              label={`${country.labels.bonus} (${country.currencySymbol})`}
              hint={country.labels.bonusHint}
              error={submitted ? errors.bonus : undefined}
            >
              <PrefixedInput
                id="labour-salary-bonus"
                prefix={country.currencySymbol}
                value={bonus}
                aria-invalid={submitted && Boolean(errors.bonus)}
                onChange={(raw) => applyComponent("bonus", raw)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="labour-salary-ee"
              label={extraIsPercent ? `${country.labels.employeeExtra} (%)` : `${country.labels.employeeExtra} (${country.currencySymbol})`}
              hint={country.labels.employeeExtraHint}
              error={submitted ? errors.employeeExtra : undefined}
            >
              <PrefixedInput
                id="labour-salary-ee"
                prefix={extraIsPercent ? undefined : country.currencySymbol}
                suffix={extraIsPercent ? "%" : undefined}
                value={employeeExtra}
                aria-invalid={submitted && Boolean(errors.employeeExtra)}
                onChange={setEmployeeExtra}
              />
            </Field>
            <Field
              id="labour-salary-er"
              label={extraIsPercent ? `${country.labels.employerExtra} (%)` : `${country.labels.employerExtra} (${country.currencySymbol})`}
              hint={country.labels.employerExtraHint}
              error={submitted ? errors.employerExtra : undefined}
            >
              <PrefixedInput
                id="labour-salary-er"
                prefix={extraIsPercent ? undefined : country.currencySymbol}
                suffix={extraIsPercent ? "%" : undefined}
                value={employerExtra}
                aria-invalid={submitted && Boolean(errors.employerExtra)}
                onChange={setEmployerExtra}
              />
            </Field>
          </div>

          {country.showTaxRegime ? (
            <Field id="labour-salary-regime" label={country.labels.taxStatus}>
              <div className="flex flex-wrap gap-2" role="group" aria-label={country.labels.taxStatus}>
                {(
                  [
                    { value: "new" as const, label: "New regime" },
                    { value: "old" as const, label: "Old regime" },
                  ]
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={taxRegime === option.value}
                    className={cn(
                      "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                      taxRegime === option.value
                        ? "border-coral bg-coral text-white"
                        : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                    )}
                    onClick={() => setTaxRegime(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Field>
          ) : null}

          {country.showPfMode ? (
            <Field
              id="labour-salary-pf"
              label="PF contribution base"
              hint="EPF Scheme 2026 keeps a ₹15,000 monthly wage ceiling for mandatory contributions. Full wages models a voluntary higher contribution."
            >
              <select
                id="labour-salary-pf"
                className={selectClass}
                value={pfMode}
                onChange={(event) => setPfMode(event.target.value as PfContributionMode)}
              >
                <option value="ceiling">Mandatory ceiling (₹15,000 / month)</option>
                <option value="full-wages">On full statutory wages</option>
              </select>
            </Field>
          ) : null}

          {country.showFilingStatus ? (
            <Field id="labour-salary-filing" label={country.labels.taxStatus}>
              <select
                id="labour-salary-filing"
                className={selectClass}
                value={filingStatus}
                onChange={(event) => setFilingStatus(event.target.value as FilingStatus)}
              >
                {FILING_STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          {country.labels.region && country.regions.length > 0 ? (
            <Field id="labour-salary-region" label={country.labels.region}>
              <select
                id="labour-salary-region"
                className={selectClass}
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                {country.regions.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
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

          {submitted && invalid ? (
            <p className="text-sm text-destructive" role="alert">
              Fix the highlighted fields to calculate.
            </p>
          ) : null}
        </form>

        <div className="space-y-4">
          {result ? (
            <ResultsPanel result={result} country={country} money={money} onEdit={editInputs} />
          ) : (
            <div className="flex min-h-64 items-center rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center">
              <p className="mx-auto max-w-sm text-sm text-[var(--muted-ink)]">
                Choose a country, enter cash salary components, then press Calculate. India uses the Labour Code 2026 wage
                definition; other countries use their own payroll rules.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-[var(--muted-ink)]">
        Results are estimates and may vary based on applicable laws, employer policies, location, and individual
        circumstances. This is not legal, tax, or payroll advice.
      </p>
    </div>
  );
}

function ResultsPanel({
  result,
  country,
  money,
  onEdit,
}: {
  result: SalaryResult;
  country: SalaryCountry;
  money: (value: number) => string;
  onEdit: () => void;
}) {
  const taxTotal = result.incomeTax + result.regionalTax;
  const pieData = [
    { name: "Take-home", value: Math.max(0, result.netAnnual), color: CHART_COLORS.takeHome },
    { name: "Tax", value: Math.max(0, taxTotal), color: CHART_COLORS.tax },
    { name: "Employee contributions", value: Math.max(0, result.employeeContributions), color: CHART_COLORS.contributions },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Monthly take-home</p>
          <p className="mt-1 font-display text-[32px] leading-none tracking-[-0.03em] text-ink sm:text-[36px]">
            {money(result.netMonthly)}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            {money(result.netAnnual)} a year · {country.labels.framework}
          </p>
        </div>
        <Button type="button" variant="outline" className="min-h-10" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Edit Inputs
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Gross salary" value={money(result.gross)} />
        <Stat label={country.labels.applicableWage} value={money(result.applicableWage)} hint={result.applicableWageNote} />
        <Stat label="Net take-home (annual)" value={money(result.netAnnual)} />
        <Stat label="Employer cost / CTC" value={money(result.employerCost)} hint="Cash pay plus employer contributions" />
      </div>

      <div className="h-56 rounded-lg border border-[var(--hairline)] bg-canvas p-3">
        <p className="mb-1 text-sm font-medium text-ink">Salary breakdown</p>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={76} stroke="none">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => money(Number(value ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <ul className="grid gap-1 text-xs text-[var(--muted-ink)] sm:grid-cols-3">
        <li className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-coral" aria-hidden />
          Take-home {money(result.netAnnual)}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber" aria-hidden />
          Tax {money(taxTotal)}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal" aria-hidden />
          Employee contributions {money(result.employeeContributions)}
        </li>
      </ul>

      <div className="grid gap-3 sm:grid-cols-2">
        <LineList
          title="Employee deductions"
          hint="Taken from take-home"
          lines={result.employeeLines}
          extra={[
            { label: result.incomeTaxLabel, amount: result.incomeTax },
            ...(result.regionalTax > 0 ? [{ label: result.regionalLabel, amount: result.regionalTax }] : []),
          ]}
          totalLabel="Total deductions"
          total={result.totalEmployeeDeductions}
          money={money}
          tone="employee"
        />
        <LineList
          title="Employer contributions"
          hint="On top of cash pay — not deducted from take-home"
          lines={result.employerLines}
          totalLabel="Employer cost add-on"
          total={result.employerContributions}
          money={money}
          tone="employer"
        />
      </div>

      {result.comparison ? <ComparisonTable comparison={result.comparison} money={money} /> : null}

      <p className="text-xs text-[var(--muted-ink)]">
        Results are estimates and may vary based on applicable laws, employer policies, location, and individual
        circumstances. This is not legal, tax, or payroll advice.
      </p>
    </div>
  );
}

function ComparisonTable({
  comparison,
  money,
}: {
  comparison: NonNullable<SalaryResult["comparison"]>;
  money: (value: number) => string;
}) {
  const rows = [
    { label: "Statutory wages", before: comparison.before.applicableWage, after: comparison.after.applicableWage },
    { label: "Employee contributions", before: comparison.before.employeeContributions, after: comparison.after.employeeContributions },
    { label: "Employer contributions", before: comparison.before.employerContributions, after: comparison.after.employerContributions },
    { label: "Income tax", before: comparison.before.incomeTax, after: comparison.after.incomeTax },
    { label: "Take-home", before: comparison.before.netAnnual, after: comparison.after.netAnnual },
    { label: "Employer cost", before: comparison.before.employerCost, after: comparison.after.employerCost },
  ];

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">Before vs current Labour Code wages</p>
      <p className="mb-3 text-xs text-[var(--muted-ink)]">
        “Before” uses contractual basic + DA only. “Current” applies the 50% wage floor (in force 21 November 2025).
      </p>
      <div className="overflow-x-auto rounded-lg border border-[var(--hairline)]">
        <table className="w-full min-w-[28rem] text-sm">
          <thead className="bg-surface-soft text-left text-[var(--muted-ink)]">
            <tr>
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 font-medium">Before</th>
              <th className="px-3 py-2 font-medium">Current</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-[var(--hairline)]">
                <td className="px-3 py-2 text-ink">{row.label}</td>
                <td className="px-3 py-2 tabular-nums text-[var(--body)]">{money(row.before)}</td>
                <td className="px-3 py-2 tabular-nums font-medium text-ink">{money(row.after)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LineList({
  title,
  hint,
  lines,
  extra = [],
  totalLabel,
  total,
  money,
  tone,
}: {
  title: string;
  hint: string;
  lines: { label: string; amount: number }[];
  extra?: { label: string; amount: number }[];
  totalLabel: string;
  total: number;
  money: (value: number) => string;
  tone: "employee" | "employer";
}) {
  const items = [...lines];
  for (const item of extra) {
    if (!items.some((line) => line.label === item.label)) items.push(item);
  }
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3",
        tone === "employee" ? "border-coral/30 bg-coral/5" : "border-teal/30 bg-teal/5",
      )}
    >
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mt-0.5 text-xs text-[var(--muted-ink)]">{hint}</p>
      <ul className="mt-3 space-y-1.5">
        {items.length === 0 ? (
          <li className="text-sm text-[var(--muted-ink)]">None in this estimate</li>
        ) : (
          items.map((line) => (
            <li key={line.label} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-[var(--body)]">{line.label}</span>
              <span className="shrink-0 tabular-nums text-ink">{money(line.amount)}</span>
            </li>
          ))
        )}
      </ul>
      <p className="mt-3 flex items-center justify-between border-t border-[var(--hairline)] pt-2 text-sm font-medium text-ink">
        <span>{totalLabel}</span>
        <span className="tabular-nums">{money(total)}</span>
      </p>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-canvas px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted-ink)]">{hint}</p> : null}
    </div>
  );
}

function CountrySelect({
  value,
  onChange,
}: {
  value: SalaryCountry;
  onChange: (code: SalaryCountryCode) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="labour-salary-country">Country</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            id="labour-salary-country"
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--hairline)] bg-canvas px-3 text-left text-sm text-ink outline-none transition-colors hover:border-coral/40 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15"
            aria-label="Country"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span aria-hidden="true" className="text-base leading-none">
                {value.flag}
              </span>
              <span className="truncate">{value.name}</span>
              <span className="text-[var(--muted-ink)]">{value.currency}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-ink)]" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-64">
          {SALARY_COUNTRIES.map((item) => (
            <DropdownMenuItem key={item.code} className="justify-between gap-3 py-2" onSelect={() => onChange(item.code)}>
              <span className="flex items-center gap-2.5">
                <span aria-hidden="true" className="text-base leading-none">
                  {item.flag}
                </span>
                <span>{item.name}</span>
                <span className="text-[var(--muted-ink)]">{item.currency}</span>
              </span>
              {item.code === value.code ? <Check className="h-4 w-4 text-coral" aria-hidden /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
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

type PrefixedInputProps = {
  id: string;
  prefix?: string;
  suffix?: string;
  value: string;
  onChange: (raw: string) => void;
} & Omit<ComponentProps<typeof Input>, "onChange" | "value" | "prefix">;

function PrefixedInput({ id, prefix, suffix, value, onChange, ...rest }: PrefixedInputProps) {
  const widePrefix = Boolean(prefix && prefix.length > 1);
  return (
    <div className="relative">
      {prefix ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
          {prefix}
        </span>
      ) : null}
      <Input
        id={id}
        {...rest}
        inputMode="decimal"
        value={value}
        className={cn(prefix && (widePrefix ? "pl-12" : "pl-7"), suffix && "pr-8", rest.className)}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "" || /^[\d,.$%₹£\s\u0600-\u06FF]*\.?[\d]*$/.test(raw)) onChange(raw);
        }}
      />
      {suffix ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
