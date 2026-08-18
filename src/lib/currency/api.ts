/**
 * Exchange-rate source of truth for the Currency Converter.
 * Swap `activeProvider` (or the URL template) when you change providers.
 * `{base}` is replaced with the ISO 4217 code.
 */
export type RateProviderId = "open-er-api" | "frankfurter";

export type RateProvider = {
  id: RateProviderId;
  name: string;
  latestUrl: string;
};

export const RATE_PROVIDERS: Record<RateProviderId, RateProvider> = {
  "open-er-api": {
    id: "open-er-api",
    name: "ExchangeRate-API",
    latestUrl: "https://open.er-api.com/v6/latest/{base}",
  },
  frankfurter: {
    id: "frankfurter",
    name: "Frankfurter",
    latestUrl: "https://api.frankfurter.dev/v1/latest?from={base}",
  },
};

/** Primary feed, then fallback if the first request fails. */
export const CURRENCY_RATE_API = {
  primary: RATE_PROVIDERS["open-er-api"],
  fallback: RATE_PROVIDERS.frankfurter,
  cacheTtlMs: 15 * 60 * 1000,
} as const;

export type RateQuote = {
  base: string;
  rates: Record<string, number>;
  updatedAt: Date | null;
  provider: string;
};

const memoryCache = new Map<string, { quote: RateQuote; fetchedAt: number }>();

export function parseRatesResponse(json: unknown, requestedBase: string, providerName: string): RateQuote | null {
  if (!json || typeof json !== "object") return null;
  const data = json as Record<string, unknown>;

  if (data.result === "error") return null;

  const ratesRaw = data.rates;
  if (!ratesRaw || typeof ratesRaw !== "object") return null;
  const rates: Record<string, number> = {};
  for (const [code, value] of Object.entries(ratesRaw as Record<string, unknown>)) {
    const rate = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(rate) && rate > 0) rates[code.toUpperCase()] = rate;
  }
  const base = String(data.base_code ?? data.base ?? requestedBase).toUpperCase();
  rates[base] = 1;

  let updatedAt: Date | null = null;
  if (typeof data.time_last_update_unix === "number") {
    updatedAt = new Date(data.time_last_update_unix * 1000);
  } else if (typeof data.time_last_update_utc === "string") {
    const parsed = new Date(data.time_last_update_utc);
    if (!Number.isNaN(parsed.getTime())) updatedAt = parsed;
  } else if (typeof data.date === "string") {
    const parsed = new Date(`${data.date}T00:00:00Z`);
    if (!Number.isNaN(parsed.getTime())) updatedAt = parsed;
  }

  if (!Object.keys(rates).length) return null;
  return { base, rates, updatedAt, provider: providerName };
}

export function quoteFromPayload(json: unknown): RateQuote | null {
  if (!json || typeof json !== "object") return null;
  const data = json as Record<string, unknown>;
  if (typeof data.base !== "string" || !data.rates || typeof data.rates !== "object") return null;
  const rates: Record<string, number> = {};
  for (const [code, value] of Object.entries(data.rates as Record<string, unknown>)) {
    const rate = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(rate) && rate > 0) rates[code.toUpperCase()] = rate;
  }
  const base = data.base.toUpperCase();
  if (!/^[A-Z]{3}$/.test(base) || !Object.keys(rates).length) return null;
  rates[base] = 1;
  let updatedAt: Date | null = null;
  if (typeof data.updatedAt === "string") {
    const parsed = new Date(data.updatedAt);
    if (!Number.isNaN(parsed.getTime())) updatedAt = parsed;
  }
  const provider = typeof data.provider === "string" && data.provider.trim() ? data.provider : "Exchange rates";
  return { base, rates, updatedAt, provider };
}

async function fetchProvider(provider: RateProvider, base: string, signal?: AbortSignal) {
  const url = provider.latestUrl.replace("{base}", encodeURIComponent(base));
  const response = await fetch(url, { signal, headers: { Accept: "application/json" }, redirect: "follow" });
  if (!response.ok) throw new Error(`${provider.name} returned ${response.status}`);
  const json: unknown = await response.json();
  const quote = parseRatesResponse(json, base, provider.name);
  if (!quote) throw new Error(`${provider.name} did not return usable rates.`);
  return quote;
}

async function fetchRatesFromProviders(code: string, signal?: AbortSignal, force = false): Promise<RateQuote> {
  const cached = memoryCache.get(code);
  if (!force && cached && Date.now() - cached.fetchedAt < CURRENCY_RATE_API.cacheTtlMs) {
    return cached.quote;
  }

  try {
    const quote = await fetchProvider(CURRENCY_RATE_API.primary, code, signal);
    memoryCache.set(code, { quote, fetchedAt: Date.now() });
    return quote;
  } catch (primaryError) {
    try {
      const quote = await fetchProvider(CURRENCY_RATE_API.fallback, code, signal);
      memoryCache.set(code, { quote, fetchedAt: Date.now() });
      return quote;
    } catch {
      throw primaryError instanceof Error ? primaryError : new Error("Could not fetch exchange rates.");
    }
  }
}

async function fetchRatesViaProxy(code: string, signal?: AbortSignal, force = false): Promise<RateQuote> {
  const cached = memoryCache.get(code);
  if (!force && cached && Date.now() - cached.fetchedAt < CURRENCY_RATE_API.cacheTtlMs) {
    return cached.quote;
  }
  const params = new URLSearchParams({ base: code });
  if (force) params.set("refresh", "1");
  const response = await fetch(`/api/currency-rates?${params}`, {
    signal,
    headers: { Accept: "application/json" },
    cache: force ? "no-store" : "default",
  });
  if (!response.ok) throw new Error(`Rate lookup returned ${response.status}`);
  const quote = quoteFromPayload(await response.json());
  if (!quote) throw new Error("Rate lookup did not return usable rates.");
  memoryCache.set(code, { quote, fetchedAt: Date.now() });
  return quote;
}

export async function fetchRates(base: string, signal?: AbortSignal, force = false): Promise<RateQuote> {
  const code = base.toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) throw new Error("Invalid currency code.");
  if (typeof window !== "undefined") return fetchRatesViaProxy(code, signal, force);
  return fetchRatesFromProviders(code, signal, force);
}

export function clearRateCache() {
  memoryCache.clear();
}

export function rateLookupErrorMessage(error: unknown) {
  if (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  ) {
    return null;
  }
  return "Could not load exchange rates. Check your connection and try again.";
}
