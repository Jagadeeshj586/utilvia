"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/utils";

export function HraCalculator() {
  const [basic, setBasic] = useState("40000");
  const [da, setDa] = useState("0");
  const [hra, setHra] = useState("20000");
  const [rent, setRent] = useState("25000");
  const [metro, setMetro] = useState(true);

  const basicN = Number(basic) || 0;
  const daN = Number(da) || 0;
  const hraN = Number(hra) || 0;
  const rentN = Number(rent) || 0;
  const base = basicN + daN;

  const result = useMemo(() => {
    const actualHra = hraN;
    const rentMinus10 = Math.max(0, rentN - base * 0.1);
    const pctOfBasic = base * (metro ? 0.5 : 0.4);
    const exempt = Math.min(actualHra, rentMinus10, pctOfBasic);
    const taxable = Math.max(0, actualHra - exempt);
    return { actualHra, rentMinus10, pctOfBasic, exempt, taxable };
  }, [base, hraN, metro, rentN]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="basic-salary">Basic Salary (monthly) (₹)</Label>
          <Input id="basic-salary" value={basic} onChange={(e) => setBasic(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="dearness">Dearness Allowance (monthly) (₹)</Label>
          <Input id="dearness" value={da} onChange={(e) => setDa(e.target.value)} className="mt-1" />
          <p className="mt-1 text-xs text-[var(--muted-ink)]">Enter 0 if not applicable</p>
        </div>
        <div>
          <Label htmlFor="hra-received">HRA Received (monthly) (₹)</Label>
          <Input id="hra-received" value={hra} onChange={(e) => setHra(e.target.value)} className="mt-1" />
          <p className="mt-1 text-xs text-[var(--muted-ink)]">Check your salary slip</p>
        </div>
        <div>
          <Label htmlFor="rent-paid">Rent Paid (monthly) (₹)</Label>
          <Input id="rent-paid" value={rent} onChange={(e) => setRent(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="city-type">City Type</Label>
          <select
            id="city-type"
            value={metro ? "metro" : "non"}
            onChange={(e) => setMetro(e.target.value === "metro")}
            className="mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm"
          >
            <option value="metro">Metro City</option>
            <option value="non">Non-Metro City</option>
          </select>
          <p className="mt-1 text-xs text-[var(--muted-ink)]">Metro: Mumbai, Delhi, Kolkata, Chennai</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="HRA Exempt / month" value={formatINR(result.exempt)} highlight />
        <Stat label="HRA Taxable / month" value={formatINR(result.taxable)} />
        <Stat label="Tax saved" value={formatINR(result.exempt)} />
      </div>
      <div className="rounded-lg border border-[var(--hairline)]">
        <p className="border-b border-[var(--hairline)] px-4 py-3 text-sm font-semibold">Breakdown</p>
        <div className="divide-y divide-[var(--hairline)] text-sm">
          <Row label="Actual HRA received" value={formatINR(result.actualHra)} />
          <Row label="Rent paid − 10% of Basic + DA" value={formatINR(result.rentMinus10)} />
          <Row label={`${metro ? "50%" : "40%"} of Basic + DA`} value={formatINR(result.pctOfBasic)} />
          <Row label="Exempt (minimum of above)" value={formatINR(result.exempt)} />
        </div>
      </div>
      <div className="rounded-lg border border-[var(--hairline)]">
        <p className="border-b border-[var(--hairline)] px-4 py-3 text-sm font-semibold">Annual Amounts</p>
        <div className="divide-y divide-[var(--hairline)] text-sm">
          <Row label="Annual Exempt HRA" value={formatINR(result.exempt * 12)} />
          <Row label="Annual Taxable HRA" value={formatINR(result.taxable * 12)} />
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 px-4 py-2.5">
      <span className="text-[var(--muted-ink)]">{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}
