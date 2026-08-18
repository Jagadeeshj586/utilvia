"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DEFAULT_PPF_INTEREST_RATE,
  PPF_MAX_INVESTMENT,
  PPF_MAX_TENURE,
  PPF_MIN_INVESTMENT,
  PPF_MIN_TENURE,
  calculatePpf,
  formatPpfMaturityLakh,
  type PpfInvestmentFrequency,
} from "@/lib/ppf/calculate";
import { cn, formatINR } from "@/lib/utils";

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--hairline)] bg-surface-soft px-4 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={
          highlight
            ? "mt-1 font-display text-3xl font-semibold tabular-nums text-coral"
            : "mt-1 text-xl font-semibold tabular-nums text-ink"
        }
      >
        {value}
      </p>
    </div>
  );
}

const INFO_CARDS = [
  { title: "Year-by-year", desc: "Full balance table each year" },
  { title: "EEE status", desc: "Tax-free interest and maturity" },
  { title: "Govt backed", desc: "7.1% Q2 FY2026-27 rate" },
] as const;

export function PpfCalculator() {
  const [annualInvestment, setAnnualInvestment] = useState(150_000);
  const [frequency, setFrequency] = useState<PpfInvestmentFrequency>("yearly");
  const [interestRate, setInterestRate] = useState(String(DEFAULT_PPF_INTEREST_RATE));
  const [tenureYears, setTenureYears] = useState(15);

  const result = useMemo(() => {
    const rate = parseAmount(interestRate);
    if (!Number.isFinite(rate)) return null;
    return calculatePpf({
      annualInvestment,
      tenureYears,
      interestRatePercent: rate,
      frequency,
    });
  }, [annualInvestment, frequency, interestRate, tenureYears]);

  const copyMaturity = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(formatINR(result.maturityValue));
      toast.success("Maturity value copied");
    } catch {
      toast.error("Could not copy maturity value");
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-[var(--body)]">
          Based on Indian tax/labour law — PPF rules, FY 2026-27
        </div>
        <p className="text-sm text-[var(--body)]">
          PPF is Exempt-Exempt-Exempt (EEE): 80C deductible, interest tax-free, maturity tax-free (80C under old
          regime).
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="ppf-investment">
              Annual Investment (₹{PPF_MIN_INVESTMENT.toLocaleString("en-IN")} – ₹
              {PPF_MAX_INVESTMENT.toLocaleString("en-IN")})
            </Label>
            <span className="text-sm tabular-nums text-muted-foreground">{annualInvestment.toLocaleString("en-IN")}</span>
          </div>
          <Slider
            id="ppf-investment"
            min={PPF_MIN_INVESTMENT}
            max={PPF_MAX_INVESTMENT}
            step={500}
            value={[annualInvestment]}
            onValueChange={([value]) => setAnnualInvestment(value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ppf-frequency">Investment Frequency</Label>
          <div id="ppf-frequency" className="flex flex-wrap gap-2" role="group" aria-label="Investment frequency">
            {(
              [
                { value: "yearly", label: "Yearly" },
                { value: "monthly", label: "Monthly (same total/year)" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "h-9 rounded-md border px-3 text-sm transition-colors",
                  frequency === option.value
                    ? "border-coral bg-coral text-white"
                    : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                )}
                aria-pressed={frequency === option.value}
                onClick={() => setFrequency(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="ppf-rate">Interest Rate (% p.a.)</Label>
          <Input
            id="ppf-rate"
            inputMode="decimal"
            value={interestRate}
            onChange={(event) => setInterestRate(event.target.value)}
            placeholder="7.1"
            className="mt-1 max-w-xs"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="ppf-tenure">Tenure — {tenureYears} years</Label>
          </div>
          <input
            id="ppf-tenure"
            type="range"
            min={PPF_MIN_TENURE}
            max={PPF_MAX_TENURE}
            value={tenureYears}
            onChange={(event) => setTenureYears(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-coral"
          />
        </div>
      </section>

      {result ? (
        <section className="space-y-5" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total Invested" value={formatINR(result.totalInvested)} />
            <Stat label="Interest Earned" value={formatINR(result.totalInterest)} />
            <Stat label="Maturity Value" value={formatINR(result.maturityValue)} highlight />
            <Stat label="≈ Tax saved (30% slab)" value={formatINR(result.estimatedTaxSaved)} />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Maturity: {formatPpfMaturityLakh(result.maturityValue)}
            <Button type="button" variant="ghost" size="sm" className="ml-2 h-8 gap-1 px-2" onClick={copyMaturity}>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Copy
            </Button>
          </p>

          <div className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-surface-card">
            <div className="max-h-80 overflow-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="sticky top-0 bg-surface-soft text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Year</th>
                    <th className="px-4 py-2 font-medium">Investment</th>
                    <th className="px-4 py-2 font-medium">Interest</th>
                    <th className="px-4 py-2 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearRows.map((row) => (
                    <tr key={row.year} className="border-t border-[var(--hairline)]">
                      <td className="px-4 py-2 tabular-nums text-[var(--body)]">{row.year}</td>
                      <td className="px-4 py-2 tabular-nums text-[var(--body)]">{formatINR(row.investment)}</td>
                      <td className="px-4 py-2 tabular-nums text-[var(--body)]">{formatINR(row.interest)}</td>
                      <td className="px-4 py-2 tabular-nums font-medium text-ink">{formatINR(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2 text-sm text-[var(--body)]">
            <p>
              Partial withdrawal: From Year {result.partialWithdrawalEligibleFromYear} ({result.partialWithdrawalEligibleFy}
              ), withdraw up to 50% of balance at end of Year 4 — once per financial year.
            </p>
            <p>
              Loan against PPF: Between Year {result.loanEligibleFromYear} and Year {result.loanEligibleUntilYear} (
              {result.loanEligibleFromFy} to {result.loanEligibleUntilFy}), borrow up to 25% of balance at end of Year 2.
            </p>
            {result.extensionBlocks > 0 ? (
              <p>
                Tenure beyond 15 years uses {result.extensionBlocks} five-year extension block
                {result.extensionBlocks > 1 ? "s" : ""} after the initial lock-in.
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {INFO_CARDS.map((card) => (
              <div key={card.title} className="rounded-xl border border-[var(--hairline)] bg-surface-soft px-4 py-4">
                <p className="font-medium text-ink">{card.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p className="text-sm text-destructive" role="alert">
          Enter a valid annual investment, interest rate, and tenure to see results.
        </p>
      )}
    </div>
  );
}
