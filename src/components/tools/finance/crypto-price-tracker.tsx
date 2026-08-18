"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Search, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { toast } from "sonner";
import { ToolNotice } from "@/components/tools/tool-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CRYPTO_MARKET_API,
  DEFAULT_REFRESH_SECONDS,
  DEFAULT_SELECTED_ID,
  DEFAULT_VS,
  FEATURED_COIN_IDS,
  FIAT_CURRENCIES,
  REFRESH_INTERVALS,
  changeDirection,
  fetchMarkets,
  filterCoins,
  formatCompactFiat,
  formatCryptoPrice,
  formatPercentChange,
  formatUpdatedAt,
  marketLookupErrorMessage,
  sparklineToSeries,
  type CoinQuote,
  type MarketSnapshot,
} from "@/lib/crypto-markets";
import { cn } from "@/lib/utils";

const UP = "#5db8a6";
const DOWN = "#cc785c";
const FLAT = "#a09d96";

export function CryptoPriceTracker() {
  const [vs, setVs] = useState(DEFAULT_VS);
  const [query, setQuery] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(DEFAULT_REFRESH_SECONDS);
  const [selectedId, setSelectedId] = useState(DEFAULT_SELECTED_ID);
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (force: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    if (force) setError(null);
    try {
      const next = await fetchMarkets(vs, controller.signal, force);
      if (controller.signal.aborted) return;
      setSnapshot(next);
      setError(null);
    } catch (caught: unknown) {
      const message = marketLookupErrorMessage(caught);
      if (message && !controller.signal.aborted) {
        setError(message);
        if (force) toast.error(message);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [vs]);

  useEffect(() => {
    void load(false);
    return () => abortRef.current?.abort();
  }, [load]);

  useEffect(() => {
    const tick = () => {
      if (document.hidden) return;
      void load(false);
    };
    const id = window.setInterval(tick, intervalSeconds * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [load, intervalSeconds]);

  const rows = useMemo(() => filterCoins(snapshot?.coins ?? [], query), [snapshot, query]);
  const selected =
    snapshot?.coins.find((coin) => coin.id === selectedId) ??
    snapshot?.coins.find((coin) => coin.id === DEFAULT_SELECTED_ID) ??
    snapshot?.coins[0] ??
    null;
  const updated = formatUpdatedAt(snapshot?.fetchedAt ?? null);
  const showInitialLoading = loading && !snapshot;
  const chartSeries = useMemo(() => sparklineToSeries(selected?.sparkline ?? []), [selected]);
  const tone = changeDirection(selected?.change24h ?? null);
  const chartColor = tone === "up" ? UP : tone === "down" ? DOWN : FLAT;

  return (
    <div className="space-y-6">
      <ToolNotice>
        Near-real-time prices from {snapshot?.provider ?? "CoinGecko"} (top 50 by market cap). Quotes are cached for about{" "}
        {Math.round(CRYPTO_MARKET_API.cacheTtlMs / 1000)} seconds and are not a live exchange feed. Not financial advice.
      </ToolNotice>

      <div className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_auto]">
          <div>
            <Label htmlFor="crypto-search">Search coins</Label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-ink)]" />
              <Input
                id="crypto-search"
                value={query}
                placeholder="BTC, Ethereum, Solana…"
                className="min-h-10 pl-9"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Button
              type="button"
              className="min-h-10 min-w-28"
              disabled={loading}
              onClick={() => void load(true)}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin motion-reduce:animate-none")} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Quote currency</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {FIAT_CURRENCIES.map((fiat) => (
                <button
                  key={fiat.code}
                  type="button"
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    vs === fiat.code
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => setVs(fiat.code)}
                >
                  {fiat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Auto-refresh</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {REFRESH_INTERVALS.map((item) => (
                <button
                  key={item.seconds}
                  type="button"
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    intervalSeconds === item.seconds
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => setIntervalSeconds(item.seconds)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--muted-ink)]" aria-live="polite">
          {showInitialLoading
            ? "Fetching market data…"
            : error && !snapshot
              ? error
              : snapshot?.stale
                ? `Showing last snapshot · ${updated ?? "just now"}`
                : loading
                  ? `Updating… · ${updated ?? ""}`
                  : `Auto-refresh every ${intervalSeconds}s · Last updated ${updated ?? "just now"}`}
        </p>
      </div>

      {error && snapshot ? (
        <p className="text-sm text-destructive" role="alert">
          {error} Showing the last snapshot.
        </p>
      ) : null}

      {showInitialLoading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading market data">
          <div className="h-56 animate-pulse rounded-xl bg-surface-card" />
          <div className="h-64 animate-pulse rounded-xl bg-surface-card" />
        </div>
      ) : error && !snapshot ? (
        <div className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-card px-6 py-10 text-center">
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
          <Button type="button" variant="outline" className="mt-4 min-h-10" onClick={() => void load(true)}>
            Try again
          </Button>
        </div>
      ) : snapshot ? (
        <>
          {selected ? (
            <SelectedCoin
              coin={selected}
              vs={vs}
              series={chartSeries}
              chartColor={chartColor}
              imageBroken={brokenImages.has(selected.id)}
              onImageError={() => setBrokenImages((prev) => new Set(prev).add(selected.id))}
            />
          ) : null}

          <div>
            <p className="text-sm font-medium text-ink">Popular</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {FEATURED_COIN_IDS.map((id) => {
                const coin = snapshot.coins.find((item) => item.id === id);
                if (!coin) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    className={cn(
                      "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                      selected?.id === id
                        ? "border-coral bg-coral text-white"
                        : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                    )}
                    onClick={() => {
                      setSelectedId(id);
                      setQuery("");
                    }}
                  >
                    {coin.symbol}
                  </button>
                );
              })}
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-card px-6 py-10 text-center">
              <p className="text-sm text-[var(--muted-ink)]">No coins match “{query.trim()}”.</p>
              <Button type="button" variant="outline" className="mt-4 min-h-10" onClick={() => setQuery("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <>
              <ul className="grid gap-3 md:hidden">
                {rows.map((coin) => (
                  <li key={coin.id}>
                    <CoinCard
                      coin={coin}
                      vs={vs}
                      selected={selected?.id === coin.id}
                      imageBroken={brokenImages.has(coin.id)}
                      onSelect={() => setSelectedId(coin.id)}
                      onImageError={() => setBrokenImages((prev) => new Set(prev).add(coin.id))}
                    />
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-x-auto rounded-xl border border-[var(--hairline)] md:block">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <caption className="sr-only">Cryptocurrency prices in {vs.toUpperCase()}</caption>
                  <thead className="bg-canvas text-xs uppercase tracking-[0.08em] text-[var(--muted-ink)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium">Coin</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">24h</th>
                      <th className="px-4 py-3 font-medium">24h high / low</th>
                      <th className="px-4 py-3 font-medium">Market cap</th>
                      <th className="px-4 py-3 font-medium">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((coin) => {
                      const dir = changeDirection(coin.change24h);
                      const active = selected?.id === coin.id;
                      return (
                        <tr
                          key={coin.id}
                          tabIndex={0}
                          aria-pressed={active}
                          className={cn(
                            "cursor-pointer border-t border-[var(--hairline)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40",
                            active ? "bg-coral/10" : "bg-surface-card hover:bg-canvas",
                          )}
                          onClick={() => setSelectedId(coin.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedId(coin.id);
                            }
                          }}
                        >
                          <td className="px-4 py-3 tabular-nums text-[var(--muted-ink)]">{coin.rank ?? "—"}</td>
                          <td className="px-4 py-3">
                            <CoinIdentity
                              coin={coin}
                              imageBroken={brokenImages.has(coin.id)}
                              onImageError={() => setBrokenImages((prev) => new Set(prev).add(coin.id))}
                            />
                          </td>
                          <td className="px-4 py-3 font-medium tabular-nums text-ink">
                            {formatCryptoPrice(coin.price, vs)}
                          </td>
                          <td className="px-4 py-3">
                            <ChangeBadge value={coin.change24h} direction={dir} />
                          </td>
                          <td className="px-4 py-3 tabular-nums text-[var(--body)]">
                            {formatCryptoPrice(coin.high24h, vs)}
                            <span className="mx-1 text-[var(--muted-ink)]">/</span>
                            {formatCryptoPrice(coin.low24h, vs)}
                          </td>
                          <td className="px-4 py-3 tabular-nums">{formatCompactFiat(coin.marketCap, vs)}</td>
                          <td className="px-4 py-3 tabular-nums">{formatCompactFiat(coin.volume24h, vs)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}

function SelectedCoin({
  coin,
  vs,
  series,
  chartColor,
  imageBroken,
  onImageError,
}: {
  coin: CoinQuote;
  vs: string;
  series: Array<{ i: number; price: number }>;
  chartColor: string;
  imageBroken: boolean;
  onImageError: () => void;
}) {
  const dir = changeDirection(coin.change24h);
  return (
    <div className="grid gap-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div>
        <CoinIdentity coin={coin} imageBroken={imageBroken} onImageError={onImageError} large />
        <p className="mt-4 font-display text-[32px] leading-none tracking-[-0.03em] text-ink sm:text-[36px]">
          {formatCryptoPrice(coin.price, vs)}
        </p>
        <div className="mt-2">
          <ChangeBadge value={coin.change24h} direction={dir} />
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Rank" value={coin.rank != null ? `#${coin.rank}` : "—"} />
          <Stat label="24h change" value={formatPercentChange(coin.change24h)} />
          <Stat label="24h high" value={formatCryptoPrice(coin.high24h, vs)} />
          <Stat label="24h low" value={formatCryptoPrice(coin.low24h, vs)} />
          <Stat label="Market cap" value={formatCompactFiat(coin.marketCap, vs)} />
          <Stat label="24h volume" value={formatCompactFiat(coin.volume24h, vs)} />
        </dl>
      </div>
      <div className="min-h-[220px] rounded-lg border border-[var(--hairline)] bg-canvas p-3 sm:p-4">
        <p className="text-sm font-medium text-ink">7-day price</p>
        <p className="mt-1 text-xs text-[var(--muted-ink)]">Hourly sparkline from CoinGecko · near-real-time</p>
        {series.length > 1 ? (
          <div className="mt-2 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <YAxis
                  domain={["dataMin", "dataMax"]}
                  width={64}
                  tick={{ fill: "#6c6a64", fontSize: 11 }}
                  tickFormatter={(value) => formatCompactFiat(Number(value), vs)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-md border border-[var(--hairline)] bg-canvas px-3 py-2 text-xs shadow-sm">
                        {formatCryptoPrice(Number(payload[0]?.value), vs)}
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  fill={chartColor}
                  fillOpacity={0.18}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="sr-only">
              Seven-day sparkline for {coin.name}. Latest price {formatCryptoPrice(coin.price, vs)}, 24-hour change{" "}
              {formatPercentChange(coin.change24h)}.
            </p>
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-[var(--muted-ink)]">Chart is unavailable for this coin.</p>
        )}
      </div>
    </div>
  );
}

function CoinCard({
  coin,
  vs,
  selected,
  imageBroken,
  onSelect,
  onImageError,
}: {
  coin: CoinQuote;
  vs: string;
  selected: boolean;
  imageBroken: boolean;
  onSelect: () => void;
  onImageError: () => void;
}) {
  const dir = changeDirection(coin.change24h);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-colors",
        selected ? "border-coral bg-coral/10" : "border-[var(--hairline)] bg-surface-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <CoinIdentity coin={coin} imageBroken={imageBroken} onImageError={onImageError} />
        <ChangeBadge value={coin.change24h} direction={dir} />
      </div>
      <p className="mt-3 font-display text-2xl tracking-[-0.03em] text-ink">{formatCryptoPrice(coin.price, vs)}</p>
      <p className="mt-2 text-xs text-[var(--muted-ink)]">
        Rank {coin.rank ?? "—"} · Cap {formatCompactFiat(coin.marketCap, vs)} · Vol {formatCompactFiat(coin.volume24h, vs)}
      </p>
    </button>
  );
}

function CoinIdentity({
  coin,
  imageBroken,
  onImageError,
  large = false,
}: {
  coin: CoinQuote;
  imageBroken: boolean;
  onImageError: () => void;
  large?: boolean;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {coin.image && !imageBroken ? (
        // CoinGecko CDN — regular img avoids a next.config remotePatterns change.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coin.image}
          alt=""
          width={large ? 36 : 28}
          height={large ? 36 : 28}
          className={cn("rounded-full bg-canvas", large ? "h-9 w-9" : "h-7 w-7")}
          onError={onImageError}
        />
      ) : (
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-canvas text-[10px] font-medium text-[var(--muted-ink)]",
            large ? "h-9 w-9" : "h-7 w-7",
          )}
          aria-hidden
        >
          {coin.symbol.slice(0, 3)}
        </span>
      )}
      <span className="min-w-0">
        <span className={cn("block truncate font-medium text-ink", large && "text-base")}>{coin.name}</span>
        <span className="block text-xs uppercase tracking-wide text-[var(--muted-ink)]">{coin.symbol}</span>
      </span>
    </span>
  );
}

function ChangeBadge({ value, direction }: { value: number | null; direction: "up" | "down" | "flat" }) {
  const Icon = direction === "down" ? TrendingDown : TrendingUp;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium tabular-nums",
        direction === "up" && "bg-teal/15 text-teal",
        direction === "down" && "bg-coral/15 text-coral",
        direction === "flat" && "bg-canvas text-[var(--muted-ink)]",
      )}
    >
      {direction !== "flat" ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
      {formatPercentChange(value)}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-canvas px-3 py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted-ink)]">{label}</dt>
      <dd className="mt-1 tabular-nums text-ink">{value}</dd>
    </div>
  );
}
