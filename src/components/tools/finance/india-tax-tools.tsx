"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  calculateIndiaTax,
  type TaxAgeGroup,
  type TaxFy,
  type TaxRegime,
} from "@/lib/calculators/india-tax";
import { formatINR, formatNum } from "@/lib/utils";

const selectClass = "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--muted-ink)]">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export function IncomeTaxCalculator() {
  const [income, setIncome] = useState(1_200_000);
  const [age, setAge] = useState<TaxAgeGroup>("below60");
  const [fy, setFy] = useState<TaxFy>("2025-26");
  const [regime, setRegime] = useState<TaxRegime>("new");
  const [hra, setHra] = useState(0);
  const [d80c, setD80c] = useState(0);
  const [d80d, setD80d] = useState(0);
  const [homeLoan, setHomeLoan] = useState(0);
  const [nps, setNps] = useState(0);

  const oldResult = useMemo(
    () =>
      calculateIndiaTax({
        ctc: income,
        regime: "old",
        age,
        fy,
        hraExemption: hra,
        deduction80c: d80c,
        deduction80d: d80d,
        homeLoanInterest: homeLoan,
        nps80ccd1b: nps,
        includeEpf: false,
      }),
    [age, d80c, d80d, fy, homeLoan, hra, income, nps],
  );
  const newResult = useMemo(
    () => calculateIndiaTax({ ctc: income, regime: "new", age, fy, includeEpf: false }),
    [age, fy, income],
  );
  const result = regime === "old" ? oldResult : newResult;
  const better = newResult.annualTax <= oldResult.annualTax ? "new" : "old";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="annual-income">Annual Income (₹)</Label>
          <Input id="annual-income" type="number" min={0} value={income} onChange={(e) => setIncome(Number(e.target.value) || 0)} className="mt-1" />
          <Slider className="mt-3" min={300000} max={10000000} step={25000} value={[income]} onValueChange={([v]) => setIncome(v)} />
        </div>
        <div>
          <Label htmlFor="age-group">Age Group</Label>
          <select id="age-group" value={age} onChange={(e) => setAge(e.target.value as TaxAgeGroup)} className={selectClass}>
            <option value="below60">Below 60</option>
            <option value="60-80">60 - 80</option>
            <option value="above80">Above 80</option>
          </select>
        </div>
        <div>
          <Label htmlFor="financial-year">Financial Year</Label>
          <select id="financial-year" value={fy} onChange={(e) => setFy(e.target.value as TaxFy)} className={selectClass}>
            <option value="2024-25">FY 2024-25</option>
            <option value="2025-26">FY 2025-26</option>
          </select>
        </div>
        <div>
          <Label>View Regime Details</Label>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setRegime("old")} className={`h-10 rounded-md border px-4 text-sm ${regime === "old" ? "border-primary bg-primary/10 font-medium" : "border-[var(--hairline)]"}`}>
              Old Regime
            </button>
            <button type="button" onClick={() => setRegime("new")} className={`h-10 rounded-md border px-4 text-sm ${regime === "new" ? "border-primary bg-primary/10 font-medium" : "border-[var(--hairline)]"}`}>
              New Regime
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--hairline)] p-4">
        <p className="mb-3 text-sm font-semibold">Old Regime Deductions</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="hra-exemption" label="HRA Exemption (₹)" value={hra} onChange={setHra} max={1000000} />
          <Field id="d80c" label="80C Investments (max ₹1,50,000)" value={d80c} onChange={setD80c} max={150000} />
          <Field id="d80d" label="80D Health Insurance" value={d80d} onChange={setD80d} max={100000} />
          <Field id="home-loan" label="Home Loan Interest 24(b) (max ₹2,00,000)" value={homeLoan} onChange={setHomeLoan} max={200000} />
          <Field id="nps" label="NPS 80CCD(1B) (max ₹50,000)" value={nps} onChange={setNps} max={50000} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-primary/30 bg-surface-card p-5">
          <p className="text-sm text-[var(--muted-ink)]">{regime === "new" ? "Tax under New Regime" : "Tax under Old Regime"}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{formatINR(result.annualTax)}</p>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">Take-home Income: {formatINR(result.takeHomeAnnual)}</p>
        </div>
        <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-3 text-sm">
          <p className="font-semibold">Recommendation</p>
          <p className="mt-2 text-[var(--muted-ink)]">
            {better === "new" ? "New regime" : "Old regime"} is lower by {formatINR(Math.abs(newResult.annualTax - oldResult.annualTax))} in this estimate.
          </p>
        </div>
      </div>

      <dl className="rounded-lg border border-[var(--hairline)] divide-y divide-[var(--hairline)] px-4 text-sm">
        <div className="py-2.5"><Row label="Gross Income" value={formatINR(income)} /></div>
        <div className="py-2.5"><Row label="Standard Deduction" value={formatINR(result.standardDeduction)} /></div>
        <div className="py-2.5"><Row label="Total Deductions" value={formatINR(result.extraDeductions)} /></div>
        <div className="py-2.5"><Row label="Taxable Income" value={formatINR(result.taxable)} /></div>
        <div className="py-2.5"><Row label="Tax Before Rebate" value={formatINR(result.taxBeforeRebate)} /></div>
        <div className="py-2.5"><Row label="Rebate u/s 87A" value={formatINR(result.rebate)} /></div>
        <div className="py-2.5"><Row label="Health & Education Cess (4%)" value={formatINR(result.cess)} /></div>
        <div className="py-2.5"><Row label="Total Tax" value={formatINR(result.annualTax)} /></div>
        <div className="py-2.5"><Row label="Take-home Income" value={formatINR(result.takeHomeAnnual)} /></div>
        <div className="py-2.5"><Row label="Effective rate" value={`${formatNum(result.effectiveRate, 1)}%`} /></div>
      </dl>
      <p className="text-xs text-[var(--muted-ink)]">Estimate only. Not tax advice.</p>
    </div>
  );
}

export function TaxRegimeComparison() {
  const [salary, setSalary] = useState(1_200_000);
  const [hraMonthly, setHraMonthly] = useState(0);
  const [rentMonthly, setRentMonthly] = useState(0);
  const [metro, setMetro] = useState(true);
  const [d80c, setD80c] = useState(150_000);
  const [d80d, setD80d] = useState(0);
  const [other, setOther] = useState(0);

  const basic = salary * 0.5;
  const hraExemption = Math.min(
    hraMonthly * 12,
    basic * (metro ? 0.5 : 0.4),
    Math.max(0, rentMonthly * 12 - basic * 0.1),
  );

  const oldResult = useMemo(
    () =>
      calculateIndiaTax({
        ctc: salary,
        regime: "old",
        deduction80c: d80c,
        deduction80d: d80d,
        hraExemption,
        homeLoanInterest: other,
        includeEpf: false,
      }),
    [d80c, d80d, hraExemption, other, salary],
  );
  const newResult = useMemo(
    () => calculateIndiaTax({ ctc: salary, regime: "new", includeEpf: false }),
    [salary],
  );
  const better = newResult.annualTax <= oldResult.annualTax ? "new" : "old";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="gross-salary" label="Annual Gross Salary (₹)" value={salary} onChange={setSalary} />
        <Field id="hra-received" label="HRA Received (₹/month)" value={hraMonthly} onChange={setHraMonthly} />
        <Field id="rent-paid" label="Rent Paid (₹/month)" value={rentMonthly} onChange={setRentMonthly} />
        <div>
          <Label htmlFor="city-type">City Type</Label>
          <select id="city-type" value={metro ? "metro" : "non"} onChange={(e) => setMetro(e.target.value === "metro")} className={selectClass}>
            <option value="metro">Metro</option>
            <option value="non">Non-Metro</option>
          </select>
        </div>
        <Field id="sec-80c" label="Section 80C (₹/year)" value={d80c} onChange={setD80c} max={150000} />
        <Field id="sec-80d" label="Section 80D (₹/year)" value={d80d} onChange={setD80d} max={100000} />
        <Field id="other-ded" label="Other Deductions (₹/year)" value={other} onChange={setOther} />
      </div>
      <p className="rounded-md border border-[var(--hairline)] bg-surface-soft px-3 py-2 text-sm">
        {better === "new" ? "New Regime" : "Old Regime"} is better by {formatINR(Math.abs(newResult.annualTax - oldResult.annualTax))} per year in this estimate.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <CompareCard title="Old Regime" result={oldResult} salary={salary} hraExemption={hraExemption} emphasize={better === "old"} />
        <CompareCard title="New Regime" result={newResult} salary={salary} hraExemption={0} emphasize={better === "new"} />
      </div>
      <p className="text-xs text-[var(--muted-ink)]">FY 2025-26 slabs, standard deduction, 87A rebate, and 4% cess. Not tax advice.</p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  max,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" min={0} max={max} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="mt-1" />
    </div>
  );
}

function CompareCard({
  title,
  result,
  salary,
  hraExemption,
  emphasize,
}: {
  title: string;
  result: ReturnType<typeof calculateIndiaTax>;
  salary: number;
  hraExemption: number;
  emphasize?: boolean;
}) {
  return (
    <div className={emphasize ? "rounded-lg border border-primary/30 bg-surface-card p-5" : "rounded-lg border border-[var(--hairline)] bg-surface-soft p-5"}>
      <p className="text-sm font-semibold">{title}</p>
      <dl className="mt-3 space-y-1.5 text-sm">
        <Row label="Gross Salary" value={formatINR(salary)} />
        <Row label="Standard Deduction" value={formatINR(result.standardDeduction)} />
        <Row label="HRA Exemption" value={formatINR(hraExemption)} />
        <Row label="Total Deductions" value={formatINR(result.extraDeductions)} />
        <Row label="Taxable Income" value={formatINR(result.taxable)} />
        <Row label="Tax (before cess)" value={formatINR(result.taxBeforeCess)} />
        <Row label="87A Rebate" value={formatINR(result.rebate)} />
        <Row label="Health + Ed Cess (4%)" value={formatINR(result.cess)} />
        <Row label="Total Tax" value={formatINR(result.annualTax)} />
        <Row label="Monthly Tax" value={formatINR(result.annualTax / 12)} />
      </dl>
    </div>
  );
}
