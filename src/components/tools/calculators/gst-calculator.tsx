"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/utils";

const RATES = [0, 5, 12, 18, 28];

export function GstCalculator() {
  const [amount, setAmount] = useState("10000");
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState<"add" | "remove">("add");

  const value = Number(String(amount).replace(/,/g, "")) || 0;

  const result = useMemo(() => {
    if (mode === "remove") {
      const base = value / (1 + rate / 100);
      const gst = value - base;
      return { originalAmount: base, gstAmount: gst, totalAmount: value };
    }
    const gst = value * (rate / 100);
    return { originalAmount: value, gstAmount: gst, totalAmount: value + gst };
  }, [mode, rate, value]);

  const half = result.gstAmount / 2;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="gst-amount">Amount (₹)</Label>
          <Input id="gst-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" placeholder="10,000" />
        </div>
        <div>
          <Label>GST Rate</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {RATES.map((item) => (
              <Button key={item} type="button" variant={rate === item ? "default" : "outline"} onClick={() => setRate(item)}>
                {item}%
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Label>Calculation Type</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" variant={mode === "add" ? "default" : "outline"} onClick={() => setMode("add")}>
              Add GST
            </Button>
            <Button type="button" variant={mode === "remove" ? "default" : "outline"} onClick={() => setMode("remove")}>
              Remove GST
            </Button>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Original Amount" value={formatINR(result.originalAmount, 2)} />
        <Stat label="GST Amount" value={formatINR(result.gstAmount, 2)} highlight />
        <Stat label="Total Amount" value={formatINR(result.totalAmount, 2)} />
      </div>
      <div className="rounded-lg border border-[var(--hairline)] divide-y divide-[var(--hairline)]">
        <div className="flex justify-between px-4 py-2.5 text-sm">
          <span className="text-[var(--muted-ink)]">CGST ({rate / 2}%)</span>
          <span className="tabular-nums font-medium">{formatINR(half, 2)}</span>
        </div>
        <div className="flex justify-between px-4 py-2.5 text-sm">
          <span className="text-[var(--muted-ink)]">SGST ({rate / 2}%)</span>
          <span className="tabular-nums font-medium">{formatINR(half, 2)}</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-primary/30 bg-surface-card" : "border-[var(--hairline)] bg-surface-soft"}`}>
      <p className="text-sm text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
