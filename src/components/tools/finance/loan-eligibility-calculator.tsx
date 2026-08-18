"use client";

import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { Check, ChevronDown, Pencil, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  LOAN_COUNTRIES,
  STATUS_LABEL,
  calculateLoanEligibility,
  defaultsFromCountry,
  formatLoanMoney,
  formatMoneyDraft,
  getLoanCountry,
  getLoanType,
  hasLoanErrors,
  moneyDigits,
  parseMoney,
  validateLoanEligibility,
  type EligibilityStatus,
  type IncomePeriod,
  type LoanCountry,
  type LoanCountryCode,
  type LoanEligibilityInput,
  type LoanEligibilityResult,
  type LoanTypeId,
} from "@/lib/loan-eligibility/calculate";
import { cn } from "@/lib/utils";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

const STATUS_STYLES: Record<EligibilityStatus, string> = {
  eligible: "border-teal/40 bg-teal/10 text-ink",
  maybe: "border-amber/40 bg-amber/10 text-ink",
  not: "border-coral/40 bg-coral/10 text-ink",
};

const STATUS_DOT: Record<EligibilityStatus, string> = {
  eligible: "bg-teal",
  maybe: "bg-amber",
  not: "bg-coral",
};

function toInput(country: LoanCountry, loanType: LoanTypeId, drafts: {
  income: string;
  incomePeriod: IncomePeriod;
  existingDebt: string;
  requestedAmount: string;
  termYears: string;
  interestRate: string;
  employmentId: string;
  creditScore: string;
  downPayment: string;
  age: string;
  employmentMonths: string;
  salaryTransfer: boolean;
  resident: boolean;
}): LoanEligibilityInput {
  return {
    country: country.code,
    loanType,
    income: parseMoney(drafts.income),
    incomePeriod: drafts.incomePeriod,
    existingDebt: drafts.existingDebt.trim() === "" ? 0 : parseMoney(drafts.existingDebt),
    requestedAmount: parseMoney(drafts.requestedAmount),
    termYears: parseMoney(drafts.termYears),
    interestRatePercent: parseMoney(drafts.interestRate),
    employmentId: drafts.employmentId,
    creditScore: parseMoney(drafts.creditScore),
    downPayment: drafts.downPayment.trim() === "" ? 0 : parseMoney(drafts.downPayment),
    age: parseMoney(drafts.age),
    employmentMonths: parseMoney(drafts.employmentMonths),
    salaryTransfer: drafts.salaryTransfer,
    resident: drafts.resident,
  };
}

function draftsFrom(country: LoanCountry, loanTypeId: LoanTypeId) {
  const defaults = defaultsFromCountry(country, loanTypeId);
  const digits = moneyDigits(country.currency);
  return {
    income: formatMoneyDraft(defaults.income, country.locale, defaults.incomePeriod === "annual" ? digits : digits),
    existingDebt: formatMoneyDraft(defaults.existingDebt, country.locale, digits),
    requestedAmount: formatMoneyDraft(defaults.requestedAmount, country.locale, digits),
    termYears: String(defaults.termYears),
    interestRate: formatMoneyDraft(defaults.interestRatePercent, country.locale, 2),
    employmentId: defaults.employmentId,
    creditScore: country.credit ? String(defaults.creditScore) : "",
    downPayment: getLoanType(country, loanTypeId).showDownPayment
      ? formatMoneyDraft(defaults.downPayment, country.locale, digits)
      : "0",
    age: country.extras.age ? String(defaults.age) : "",
    employmentMonths: country.extras.employmentMonths ? String(defaults.employmentMonths) : "",
    salaryTransfer: defaults.salaryTransfer,
    resident: defaults.resident,
    incomePeriod: defaults.incomePeriod,
  };
}

export function LoanEligibilityCalculator() {
  const [countryCode, setCountryCode] = useState<LoanCountryCode>("US");
  const country = getLoanCountry(countryCode);
  const [loanType, setLoanType] = useState<LoanTypeId>(country.defaultLoanType);
  const type = getLoanType(country, loanType);
  const initial = draftsFrom(country, loanType);
  const [income, setIncome] = useState(initial.income);
  const [incomePeriod, setIncomePeriod] = useState<IncomePeriod>(initial.incomePeriod);
  const [existingDebt, setExistingDebt] = useState(initial.existingDebt);
  const [requestedAmount, setRequestedAmount] = useState(initial.requestedAmount);
  const [termYears, setTermYears] = useState(initial.termYears);
  const [interestRate, setInterestRate] = useState(initial.interestRate);
  const [employmentId, setEmploymentId] = useState(initial.employmentId);
  const [creditScore, setCreditScore] = useState(initial.creditScore);
  const [downPayment, setDownPayment] = useState(initial.downPayment);
  const [age, setAge] = useState(initial.age);
  const [employmentMonths, setEmploymentMonths] = useState(initial.employmentMonths);
  const [salaryTransfer, setSalaryTransfer] = useState(initial.salaryTransfer);
  const [resident, setResident] = useState(initial.resident);
  const [result, setResult] = useState<LoanEligibilityResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formCollapsed, setFormCollapsed] = useState(false);

  const input = toInput(country, loanType, {
    income,
    incomePeriod,
    existingDebt,
    requestedAmount,
    termYears,
    interestRate,
    employmentId,
    creditScore,
    downPayment,
    age,
    employmentMonths,
    salaryTransfer,
    resident,
  });

  const errors = useMemo(() => validateLoanEligibility(input), [input]);
  const invalid = hasLoanErrors(errors);
  const employment = country.employmentTypes.find((item) => item.id === employmentId) ?? country.employmentTypes[0];
  const digits = moneyDigits(country.currency);

  const applyCountry = (code: LoanCountryCode) => {
    const next = getLoanCountry(code);
    const drafts = draftsFrom(next, next.defaultLoanType);
    setCountryCode(code);
    setLoanType(next.defaultLoanType);
    setIncome(drafts.income);
    setIncomePeriod(drafts.incomePeriod);
    setExistingDebt(drafts.existingDebt);
    setRequestedAmount(drafts.requestedAmount);
    setTermYears(drafts.termYears);
    setInterestRate(drafts.interestRate);
    setEmploymentId(drafts.employmentId);
    setCreditScore(drafts.creditScore);
    setDownPayment(drafts.downPayment);
    setAge(drafts.age);
    setEmploymentMonths(drafts.employmentMonths);
    setSalaryTransfer(drafts.salaryTransfer);
    setResident(drafts.resident);
    setResult(null);
    setSubmitted(false);
    setFormCollapsed(false);
  };

  const applyLoanType = (id: LoanTypeId) => {
    const next = getLoanType(country, id);
    const defaults = defaultsFromCountry(country, id);
    setLoanType(id);
    setRequestedAmount(formatMoneyDraft(defaults.requestedAmount, country.locale, digits));
    setTermYears(String(defaults.termYears));
    setInterestRate(formatMoneyDraft(defaults.interestRatePercent, country.locale, 2));
    setDownPayment(next.showDownPayment ? formatMoneyDraft(defaults.downPayment, country.locale, digits) : "0");
    setResult(null);
    setSubmitted(false);
  };

  const setPeriod = (period: IncomePeriod) => {
    if (period === incomePeriod) return;
    const parsed = parseMoney(income);
    if (Number.isFinite(parsed) && parsed > 0) {
      const next = period === "annual" ? parsed * 12 : parsed / 12;
      setIncome(formatMoneyDraft(next, country.locale, digits));
    }
    setIncomePeriod(period);
  };

  const calculate = () => {
    setSubmitted(true);
    if (hasLoanErrors(validateLoanEligibility(input))) return;
    setResult(calculateLoanEligibility(input));
    setFormCollapsed(true);
  };

  const reset = () => {
    applyCountry(countryCode);
  };

  const editInputs = () => {
    setFormCollapsed(false);
    window.setTimeout(() => document.getElementById("loan-el-country")?.focus(), 0);
  };

  const money = (value: number) => formatLoanMoney(value, country);

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

          <p className="font-display text-lg tracking-[-0.02em] text-ink">{country.labels.pageTitle}</p>

          <div className="space-y-2">
            <Label>Loan type</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Loan type">
              {country.loanTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={loanType === item.id}
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    loanType === item.id
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => applyLoanType(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <Field
            id="loan-el-income"
            label={`${country.labels.income} (${country.currencySymbol})`}
            hint={country.labels.incomeHint}
            error={submitted ? errors.income : undefined}
          >
            <div className="flex rounded-md border border-[var(--hairline)] p-0.5" role="group" aria-label="Income period">
              {(
                [
                  { value: "monthly" as const, label: "Monthly" },
                  { value: "annual" as const, label: "Annual" },
                ]
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "h-8 flex-1 rounded-[6px] px-2.5 text-sm transition-colors",
                    incomePeriod === option.value ? "bg-coral text-white" : "text-[var(--body)] hover:bg-surface-soft",
                  )}
                  aria-pressed={incomePeriod === option.value}
                  onClick={() => setPeriod(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <PrefixedInput
              id="loan-el-income"
              prefix={country.currencySymbol}
              value={income}
              aria-invalid={submitted && Boolean(errors.income)}
              onChange={setIncome}
            />
          </Field>

          <Field
            id="loan-el-debt"
            label={`${country.labels.existingDebt} (${country.currencySymbol})`}
            hint={country.labels.existingDebtHint}
            error={submitted ? errors.existingDebt : undefined}
          >
            <PrefixedInput id="loan-el-debt" prefix={country.currencySymbol} value={existingDebt} onChange={setExistingDebt} />
          </Field>

          <Field
            id="loan-el-requested"
            label={`${country.labels.requested} (${country.currencySymbol})`}
            hint={country.labels.requestedHint}
            error={submitted ? errors.requestedAmount : undefined}
          >
            <PrefixedInput id="loan-el-requested" prefix={country.currencySymbol} value={requestedAmount} onChange={setRequestedAmount} />
          </Field>

          {type.showDownPayment ? (
            <Field
              id="loan-el-down"
              label={`${country.labels.downPayment} (${country.currencySymbol})`}
              hint={country.labels.downPaymentHint}
              error={submitted ? errors.downPayment : undefined}
            >
              <PrefixedInput id="loan-el-down" prefix={country.currencySymbol} value={downPayment} onChange={setDownPayment} />
            </Field>
          ) : null}

          <Field
            id="loan-el-term"
            label={`${country.labels.term} (years)`}
            error={submitted ? errors.termYears : undefined}
          >
            <Input
              id="loan-el-term"
              inputMode="numeric"
              value={termYears}
              aria-invalid={submitted && Boolean(errors.termYears)}
              onChange={(event) => setTermYears(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {type.termPresets.map((years) => (
                <button
                  key={years}
                  type="button"
                  className={cn(
                    "h-9 rounded-md border px-3 text-sm transition-colors",
                    Number(termYears) === years
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  aria-pressed={Number(termYears) === years}
                  onClick={() => setTermYears(String(years))}
                >
                  {years} yr
                </button>
              ))}
            </div>
          </Field>

          <Field
            id="loan-el-rate"
            label={`${country.labels.rate} (%)`}
            hint="Enter the rate a lender quoted, or use the example. Results also show an estimated rate after credit-band adjustments."
            error={submitted ? errors.interestRatePercent : undefined}
          >
            <PrefixedInput id="loan-el-rate" suffix="%" value={interestRate} onChange={setInterestRate} />
          </Field>

          <Field id="loan-el-employment" label={country.labels.employment} hint={employment.hint}>
            <select
              id="loan-el-employment"
              className={selectClass}
              value={employmentId}
              onChange={(event) => setEmploymentId(event.target.value)}
            >
              {country.employmentTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          {country.credit ? (
            <Field
              id="loan-el-credit"
              label={country.credit.label}
              hint={country.credit.hint}
              error={submitted ? errors.creditScore : undefined}
            >
              <Input
                id="loan-el-credit"
                inputMode="numeric"
                value={creditScore}
                aria-invalid={submitted && Boolean(errors.creditScore)}
                onChange={(event) => setCreditScore(event.target.value)}
              />
            </Field>
          ) : null}

          {country.extras.age ? (
            <Field id="loan-el-age" label={country.labels.age ?? "Age"} hint={country.labels.ageHint} error={submitted ? errors.age : undefined}>
              <Input id="loan-el-age" inputMode="numeric" value={age} onChange={(event) => setAge(event.target.value)} />
            </Field>
          ) : null}

          {country.extras.employmentMonths ? (
            <Field
              id="loan-el-months"
              label={country.labels.employmentMonths ?? "Months in current job"}
              hint={country.labels.employmentMonthsHint}
              error={submitted ? errors.employmentMonths : undefined}
            >
              <Input
                id="loan-el-months"
                inputMode="numeric"
                value={employmentMonths}
                onChange={(event) => setEmploymentMonths(event.target.value)}
              />
            </Field>
          ) : null}

          {country.extras.salaryTransfer ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--hairline)] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{country.labels.salaryTransfer}</p>
                <p className="text-xs text-[var(--muted-ink)]">{country.labels.salaryTransferHint}</p>
              </div>
              <Switch checked={salaryTransfer} onCheckedChange={setSalaryTransfer} aria-label={country.labels.salaryTransfer} />
            </div>
          ) : null}

          {country.extras.residency && type.id === "home" ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--hairline)] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{country.labels.residency}</p>
                <p className="text-xs text-[var(--muted-ink)]">Non-residents usually need a larger down payment.</p>
              </div>
              <Switch checked={resident} onCheckedChange={setResident} aria-label={country.labels.residency} />
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
            <ResultsPanel result={result} country={country} money={money} onEdit={editInputs} />
          ) : (
            <div className="flex min-h-64 items-center rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center">
              <p className="mx-auto max-w-sm text-sm text-[var(--muted-ink)]">
                Choose a country and loan type, enter income and debts, then press Calculate for an estimated eligibility
                range. Figures are planning estimates, not a loan offer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsPanel({
  result,
  country,
  money,
  onEdit,
}: {
  result: LoanEligibilityResult;
  country: LoanCountry;
  money: (value: number) => string;
  onEdit: () => void;
}) {
  const type = getLoanType(country, result.loanType);
  const incomeShare = Math.max(result.monthlyIncome, 1);
  const existingPct = Math.max(0, (result.existingDebt / incomeShare) * 100);
  const paymentPct = Math.max(0, (result.requestedPayment / incomeShare) * 100);
  const used = existingPct + paymentPct;
  const scale = used > 100 ? 100 / used : 1;
  const remainPct = Math.max(0, 100 - used * scale);

  return (
    <div className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Eligibility estimate</p>
          <p
            className={cn(
              "mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
              STATUS_STYLES[result.status],
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[result.status])} aria-hidden />
            {STATUS_LABEL[result.status]}
          </p>
        </div>
        <Button type="button" variant="outline" className="min-h-10" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Edit Inputs
        </Button>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Eligible loan amount</p>
        <p className="mt-1 font-display text-[32px] leading-none tracking-[-0.03em] text-ink sm:text-[36px]">
          {money(result.eligibleLoanAmount)}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-ink)]">
          {type.label} · requested {money(result.requestedAmount)}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Estimated monthly payment" value={money(result.requestedPayment)} />
        <Stat label="Maximum affordable payment" value={money(result.maxAffordablePayment)} />
        <Stat
          label={country.labels.ratio}
          value={`${result.ratioPercent.toFixed(1)}%`}
          hint={`Guideline ${result.eligibleRatioPercent.toFixed(0)}%${result.maybeRatioPercent > result.eligibleRatioPercent ? ` · stretch ${result.maybeRatioPercent.toFixed(0)}%` : ""}`}
        />
        <Stat
          label="Estimated interest rate"
          value={`${result.estimatedRate.toFixed(2)}%`}
          hint={
            result.estimatedRate !== result.quotedRate
              ? `Quoted ${result.quotedRate.toFixed(2)}% plus a credit-band adjustment`
              : result.qualifyingRate > result.quotedRate
                ? `Quoted ${result.quotedRate.toFixed(2)}% · qualifying ${result.qualifyingRate.toFixed(2)}%`
                : undefined
          }
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink">Income vs obligations</p>
        <div
          className="flex h-3 overflow-hidden rounded-full bg-canvas"
          role="img"
          aria-label={`Existing debts ${existingPct.toFixed(0)} percent, new payment ${paymentPct.toFixed(0)} percent of monthly income`}
        >
          <span className="bg-amber" style={{ width: `${existingPct * scale}%` }} />
          <span className="bg-coral" style={{ width: `${paymentPct * scale}%` }} />
          <span className="bg-teal" style={{ width: `${remainPct}%` }} />
        </div>
        <ul className="mt-3 grid gap-1 text-xs text-[var(--muted-ink)] sm:grid-cols-3">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber" aria-hidden />
            Existing {money(result.existingDebt)} / mo
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-coral" aria-hidden />
            New payment {money(result.requestedPayment)} / mo
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal" aria-hidden />
            Remaining {money(Math.max(0, result.remainingIncome))} / mo
          </li>
        </ul>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink">Key factors</p>
        <ul className="space-y-2">
          {result.factors.map((factor) => (
            <li key={factor.label} className="rounded-lg border border-[var(--hairline)] bg-canvas px-3 py-2">
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    factor.tone === "eligible" ? "bg-teal" : factor.tone === "maybe" ? "bg-amber" : factor.tone === "not" ? "bg-coral" : "bg-[var(--hairline)]",
                  )}
                  aria-hidden
                />
                {factor.label}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-ink)]">{factor.detail}</p>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-[var(--muted-ink)]">
        Estimates only — not a pre-approval, sanction, or credit decision. Lenders apply their own policy, documentation
        checks, and live rates.
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
  value: LoanCountry;
  onChange: (code: LoanCountryCode) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="loan-el-country">Country</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            id="loan-el-country"
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
          {LOAN_COUNTRIES.map((item) => (
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
