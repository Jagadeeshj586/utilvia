/**
 * Market-data source of truth for the Crypto Price Tracker.
 * Swap `primary.marketsUrl` (or add a fallback) when you change providers.
 * `{vs}` is replaced with the fiat code (usd, inr, …).
 */
export type MarketProviderId = "coingecko";

export type MarketProvider = {
  id: MarketProviderId;
  name: string;
  marketsUrl: string;
};

export const MARKET_PROVIDERS: Record<MarketProviderId, MarketProvider> = {
  coingecko: {
    id: "coingecko",
    name: "CoinGecko",
    marketsUrl:
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency={vs}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h",
  },
};

export const CRYPTO_MARKET_API = {
  primary: MARKET_PROVIDERS.coingecko,
  cacheTtlMs: 20_000,
  minClientIntervalMs: 12_000,
} as const;

export type CoinQuote = {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  rank: number | null;
  price: number | null;
  change24h: number | null;
  high24h: number | null;
  low24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
  sparkline: number[];
  lastUpdated: Date | null;
};

export type MarketSnapshot = {
  vs: string;
  provider: string;
  fetchedAt: Date;
  coins: CoinQuote[];
  stale?: boolean;
};

const memoryCache = new Map<string, { snapshot: MarketSnapshot; fetchedAt: number }>();

function asNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseMarketsResponse(json: unknown, vs: string, providerName: string): MarketSnapshot | null {
  if (!Array.isArray(json)) return null;
  const coins: CoinQuote[] = [];
  for (const row of json) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const id = asString(item.id);
    const symbol = asString(item.symbol);
    const name = asString(item.name);
    if (!id || !symbol || !name) continue;
    const sparkRaw = item.sparkline_in_7d;
    const sparkPrices =
      sparkRaw && typeof sparkRaw === "object" ? (sparkRaw as { price?: unknown }).price : undefined;
    const sparkline = Array.isArray(sparkPrices)
      ? sparkPrices.map((n) => Number(n)).filter((n) => Number.isFinite(n))
      : [];
    const updatedRaw = asString(item.last_updated);
    const lastUpdated = updatedRaw ? new Date(updatedRaw) : null;
    coins.push({
      id,
      symbol: symbol.toUpperCase(),
      name,
      image: asString(item.image),
      rank: asNumber(item.market_cap_rank),
      price: asNumber(item.current_price),
      change24h: asNumber(item.price_change_percentage_24h),
      high24h: asNumber(item.high_24h),
      low24h: asNumber(item.low_24h),
      marketCap: asNumber(item.market_cap),
      volume24h: asNumber(item.total_volume),
      sparkline,
      lastUpdated: lastUpdated && !Number.isNaN(lastUpdated.getTime()) ? lastUpdated : null,
    });
  }
  if (!coins.length) return null;
  return { vs: vs.toLowerCase(), provider: providerName, fetchedAt: new Date(), coins };
}

export function snapshotFromPayload(json: unknown): MarketSnapshot | null {
  if (!json || typeof json !== "object") return null;
  const data = json as Record<string, unknown>;
  if (!Array.isArray(data.coins) || typeof data.vs !== "string") return null;
  const coins: CoinQuote[] = [];
  for (const row of data.coins) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const id = asString(item.id);
    const symbol = asString(item.symbol);
    const name = asString(item.name);
    if (!id || !symbol || !name) continue;
    const sparkline = Array.isArray(item.sparkline)
      ? item.sparkline.map((n) => Number(n)).filter((n) => Number.isFinite(n))
      : [];
    const updatedRaw = asString(item.lastUpdated);
    const lastUpdated = updatedRaw ? new Date(updatedRaw) : null;
    coins.push({
      id,
      symbol: symbol.toUpperCase(),
      name,
      image: asString(item.image),
      rank: asNumber(item.rank),
      price: asNumber(item.price),
      change24h: asNumber(item.change24h),
      high24h: asNumber(item.high24h),
      low24h: asNumber(item.low24h),
      marketCap: asNumber(item.marketCap),
      volume24h: asNumber(item.volume24h),
      sparkline,
      lastUpdated: lastUpdated && !Number.isNaN(lastUpdated.getTime()) ? lastUpdated : null,
    });
  }
  if (!coins.length) return null;
  const fetchedAt = typeof data.fetchedAt === "string" ? new Date(data.fetchedAt) : new Date();
  return {
    vs: data.vs.toLowerCase(),
    provider: asString(data.provider) ?? "CoinGecko",
    fetchedAt: Number.isNaN(fetchedAt.getTime()) ? new Date() : fetchedAt,
    coins,
    stale: data.stale === true,
  };
}

export function serializeSnapshot(snapshot: MarketSnapshot) {
  return {
    vs: snapshot.vs,
    provider: snapshot.provider,
    fetchedAt: snapshot.fetchedAt.toISOString(),
    stale: snapshot.stale === true,
    coins: snapshot.coins.map((coin) => ({
      ...coin,
      lastUpdated: coin.lastUpdated?.toISOString() ?? null,
    })),
  };
}

export class MarketLookupError extends Error {
  status: number;
  retryAfterMs: number | null;

  constructor(message: string, status = 502, retryAfterMs: number | null = null) {
    super(message);
    this.name = "MarketLookupError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

function parseRetryAfter(header: string | null) {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(120_000, seconds * 1000);
  return null;
}

async function fetchProvider(provider: MarketProvider, vs: string, signal?: AbortSignal) {
  const url = provider.marketsUrl.replace("{vs}", encodeURIComponent(vs));
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
      "User-Agent": "Utilvia/1.0 (crypto-price-tracker)",
    },
    cache: "no-store",
  });
  if (response.status === 429) {
    throw new MarketLookupError(
      `${provider.name} rate-limited this request.`,
      429,
      parseRetryAfter(response.headers.get("retry-after")) ?? 30_000,
    );
  }
  if (!response.ok) throw new MarketLookupError(`${provider.name} returned ${response.status}`, response.status);
  const json: unknown = await response.json();
  const snapshot = parseMarketsResponse(json, vs, provider.name);
  if (!snapshot) throw new MarketLookupError(`${provider.name} did not return usable market data.`);
  return snapshot;
}

async function fetchMarketsFromProvider(vs: string, signal?: AbortSignal, force = false) {
  const key = vs.toLowerCase();
  const cached = memoryCache.get(key);
  if (!force && cached && Date.now() - cached.fetchedAt < CRYPTO_MARKET_API.cacheTtlMs) {
    return cached.snapshot;
  }
  try {
    const snapshot = await fetchProvider(CRYPTO_MARKET_API.primary, key, signal);
    memoryCache.set(key, { snapshot, fetchedAt: Date.now() });
    return snapshot;
  } catch (error) {
    if (cached) return { ...cached.snapshot, stale: true };
    throw error;
  }
}

async function fetchMarketsViaProxy(vs: string, signal?: AbortSignal, force = false) {
  const key = vs.toLowerCase();
  const cached = memoryCache.get(key);
  if (!force && cached && Date.now() - cached.fetchedAt < CRYPTO_MARKET_API.minClientIntervalMs) {
    return cached.snapshot;
  }
  const params = new URLSearchParams({ vs: key });
  if (force) params.set("refresh", "1");
  const response = await fetch(`/api/crypto-markets?${params}`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (response.status === 429) {
    const retryAfterMs = parseRetryAfter(response.headers.get("retry-after"));
    if (cached) return { ...cached.snapshot, stale: true };
    throw new MarketLookupError("Market data is rate-limited right now.", 429, retryAfterMs);
  }
  if (!response.ok) {
    if (cached) return { ...cached.snapshot, stale: true };
    throw new MarketLookupError(`Market lookup returned ${response.status}`, response.status);
  }
  const snapshot = snapshotFromPayload(await response.json());
  if (!snapshot) throw new MarketLookupError("Market lookup did not return usable data.");
  memoryCache.set(key, { snapshot, fetchedAt: Date.now() });
  return snapshot;
}

export async function fetchMarkets(vs: string, signal?: AbortSignal, force = false) {
  const code = vs.toLowerCase();
  if (typeof window !== "undefined") return fetchMarketsViaProxy(code, signal, force);
  return fetchMarketsFromProvider(code, signal, force);
}

export function clearMarketCache() {
  memoryCache.clear();
}

export function marketLookupErrorMessage(error: unknown) {
  if (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  ) {
    return null;
  }
  if (error instanceof MarketLookupError && error.status === 429) {
    return "CoinGecko is rate-limiting requests. Auto-refresh will wait, or try again in a minute.";
  }
  return "Could not load market data. Check your connection and try again.";
}
