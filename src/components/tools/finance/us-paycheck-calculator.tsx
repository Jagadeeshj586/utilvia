"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FILING_STATUSES,
  PAYCHECK_COUNTRIES,
  PAYCHECK_DEFAULTS,
  PAY_FREQUENCIES,
  calculatePaycheck,
  formatMoney,
  getCountry,
  type CountryCode,
  type FilingStatus,
  type PayFrequency,
  type SalaryMode,
} from "@/lib/paycheck/calculate";
import { cn } from "@/lib/utils";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 rounded-md border px-3 text-sm font-medium transition-colors",
              value === option.value
                ? "border-coral bg-coral text-white"
                : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
            )}
            aria-pressed={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-2 text-sm", emphasize && "border-t border-[var(--hairline)] pt-3 font-medium text-ink")}>
      <span className={emphasize ? "text-ink" : "text-[var(--body)]"}>{label}</span>
      <span className="tabular-nums text-ink">{value}</span>
    </div>
  );
}

function money(amount: number, currency: ReturnType<typeof getCountry>["currency"], digits: number) {
  return formatMoney(amount, currency, digits);
}

export function UsPaycheckCalculatorTool() {
  const [country, setCountry] = useState<CountryCode>(PAYCHECK_DEFAULTS.country);
  const [mode, setMode] = useState<SalaryMode>(PAYCHECK_DEFAULTS.mode);
  const [annualSalary, setAnnualSalary] = useState(String(PAYCHECK_DEFAULTS.annualSalary));
  const [hourlyRate, setHourlyRate] = useState(String(PAYCHECK_DEFAULTS.hourlyRate));
  const [hoursPerWeek, setHoursPerWeek] = useState(String(PAYCHECK_DEFAULTS.hoursPerWeek));
  const [weeksPerYear, setWeeksPerYear] = useState(String(PAYCHECK_DEFAULTS.weeksPerYear));
  const [frequency, setFrequency] = useState<PayFrequency>(PAYCHECK_DEFAULTS.frequency);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(PAYCHECK_DEFAULTS.filingStatus);
  const [stateCode, setStateCode] = useState(PAYCHECK_DEFAULTS.stateCode);
  const [contribution401k, setContribution401k] = useState(String(PAYCHECK_DEFAULTS.contribution401kPercent));
  const [healthInsurance, setHealthInsurance] = useState(String(PAYCHECK_DEFAULTS.healthInsuranceMonthly));
  const [hsa, setHsa] = useState(String(PAYCHECK_DEFAULTS.hsaMonthly));

  const profile = getCountry(country);
  const pretaxColumns = profile.extraPretaxLabel ? "sm:grid-cols-3" : "sm:grid-cols-2";

  const applyCountry = (next: CountryCode) => {
    const selected = getCountry(next);
    setCountry(next);
    setAnnualSalary(String(selected.defaultAnnual));
    setHourlyRate(String(selected.defaultHourly));
    setFrequency(selected.defaultFrequency);
    setStateCode(selected.defaultRegion);
    setContribution401k(String(selected.defaultRetirement));
    setHealthInsurance("0");
    setHsa("0");
    setFilingStatus("single");
  };

  const result = useMemo(
    () =>
      calculatePaycheck({
        country,
        mode,
        annualSalary: Number(annualSalary) || 0,
        hourlyRate: Number(hourlyRate) || 0,
        hoursPerWeek: Number(hoursPerWeek) || 0,
        weeksPerYear: Number(weeksPerYear) || 0,
        frequency,
        filingStatus,
        stateCode,
        contribution401kPercent: Number(contribution401k) || 0,
        healthInsuranceMonthly: Number(healthInsurance) || 0,
        hsaMonthly: Number(hsa) || 0,
      }),
    [
      annualSalary,
      contribution401k,
      country,
      filingStatus,
      frequency,
      healthInsurance,
      hoursPerWeek,
      hourlyRate,
      hsa,
      mode,
      stateCode,
      weeksPerYear,
    ],
  );

  const currency = result?.currency ?? profile.currency;
  const periodDigits = currency === "INR" ? 0 : 2;

  return (
    <div className="space-y-6">
      <p className="flex items-center gap-2 rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--body)]">
        <span aria-hidden="true" className="text-base leading-none">
          {result?.flag ?? profile.flag}
        </span>
        <span>{result?.ruleNote ?? profile.ruleNote}</span>
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <h2 className="font-sans text-base font-medium text-ink">Salary Input</h2>

          <div>
            <Label htmlFor="paycheck-country">Country</Label>
            <select
              id="paycheck-country"
              value={country}
              onChange={(event) => applyCountry(event.target.value as CountryCode)}
              className={selectClass}
            >
              {PAYCHECK_COUNTRIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.flag} {item.name}
                </option>
              ))}
            </select>
          </div>

          <SegmentedControl
            label="Input type"
            value={mode}
            onChange={setMode}
            options={[
              { value: "annual", label: "Annual salary" },
              { value: "hourly", label: "Hourly rate" },
            ]}
          />

          {mode === "annual" ? (
            <div>
              <Label htmlFor="paycheck-annual">Gross Annual Salary ({profile.currencySymbol})</Label>
              <Input
                id="paycheck-annual"
                inputMode="decimal"
                value={annualSalary}
                onChange={(event) => setAnnualSalary(event.target.value)}
                className="mt-1"
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="paycheck-hourly">Hourly rate ({profile.currencySymbol})</Label>
                <Input
                  id="paycheck-hourly"
                  inputMode="decimal"
                  value={hourlyRate}
                  onChange={(event) => setHourlyRate(event.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="paycheck-hours">Hours / week</Label>
                <Input
                  id="paycheck-hours"
                  inputMode="decimal"
                  value={hoursPerWeek}
                  onChange={(event) => setHoursPerWeek(event.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="paycheck-weeks">Weeks / year</Label>
                <Input
                  id="paycheck-weeks"
                  inputMode="decimal"
                  value={weeksPerYear}
                  onChange={(event) => setWeeksPerYear(event.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <SegmentedControl
            label="Pay Frequency"
            value={frequency}
            onChange={setFrequency}
            options={PAY_FREQUENCIES.map((item) => ({ value: item.value, label: item.label }))}
          />

          {profile.showFilingStatus ? (
            <div>
              <Label htmlFor="paycheck-filing">Filing Status</Label>
              <select
                id="paycheck-filing"
                value={filingStatus}
                onChange={(event) => setFilingStatus(event.target.value as FilingStatus)}
                className={selectClass}
              >
                {FILING_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {profile.regionLabel && profile.regions.length > 0 ? (
            <div>
              <Label htmlFor="paycheck-region">{profile.regionLabel}</Label>
              <select
                id="paycheck-region"
                value={stateCode}
                onChange={(event) => setStateCode(event.target.value)}
                className={selectClass}
              >
                {profile.regions.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-4 border-t border-[var(--hairline)] pt-4">
            <h3 className="text-sm font-medium text-ink">Pre-tax Deductions (optional)</h3>
            {country === "IN" ? (
              <p className="text-xs leading-[1.55] text-muted-foreground">
                EPF is calculated on basic pay, assumed as 50% of CTC. New-regime tax uses the ₹75,000 standard deduction; EPF does not reduce taxable income.
              </p>
            ) : null}
            <div className={cn("grid grid-cols-1 gap-4 sm:items-end", pretaxColumns)}>
              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="paycheck-401k" className="leading-snug">
                  {profile.retirementLabel}
                </Label>
                <Input
                  id="paycheck-401k"
                  inputMode="decimal"
                  value={contribution401k}
                  onChange={(event) => setContribution401k(event.target.value)}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="paycheck-health" className="leading-snug">
                  {profile.healthLabel}
                </Label>
                <Input
                  id="paycheck-health"
                  inputMode="decimal"
                  value={healthInsurance}
                  onChange={(event) => setHealthInsurance(event.target.value)}
                />
              </div>
              {profile.extraPretaxLabel ? (
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor="paycheck-hsa" className="leading-snug">
                    {profile.extraPretaxLabel}
                  </Label>
                  <Input
                    id="paycheck-hsa"
                    inputMode="decimal"
                    value={hsa}
                    onChange={(event) => setHsa(event.target.value)}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4" aria-live="polite">
          {result ? (
            <>
              <div className="rounded-xl border border-[var(--hairline)] bg-canvas px-5 py-6 text-center sm:px-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Net Take-Home ({result.frequencyLabel})
                </p>
                <p className="mt-2 font-display text-[2.5rem] leading-none tracking-[-0.03em] text-ink sm:text-[3rem]">
                  {money(result.netPerPeriod, currency, periodDigits)}
                </p>
                <p className="mt-3 text-sm text-[var(--body)]">
                  Gross Pay ({result.frequencyLabel}): {money(result.grossPerPeriod, currency, periodDigits)}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-4 sm:px-5">
                <h3 className="mb-1 text-sm font-medium text-ink">Annual Breakdown</h3>
                {result.lines.map((line, index) => (
                  <BreakdownRow
                    key={`${line.label}-${index}`}
                    label={line.label}
                    value={
                      index === 0
                        ? money(line.amount, currency, 0)
                        : line.amount === 0
                          ? money(0, currency, 0)
                          : `- ${money(line.amount, currency, currency === "USD" && line.label.includes("Medicare") ? 2 : 0)}`
                    }
                  />
                ))}
                <BreakdownRow
                  label="Net Take-Home (annual)"
                  value={money(result.netAnnual, currency, 0)}
                  emphasize
                />
                <p className="mt-3 text-xs leading-[1.55] text-muted-foreground">{result.taxableNote}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {result.summary.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-4 text-center"
                  >
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-ink">
                      {money(card.amount, currency, 0)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-5 py-10 text-center text-sm text-muted-foreground">
              Enter a salary to estimate take-home pay.
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Estimates only — not tax, legal, or financial advice. Actual withholdings depend on your tax forms, local
        rules, and employer setup in {profile.name}.
      </p>
    </div>
  );
}
