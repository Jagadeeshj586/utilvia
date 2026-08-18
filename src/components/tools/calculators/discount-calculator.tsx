"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateDiscount, DISCOUNT_PRESETS, type DiscountMode } from "@/lib/calculators/discount";
import { cn, formatINR, formatUSD } from "@/lib/utils";

type Currency = "INR" | "USD";

export function DiscountCalculator() {
  const [mode, setMode] = useState<DiscountMode>("percent-off");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [original, setOriginal] = useState("1000");
  const [percent, setPercent] = useState("20");
  const [finalPrice, setFinalPrice] = useState("800");

  const result = useMemo(() => {
    if (mode === "percent-off") {
      return calculateDiscount({
        mode,
        originalPrice: Number(original),
        discountPercent: Number(percent),
      });
    }
    if (mode === "find-percent") {
      return calculateDiscount({
        mode,
        originalPrice: Number(original),
        finalPrice: Number(finalPrice),
      });
    }
    return calculateDiscount({
      mode,
      finalPrice: Number(finalPrice),
      discountPercent: Number(percent),
    });
  }, [finalPrice, mode, original, percent]);

  const formatMoney = (value: number) => (currency === "INR" ? formatINR(value, 2) : formatUSD(value, 2));
  const currencyLabel = currency === "INR" ? "₹" : "$";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label>Calculation Mode</Label>
        <div className="flex gap-2">
          {(["INR", "USD"] as const).map((value) => (
            <Button key={value} type="button" size="sm" variant={currency === value ? "default" : "outline"} onClick={() => setCurrency(value)}>
              {value}
            </Button>
          ))}
        </div>
      </div>

      <Tabs value={mode} onValueChange={(value) => setMode(value as DiscountMode)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-none bg-transparent p-0">
          <TabsTrigger value="percent-off">% Off</TabsTrigger>
          <TabsTrigger value="find-percent">Find %</TabsTrigger>
          <TabsTrigger value="find-original">Original Price</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2">
        {mode !== "find-original" ? (
          <div>
            <Label htmlFor="original-price">Original Price ({currencyLabel})</Label>
            <Input
              id="original-price"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="Enter original price"
              value={original}
              onChange={(event) => setOriginal(event.target.value)}
              className="mt-1 font-mono tabular-nums"
            />
          </div>
        ) : null}

        {mode !== "find-percent" ? (
          <div>
            <Label htmlFor="discount-percent">Discount Percentage (%)</Label>
            <Input
              id="discount-percent"
              type="number"
              min={0}
              max={100}
              step="any"
              inputMode="decimal"
              placeholder="Enter discount %"
              value={percent}
              onChange={(event) => setPercent(event.target.value)}
              className="mt-1 font-mono tabular-nums"
            />
          </div>
        ) : null}

        {mode !== "percent-off" ? (
          <div>
            <Label htmlFor="final-price">Final Price ({currencyLabel})</Label>
            <Input
              id="final-price"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="Enter final price"
              value={finalPrice}
              onChange={(event) => setFinalPrice(event.target.value)}
              className="mt-1 font-mono tabular-nums"
            />
          </div>
        ) : null}
      </div>

      {mode !== "find-percent" ? (
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setPercent(String(preset))}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                Number(percent) === preset
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[var(--hairline)] bg-surface-soft text-[var(--body)] hover:border-primary/40",
              )}
            >
              {preset}%
            </button>
          ))}
        </div>
      ) : null}

      {result.error ? (
        <p className="text-sm text-destructive" role="alert">
          {result.error}
        </p>
      ) : null}

      <section aria-live="polite">
        <h3 className="text-sm font-semibold text-ink">Results</h3>
        <div className="mt-3 space-y-3 rounded-lg border border-[var(--hairline)] bg-surface-soft p-4">
          <ResultRow label="Original Price" value={formatMoney(result.originalPrice)} />
          <ResultRow
            label="Discount"
            value={`${result.discountPercent.toFixed(1)}% = ${formatMoney(result.discountAmount)} saved`}
          />
          <ResultRow label="Final Price" value={formatMoney(result.finalPrice)} highlight />
        </div>
      </section>
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between", highlight && "border-t border-[var(--hairline)] pt-3")}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-base tabular-nums", highlight ? "text-xl font-semibold text-ink" : "text-ink")}>{value}</span>
    </div>
  );
}
