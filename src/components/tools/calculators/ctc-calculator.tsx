"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/utils";

const PT_OPTIONS = [
  { id: "maharashtra", label: "Maharashtra (₹200/month)", monthly: 200 },
  { id: "karnataka", label: "Karnataka (₹200/month)", monthly: 200 },
  { id: "west-bengal", label: "West Bengal (₹200/month)", monthly: 200 },
  { id: "tamil-nadu", label: "Tamil Nadu (₹212.5/month)", monthly: 212.5 },
  { id: "telangana", label: "Telangana (₹200/month)", monthly: 200 },
  { id: "none", label: "No Professional Tax", monthly: 0 },
  { id: "custom", label: "Custom amount", monthly: 0 },
] as const;

function newRegimeTaxFy24(taxable: number) {
  if (taxable <= 0 || taxable <= 700_000) return 0;
  let tax = 0;
  let prev = 0;
  const slabs: Array<[number, number]> = [
    [300_000, 0],
    [700_000, 0.05],
    [1_000_000, 0.1],
    [1_200_000, 0.15],
    [1_500_000, 0.2],
    [Infinity, 0.3],
  ];
  for (const [upTo, rate] of slabs) {
    if (taxable <= prev) break;
    const slice = Math.min(taxable, upTo) - prev;
    if (slice > 0) tax += slice * rate;
    prev = upTo;
  }
  return Math.max(0, tax);
}

export function CtcCalculator() {
  const [ctcRaw, setCtcRaw] = useState("1200000");
  const [pf, setPf] = useState<"yes" | "no">("yes");
  const [ptState, setPtState] = useState<(typeof PT_OPTIONS)[number]["id"]>("maharashtra");
  const [customPt, setCustomPt] = useState("200");

  const ctc = Number(String(ctcRaw).replace(/,/g, "")) || 0;
  const ptMonthly = ptState === "custom" ? Number(customPt) || 0 : (PT_OPTIONS.find((item) => item.id === ptState)?.monthly ?? 0);

  const result = useMemo(() => {
    if (ctc <= 0) return null;
    const basic = 0.5 * ctc;
    const pfEmployee = pf === "yes" ? 0.12 * basic : 0;
    const professionalTaxAnnual = 12 * ptMonthly;
    const incomeTax = newRegimeTaxFy24(Math.max(0, ctc - pfEmployee - professionalTaxAnnual - 75_000));
    const totalDeductions = pfEmployee + professionalTaxAnnual + incomeTax;
    const annualInHand = ctc - totalDeductions;
    return {
      basic,
      hra: 0.2 * ctc,
      specialAllowance: 0.3 * ctc,
      pfEmployee,
      professionalTaxAnnual,
      incomeTax,
      totalDeductions,
      annualInHand,
      monthlyInHand: annualInHand / 12,
    };
  }, [ctc, pf, ptMonthly]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="annual-ctc">Annual CTC (₹)</Label>
          <Input id="annual-ctc" value={ctcRaw} onChange={(event) => setCtcRaw(event.target.value)} className="mt-1" placeholder="12,00,000" />
        </div>
        <div>
          <Label htmlFor="pf-toggle">PF Contribution (12% of Basic)</Label>
          <select
            id="pf-toggle"
            value={pf}
            onChange={(event) => setPf(event.target.value as "yes" | "no")}
            className="mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <Label htmlFor="professional-tax">Professional Tax</Label>
          <select
            id="professional-tax"
            value={ptState}
            onChange={(event) => setPtState(event.target.value as (typeof PT_OPTIONS)[number]["id"])}
            className="mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm"
          >
            {PT_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        {ptState === "custom" ? (
          <div>
            <Label htmlFor="custom-tax">Custom Professional Tax (₹/month)</Label>
            <Input id="custom-tax" value={customPt} onChange={(event) => setCustomPt(event.target.value)} className="mt-1" placeholder="200" />
          </div>
        ) : null}
      </div>

      {result ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-primary/30 bg-surface-card p-5">
              <p className="text-sm text-[var(--muted-ink)]">Monthly In-Hand Salary</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{formatINR(result.monthlyInHand)}</p>
            </div>
            <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
              <p className="text-sm text-[var(--muted-ink)]">Annual In-Hand Salary</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{formatINR(result.annualInHand)}</p>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--hairline)] divide-y divide-[var(--hairline)]">
            <p className="px-4 py-3 text-sm font-semibold">Deductions Breakdown</p>
            {[
              ["PF Employee (12% of Basic)", result.pfEmployee],
              ["Professional Tax", result.professionalTaxAnnual],
              ["Income Tax (estimated, new regime)", result.incomeTax],
              ["Total Deductions", result.totalDeductions],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="text-[var(--muted-ink)]">{label}</span>
                <span className="tabular-nums font-medium">{formatINR(Number(value))}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--muted-ink)]">
            <p className="font-medium text-ink">Assumptions</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Basic salary = 50% of CTC</li>
              <li>HRA = 20% of CTC</li>
              <li>Special allowance = remaining 30%</li>
              <li>Standard deduction of ₹75,000 applied for tax estimate</li>
              <li>Income tax uses simplified new tax regime slabs</li>
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
