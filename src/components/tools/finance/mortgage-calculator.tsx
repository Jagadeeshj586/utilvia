"use client";

import { useMemo, useState, type ComponentProps } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  MORTGAGE_COUNTRIES,
  calculateMortgage,
  defaultsFromCountry,
  downPaymentFromPercent,
  formatMoneyDraft,
  formatMortgageMoney,
  getMortgageCountry,
  hasMortgageErrors,
  loanFromHomeAndDown,
  parseMoney,
  percentFromDownPayment,
  validateMortgageInput,
  type DownPaymentMode,
  type MortgageCountry,
  type MortgageCountryCode,
  type MortgageInput,
  type MortgageResult,
} from "@/lib/mortgage/calculate";
import { cn } from "@/lib/utils";

type Draft = {
  homePrice: string;
  downPayment: string;
  loanAmount: string;
  interestRate: string;
  termYears: string;
  extras: Record<string, string>;
};

const PIE_COLORS = {
  principal: "#cc785c",
  interest: "#e8a55a",
} as const;

function extrasDraft(country: MortgageCountry, extras: Record<string, number>) {
  const next: Record<string, string> = {};
  for (const field of country.extras) {
    const value = extras[field.id] ?? 0;
    next[field.id] = value === 0 && field.optional ? "" : formatMoneyDraft(value, country.locale, field.period === "monthly" ? 2 : 0);
  }
  return next;
}

function toDraft(input: MortgageInput, country: MortgageCountry, downMode: DownPaymentMode): Draft {
  return {
    homePrice: formatMoneyDraft(input.homePrice, country.locale),
    downPayment:
      downMode === "percent"
        ? formatMoneyDraft(input.downPaymentPercent, country.locale, 2)
        : formatMoneyDraft(input.downPaymentAmount, country.locale),
    loanAmount: formatMoneyDraft(input.loanAmount, country.locale),
    interestRate: formatMoneyDraft(input.interestRatePercent, country.locale, 2),
    termYears: String(input.termYears),
    extras: extrasDraft(country, input.extras),
  };
}

export function MortgageCalculator() {
  const [countryCode, setCountryCode] = useState<MortgageCountryCode>("US");
  const country = getMortgageCountry(countryCode);
  const [homePrice, setHomePrice] = useState(country.defaultHomePrice);
  const [downPaymentAmount, setDownPaymentAmount] = useState(
    downPaymentFromPercent(country.defaultHomePrice, country.defaultDownPercent),
  );
  const [downPaymentPercent, setDownPaymentPercent] = useState(country.defaultDownPercent);
  const [loanAmount, setLoanAmount] = useState(
    loanFromHomeAndDown(country.defaultHomePrice, downPaymentFromPercent(country.defaultHomePrice, country.defaultDownPercent)),
  );
  const [interestRate, setInterestRate] = useState(country.defaultRate);
  const [termYears, setTermYears] = useState(country.defaultTermYears);
  const [extras, setExtras] = useState<Record<string, number>>({ ...country.defaultExtras });
  const [downMode, setDownMode] = useState<DownPaymentMode>("percent");
  const [draft, setDraft] = useState<Draft>(() => toDraft(defaultsFromCountry(country), country, "percent"));
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const input: MortgageInput = {
    country: countryCode,
    homePrice,
    downPaymentAmount,
    downPaymentPercent,
    loanAmount,
    interestRatePercent: interestRate,
    termYears,
    extras,
  };

  const errors = useMemo(() => validateMortgageInput(input), [input]);
  const invalid = hasMortgageErrors(errors);

  const applyValues = (next: MortgageInput, mode = downMode, keep?: { key: keyof Draft; value: string }) => {
    const profile = getMortgageCountry(next.country);
    setCountryCode(next.country);
    setHomePrice(next.homePrice);
    setDownPaymentAmount(next.downPaymentAmount);
    setDownPaymentPercent(next.downPaymentPercent);
    setLoanAmount(next.loanAmount);
    setInterestRate(next.interestRatePercent);
    setTermYears(next.termYears);
    setExtras(next.extras);
    setDraft({
      ...toDraft(next, profile, mode),
      ...(keep ? { [keep.key]: keep.value } : {}),
    });
  };

  const applyLinked = (
    next: Partial<Pick<MortgageInput, "homePrice" | "downPaymentAmount" | "downPaymentPercent" | "loanAmount">>,
    mode = downMode,
    keep?: { key: keyof Draft; value: string },
  ) => {
    const price = next.homePrice ?? homePrice;
    let down = next.downPaymentAmount ?? downPaymentAmount;
    let percent = next.downPaymentPercent ?? downPaymentPercent;
    let loan = next.loanAmount ?? loanAmount;

    if (next.homePrice != null) {
      if (mode === "percent") {
        down = downPaymentFromPercent(price, percent);
        loan = loanFromHomeAndDown(price, down);
      } else {
        loan = loanFromHomeAndDown(price, down);
        percent = percentFromDownPayment(price, down);
      }
    } else if (next.downPaymentPercent != null) {
      down = downPaymentFromPercent(price, percent);
      loan = loanFromHomeAndDown(price, down);
    } else if (next.downPaymentAmount != null) {
      percent = percentFromDownPayment(price, down);
      loan = loanFromHomeAndDown(price, down);
    } else if (next.loanAmount != null) {
      down = loanFromHomeAndDown(price, loan);
      percent = percentFromDownPayment(price, down);
    }

    applyValues(
      {
        country: countryCode,
        homePrice: price,
        downPaymentAmount: down,
        downPaymentPercent: percent,
        loanAmount: loan,
        interestRatePercent: interestRate,
        termYears,
        extras,
      },
      mode,
      keep,
    );
  };

  const applyCountry = (code: MortgageCountryCode) => {
    const profile = getMortgageCountry(code);
    setDownMode("percent");
    applyValues(defaultsFromCountry(profile), "percent");
    setResult(null);
    setSubmitted(false);
    setShowSchedule(false);
  };

  const calculate = () => {
    setSubmitted(true);
    setResult(calculateMortgage(input));
  };

  const reset = () => {
    setDownMode("percent");
    applyValues(defaultsFromCountry(country), "percent");
    setResult(null);
    setSubmitted(false);
    setShowSchedule(false);
  };

  const money = (value: number) => formatMortgageMoney(value, country);

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--body)]">
        <span aria-hidden="true" className="text-base leading-none">
          {country.flag}
        </span>
        <span>{country.note}</span>
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <form
          className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            calculate();
          }}
        >
          <CountrySelect value={country} onChange={applyCountry} />

          <MoneyField
            id="mortgage-home"
            label={country.labels.homePrice}
            prefix={country.currencySymbol}
            value={draft.homePrice}
            error={submitted ? errors.homePrice : undefined}
            onChange={(raw) => {
              setDraft((d) => ({ ...d, homePrice: raw }));
              const parsed = parseMoney(raw);
              if (!Number.isFinite(parsed)) {
                setHomePrice(parsed);
                return;
              }
              applyLinked({ homePrice: parsed }, downMode, { key: "homePrice", value: raw });
            }}
            onBlur={() => {
              const parsed = parseMoney(draft.homePrice);
              if (Number.isFinite(parsed)) applyLinked({ homePrice: parsed });
            }}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="mortgage-down">{country.labels.downPayment}</Label>
              <div className="flex rounded-md border border-[var(--hairline)] p-0.5" role="group" aria-label={`${country.labels.downPayment} unit`}>
                {(
                  [
                    { value: "amount" as const, label: country.currencySymbol },
                    { value: "percent" as const, label: "%" },
                  ]
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "h-8 min-w-10 rounded-[6px] px-2.5 text-sm transition-colors",
                      downMode === option.value ? "bg-coral text-white" : "text-[var(--body)] hover:bg-surface-soft",
                    )}
                    aria-pressed={downMode === option.value}
                    onClick={() => {
                      setDownMode(option.value);
                      setDraft((current) => ({
                        ...current,
                        downPayment:
                          option.value === "percent"
                            ? formatMoneyDraft(downPaymentPercent, country.locale, 2)
                            : formatMoneyDraft(downPaymentAmount, country.locale),
                      }));
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <PrefixedInput
              id="mortgage-down"
              prefix={downMode === "amount" ? country.currencySymbol : undefined}
              suffix={downMode === "percent" ? "%" : undefined}
              inputMode="decimal"
              value={draft.downPayment}
              aria-invalid={submitted && Boolean(downMode === "percent" ? errors.downPaymentPercent : errors.downPaymentAmount)}
              onChange={(raw) => {
                setDraft((d) => ({ ...d, downPayment: raw }));
                const parsed = parseMoney(raw);
                if (!Number.isFinite(parsed)) {
                  if (downMode === "percent") setDownPaymentPercent(parsed);
                  else setDownPaymentAmount(parsed);
                  return;
                }
                if (downMode === "percent") applyLinked({ downPaymentPercent: parsed }, downMode, { key: "downPayment", value: raw });
                else applyLinked({ downPaymentAmount: parsed }, downMode, { key: "downPayment", value: raw });
              }}
              onBlur={() => {
                const parsed = parseMoney(draft.downPayment);
                if (!Number.isFinite(parsed)) return;
                if (downMode === "percent") applyLinked({ downPaymentPercent: parsed });
                else applyLinked({ downPaymentAmount: parsed });
              }}
            />
            <p className="text-xs text-[var(--muted-ink)]">
              {downMode === "percent"
                ? `${money(Number.isFinite(downPaymentAmount) ? downPaymentAmount : 0)} ${country.labels.downPayment.toLowerCase()}`
                : `${Number.isFinite(downPaymentPercent) ? downPaymentPercent.toFixed(1) : "—"}% of ${country.labels.homePrice.toLowerCase()}`}
            </p>
            {submitted && (errors.downPaymentAmount || errors.downPaymentPercent) ? (
              <p className="text-xs text-destructive" role="alert">
                {errors.downPaymentAmount || errors.downPaymentPercent}
              </p>
            ) : null}
          </div>

          <MoneyField
            id="mortgage-loan"
            label={country.labels.loanAmount}
            prefix={country.currencySymbol}
            hint={`${country.labels.homePrice} minus ${country.labels.downPayment.toLowerCase()}. You can edit this directly.`}
            value={draft.loanAmount}
            error={submitted ? errors.loanAmount : undefined}
            onChange={(raw) => {
              setDraft((d) => ({ ...d, loanAmount: raw }));
              const parsed = parseMoney(raw);
              if (!Number.isFinite(parsed)) {
                setLoanAmount(parsed);
                return;
              }
              applyLinked({ loanAmount: parsed }, downMode, { key: "loanAmount", value: raw });
            }}
            onBlur={() => {
              const parsed = parseMoney(draft.loanAmount);
              if (Number.isFinite(parsed)) applyLinked({ loanAmount: parsed });
            }}
          />

          <MoneyField
            id="mortgage-rate"
            label={country.labels.interestRate}
            suffix="%"
            value={draft.interestRate}
            error={submitted ? errors.interestRatePercent : undefined}
            onChange={(raw) => {
              setDraft((d) => ({ ...d, interestRate: raw }));
              setInterestRate(parseMoney(raw));
            }}
            onBlur={() => {
              const parsed = parseMoney(draft.interestRate);
              if (Number.isFinite(parsed)) {
                setInterestRate(parsed);
                setDraft((d) => ({ ...d, interestRate: formatMoneyDraft(parsed, country.locale, 2) }));
              }
            }}
          />

          <div className="space-y-2">
            <Label htmlFor="mortgage-term">{country.labels.term} (years)</Label>
            <Input
              id="mortgage-term"
              inputMode="numeric"
              value={draft.termYears}
              aria-invalid={submitted && Boolean(errors.termYears)}
              aria-describedby={errors.termYears && submitted ? "mortgage-term-error" : undefined}
              onChange={(event) => {
                const raw = event.target.value;
                setDraft((d) => ({ ...d, termYears: raw }));
                setTermYears(parseMoney(raw));
              }}
            />
            <div className="flex flex-wrap gap-2">
              {country.termPresets.map((years) => (
                <button
                  key={years}
                  type="button"
                  className={cn(
                    "h-9 rounded-md border px-3 text-sm transition-colors",
                    termYears === years
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  aria-pressed={termYears === years}
                  onClick={() => {
                    setTermYears(years);
                    setDraft((d) => ({ ...d, termYears: String(years) }));
                  }}
                >
                  {years} yr
                </button>
              ))}
            </div>
            {submitted && errors.termYears ? (
              <p id="mortgage-term-error" className="text-xs text-destructive" role="alert">
                {errors.termYears}
              </p>
            ) : null}
          </div>

          {country.extras.length > 0 ? (
            <div className="space-y-4 border-t border-[var(--hairline)] pt-4">
              <h3 className="text-sm font-medium text-ink">{country.labels.extrasHeading}</h3>
              <div className={cn("grid gap-4", country.extras.length > 1 ? "sm:grid-cols-2" : "")}>
                {country.extras.map((field) => (
                  <MoneyField
                    key={field.id}
                    id={`mortgage-extra-${field.id}`}
                    label={field.label}
                    prefix={country.currencySymbol}
                    hint={field.hint}
                    placeholder={field.optional ? "0" : undefined}
                    value={draft.extras[field.id] ?? ""}
                    error={submitted ? errors.extras?.[field.id] : undefined}
                    onChange={(raw) => {
                      setDraft((d) => ({ ...d, extras: { ...d.extras, [field.id]: raw } }));
                      const parsed = raw.trim() === "" ? 0 : parseMoney(raw);
                      setExtras((current) => ({ ...current, [field.id]: parsed }));
                    }}
                    onBlur={() => {
                      const raw = draft.extras[field.id] ?? "";
                      if (raw.trim() === "") {
                        setExtras((current) => ({ ...current, [field.id]: 0 }));
                        return;
                      }
                      const parsed = parseMoney(raw);
                      if (!Number.isFinite(parsed)) return;
                      setExtras((current) => ({ ...current, [field.id]: parsed }));
                      setDraft((d) => ({
                        ...d,
                        extras: {
                          ...d.extras,
                          [field.id]: parsed === 0 && field.optional ? "" : formatMoneyDraft(parsed, country.locale, field.period === "monthly" ? 2 : 0),
                        },
                      }));
                    }}
                  />
                ))}
              </div>
            </div>
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
            <ResultsPanel
              result={result}
              country={country}
              showSchedule={showSchedule}
              onToggleSchedule={() => setShowSchedule((open) => !open)}
            />
          ) : (
            <div className="flex min-h-64 items-center rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center">
              <p className="mx-auto max-w-sm text-sm text-[var(--muted-ink)]">
                Choose a country, enter the property details, then press Calculate for monthly payment, LTV, and a principal vs
                interest breakdown.
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
  value: MortgageCountry;
  onChange: (code: MortgageCountryCode) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="mortgage-country">Country</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            id="mortgage-country"
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
          {MORTGAGE_COUNTRIES.map((item) => (
            <DropdownMenuItem
              key={item.code}
              className="justify-between gap-3 py-2"
              onSelect={() => onChange(item.code)}
            >
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
  showSchedule,
  onToggleSchedule,
}: {
  result: MortgageResult;
  country: MortgageCountry;
  showSchedule: boolean;
  onToggleSchedule: () => void;
}) {
  const money = (value: number) => formatMortgageMoney(value, country);
  const slices = [
    { name: "Principal", value: result.loanAmount, color: PIE_COLORS.principal },
    { name: "Interest", value: Math.max(0, result.totalInterest), color: PIE_COLORS.interest },
  ].filter((slice) => slice.value > 0.005);
  const principalShare =
    result.loanAmount + result.totalInterest > 0
      ? Math.max(0, Math.min(100, (result.loanAmount / (result.loanAmount + result.totalInterest)) * 100))
      : 100;

  return (
    <section className="space-y-4" aria-live="polite">
      <div className="rounded-xl border border-primary/30 bg-surface-card p-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted-ink)]">Monthly payment</p>
        <p className="mt-2 font-display text-[36px] leading-none tracking-[-0.04em] text-ink sm:text-[44px]">
          {money(result.monthlyPayment)}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-ink)]">
          {country.labels.loanAmount} {money(result.principalAndInterest)}
          {result.additionalCostsMonthly > 0 ? ` · extras ${money(result.additionalCostsMonthly)}` : null}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Monthly payment" value={money(result.monthlyPayment)} />
        <Stat label="Principal & interest" value={money(result.principalAndInterest)} />
        <Stat
          label="Additional costs / fees"
          value={money(result.additionalCostsMonthly)}
          hint={result.additionalCostsOneTime > 0 ? `+ ${money(result.additionalCostsOneTime)} one-time` : "Monthly"}
        />
        <Stat label="Total interest" value={money(result.totalInterest)} />
        <Stat label="Total amount paid" value={money(result.totalAmountPaid)} />
        <Stat label="Loan-to-value (LTV)" value={`${result.ltvPercent.toFixed(1)}%`} />
      </div>

      <div className="rounded-xl border border-[var(--hairline)] bg-canvas p-5">
        <h3 className="text-sm font-medium text-ink">Principal vs interest</h3>
        <p className="mt-1 text-xs text-[var(--muted-ink)]">How much of the loan cost is principal versus interest over the full term.</p>
        <div className="relative mx-auto mt-2 h-56 w-full max-w-sm">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="none">
                {slices.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => money(Number(value ?? 0))}
                contentStyle={{
                  background: "var(--canvas, #faf9f5)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-ink)]">LTV</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{result.ltvPercent.toFixed(1)}%</p>
          </div>
        </div>
        <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-[var(--body)]">
          {slices.map((slice) => (
            <li key={slice.name} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: slice.color }} aria-hidden />
              {slice.name} · {money(slice.value)}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted-ink)]">
            <span>Principal {money(result.loanAmount)}</span>
            <span>Interest {money(result.totalInterest)}</span>
          </div>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-soft" aria-hidden>
            <span className="h-full bg-coral" style={{ width: `${principalShare}%` }} />
            <span className="h-full bg-amber" style={{ width: `${100 - principalShare}%` }} />
          </div>
        </div>
      </div>

      <div>
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onToggleSchedule} aria-expanded={showSchedule}>
          {showSchedule ? "Hide amortization schedule" : "Show amortization schedule"}
        </Button>
        {showSchedule ? (
          <div className="mt-3 max-h-80 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.yearlyAmortization.map((row) => (
                  <TableRow key={row.year}>
                    <TableCell className="tabular-nums">{row.year}</TableCell>
                    <TableCell className="tabular-nums">{money(row.principalPaid)}</TableCell>
                    <TableCell className="tabular-nums">{money(row.interestPaid)}</TableCell>
                    <TableCell className="tabular-nums font-medium">{money(row.endingBalance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-canvas px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">{label}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-[var(--muted-ink)]">{hint}</p> : null}
      <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}

function MoneyField({
  id,
  label,
  prefix,
  suffix,
  hint,
  placeholder,
  value,
  error,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  prefix?: string;
  suffix?: string;
  hint?: string;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (raw: string) => void;
  onBlur?: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {hint ? (
          <span id={`${id}-hint`} className="text-xs text-[var(--muted-ink)]">
            {hint}
          </span>
        ) : null}
      </div>
      <PrefixedInput
        id={id}
        prefix={prefix}
        suffix={suffix}
        placeholder={placeholder}
        value={value}
        inputMode="decimal"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        onChange={onChange}
        onBlur={onBlur}
      />
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
  placeholder?: string;
  inputMode?: ComponentProps<"input">["inputMode"];
  onChange: (raw: string) => void;
  onBlur?: () => void;
} & Omit<ComponentProps<typeof Input>, "onChange" | "onBlur" | "value" | "prefix">;

function PrefixedInput({
  id,
  prefix,
  suffix,
  value,
  placeholder,
  inputMode,
  onChange,
  onBlur,
  ...rest
}: PrefixedInputProps) {
  const widePrefix = Boolean(prefix && prefix.length > 1);
  return (
    <div className="relative">
      {prefix ? (
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]",
            widePrefix ? "left-3" : "left-3",
          )}
        >
          {prefix}
        </span>
      ) : null}
      <Input
        id={id}
        {...rest}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        className={cn(prefix && (widePrefix ? "pl-12" : "pl-7"), suffix && "pr-8", rest.className)}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "" || /^[\d,.$%₹£\s\u0600-\u06FF]*\.?[\d]*$/.test(raw)) onChange(raw);
        }}
        onBlur={onBlur}
      />
      {suffix ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
