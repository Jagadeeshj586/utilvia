"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_PT_INPUT,
  PT_NON_LEVYING_STATES,
  PT_STATE_OPTIONS,
  calculateProfessionalTax,
  parsePtSalary,
  type PtGender,
} from "@/lib/professional-tax/calculate";
import { copyText } from "@/lib/security/clipboard";
import { cn, formatINR } from "@/lib/utils";

const selectClass =
  "mt-1 h-11 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

function money(value: number) {
  return formatINR(value, 0);
}

export function ProfessionalTaxCalculator() {
  const [stateKey, setStateKey] = useState(DEFAULT_PT_INPUT.stateKey);
  const [salary, setSalary] = useState(String(DEFAULT_PT_INPUT.monthlySalary));
  const [gender, setGender] = useState<PtGender>(DEFAULT_PT_INPUT.gender);
  const [copied, setCopied] = useState(false);

  const monthlySalary = parsePtSalary(salary);
  const result = useMemo(
    () => calculateProfessionalTax({ stateKey, monthlySalary, gender }),
    [stateKey, monthlySalary, gender],
  );

  const reset = () => {
    setStateKey(DEFAULT_PT_INPUT.stateKey);
    setSalary(String(DEFAULT_PT_INPUT.monthlySalary));
    setGender(DEFAULT_PT_INPUT.gender);
    setCopied(false);
  };

  const copyAnnual = async () => {
    if (!result || result.annualPT <= 0) return;
    const ok = await copyText(money(result.annualPT));
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(true);
    toast.success("Copied annual PT");
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted-ink)]">
        Calculate state-wise professional tax for all 18 PT-levying states. Maharashtra women’s exemption and February
        quirk included.
      </p>

      <div className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div>
          <Label htmlFor="pt-state">State</Label>
          <select
            id="pt-state"
            className={selectClass}
            value={stateKey}
            onChange={(event) => setStateKey(event.target.value)}
          >
            {PT_STATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="pt-salary">Monthly Gross Salary (₹)</Label>
          <Input
            id="pt-salary"
            inputMode="decimal"
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            placeholder="50,000"
            className="mt-1 min-h-11"
          />
        </div>

        {stateKey === "maharashtra" ? (
          <div>
            <Label>Gender</Label>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Gender for Maharashtra exemption">
              {(
                [
                  ["male", "Male"],
                  ["female", "Female"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={gender === value}
                  className={cn(
                    "min-h-10 rounded-lg border px-4 text-sm font-medium transition-colors",
                    gender === value
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => setGender(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <Button type="button" variant="outline" className="min-h-10" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {result ? (
        <div className="space-y-4">
          {result.noPtState ? (
            <p className="rounded-xl border border-teal/30 bg-teal/10 px-4 py-3 text-sm text-ink">
              Your state does not levy Professional Tax — no PT deduction applies. States without PT include{" "}
              {PT_NON_LEVYING_STATES.join(", ")}.
            </p>
          ) : null}

          {result.exempt && !result.noPtState ? (
            <p className="rounded-xl border border-teal/30 bg-teal/10 px-4 py-3 text-sm text-ink">
              Exempt. {result.exemptReason}
            </p>
          ) : null}

          {!result.noPtState && !result.exempt ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Monthly PT" value={money(result.monthlyPT)} highlight />
              {result.februaryPT !== null ? <Stat label="February PT" value={money(result.februaryPT)} /> : null}
              <Stat label="Annual PT" value={money(result.annualPT)} />
              <Stat label="Income Tax Saving (16(iii))" value={money(result.incomeTaxSaving)} />
            </div>
          ) : null}

          {result.februaryNote ? (
            <p className="rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-ink">
              February PT is ₹300 (not ₹200) — this is the Maharashtra annual total adjustment to reach ₹2,500.
            </p>
          ) : null}

          {result.halfYearlyNote ? (
            <p className="text-sm text-[var(--muted-ink)]">{result.halfYearlyNote}</p>
          ) : null}

          {result.stateNotes && !result.exempt ? (
            <p className="text-sm text-[var(--muted-ink)]">{result.stateNotes}</p>
          ) : null}

          {result.annualPT > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs text-[var(--muted-ink)]">
                Section 16(iii) saving estimated at 31.2% (30% bracket + 4% cess).
              </p>
              <Button type="button" size="sm" variant="outline" onClick={() => void copyAnnual()}>
                {copied ? <Check className="h-3.5 w-3.5 text-teal" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy annual PT"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="text-xs text-[var(--muted-ink)]">
        Professional tax rates are set by state governments and may change. PT is deducted by your employer based on
        their registered office state. Verify with your HR or state commercial tax department.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "18 states", body: "All PT-levying state slabs" },
          { title: "Section 16(iii)", body: "Income tax saving estimate" },
          { title: "Maharashtra", body: "Women exempt + Feb ₹300 quirk" },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3">
            <p className="text-sm font-medium text-ink">{item.title}</p>
            <p className="mt-0.5 text-sm text-[var(--muted-ink)]">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        highlight ? "border-coral/30 bg-coral/10" : "border-[var(--hairline)] bg-surface-card",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted-ink)]">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
