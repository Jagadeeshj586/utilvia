"use client";

import { useEffect, useMemo, useState, type HTMLAttributes, type ReactNode } from "react";
import { Check, Download, Lock, Pencil, Plus, Printer, RotateCcw, Shield, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PAY_FREQUENCIES } from "@/lib/paycheck/types";
import {
  PAY_STUB_COUNTRIES,
  PAY_STUB_STEPS,
  calculatePayStub,
  earningAmount,
  earningsFromProfile,
  formatPayStubDate,
  formatPayStubMoney,
  getPayStubCountry,
  newEarning,
  newOtherDeduction,
  periodForFrequency,
  type CountryCode,
  type PayFrequency,
  type PayStubEarning,
  type PayStubOtherDeduction,
  type PayStubStep,
} from "@/lib/pay-stub/calculate";
import { buildPayStubPdf } from "@/lib/pay-stub/pdf";
import { cn, downloadBlob, uint8ToBlob } from "@/lib/utils";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

const US = getPayStubCountry("US");
const US_PERIOD = periodForFrequency(US.defaultFrequency);

export function PayStubGenerator() {
  const [step, setStep] = useState<PayStubStep>("country");
  const [country, setCountry] = useState<CountryCode>("US");
  const [companyName, setCompanyName] = useState(US.companyName);
  const [companyAddress, setCompanyAddress] = useState(US.companyAddress);
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState(US.employeeName);
  const [employeeId, setEmployeeId] = useState("");
  const [employeeAddress, setEmployeeAddress] = useState(US.employeeAddress);
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [frequency, setFrequency] = useState<PayFrequency>(US.defaultFrequency);
  const [regionCode, setRegionCode] = useState(US.defaultRegion);
  const [payPeriodStart, setPayPeriodStart] = useState(US_PERIOD.start);
  const [payPeriodEnd, setPayPeriodEnd] = useState(US_PERIOD.end);
  const [payDate, setPayDate] = useState(US_PERIOD.payDate);
  const [earnings, setEarnings] = useState<PayStubEarning[]>(() => earningsFromProfile("US"));
  const [retirementPercent, setRetirementPercent] = useState(String(US.defaultRetirementPercent));
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [otherDeductions, setOtherDeductions] = useState<PayStubOtherDeduction[]>([]);
  const [busy, setBusy] = useState(false);

  const profile = getPayStubCountry(country);

  useEffect(() => {
    document.body.classList.add("pay-stub-print");
    return () => document.body.classList.remove("pay-stub-print");
  }, []);

  const statutoryOverrides = useMemo(() => {
    const next: Record<string, number | null> = {};
    for (const [key, value] of Object.entries(overrides)) {
      const parsed = Number(value);
      next[key] = value.trim() === "" || !Number.isFinite(parsed) ? null : parsed;
    }
    return next;
  }, [overrides]);

  const totals = useMemo(
    () =>
      calculatePayStub({
        country,
        frequency,
        regionCode,
        payPeriodStart,
        payPeriodEnd,
        earnings,
        retirementPercent: Number(retirementPercent) || 0,
        statutoryOverrides,
        otherDeductions,
      }),
    [country, earnings, frequency, otherDeductions, payPeriodEnd, payPeriodStart, regionCode, retirementPercent, statutoryOverrides],
  );

  const money = (value: number) => formatPayStubMoney(value, totals.currency);
  const date = (iso: string) => formatPayStubDate(iso, profile.locale);
  const frequencyLabel = PAY_FREQUENCIES.find((item) => item.value === frequency)?.label ?? frequency;
  const canPreview = totals.errors.length === 0 && companyName.trim() && employeeName.trim();
  const currentStepIndex = PAY_STUB_STEPS.findIndex((item) => item.id === step);

  const applyCountry = (next: CountryCode) => {
    const selected = getPayStubCountry(next);
    const period = periodForFrequency(selected.defaultFrequency);
    setCountry(next);
    setCompanyName(selected.companyName);
    setCompanyAddress(selected.companyAddress);
    setCompanyPhone("");
    setCompanyLogo(null);
    setEmployeeName(selected.employeeName);
    setEmployeeId("");
    setEmployeeAddress(selected.employeeAddress);
    setJobTitle("");
    setDepartment("");
    setNationalId("");
    setFrequency(selected.defaultFrequency);
    setRegionCode(selected.defaultRegion);
    setPayPeriodStart(period.start);
    setPayPeriodEnd(period.end);
    setPayDate(period.payDate);
    setEarnings(earningsFromProfile(next));
    setRetirementPercent(String(selected.defaultRetirementPercent));
    setOverrides({});
    setOtherDeductions([]);
  };

  const applyFrequency = (next: PayFrequency) => {
    const period = periodForFrequency(next);
    setFrequency(next);
    setPayPeriodStart(period.start);
    setPayPeriodEnd(period.end);
    setPayDate(period.payDate);
  };

  const reset = () => {
    applyCountry(country);
    setStep("country");
    toast.success("Stub reset to country defaults");
  };

  const goNext = () => {
    const index = PAY_STUB_STEPS.findIndex((item) => item.id === step);
    const next = PAY_STUB_STEPS[index + 1];
    if (!next) return;
    if (next.id === "preview" && !canPreview) {
      toast.error(totals.errors[0] || "Add employer and employee names before previewing.");
      return;
    }
    setStep(next.id);
  };

  const goBack = () => {
    const index = PAY_STUB_STEPS.findIndex((item) => item.id === step);
    const previous = PAY_STUB_STEPS[index - 1];
    if (previous) setStep(previous.id);
  };

  const generate = () => {
    if (!canPreview) {
      toast.error(totals.errors[0] || "Add employer and employee names before generating.");
      if (!companyName.trim() || !employeeName.trim()) setStep("details");
      else if (totals.errors.length) setStep("earnings");
      return;
    }
    setStep("preview");
    requestAnimationFrame(() => document.getElementById("pay-stub-preview")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const loadLogo = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setCompanyLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const downloadPdf = async () => {
    if (!canPreview) {
      toast.error("Fix the highlighted fields before downloading.");
      return;
    }
    setBusy(true);
    try {
      const bytes = await buildPayStubPdf({
        profile,
        companyName,
        companyAddress,
        companyPhone,
        companyLogo,
        employeeName,
        employeeId,
        employeeAddress,
        jobTitle,
        department,
        nationalId,
        payPeriodStart,
        payPeriodEnd,
        payDate,
        frequencyLabel,
        earnings,
        otherDeductions,
        totals,
      });
      downloadBlob(uint8ToBlob(bytes, "application/pdf"), `${profile.documentName.toLowerCase().replace(/\s+/g, "-")}-${payDate}.pdf`);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Could not create the PDF.");
    } finally {
      setBusy(false);
    }
  };

  const updateEarning = (id: string, patch: Partial<PayStubEarning>) => {
    setEarnings((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  return (
    <div className="space-y-6">
      <p className="print:hidden rounded-lg border border-teal/30 bg-teal/10 px-4 py-3 text-center text-sm text-[var(--body)]">
        <Lock className="mx-auto mb-1 h-4 w-4" aria-hidden />
        Your pay information stays in your browser — nothing is sent to any server. Close this page to clear all data.
      </p>

      <div className="print:hidden rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--body)]">
        <span aria-hidden className="mr-2">
          {profile.flag}
        </span>
        {profile.ruleNote}
      </div>

      <nav className="print:hidden" aria-label="Pay stub steps">
        <p className="mb-3 text-sm text-[var(--muted-ink)]">
          Step {currentStepIndex + 1} of {PAY_STUB_STEPS.length}
          <span className="text-ink"> — {PAY_STUB_STEPS[currentStepIndex]?.label}</span>
        </p>
        <ol className="flex w-full items-start">
          {PAY_STUB_STEPS.map((item, index) => {
            const current = index === currentStepIndex;
            const done = index < currentStepIndex;
            const last = index === PAY_STUB_STEPS.length - 1;
            return (
              <li key={item.id} className={cn("flex min-w-0 items-start", last ? "shrink-0" : "flex-1")}>
                <button
                  type="button"
                  aria-current={current ? "step" : undefined}
                  className="flex min-w-0 flex-col items-center gap-1.5"
                  onClick={() => {
                    if (item.id === "preview" && !canPreview) {
                      toast.error(totals.errors[0] || "Complete the form before opening the preview.");
                      return;
                    }
                    setStep(item.id);
                  }}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                      done || current
                        ? "bg-coral text-white"
                        : "border border-[var(--hairline)] bg-canvas text-[var(--muted-ink)] hover:border-coral/40",
                      current && "ring-2 ring-coral/30 ring-offset-2 ring-offset-canvas",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden /> : index + 1}
                  </span>
                  <span
                    className={cn(
                      "max-w-[4.5rem] text-center text-[11px] leading-tight sm:max-w-none sm:text-xs",
                      current ? "font-medium text-ink" : "text-[var(--muted-ink)]",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
                {last ? null : (
                  <div
                    className={cn("mx-1 mt-4 h-px min-w-2 flex-1 sm:mx-2", done ? "bg-coral" : "bg-[var(--hairline)]")}
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="print:hidden space-y-6">
          {step === "country" ? (
            <Section title="Country">
              <p className="text-sm text-[var(--muted-ink)]">
                Choose a country to load local currency, pay-stub labels, and estimated payroll rules.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PAY_STUB_COUNTRIES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    aria-pressed={country === item.code}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm font-medium transition-colors",
                      country === item.code
                        ? "border-coral bg-coral text-white"
                        : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                    )}
                    onClick={() => applyCountry(item.code)}
                  >
                    <span aria-hidden className="text-lg">
                      {item.flag}
                    </span>
                    <span>
                      {item.name}
                      <span className={cn("mt-0.5 block text-xs font-normal", country === item.code ? "text-white/80" : "text-[var(--muted-ink)]")}>
                        {item.currency} · {item.documentName}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </Section>
          ) : null}

          {step === "details" ? (
            <>
              <Section title={`${profile.employerLabel} details`}>
                <Field id="company-name" label={`${profile.employerLabel} name`} value={companyName} onChange={setCompanyName} required />
                <Field id="company-address" label="Address" value={companyAddress} onChange={setCompanyAddress} />
                <Field id="company-phone" label="Phone (optional)" value={companyPhone} onChange={setCompanyPhone} />
                <div>
                  <Label htmlFor="company-logo">Logo (optional)</Label>
                  <Input
                    id="company-logo"
                    type="file"
                    accept="image/*"
                    className="mt-1 cursor-pointer text-sm file:mr-3 file:rounded-md file:border-0 file:bg-surface-soft file:px-3 file:py-1.5 file:text-sm file:text-ink"
                    onChange={(event) => loadLogo(event.target.files?.[0])}
                  />
                </div>
              </Section>
              <Section title="Employee details">
                <Field id="employee-name" label="Employee name" value={employeeName} onChange={setEmployeeName} required />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="employee-id" label={profile.employeeIdLabel} value={employeeId} onChange={setEmployeeId} />
                  <Field id="job-title" label={profile.jobTitleLabel} value={jobTitle} onChange={setJobTitle} />
                </div>
                <Field id="employee-address" label="Address" value={employeeAddress} onChange={setEmployeeAddress} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="department" label={`${profile.departmentLabel} (optional)`} value={department} onChange={setDepartment} />
                  <Field
                    id="national-id"
                    label={profile.nationalIdLabel}
                    value={nationalId}
                    onChange={(value) => setNationalId(value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4))}
                    placeholder="1234"
                    autoComplete="off"
                  />
                </div>
                <p className="text-xs text-[var(--muted-ink)]">Only the last four characters are stored and printed, with a mask.</p>
                <div>
                  <Label htmlFor="pay-frequency">Pay frequency</Label>
                  <select id="pay-frequency" className={selectClass} value={frequency} onChange={(event) => applyFrequency(event.target.value as PayFrequency)}>
                    {PAY_FREQUENCIES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                {profile.regionLabel && profile.regions.length ? (
                  <div>
                    <Label htmlFor="pay-region">{profile.regionLabel}</Label>
                    <select id="pay-region" className={selectClass} value={regionCode} onChange={(event) => setRegionCode(event.target.value)}>
                      {profile.regions.map((region) => (
                        <option key={region.code} value={region.code}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field id="pay-start" label="Pay period start" value={payPeriodStart} onChange={setPayPeriodStart} type="date" />
                  <Field id="pay-end" label="Pay period end" value={payPeriodEnd} onChange={setPayPeriodEnd} type="date" />
                  <Field id="pay-date" label="Pay date" value={payDate} onChange={setPayDate} type="date" />
                </div>
              </Section>
            </>
          ) : null}

          {step === "earnings" ? (
            <Section
              title="Earnings"
              action={
                <div className="flex flex-wrap gap-2">
                  <AddLink onClick={() => setEarnings((current) => [...current, newEarning(profile.hoursEarningLabel, "hours", 0, 0, 0)])}>
                    Hours row
                  </AddLink>
                  <AddLink onClick={() => setEarnings((current) => [...current, newEarning(profile.bonusLabel)])}>Bonus</AddLink>
                  <AddLink onClick={() => setEarnings((current) => [...current, newEarning(profile.allowanceLabel)])}>Allowance</AddLink>
                </div>
              }
            >
              <p className="text-sm text-[var(--muted-ink)]">
                Gross pay is the sum of these rows in {profile.currency}. Hours rows use hours × rate; bonuses and allowances use a fixed amount.
              </p>
              {earnings.map((row) => (
                <div key={row.id} className="space-y-2 rounded-lg border border-[var(--hairline)] bg-canvas p-3">
                  <div className="flex items-start gap-2">
                    <Input
                      value={row.label}
                      onChange={(event) => updateEarning(row.id, { label: event.target.value })}
                      aria-label="Earning type"
                      className="flex-1"
                    />
                    {earnings.length > 1 ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove ${row.label || "earning"}`}
                        onClick={() => setEarnings((current) => current.filter((item) => item.id !== row.id))}
                      >
                        <Trash2 className="h-4 w-4 text-[var(--muted-ink)]" />
                      </Button>
                    ) : null}
                  </div>
                  {row.mode === "hours" ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                      <Input
                        type="number"
                        value={row.hours}
                        onChange={(event) => updateEarning(row.id, { hours: Number(event.target.value) })}
                        aria-label="Hours"
                        placeholder="Hours"
                      />
                      <Input
                        type="number"
                        value={row.rate}
                        onChange={(event) => updateEarning(row.id, { rate: Number(event.target.value) })}
                        aria-label="Rate"
                        placeholder="Rate"
                      />
                      <p className="col-span-2 text-sm font-medium tabular-nums sm:col-span-1 sm:text-right">{money(earningAmount(row))}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={row.amount}
                        onChange={(event) => updateEarning(row.id, { amount: Number(event.target.value) })}
                        aria-label={`${row.label || "Amount"}`}
                      />
                      <p className="w-28 text-right text-sm font-medium tabular-nums">{money(earningAmount(row))}</p>
                    </div>
                  )}
                </div>
              ))}
              <p className="text-sm font-medium">
                Gross pay: <span className="tabular-nums">{money(totals.grossPay)}</span>
              </p>
              {totals.errors.map((error) => (
                <p key={error} className="text-sm text-[var(--error)]">
                  {error}
                </p>
              ))}
            </Section>
          ) : null}

          {step === "deductions" ? (
            <Section title="Deductions">
              <Field
                id="retirement"
                label={profile.retirementLabel}
                value={retirementPercent}
                onChange={setRetirementPercent}
                inputMode="decimal"
              />
              {totals.statutory.length ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Taxes and contributions</p>
                  <p className="text-xs text-[var(--muted-ink)]">Estimated from {profile.name} payroll rules. Clear a field to return to the estimate.</p>
                  {totals.statutory.map((line) => (
                    <div key={line.key}>
                      <Label htmlFor={`stat-${line.key}`}>
                        {line.label}
                        {line.estimated ? " (estimated)" : ""}
                      </Label>
                      <Input
                        id={`stat-${line.key}`}
                        inputMode="decimal"
                        className="mt-1"
                        value={overrides[line.key] ?? line.amount.toFixed(2)}
                        placeholder="Auto"
                        onChange={(event) => setOverrides((current) => ({ ...current, [line.key]: event.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted-ink)]">
                  No automatic income tax or social contributions for this country. Add optional deductions below.
                </p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Other deductions</p>
                <AddLink onClick={() => setOtherDeductions((current) => [...current, newOtherDeduction(profile.otherDeductionLabel)])}>
                  Add
                </AddLink>
              </div>
              {otherDeductions.map((row) => (
                <div key={row.id} className="flex gap-2">
                  <Input
                    value={row.label}
                    onChange={(event) =>
                      setOtherDeductions((current) => current.map((item) => (item.id === row.id ? { ...item, label: event.target.value } : item)))
                    }
                    aria-label="Deduction label"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={row.amount}
                    onChange={(event) =>
                      setOtherDeductions((current) =>
                        current.map((item) => (item.id === row.id ? { ...item, amount: Number(event.target.value) } : item)),
                      )
                    }
                    aria-label={`${row.label || "Deduction"} amount`}
                    className="w-28"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Remove ${row.label || "deduction"}`}
                    onClick={() => setOtherDeductions((current) => current.filter((item) => item.id !== row.id))}
                  >
                    <Trash2 className="h-4 w-4 text-[var(--muted-ink)]" />
                  </Button>
                </div>
              ))}
            </Section>
          ) : null}

          {step === "preview" ? (
            <Section title="Ready to download">
              <p className="text-sm text-[var(--body)]">
                Review the live stub, then print or download a PDF. This is a sample estimated payroll document, not an official record.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setStep("details")}>
                  <Pencil className="h-4 w-4" />
                  Edit details
                </Button>
                <Button type="button" variant="outline" onClick={() => setStep("earnings")}>
                  Edit earnings
                </Button>
              </div>
            </Section>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {step !== "country" ? (
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
            ) : null}
            {step !== "preview" ? (
              <Button type="button" onClick={step === "deductions" ? generate : goNext}>
                {step === "deductions" ? "Generate preview" : "Next"}
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className={cn("space-y-4 lg:sticky lg:top-24 lg:self-start", step !== "preview" ? "max-lg:hidden" : "")}>
          <div className="print:hidden flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Pay stub preview</h2>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={generate}>
                Generate
              </Button>
              <Button type="button" variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button type="button" onClick={() => void downloadPdf()} disabled={busy}>
                <Download className="h-4 w-4" />
                {busy ? "Preparing PDF…" : "Download PDF"}
              </Button>
            </div>
          </div>

          <div id="pay-stub-preview" className="rounded-xl border border-[var(--hairline)] bg-[#faf9f5] p-6 text-[#141413] shadow-sm">
            <div className="flex justify-between gap-4 border-b border-[#e6dfd8] pb-4">
              <div>
                {companyLogo ? (
                  // Logo is a local data URL chosen by the user; it never leaves the browser.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={companyLogo} alt="" className="mb-2 h-10 object-contain" />
                ) : null}
                <p className="text-lg font-semibold">{companyName || profile.employerLabel}</p>
                {companyAddress ? <p className="text-xs text-[#3d3d3a]">{companyAddress}</p> : null}
                {companyPhone ? <p className="text-xs text-[#3d3d3a]">{companyPhone}</p> : null}
              </div>
              <div className="text-right text-xs text-[#3d3d3a]">
                <p className="font-semibold text-[#141413]">{profile.documentTitle}</p>
                <p>
                  {profile.flag} {profile.name}
                </p>
                <p>Pay date: {date(payDate)}</p>
                <p>
                  Period: {date(payPeriodStart)} – {date(payPeriodEnd)}
                </p>
                <p>{frequencyLabel}</p>
              </div>
            </div>

            <div className="mt-4 text-xs">
              <p className="font-semibold text-[#252523]">Employee</p>
              <p>{employeeName || "—"}</p>
              {employeeAddress ? <p className="text-[#3d3d3a]">{employeeAddress}</p> : null}
              {employeeId ? (
                <p>
                  {profile.employeeIdLabel}: {employeeId}
                </p>
              ) : null}
              {jobTitle ? (
                <p>
                  {profile.jobTitleLabel}: {jobTitle}
                </p>
              ) : null}
              {department ? (
                <p>
                  {profile.departmentLabel}: {department}
                </p>
              ) : null}
              {nationalId ? (
                <p>
                  {profile.nationalIdPrefix}
                  {nationalId}
                </p>
              ) : null}
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#d9d2c8]">
                    <th className="py-1 text-left font-medium">Earnings</th>
                    <th className="py-1 text-right font-medium">Hours</th>
                    <th className="py-1 text-right font-medium">Rate</th>
                    <th className="py-1 text-right font-medium">This period</th>
                    <th className="py-1 text-right font-medium">YTD</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((row) => (
                    <tr key={row.id}>
                      <td className="py-1">{row.label || "—"}</td>
                      <td className="py-1 text-right tabular-nums">{row.mode === "hours" ? row.hours : "—"}</td>
                      <td className="py-1 text-right tabular-nums">{row.mode === "hours" ? money(row.rate) : "—"}</td>
                      <td className="py-1 text-right tabular-nums">{money(earningAmount(row))}</td>
                      <td className="py-1 text-right tabular-nums">{money(earningAmount(row) * totals.periodIndex)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-[#d9d2c8] font-semibold">
                    <td className="py-1" colSpan={3}>
                      Gross pay
                    </td>
                    <td className="py-1 text-right tabular-nums">{money(totals.grossPay)}</td>
                    <td className="py-1 text-right tabular-nums">{money(totals.ytdGross)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#d9d2c8]">
                    <th className="py-1 text-left font-medium">Deductions</th>
                    <th className="py-1 text-right font-medium">This period</th>
                    <th className="py-1 text-right font-medium">YTD</th>
                  </tr>
                </thead>
                <tbody>
                  {totals.statutory.map((line) => (
                    <tr key={line.key}>
                      <td className="py-1">
                        {line.label}
                        {line.estimated ? <span className="text-[#6c6a64]"> (est.)</span> : null}
                      </td>
                      <td className="py-1 text-right tabular-nums">{money(line.amount)}</td>
                      <td className="py-1 text-right tabular-nums">{money(line.amount * totals.periodIndex)}</td>
                    </tr>
                  ))}
                  {otherDeductions
                    .filter((row) => row.amount > 0)
                    .map((row) => (
                      <tr key={row.id}>
                        <td className="py-1">{row.label || "Other"}</td>
                        <td className="py-1 text-right tabular-nums">{money(row.amount)}</td>
                        <td className="py-1 text-right tabular-nums">{money(row.amount * totals.periodIndex)}</td>
                      </tr>
                    ))}
                  <tr className="border-t border-[#d9d2c8] font-semibold">
                    <td className="py-1">Total deductions</td>
                    <td className="py-1 text-right tabular-nums">{money(totals.totalDeductions)}</td>
                    <td className="py-1 text-right tabular-nums">{money(totals.ytdDeductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-lg bg-[#f5f0e8] px-4 py-3">
              <p className="text-xs tracking-wide text-[#3d3d3a]">NET PAY</p>
              <p className="text-2xl font-semibold tabular-nums">{money(totals.netPay)}</p>
              <p className="text-xs text-[#3d3d3a]">YTD {money(totals.ytdNet)}</p>
            </div>
            <p className="mt-4 text-center text-[10px] text-[#6c6a64]">Sample / estimated payroll document — not an official payslip or tax record</p>
          </div>

          <p className="print:hidden mx-auto max-w-xl text-center text-xs text-[var(--muted-ink)]">
            This tool generates a sample stub for reference only. Consult your payroll provider or HR for official documentation.
          </p>
        </div>
      </div>

      <div className="print:hidden grid gap-4 sm:grid-cols-3">
        {[
          { icon: Shield, title: "Browser-only", desc: "No data sent to servers" },
          { icon: Download, title: "Print or PDF", desc: "Save a copy on your device" },
          { icon: Wand2, title: "Local payroll rules", desc: "Tax and contributions follow the country you pick" },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-4">
            <item.icon className="mb-2 h-5 w-5 text-coral" strokeWidth={1.75} />
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-[var(--muted-ink)]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <div className={cn("flex flex-wrap items-center gap-2", action ? "justify-between" : "")}>
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function AddLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-coral hover:text-[var(--coral-active)]" onClick={onClick}>
      <Plus className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  inputMode,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        aria-required={required}
        className="mt-1"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
