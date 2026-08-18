"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  INFLATION_DEFAULT_RATES,
  INFLATION_DEFAULTS,
  calculateInflation,
  type InflationCurrency,
  type InflationMode,
} from "@/lib/inflation/calculate";
import { cn, formatINR, formatUSD } from "@/lib/utils";

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function formatMoney(value: number, currency: InflationCurrency) {
  return currency === "USD" ? formatUSD(value, 0) : formatINR(value, 0);
}

export function InflationCalculator() {
  const [mode, setMode] = useState<InflationMode>(INFLATION_DEFAULTS.mode);
  const [currency, setCurrency] = useState<InflationCurrency>(INFLATION_DEFAULTS.currency);
  const [amount, setAmount] = useState(String(INFLATION_DEFAULTS.amount));
  const [years, setYears] = useState(String(INFLATION_DEFAULTS.years));
  const [rate, setRate] = useState(String(INFLATION_DEFAULTS.inflationRatePercent));

  useEffect(() => {
    setRate(String(INFLATION_DEFAULT_RATES[currency]));
  }, [currency]);

  const result = useMemo(() => {
    return calculateInflation({
      amount: parseAmount(amount),
      years: parseAmount(years),
      inflationRatePercent: parseAmount(rate),
    });
  }, [amount, rate, years]);

  const displayValue = result ? (mode === "future" ? result.futureValue : result.pastValue) : null;
  const retainedWidth = result ? Math.max(0, Math.min(100, 100 - result.purchasingPowerLoss)) : 100;
  const lostWidth = result ? Math.max(0, Math.min(100, result.purchasingPowerLoss)) : 0;
  const yearsLabel = Number.isFinite(parseAmount(years)) ? parseAmount(years) : 0;
  const symbol = currency === "USD" ? "$" : "₹";

  return (
    <div className="space-y-6">
      <section className="mx-auto max-w-xl space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Currency</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Currency">
            {(
              [
                { value: "INR", label: "INR (₹)" },
                { value: "USD", label: "USD ($)" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "h-9 rounded-md border px-3 text-sm transition-colors",
                  currency === option.value
                    ? "border-coral bg-coral text-white"
                    : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                )}
                aria-pressed={currency === option.value}
                onClick={() => setCurrency(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Mode</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Inflation calculation mode">
            {(
              [
                { value: "future", label: "Future Value" },
                { value: "past", label: "Past Value" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "h-9 rounded-md border px-3 text-sm transition-colors",
                  mode === option.value
                    ? "border-coral bg-coral text-white"
                    : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                )}
                aria-pressed={mode === option.value}
                onClick={() => setMode(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="inf-amount">Amount ({symbol})</Label>
          <Input
            id="inf-amount"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="100000"
            className="mt-1 min-h-11"
          />
        </div>

        <div>
          <Label htmlFor="inf-years">Number of Years</Label>
          <Input
            id="inf-years"
            inputMode="decimal"
            value={years}
            onChange={(event) => setYears(event.target.value)}
            placeholder="10"
            className="mt-1 min-h-11"
          />
        </div>

        <div>
          <Label htmlFor="inf-rate">Inflation Rate (% p.a.)</Label>
          <Input
            id="inf-rate"
            inputMode="decimal"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            placeholder={String(INFLATION_DEFAULT_RATES[currency])}
            className="mt-1 min-h-11"
          />
        </div>
      </section>

      {result && displayValue != null ? (
        <section className="mx-auto max-w-xl space-y-5" aria-live="polite">
          <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "future"
                ? "Future equivalent (same purchasing power)"
                : "Past equivalent (today's value)"}
            </p>
            <p className="mt-2 font-display text-4xl font-semibold tabular-nums text-coral">
              {formatMoney(displayValue, currency)}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Purchasing power loss: {result.purchasingPowerLoss}%
            </p>
          </div>

          <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-5">
            <p className="mb-3 text-sm font-medium text-ink">Value erosion over {yearsLabel} years</p>
            <div className="flex h-8 overflow-hidden rounded-lg" role="img" aria-label={`Lost ${result.purchasingPowerLoss}% to inflation`}>
              <div className="bg-coral" style={{ width: `${retainedWidth}%` }} title="Retained value" />
              <div className="bg-surface-soft" style={{ width: `${lostWidth}%` }} title="Lost to inflation" />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Retained purchasing power</span>
              <span>Lost to inflation ({result.purchasingPowerLoss}%)</span>
            </div>
          </div>
        </section>
      ) : (
        <p className="mx-auto max-w-xl text-center text-sm text-destructive" role="alert">
          Enter a valid amount, years, and inflation rate.
        </p>
      )}
    </div>
  );
}
