"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateLta } from "@/lib/lta/calculate";
import { LTA_RULES } from "@/lib/lta/rules";
import { formatINR } from "@/lib/utils";

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

export function LtaCalculator() {
  const [ltaReceived, setLtaReceived] = useState("50000");
  const [travelExpense, setTravelExpense] = useState("40000");
  const [trips, setTrips] = useState("2");
  const [result, setResult] = useState<ReturnType<typeof calculateLta>>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    const lta = parseAmount(ltaReceived);
    const expense = parseAmount(travelExpense);
    const numberOfTrips = parseAmount(trips);

    if (!Number.isFinite(lta) || lta < 0) {
      setResult(null);
      setError("Enter a valid LTA received amount.");
      return;
    }

    if (!Number.isFinite(expense) || expense < 0) {
      setResult(null);
      setError("Enter a valid actual travel expense.");
      return;
    }

    if (!Number.isFinite(numberOfTrips) || numberOfTrips < 0) {
      setResult(null);
      setError("Enter a valid number of trips.");
      return;
    }

    const next = calculateLta({
      ltaReceived: lta,
      actualTravelExpense: expense,
      numberOfTrips,
    });

    if (!next) {
      setResult(null);
      setError("Unable to calculate with the current inputs.");
      return;
    }

    setError(null);
    setResult(next);
  };

  return (
    <div className="space-y-6">
      <section className="mx-auto max-w-xl space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-[var(--body)]">
          Based on {LTA_RULES.rulesLabel}
        </div>

        <div>
          <Label htmlFor="lta-received">LTA Received (annual ₹)</Label>
          <Input
            id="lta-received"
            inputMode="decimal"
            value={ltaReceived}
            onChange={(event) => setLtaReceived(event.target.value)}
            placeholder="50000"
            className="mt-1 min-h-11"
          />
        </div>

        <div>
          <Label htmlFor="lta-expense">Actual Travel Expense (₹)</Label>
          <Input
            id="lta-expense"
            inputMode="decimal"
            value={travelExpense}
            onChange={(event) => setTravelExpense(event.target.value)}
            placeholder="40000"
            className="mt-1 min-h-11"
          />
        </div>

        <div>
          <Label htmlFor="lta-trips">Number of Trips this block</Label>
          <Input
            id="lta-trips"
            inputMode="numeric"
            value={trips}
            onChange={(event) => setTrips(event.target.value)}
            placeholder="2"
            className="mt-1 min-h-11"
          />
        </div>

        <Button type="button" onClick={calculate} className="min-h-11 w-full px-6">
          Calculate
        </Button>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      {result ? (
        <section className="mx-auto grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2" aria-live="polite">
          <div className="rounded-xl border border-teal/30 bg-teal/10 p-5 text-center">
            <p className="text-sm text-muted-foreground">Exempt Amount</p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-teal">
              {formatINR(result.exemptAmount)}
            </p>
          </div>
          <div className="rounded-xl border border-coral/30 bg-coral/10 p-5 text-center">
            <p className="text-sm text-muted-foreground">Taxable Amount</p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-coral">
              {formatINR(result.taxableAmount)}
            </p>
          </div>
        </section>
      ) : null}

      {result?.tripsExceedBlockLimit ? (
        <p className="mx-auto max-w-xl text-center text-sm text-amber" role="status">
          Note: Max {LTA_RULES.maxJourneysPerBlock} journeys are allowed per {LTA_RULES.blockYears}-year block.
        </p>
      ) : null}

      <section className="mx-auto max-w-xl rounded-xl border border-[var(--hairline)] bg-surface-card p-5 text-sm text-[var(--body)]">
        <p className="font-medium text-ink">LTA Rules</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            Current block: {LTA_RULES.currentBlockLabel} (previous block {LTA_RULES.previousBlockLabel} ended{" "}
            {LTA_RULES.previousBlockEnded})
          </li>
          <li>
            Max {LTA_RULES.maxJourneysPerBlock} journeys per {LTA_RULES.blockYears}-year block
          </li>
          <li>Air, rail, or bus fare for self and family only (not hotel, food, or local transport)</li>
          <li>
            LTA exemption is available only under the Old Tax Regime — not the New Tax Regime (Section 115BAC).
          </li>
        </ul>
      </section>
    </div>
  );
}
