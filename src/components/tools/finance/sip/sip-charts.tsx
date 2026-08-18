"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SipResult } from "@/lib/calculators/sip";
import { formatCompactINR, formatINR } from "@/lib/utils";

const INVESTED = "#cc785c";
const RETURNS = "#5db8a6";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[var(--hairline)] bg-canvas px-3 py-2 text-xs shadow-sm">
      {label != null ? <p className="mb-1 font-medium text-ink">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.name} className="text-[var(--body)]">
          <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: item.color }} />
          {item.name}: {formatINR(Math.round(Number(item.value ?? 0)))}
        </p>
      ))}
    </div>
  );
}

export function InvestmentBreakdownChart({ result }: { result: SipResult }) {
  const invested = Math.max(0, result.totalInvested);
  const returns = Math.max(0, result.estimatedReturns);
  const data = [
    { name: "Total invested", value: invested, color: INVESTED },
    { name: "Estimated returns", value: returns, color: RETURNS },
  ];

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-canvas p-5">
      <h3 className="text-sm font-medium text-ink">Investment growth</h3>
      <p className="mt-1 text-xs text-[var(--muted-ink)]">Invested amount compared with estimated returns.</p>
      <div className="relative mx-auto mt-2 h-64 w-full max-w-sm">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={68} outerRadius={96} paddingAngle={2} stroke="none">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-ink)]">Estimated value</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{formatCompactINR(result.futureValue)}</p>
        </div>
      </div>
      <ul className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-[var(--body)]">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: INVESTED }} aria-hidden />
          Invested · {formatINR(Math.round(invested))}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: RETURNS }} aria-hidden />
          Returns · {formatINR(Math.round(returns))}
        </li>
      </ul>
    </div>
  );
}

export function GrowthChart({ result }: { result: SipResult }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const tick = dark ? "#a09d96" : "#6c6a64";
  const grid = dark ? "#3a3833" : "#e6dfd8";
  const data = useMemo(
    () =>
      result.yearlyBreakdown.map((row) => ({
        year: `Y${row.year}`,
        "Estimated value": Math.round(row.totalValue),
        "Invested amount": Math.round(row.invested),
      })),
    [result.yearlyBreakdown],
  );

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-canvas p-5">
      <h3 className="text-sm font-medium text-ink">Growth over time</h3>
      <p className="mt-1 text-xs text-[var(--muted-ink)]">How invested amount and estimated value could compound year by year.</p>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: tick, fontSize: 12 }} />
            <YAxis tick={{ fill: tick, fontSize: 12 }} tickFormatter={(v) => formatCompactINR(Number(v))} width={56} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="Invested amount" stroke={INVESTED} fill={INVESTED} fillOpacity={0.18} strokeWidth={2} />
            <Area type="monotone" dataKey="Estimated value" stroke={RETURNS} fill={RETURNS} fillOpacity={0.22} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        Area chart of invested amount versus estimated SIP value for each year from 1 to {result.years}.
      </p>
    </div>
  );
}
