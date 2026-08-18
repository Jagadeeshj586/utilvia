"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatNum } from "@/lib/utils";

const PRESETS = [10, 15, 18, 20, 25];

export function TipCalculator() {
  const [bill, setBill] = useState("80");
  const [tip, setTip] = useState(18);
  const [people, setPeople] = useState("2");

  const billN = Number(bill) || 0;
  const peopleN = Math.max(1, Number(people) || 1);

  const result = useMemo(() => {
    const tipAmount = billN * (tip / 100);
    const total = billN + tipAmount;
    return { tipAmount, total, perPerson: total / peopleN, tipPerPerson: tipAmount / peopleN };
  }, [billN, peopleN, tip]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="bill-amount">Bill amount</Label>
          <Input id="bill-amount" value={bill} onChange={(e) => setBill(e.target.value)} className="mt-1" placeholder="80" />
        </div>
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <Label>Tip Percentage</Label>
            <span className="tabular-nums text-[var(--muted-ink)]">{tip}%</span>
          </div>
          <Slider min={0} max={40} step={1} value={[tip]} onValueChange={([v]) => setTip(v)} />
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTip(item)}
                className={`h-9 rounded-md border px-3 text-sm ${tip === item ? "border-primary bg-primary text-primary-foreground" : "border-[var(--hairline)]"}`}
              >
                {item}%
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-[var(--muted-ink)]">Standard US tip is 15–20%</p>
        </div>
        <div>
          <Label htmlFor="people-count">Number of People</Label>
          <Input id="people-count" type="number" min={1} value={people} onChange={(e) => setPeople(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Results</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Tip Amount" value={formatNum(result.tipAmount, 2)} />
          <Stat label="Total Bill" value={formatNum(result.total, 2)} highlight />
          <Stat label="Per Person" value={formatNum(result.perPerson, 2)} />
          <Stat label="Tip Per Person" value={formatNum(result.tipPerPerson, 2)} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-primary/30 bg-surface-card" : "border-[var(--hairline)] bg-surface-soft"}`}>
      <p className="text-sm text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
