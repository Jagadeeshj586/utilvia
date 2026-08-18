"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Info, RotateCcw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { GrowthChart, InvestmentBreakdownChart } from "@/components/tools/finance/sip/sip-charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  SIP_DEFAULTS,
  SIP_DISCLAIMER,
  SIP_LIMITS,
  SIP_PRESETS,
  calculateSIP,
  clampSipInput,
  sipCopyText,
  sipSummaryText,
  validateSipInput,
  type SipInput,
} from "@/lib/calculators/sip";
import { cn, formatINR } from "@/lib/utils";

type Draft = {
  monthly: string;
  rate: string;
  years: string;
  stepUp: string;
};

function toDraft(input: SipInput): Draft {
  return {
    monthly: String(input.monthlyInvestment),
    rate: String(input.annualReturn),
    years: String(input.years),
    stepUp: String(input.stepUpPercent ?? SIP_DEFAULTS.stepUpPercent),
  };
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

export function SipCalculator() {
  const [monthly, setMonthly] = useState<number>(SIP_DEFAULTS.monthlyInvestment);
  const [rate, setRate] = useState<number>(SIP_DEFAULTS.annualReturn);
  const [years, setYears] = useState<number>(SIP_DEFAULTS.years);
  const [stepUpEnabled, setStepUpEnabled] = useState(false);
  const [stepUpPercent, setStepUpPercent] = useState<number>(SIP_DEFAULTS.stepUpPercent);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [presetId, setPresetId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(toDraft(SIP_DEFAULTS));

  const errors = useMemo(
    () => validateSipInput({ monthlyInvestment: monthly, annualReturn: rate, years, stepUpEnabled, stepUpPercent }),
    [monthly, rate, years, stepUpEnabled, stepUpPercent],
  );
  const result = useMemo(
    () => calculateSIP(clampSipInput({ monthlyInvestment: monthly, annualReturn: rate, years, stepUpEnabled, stepUpPercent })),
    [monthly, rate, years, stepUpEnabled, stepUpPercent],
  );

  const applyValues = (next: Partial<SipInput> & { preset?: string | null }) => {
    const monthlyInvestment = next.monthlyInvestment ?? monthly;
    const annualReturn = next.annualReturn ?? rate;
    const nextYears = next.years ?? years;
    const nextStepEnabled = next.stepUpEnabled ?? stepUpEnabled;
    const nextStep = next.stepUpPercent ?? stepUpPercent;
    setMonthly(monthlyInvestment);
    setRate(annualReturn);
    setYears(nextYears);
    setStepUpEnabled(nextStepEnabled);
    setStepUpPercent(nextStep);
    setDraft(
      toDraft({
        monthlyInvestment,
        annualReturn,
        years: nextYears,
        stepUpEnabled: nextStepEnabled,
        stepUpPercent: nextStep,
      }),
    );
    setPresetId(next.preset === undefined ? null : next.preset);
  };

  const reset = () => {
    applyValues({ ...SIP_DEFAULTS, preset: null });
    setAdvancedOpen(false);
    toast.success("Calculator reset.");
  };

  const copyResults = async () => {
    try {
      await navigator.clipboard.writeText(sipCopyText(result));
      toast.success("Results copied.");
    } catch {
      toast.error("Could not copy results. Try selecting the summary text instead.");
    }
  };

  const shareResults = async () => {
    const text = sipCopyText(result);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "SIP Calculator", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.success("Results copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Sharing is not available. Results were not sent.");
    }
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--body)]">Plan your investment journey with estimated SIP maturity, invested amount, and potential growth.</p>

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-ink)]">Example scenarios</span>
        {SIP_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            size="sm"
            variant={presetId === preset.id ? "default" : "outline"}
            onClick={() => {
              applyValues({
                monthlyInvestment: preset.monthlyInvestment,
                annualReturn: preset.annualReturn,
                years: preset.years,
                stepUpEnabled: false,
                preset: preset.id,
              });
              setAdvancedOpen(false);
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <p className="text-xs text-[var(--muted-ink)]">These are example scenarios for exploration, not investment recommendations.</p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6 rounded-lg border border-[var(--hairline)] bg-surface-soft p-5 sm:p-6">
          <Field
            id="sip-monthly"
            label="Monthly investment"
            hint="How much do you want to invest each month?"
            tooltip="Enter the amount you plan to invest every month. You can type a number or use the slider."
            valueLabel={formatINR(monthly)}
            error={errors.monthlyInvestment}
            suffix="₹"
          >
            <Input
              id="sip-monthly"
              inputMode="numeric"
              className="h-11"
              aria-invalid={Boolean(errors.monthlyInvestment)}
              aria-describedby={errors.monthlyInvestment ? "sip-monthly-error sip-monthly-hint" : "sip-monthly-hint"}
              value={draft.monthly}
              onChange={(event) => {
                const raw = event.target.value;
                setDraft((d) => ({ ...d, monthly: raw }));
                const parsed = parseAmount(raw);
                if (!Number.isFinite(parsed)) return;
                setMonthly(parsed);
                setPresetId(null);
              }}
              onBlur={() => {
                const parsed = parseAmount(draft.monthly);
                const next = Number.isFinite(parsed)
                  ? Math.min(SIP_LIMITS.monthlyInvestment.max, Math.max(SIP_LIMITS.monthlyInvestment.min, Math.round(parsed)))
                  : SIP_DEFAULTS.monthlyInvestment;
                applyValues({ monthlyInvestment: next });
              }}
            />
            <Slider
              className="min-h-11"
              min={SIP_LIMITS.monthlyInvestment.min}
              max={SIP_LIMITS.monthlyInvestment.max}
              step={500}
              value={[Math.min(SIP_LIMITS.monthlyInvestment.max, Math.max(SIP_LIMITS.monthlyInvestment.min, monthly || SIP_LIMITS.monthlyInvestment.min))]}
              onValueChange={([value]) => applyValues({ monthlyInvestment: value })}
              aria-label="Monthly investment"
            />
          </Field>

          <Field
            id="sip-rate"
            label="Expected annual return"
            hint="Enter an assumed annual return"
            tooltip="Enter an assumed annual return to estimate your potential future value. Actual returns can vary."
            valueLabel={`${Number.isFinite(rate) ? rate.toFixed(1).replace(/\.0$/, "") : "-"}%`}
            error={errors.annualReturn}
          >
            <Input
              id="sip-rate"
              inputMode="decimal"
              className="h-11"
              aria-invalid={Boolean(errors.annualReturn)}
              aria-describedby={errors.annualReturn ? "sip-rate-error sip-rate-hint" : "sip-rate-hint"}
              value={draft.rate}
              onChange={(event) => {
                const raw = event.target.value;
                setDraft((d) => ({ ...d, rate: raw }));
                const parsed = Number(raw);
                if (!Number.isFinite(parsed)) return;
                setRate(parsed);
                setPresetId(null);
              }}
              onBlur={() => {
                const parsed = Number(draft.rate);
                const next = Number.isFinite(parsed)
                  ? Math.min(SIP_LIMITS.annualReturn.max, Math.max(SIP_LIMITS.annualReturn.min, Math.round(parsed * 10) / 10))
                  : SIP_DEFAULTS.annualReturn;
                applyValues({ annualReturn: next });
              }}
            />
            <Slider
              className="min-h-11"
              min={SIP_LIMITS.annualReturn.min}
              max={SIP_LIMITS.annualReturn.max}
              step={0.1}
              value={[Math.min(SIP_LIMITS.annualReturn.max, Math.max(SIP_LIMITS.annualReturn.min, rate))]}
              onValueChange={([value]) => applyValues({ annualReturn: Math.round(value * 10) / 10 })}
              aria-label="Expected annual return"
            />
          </Field>

          <Field
            id="sip-years"
            label="Investment duration"
            hint="How long do you plan to invest?"
            tooltip="Longer investment periods allow more time for compounding, but actual outcomes depend on market performance."
            valueLabel={`${years} year${years === 1 ? "" : "s"}`}
            error={errors.years}
          >
            <Input
              id="sip-years"
              inputMode="numeric"
              className="h-11"
              aria-invalid={Boolean(errors.years)}
              aria-describedby={errors.years ? "sip-years-error sip-years-hint" : "sip-years-hint"}
              value={draft.years}
              onChange={(event) => {
                const raw = event.target.value;
                setDraft((d) => ({ ...d, years: raw }));
                const parsed = Number(raw);
                if (!Number.isFinite(parsed)) return;
                setYears(Math.round(parsed));
                setPresetId(null);
              }}
              onBlur={() => {
                const parsed = Number(draft.years);
                const next = Number.isFinite(parsed)
                  ? Math.min(SIP_LIMITS.years.max, Math.max(SIP_LIMITS.years.min, Math.round(parsed)))
                  : SIP_DEFAULTS.years;
                applyValues({ years: next });
              }}
            />
            <Slider
              className="min-h-11"
              min={SIP_LIMITS.years.min}
              max={SIP_LIMITS.years.max}
              step={1}
              value={[Math.min(SIP_LIMITS.years.max, Math.max(SIP_LIMITS.years.min, years || 1))]}
              onValueChange={([value]) => applyValues({ years: value })}
              aria-label="Investment duration in years"
            />
          </Field>

          <div className="rounded-md border border-[var(--hairline)] bg-canvas p-5">
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-between text-left text-sm font-medium"
              onClick={() => setAdvancedOpen((open) => !open)}
              aria-expanded={advancedOpen}
            >
              Advanced options
              <span className="text-xs font-normal text-[var(--muted-ink)]">{advancedOpen ? "Hide" : "Show"}</span>
            </button>
            {advancedOpen ? (
              <div className="mt-3 space-y-3 border-t border-[var(--hairline)] pt-3">
                <div className="flex min-h-11 items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="sip-stepup-toggle">Enable step-up SIP</Label>
                    <p className="mt-1 text-xs text-[var(--muted-ink)]">Increase your monthly SIP once a year.</p>
                  </div>
                  <Switch
                    id="sip-stepup-toggle"
                    checked={stepUpEnabled}
                    onCheckedChange={(checked) => {
                      applyValues({ stepUpEnabled: checked });
                      setAdvancedOpen(true);
                    }}
                  />
                </div>
                {stepUpEnabled ? (
                  <Field
                    id="sip-stepup"
                    label="Annual SIP increase"
                    hint="Example: 10% raises ₹10,000 to ₹11,000 next year."
                    valueLabel={`${stepUpPercent}%`}
                    error={errors.stepUpPercent}
                  >
                    <Input
                      id="sip-stepup"
                      inputMode="decimal"
                      className="h-11"
                      value={draft.stepUp}
                      onChange={(event) => {
                        const raw = event.target.value;
                        setDraft((d) => ({ ...d, stepUp: raw }));
                        const parsed = Number(raw);
                        if (!Number.isFinite(parsed)) return;
                        setStepUpPercent(parsed);
                        setPresetId(null);
                      }}
                      onBlur={() => {
                        const parsed = Number(draft.stepUp);
                        const next = Number.isFinite(parsed)
                          ? Math.min(SIP_LIMITS.stepUpPercent.max, Math.max(SIP_LIMITS.stepUpPercent.min, Math.round(parsed * 10) / 10))
                          : SIP_DEFAULTS.stepUpPercent;
                        applyValues({ stepUpPercent: next, stepUpEnabled: true });
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 15].map((value) => (
                        <Button key={value} type="button" size="sm" variant={stepUpPercent === value ? "default" : "outline"} onClick={() => applyValues({ stepUpPercent: value, stepUpEnabled: true })}>
                          {value}%
                        </Button>
                      ))}
                    </div>
                  </Field>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--hairline)] bg-canvas p-5" aria-live="polite">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted-ink)]">Estimated value</p>
            <p className="mt-2 font-display text-[40px] leading-none tracking-[-0.04em] text-ink sm:text-[48px]">
              {formatINR(Math.round(result.futureValue))}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-ink)]">Potential value at maturity · estimates only, not guaranteed</p>
            <p className="mt-3 text-sm text-[var(--accent-teal)]">
              Wealth gain {result.wealthGainPercent >= 0 ? "+" : ""}
              {result.wealthGainPercent.toFixed(1)}%
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Total invested" hint="Your total contributions" value={formatINR(Math.round(result.totalInvested))} />
            <Stat label="Estimated returns" hint="Potential growth" value={formatINR(Math.round(result.estimatedReturns))} />
          </div>
          <InvestmentBreakdownChart result={result} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void copyResults()}>
              <Copy className="h-4 w-4" />
              Copy results
            </Button>
            <Button type="button" variant="outline" onClick={() => void shareResults()}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button type="button" variant="outline" onClick={printReport}>
              <Download className="h-4 w-4" />
              Print report
            </Button>
          </div>
        </div>
      </div>

      <section className="space-y-3 rounded-lg border border-[var(--hairline)] bg-canvas p-5 sm:p-6">
        <h2 className="font-display text-[24px] tracking-[-0.3px]">Investment breakdown</h2>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-[var(--muted-ink)]">Invested amount</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{formatINR(Math.round(result.totalInvested))}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--muted-ink)]">Estimated returns</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{formatINR(Math.round(result.estimatedReturns))}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--muted-ink)]">Total value</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{formatINR(Math.round(result.futureValue))}</dd>
          </div>
        </dl>
      </section>

      <GrowthChart result={result} />

      <section className="space-y-3">
        <h2 className="font-display text-[24px] tracking-[-0.3px]">Year-by-year projection</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              {result.mode === "step-up" ? <TableHead>Monthly SIP</TableHead> : null}
              <TableHead>Invested</TableHead>
              <TableHead>Estimated returns</TableHead>
              <TableHead>Total value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.yearlyBreakdown.map((row) => (
              <TableRow key={row.year}>
                <TableCell>{row.year}</TableCell>
                {result.mode === "step-up" ? <TableCell className="tabular-nums">{formatINR(Math.round(row.monthlySip))}</TableCell> : null}
                <TableCell className="tabular-nums">{formatINR(Math.round(row.invested))}</TableCell>
                <TableCell className="tabular-nums">{formatINR(Math.round(row.estimatedReturns))}</TableCell>
                <TableCell className="tabular-nums font-medium">{formatINR(Math.round(row.totalValue))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <p className="text-sm leading-6 text-[var(--body)]">{sipSummaryText(result)}</p>
      <p className="text-xs leading-5 text-[var(--muted-ink)]">
        These calculations are illustrative and based on the assumed rate of return. Actual mutual fund returns may vary and are not guaranteed.
      </p>

      <section className="space-y-3">
        <h2 className="font-display text-[24px] tracking-[-0.3px]">How SIP is calculated</h2>
        <p className="text-sm leading-6 text-[var(--body)]">
          A SIP invests a fixed amount at regular intervals. This tool assumes monthly contributions and a constant annual return, converted to a monthly rate. Compounding is applied each month. If the assumed return is 0%, the estimated value equals the amount invested.
        </p>
        <pre className="overflow-x-auto rounded-md border border-[var(--hairline)] bg-surface-soft p-4 text-sm text-ink">
{`FV = P × [((1 + r)^n − 1) / r] × (1 + r)`}
        </pre>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--body)]">
          <li>P = monthly investment</li>
          <li>r = monthly rate of return (annual rate ÷ 12 ÷ 100)</li>
          <li>n = number of monthly investments (years × 12)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[24px] tracking-[-0.3px]">What is SIP?</h2>
        <p className="text-sm leading-6 text-[var(--body)]">
          A Systematic Investment Plan (SIP) allows you to invest a fixed amount at regular intervals, usually monthly, into a mutual fund. It can support regular, disciplined investing and long-term wealth creation potential through rupee-cost averaging and compounding over time. Outcomes are not guaranteed.
        </p>
      </section>

      <p role="note" className="rounded-md border border-[var(--hairline)] bg-surface-soft px-3 py-2 text-xs leading-5 text-[var(--muted-ink)]">
        {SIP_DISCLAIMER}
      </p>

      <section className="hidden print:block">
        <h2>SIP calculator report</h2>
        <pre>{sipCopyText(result)}</pre>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Invested</th>
              <th>Returns</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {result.yearlyBreakdown.map((row) => (
              <tr key={row.year}>
                <td>{row.year}</td>
                <td>{formatINR(Math.round(row.invested))}</td>
                <td>{formatINR(Math.round(row.estimatedReturns))}</td>
                <td>{formatINR(Math.round(row.totalValue))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{SIP_DISCLAIMER}</p>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  tooltip,
  valueLabel,
  error,
  suffix,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  tooltip?: string;
  valueLabel: string;
  error?: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Label htmlFor={id}>{label}</Label>
          {tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-ink)] hover:text-ink" aria-label={`About ${label}`}>
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <span className="text-sm tabular-nums text-[var(--muted-ink)]">
          {suffix ? <span className="sr-only">{suffix} </span> : null}
          {valueLabel}
        </span>
      </div>
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

function Stat({ label, hint, value }: { label: string; hint?: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-canvas p-5">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-ink)]">{label}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted-ink)]">{hint}</p> : null}
      <p className={cn("mt-2 text-xl font-semibold tabular-nums text-ink")}>{value}</p>
    </div>
  );
}
