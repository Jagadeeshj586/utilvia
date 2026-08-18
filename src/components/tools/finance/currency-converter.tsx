"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Check, ChevronsUpDown, Copy, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ToolNotice } from "@/components/tools/tool-notice";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DEFAULT_AMOUNT,
  DEFAULT_FROM,
  DEFAULT_TO,
  POPULAR_PAIRS,
  convertAmount,
  fetchRates,
  filterCurrencies,
  formatMoney,
  formatRate,
  formatUpdatedAt,
  getCurrency,
  inverseRate,
  lookupRate,
  parseAmount,
  rateLookupErrorMessage,
  resultCopyText,
  validateAmount,
  type RateQuote,
} from "@/lib/currency/convert";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

export function CurrencyConverter() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [to, setTo] = useState(DEFAULT_TO);
  const [quote, setQuote] = useState<RateQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetchRates(from, controller.signal)
      .then((next) => {
        setQuote(next);
        setError(null);
      })
      .catch((caught: unknown) => {
        const message = rateLookupErrorMessage(caught);
        if (message) {
          setQuote(null);
          setError(message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [from]);

  const amountError = validateAmount(amount);
  const parsed = parseAmount(amount);
  const quoteReady = Boolean(quote && quote.base === from);
  const rate = lookupRate(quote?.rates ?? null, from, to, quote?.base);
  const converted = rate != null && Number.isFinite(parsed) && parsed >= 0 ? convertAmount(parsed, rate) : NaN;
  const inverse = rate != null ? inverseRate(rate) : NaN;
  const missingPair = quoteReady && rate == null && from !== to;
  const updated = formatUpdatedAt(quoteReady ? quote?.updatedAt ?? null : null);
  const available = useMemo(
    () => (quoteReady && quote ? new Set(Object.keys(quote.rates)) : undefined),
    [quote, quoteReady],
  );
  const canCopy = Number.isFinite(converted) && !amountError && !missingPair && (quoteReady || from === to);
  const showLoading = (loading && !quoteReady && from !== to) || (loading && !quote);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const reset = () => {
    setAmount(DEFAULT_AMOUNT);
    setFrom(DEFAULT_FROM);
    setTo(DEFAULT_TO);
    setCopied(false);
  };

  const refresh = () => {
    setLoading(true);
    setError(null);
    void fetchRates(from, undefined, true)
      .then((next) => {
        setQuote(next);
        setError(null);
        toast.success("Rates updated");
      })
      .catch((caught: unknown) => {
        const message = rateLookupErrorMessage(caught);
        if (message) {
          setError(message);
          toast.error(message);
        }
      })
      .finally(() => setLoading(false));
  };

  const copy = async () => {
    if (!canCopy) return;
    const ok = await copyText(resultCopyText(parsed, from, converted, to));
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(true);
    toast.success("Copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-6">
      <ToolNotice>
        Mid-market rates from {quote?.provider ?? "ExchangeRate-API"} (Frankfurter as fallback). Amounts stay in your
        browser — only the from-currency code is requested. Rates are approximate and may differ from banks or card
        networks.
      </ToolNotice>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <form
          className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            void copy();
          }}
        >
          <div>
            <Label htmlFor="fx-amount">Amount</Label>
            <Input
              id="fx-amount"
              inputMode="decimal"
              value={amount}
              aria-invalid={Boolean(amountError)}
              aria-describedby={amountError ? "fx-amount-error" : "fx-amount-hint"}
              className="mt-1 min-h-10 font-mono text-lg"
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === "" || /^[\d,.\s]*$/.test(raw)) setAmount(raw);
              }}
            />
            {amountError ? (
              <p id="fx-amount-error" className="mt-1 text-xs text-destructive" role="alert">
                {amountError}
              </p>
            ) : (
              <p id="fx-amount-hint" className="mt-1 text-xs text-[var(--muted-ink)]">
                Enter the amount in the from currency.
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <CurrencySelect id="fx-from" label="From currency" value={from} available={available} onChange={setFrom} />
            <Button
              type="button"
              variant="outline"
              className="min-h-10 w-full sm:mb-0 sm:w-10 sm:px-0"
              aria-label="Swap currencies"
              onClick={swap}
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span className="sm:sr-only">Swap</span>
            </Button>
            <CurrencySelect id="fx-to" label="To currency" value={to} available={available} onChange={setTo} />
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Popular pairs</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {POPULAR_PAIRS.map((pair) => (
                <button
                  key={`${pair.from}-${pair.to}`}
                  type="button"
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    from === pair.from && to === pair.to
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => {
                    setFrom(pair.from);
                    setTo(pair.to);
                  }}
                >
                  {pair.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" className="min-h-10 min-w-28 px-6" disabled={!canCopy} onClick={() => void copy()}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button type="button" variant="outline" className="min-h-10" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button type="button" variant="outline" className="min-h-10" disabled={loading} onClick={refresh}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin motion-reduce:animate-none")} />
              Refresh rates
            </Button>
          </div>
        </form>

        <div
          className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          aria-live="polite"
          aria-busy={showLoading}
        >
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Converted amount</p>
          {showLoading ? (
            <p className="mt-4 text-sm text-[var(--muted-ink)]">Fetching exchange rates…</p>
          ) : error ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
              <Button type="button" variant="outline" className="min-h-10" onClick={refresh}>
                Try again
              </Button>
            </div>
          ) : missingPair ? (
            <p className="mt-4 text-sm text-destructive" role="alert">
              No mid-market rate is available for {to} from this provider. Pick another currency.
            </p>
          ) : amountError ? (
            <p className="mt-4 text-sm text-[var(--muted-ink)]">Enter a valid amount to convert.</p>
          ) : (
            <>
              <p className="mt-2 font-display text-[32px] leading-none tracking-[-0.03em] text-ink sm:text-[36px]">
                {formatMoney(converted, to)}
              </p>
              <p className="mt-2 text-sm text-[var(--muted-ink)]">
                {formatMoney(parsed, from)} in {getCurrency(to)?.name ?? to}
              </p>
              <div className="mt-5 grid gap-3">
                <RateLine label="Exchange rate" value={`1 ${from} = ${formatRate(rate ?? NaN)} ${to}`} />
                <RateLine label="Inverse rate" value={`1 ${to} = ${formatRate(inverse)} ${from}`} />
                {updated ? <RateLine label="Rates last updated" value={updated} /> : null}
                {quote?.provider ? <RateLine label="Source" value={quote.provider} /> : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RateLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-canvas px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 text-sm tabular-nums text-ink">{value}</p>
    </div>
  );
}

function CurrencySelect({
  id,
  label,
  value,
  onChange,
  available,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  available?: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = getCurrency(value);
  const options = useMemo(() => filterCurrencies(query, available), [query, available]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            className="h-10 w-full justify-between px-3 font-normal"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden className="text-base leading-none">
                {selected?.flag ?? "💱"}
              </span>
              <span className="truncate font-medium text-ink">{selected?.code ?? value}</span>
              <span className="truncate text-[var(--muted-ink)]">{selected?.name}</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-[var(--muted-ink)]" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-72 p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search USD, rupee, Japan…"
              value={query}
              onValueChange={setQuery}
              aria-label={`Search ${label}`}
            />
            <CommandList className="max-h-72">
              <CommandEmpty>No currencies match that search.</CommandEmpty>
              <CommandGroup>
                {options.map((item) => (
                  <CommandItem
                    key={item.code}
                    value={item.code}
                    className="gap-2 py-2"
                    onSelect={() => {
                      onChange(item.code);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span aria-hidden className="text-base leading-none">
                      {item.flag}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-medium text-ink">{item.code}</span>
                      <span className="ml-2 text-[var(--muted-ink)]">{item.name}</span>
                    </span>
                    {item.code === value ? <Check className="h-4 w-4 text-coral" aria-hidden /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
