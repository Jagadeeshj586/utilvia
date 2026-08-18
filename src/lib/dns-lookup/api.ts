import { RECORD_TYPE_IDS, type DnsLookupResult, type DnsQueryType, type DnsRecord } from "./types";
import { parseDnsJson } from "./parse";
import { normalizeLookupName } from "./validate";

/**
 * DNS-over-HTTPS source of truth for the DNS Lookup Tool.
 * Swap the URL templates (or set DNS_DOH_URL / DNS_DOH_AUTHORIZATION on the server)
 * without putting credentials in client-side code. `{name}` and `{type}` are replaced.
 */
export type DohProvider = {
  id: string;
  name: string;
  queryUrl: string;
  accept: string;
};

export const DOH_PROVIDERS: Record<"cloudflare" | "google", DohProvider> = {
  cloudflare: {
    id: "cloudflare",
    name: "Cloudflare",
    queryUrl: "https://cloudflare-dns.com/dns-query?name={name}&type={type}",
    accept: "application/dns-json",
  },
  google: {
    id: "google",
    name: "Google Public DNS",
    queryUrl: "https://dns.google/resolve?name={name}&type={type}",
    accept: "application/dns-json",
  },
};

export const DNS_LOOKUP_API = {
  primary: DOH_PROVIDERS.cloudflare,
  fallback: DOH_PROVIDERS.google,
  timeoutMs: 8_000,
} as const;

export class DnsLookupError extends Error {
  status: number;
  timedOut: boolean;

  constructor(message: string, status = 502, timedOut = false) {
    super(message);
    this.name = "DnsLookupError";
    this.status = status;
    this.timedOut = timedOut;
  }
}

function providerFromEnv(): DohProvider {
  const url = typeof process !== "undefined" ? process.env.DNS_DOH_URL : undefined;
  if (!url) return DNS_LOOKUP_API.primary;
  return {
    id: "custom",
    name: "Custom resolver",
    queryUrl: url,
    accept: "application/dns-json",
  };
}

function authHeader(): Record<string, string> {
  const value = typeof process !== "undefined" ? process.env.DNS_DOH_AUTHORIZATION : undefined;
  return value?.trim() ? { Authorization: value.trim() } : {};
}

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

async function queryProvider(
  provider: DohProvider,
  name: string,
  type: string,
  signal: AbortSignal,
): Promise<DnsLookupResult> {
  const url = provider.queryUrl.replace("{name}", encodeURIComponent(name)).replace("{type}", encodeURIComponent(type));
  const started = Date.now();
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: provider.accept,
      ...authHeader(),
    },
    cache: "no-store",
  });
  const durationMs = Date.now() - started;
  if (!response.ok) throw new DnsLookupError(`${provider.name} returned ${response.status}`, response.status);
  const json: unknown = await response.json();
  const parsed = parseDnsJson(json, name, type === "ALL" ? "ALL" : (type as DnsQueryType), provider.name, durationMs);
  if (!parsed) throw new DnsLookupError(`${provider.name} did not return usable DNS data.`);
  return parsed;
}

async function queryOne(name: string, type: string, signal: AbortSignal): Promise<DnsLookupResult> {
  const primary = providerFromEnv();
  try {
    return await queryProvider(primary, name, type, signal);
  } catch (error) {
    if (isAbortError(error) || primary.id === DNS_LOOKUP_API.fallback.id) throw error;
    try {
      return await queryProvider(DNS_LOOKUP_API.fallback, name, type, signal);
    } catch (fallbackError) {
      throw isAbortError(fallbackError) ? fallbackError : error;
    }
  }
}

function mergeLookups(name: string, parts: DnsLookupResult[], durationMs: number): DnsLookupResult {
  const records: DnsRecord[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    for (const record of part.records) {
      const key = `${record.type}|${record.name}|${record.value}|${record.priority ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      records.push(record);
    }
  }
  const nxAll = parts.length > 0 && parts.every((part) => part.rcode === 3);
  const success = parts.find((part) => part.rcode === 0) ?? parts[0];
  const rcode = nxAll ? 3 : (success?.rcode ?? 2);
  const info = parts.find((part) => part.rcode === rcode) ?? success;
  return {
    name,
    queryType: "ALL",
    rcode,
    status: info?.status ?? "SERVFAIL",
    statusLabel: nxAll ? "This name does not exist." : records.length ? "Success" : "No records of the requested types.",
    durationMs,
    provider: info?.provider ?? DNS_LOOKUP_API.primary.name,
    records,
  };
}

export async function lookupDns(name: string, type: DnsQueryType, signal?: AbortSignal): Promise<DnsLookupResult> {
  const parsed = normalizeLookupName(name);
  if (!parsed.ok) throw new DnsLookupError(parsed.error, 400);

  const timeout = AbortSignal.timeout?.(DNS_LOOKUP_API.timeoutMs);
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);
  timeout?.addEventListener("abort", onAbort);

  const started = Date.now();
  try {
    if (type === "ALL") {
      const parts = await Promise.all(
        RECORD_TYPE_IDS.map(async (recordType) => {
          try {
            return await queryOne(parsed.name, recordType, controller.signal);
          } catch (error) {
            if (isAbortError(error)) throw error;
            return {
              name: parsed.name,
              queryType: recordType,
              rcode: 2,
              status: "SERVFAIL",
              statusLabel: "The resolver failed to answer.",
              durationMs: 0,
              provider: DNS_LOOKUP_API.primary.name,
              records: [] as DnsRecord[],
            } satisfies DnsLookupResult;
          }
        }),
      );
      return mergeLookups(parsed.name, parts, Date.now() - started);
    }
    return await queryOne(parsed.name, type, controller.signal);
  } catch (error) {
    if (isAbortError(error)) {
      throw new DnsLookupError("The DNS lookup timed out. Try again in a moment.", 504, true);
    }
    throw error;
  } finally {
    signal?.removeEventListener("abort", onAbort);
    timeout?.removeEventListener("abort", onAbort);
  }
}

export function lookupErrorMessage(error: unknown) {
  if (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  ) {
    return null;
  }
  if (error instanceof DnsLookupError && error.timedOut) {
    return "The DNS lookup timed out. Try again in a moment.";
  }
  if (error instanceof DnsLookupError && error.status === 400) return error.message;
  return "Could not complete the DNS lookup. Check the name and try again.";
}

export async function lookupDnsViaProxy(name: string, type: DnsQueryType, signal?: AbortSignal) {
  const params = new URLSearchParams({ name, type });
  const started = Date.now();
  const response = await fetch(`/api/dns-lookup?${params}`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const json: unknown = await response.json().catch(() => null);
  if (response.status === 504) {
    throw new DnsLookupError("The DNS lookup timed out. Try again in a moment.", 504, true);
  }
  if (!response.ok) {
    const message =
      json && typeof json === "object" && typeof (json as { error?: unknown }).error === "string"
        ? (json as { error: string }).error
        : `Lookup returned ${response.status}`;
    throw new DnsLookupError(message, response.status);
  }
  if (!json || typeof json !== "object") throw new DnsLookupError("Lookup did not return usable data.");
  const data = json as DnsLookupResult;
  if (!Array.isArray(data.records)) throw new DnsLookupError("Lookup did not return usable data.");
  return {
    ...data,
    durationMs: typeof data.durationMs === "number" ? data.durationMs : Date.now() - started,
  };
}

export async function runLookup(name: string, type: DnsQueryType, signal?: AbortSignal) {
  if (typeof window !== "undefined") return lookupDnsViaProxy(name, type, signal);
  return lookupDns(name, type, signal);
}
