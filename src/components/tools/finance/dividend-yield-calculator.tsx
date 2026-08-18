"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DEFAULT_DIVIDEND_INPUT,
  DEFAULT_HOLDING,
  DIVIDEND_RULES,
  FREQUENCY_OPTIONS,
  calculateDividend,
  dividendCopyText,
  formatYield,
  hasDividendErrors,
  validateDividend,
  type DividendFrequency,
  type DividendHolding,
  type DividendInput,
  type DividendMode,
} from "@/lib/dividend-yield/calculate";
import { copyText } from "@/lib/security/clipboard";
import { cn, formatINR } from "@/lib/utils";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

type HoldingDraft = {
  name: string;
  dps: string;
  price: string;
  shares: string;
};

type Draft = {
  mode: DividendMode;
  dps: string;
  price: string;
  purchase: string;
  shares: string;
  frequency: DividendFrequency;
  holdings: HoldingDraft[];
};

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[₹\s,]/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function toHoldingDraft(holding: DividendHolding): HoldingDraft {
  return {
    name: holding.name,
    dps: String(holding.dps),
    price: String(holding.price),
    shares: String(holding.shares),
  };
}

function toDraft(input: DividendInput): Draft {
  return {
    mode: input.mode,
    dps: String(input.dps),
    price: String(input.price),
    purchase: String(input.purchase),
    shares: String(input.shares),
    frequency: input.frequency,
    holdings: input.holdings.map(toHoldingDraft),
  };
}

export function DividendYieldCalculator() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_DIVIDEND_INPUT));
  const [copied, setCopied] = useState(false);

  const input = useMemo<DividendInput>(
    () => ({
      mode: draft.mode,
      dps: parseAmount(draft.dps),
      price: parseAmount(draft.price),
      purchase: parseAmount(draft.purchase),
      shares: parseAmount(draft.shares),
      frequency: draft.frequency,
      holdings: draft.holdings.map((row, index) => ({
        name: row.name.trim() || `Stock ${index + 1}`,
        dps: parseAmount(row.dps),
        price: parseAmount(row.price),
        shares: parseAmount(row.shares),
      })),
    }),
    [draft],
  );
  const errors = useMemo(() => validateDividend(input), [input]);
  const result = useMemo(() => calculateDividend(input), [input]);
  const invalid = hasDividendErrors(errors);

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
    setCopied(false);
  };

  const patchHolding = (index: number, next: Partial<HoldingDraft>) => {
    setDraft((current) => ({
      ...current,
      holdings: current.holdings.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)),
    }));
    setCopied(false);
  };

  const addStock = () => {
    if (draft.holdings.length >= DIVIDEND_RULES.maxStocks) return;
    const nextIndex = draft.holdings.length + 1;
    patch({
      holdings: [
        ...draft.holdings,
        { name: `Stock ${nextIndex}`, dps: "", price: "", shares: "" },
      ],
    });
  };

  const removeStock = (index: number) => {
    if (draft.holdings.length <= 1) return;
    patch({ holdings: draft.holdings.filter((_, rowIndex) => rowIndex !== index) });
  };

  const copyResult = async () => {
    if (!result) return;
    const ok = await copyText(dividendCopyText(result));
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(true);
    toast.success("Copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const frequencyMeta = FREQUENCY_OPTIONS.find((item) => item.id === draft.frequency);

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--body)]">
        See current yield, yield on cost, annual income, TDS, and an FD comparison. Figures update as you type.
      </p>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Dividend yield mode">
        {(
          [
            { id: "single", label: "Single Stock" },
            { id: "portfolio", label: "Portfolio" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={draft.mode === item.id}
            className={cn(
              "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
              draft.mode === item.id
                ? "border-coral bg-coral text-white"
                : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
            )}
            onClick={() => patch({ mode: item.id })}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <form
          className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Configure</p>

          {draft.mode === "single" ? (
            <>
              <Field id="dy-dps" label="Annual Dividend Per Share (₹)" error={errors.dps}>
                <MoneyInput id="dy-dps" value={draft.dps} invalid={Boolean(errors.dps)} onChange={(value) => patch({ dps: value })} />
              </Field>
              <Field id="dy-price" label="Current Market Price (₹)" error={errors.price}>
                <MoneyInput id="dy-price" value={draft.price} invalid={Boolean(errors.price)} onChange={(value) => patch({ price: value })} />
              </Field>
              <Field id="dy-purchase" label="Your Purchase Price (₹)" hint="Used for yield on cost" error={errors.purchase}>
                <MoneyInput
                  id="dy-purchase"
                  value={draft.purchase}
                  invalid={Boolean(errors.purchase)}
                  onChange={(value) => patch({ purchase: value })}
                />
              </Field>
              <Field id="dy-shares" label="Number of Shares Held" error={errors.shares}>
                <Input
                  id="dy-shares"
                  inputMode="numeric"
                  value={draft.shares}
                  aria-invalid={Boolean(errors.shares)}
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === "" || /^\d*$/.test(raw)) patch({ shares: raw });
                  }}
                />
              </Field>
              <Field id="dy-frequency" label="Dividend Frequency">
                <select
                  id="dy-frequency"
                  className={selectClass}
                  value={draft.frequency}
                  onChange={(event) => patch({ frequency: event.target.value as DividendFrequency })}
                >
                  {FREQUENCY_OPTIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {result?.mode === "single" && frequencyMeta ? (
                  <p className="mt-2 text-xs text-[var(--muted-ink)]">
                    {frequencyMeta.payouts === 1
                      ? `Paid once a year · ${formatINR(result.perPayoutDps, 2)} per share`
                      : `Paid ${frequencyMeta.payouts} times a year · ${formatINR(result.perPayoutDps, 2)} per share per payout`}
                  </p>
                ) : null}
              </Field>
            </>
          ) : (
            <div className="space-y-4">
              {draft.holdings.map((holding, index) => (
                <div key={index} className="space-y-3 rounded-lg border border-[var(--hairline)] bg-canvas p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Stock {index + 1}</p>
                    {draft.holdings.length > 1 ? (
                      <button
                        type="button"
                        className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs text-[var(--muted-ink)] hover:text-ink"
                        onClick={() => removeStock(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field id={`dy-name-${index}`} label="Stock name">
                      <Input
                        id={`dy-name-${index}`}
                        value={holding.name}
                        onChange={(event) => patchHolding(index, { name: event.target.value })}
                      />
                    </Field>
                    <Field id={`dy-dps-${index}`} label="Annual DPS (₹)">
                      <MoneyInput
                        id={`dy-dps-${index}`}
                        value={holding.dps}
                        onChange={(value) => patchHolding(index, { dps: value })}
                      />
                    </Field>
                    <Field id={`dy-cmp-${index}`} label="CMP (₹)">
                      <MoneyInput
                        id={`dy-cmp-${index}`}
                        value={holding.price}
                        onChange={(value) => patchHolding(index, { price: value })}
                      />
                    </Field>
                    <Field id={`dy-shares-${index}`} label="Shares">
                      <Input
                        id={`dy-shares-${index}`}
                        inputMode="numeric"
                        value={holding.shares}
                        onChange={(event) => {
                          const raw = event.target.value;
                          if (raw === "" || /^\d*$/.test(raw)) patchHolding(index, { shares: raw });
                        }}
                      />
                    </Field>
                  </div>
                </div>
              ))}
              {errors.holdings ? <p className="text-xs text-[var(--error)]">{errors.holdings}</p> : null}
              {draft.holdings.length < DIVIDEND_RULES.maxStocks ? (
                <Button type="button" variant="outline" className="w-full" onClick={addStock}>
                  <Plus className="h-4 w-4" />
                  Add stock
                </Button>
              ) : (
                <p className="text-xs text-[var(--muted-ink)]">Up to {DIVIDEND_RULES.maxStocks} stocks.</p>
              )}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setDraft(toDraft({ ...DEFAULT_DIVIDEND_INPUT, mode: draft.mode, holdings: [{ ...DEFAULT_HOLDING }] }))}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </form>

        <div className="space-y-4">
          {invalid || !result ? (
            <p className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-8 text-center text-sm text-[var(--muted-ink)]">
              Enter dividend, price, and shares to see yield and income.
            </p>
          ) : result.mode === "single" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <StatCard label="Current Dividend Yield" value={formatYield(result.currentYield)} emphasize />
                <StatCard label="Yield on Cost" value={formatYield(result.yieldOnCost)} />
                <StatCard label="Annual Dividend Income" value={formatINR(result.annualIncome)} />
                <StatCard label="Monthly Income (approx)" value={formatINR(result.monthlyIncome)} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--body)]">
                  Yield on cost based on purchase price of {formatINR(input.purchase)}
                </p>
                <Button type="button" size="sm" variant="outline" onClick={() => void copyResult()}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy yield"}
                </Button>
              </div>
              {result.tds.applies ? (
                <p className="rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-[var(--body)]">
                  TDS applicable — Company will deduct {DIVIDEND_RULES.tdsRatePercent}% TDS (
                  {formatINR(result.tds.tds)}) as your dividend income exceeds {formatINR(DIVIDEND_RULES.tdsThreshold)}.
                  Net income: {formatINR(result.tds.net)}.
                </p>
              ) : (
                <p className="rounded-lg border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-[var(--body)]">
                  No TDS — Annual dividend income ≤ {formatINR(DIVIDEND_RULES.tdsThreshold)}. Full{" "}
                  {formatINR(result.annualIncome)} received.
                </p>
              )}
              <p className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm text-[var(--body)]">
                vs FD: A bank FD at {DIVIDEND_RULES.fdRatePercent}% on {formatINR(result.investment)} investment gives{" "}
                {formatINR(result.fdIncome)}/year. Your dividend yield is {result.fdHigher ? "higher" : "lower"} at{" "}
                {formatYield(result.currentYield)}.
              </p>
            </>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <StatCard label="Portfolio Yield (weighted)" value={formatYield(result.weightedYield)} emphasize />
                <StatCard label="Total Annual Income" value={formatINR(result.annualIncome)} />
                <StatCard label="Monthly Income (approx)" value={formatINR(result.monthlyIncome)} />
                <StatCard label="Net After TDS" value={formatINR(result.tds.net)} />
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => void copyResult()}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy yield"}
              </Button>
              {result.tds.applies ? (
                <p className="rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-[var(--body)]">
                  TDS of {formatINR(result.tds.tds)} applies on holdings above {formatINR(DIVIDEND_RULES.tdsThreshold)}{" "}
                  per company. Net income: {formatINR(result.tds.net)}.
                </p>
              ) : (
                <p className="rounded-lg border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-[var(--body)]">
                  No TDS — no holding exceeds {formatINR(DIVIDEND_RULES.tdsThreshold)} from a single company.
                </p>
              )}
              <div className="overflow-x-auto rounded-xl border border-[var(--hairline)] bg-surface-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stock</TableHead>
                      <TableHead>Yield</TableHead>
                      <TableHead>Income</TableHead>
                      <TableHead>Net</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.rows.map((row, index) => (
                      <TableRow key={`${row.name}-${index}`}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="tabular-nums">{formatYield(row.yieldPercent)}</TableCell>
                        <TableCell className="tabular-nums">{formatINR(row.income)}</TableCell>
                        <TableCell className="tabular-nums">{formatINR(row.tds.net)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <p className="text-sm text-[var(--body)]">
            Dividends are not guaranteed — unlike FD interest. They depend on company profits and board decisions. High
            dividend yield may sometimes signal a falling stock price.
          </p>
          <p className="text-xs text-[var(--muted-ink)]">
            Dividend income is taxable at your applicable slab rate. TDS @ {DIVIDEND_RULES.tdsRatePercent}% if annual
            dividend from a company exceeds {formatINR(DIVIDEND_RULES.tdsThreshold)}. NRIs are taxed at{" "}
            {DIVIDEND_RULES.nriTdsPercent}% TDS. This is not investment advice.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "Dual yield", desc: "Current yield + yield on cost" },
          { title: "Portfolio", desc: `Up to ${DIVIDEND_RULES.maxStocks} stocks` },
          { title: "TDS + FD", desc: `${formatINR(DIVIDEND_RULES.tdsThreshold)} threshold check` },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3">
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-[var(--muted-ink)]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MoneyInput({
  id,
  value,
  invalid,
  onChange,
}: {
  id: string;
  value: string;
  invalid?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
        ₹
      </span>
      <Input
        id={id}
        inputMode="decimal"
        value={value}
        aria-invalid={invalid}
        className="pl-7 tabular-nums"
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) onChange(raw);
        }}
      />
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="mt-0.5 text-xs text-[var(--muted-ink)]">{hint}</p> : null}
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1 text-xs text-[var(--error)]">{error}</p> : null}
    </div>
  );
}

function StatCard({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">{label}</p>
      <p className={cn("mt-1 font-display text-2xl font-semibold tabular-nums", emphasize ? "text-coral" : "text-ink")}>
        {value}
      </p>
    </div>
  );
}
