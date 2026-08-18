"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { ToolNotice } from "@/components/tools/tool-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IP_LOOKUP_API,
  ipLookupCopyText,
  ipLookupErrorMessage,
  normalizeIpv4,
  type IpGeoResult,
  type IpLookupMode,
} from "@/lib/ip-lookup/lookup";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

const MODES: { id: IpLookupMode; label: string }[] = [
  { id: "mine", label: "My IP" },
  { id: "any", label: "Lookup any IP" },
];

async function fetchPublicIp(signal: AbortSignal) {
  const response = await fetch(IP_LOOKUP_API.ipifyUrl, { signal });
  if (!response.ok) throw new Error("Could not detect your public IP.");
  const json = (await response.json()) as { ip?: string };
  const parsed = normalizeIpv4(json.ip ?? "");
  if (!parsed.ok) throw new Error("Could not detect a public IPv4 address.");
  return parsed.ip;
}

async function fetchGeo(ip: string, signal: AbortSignal) {
  const response = await fetch(`/api/ip-lookup?ip=${encodeURIComponent(ip)}`, { signal });
  const json = (await response.json()) as IpGeoResult & { error?: string };
  if (!response.ok) throw new Error(json.error || "Could not geolocate that IP address.");
  return json;
}

export function IpAddressLookup() {
  const [mode, setMode] = useState<IpLookupMode>("mine");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<IpGeoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = async (ip?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const target = ip ?? (await fetchPublicIp(controller.signal));
      const next = await fetchGeo(target, controller.signal);
      if (controller.signal.aborted) return;
      setResult(next);
    } catch (caught: unknown) {
      const message = ipLookupErrorMessage(caught);
      if (message) {
        setResult(null);
        setError(message);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "mine") return;
    void run();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const lookupAny = () => {
    const parsed = normalizeIpv4(query);
    if (!parsed.ok) {
      setError(parsed.error);
      setResult(null);
      return;
    }
    void run(parsed.ip);
  };

  const copy = async (label: string, value: string) => {
    const ok = await copyText(value);
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(label);
    toast.success("Copied");
    window.setTimeout(() => setCopied((current) => (current === label ? null : current)), 1600);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--body)]">
        See your public IP or look up any IPv4 address — country, city, ISP, and timezone.
      </p>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="IP lookup mode">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            className={cn(
              "min-h-10 rounded-lg border px-4 text-sm font-medium transition-colors",
              mode === item.id
                ? "border-coral bg-coral text-white"
                : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
            )}
            onClick={() => {
              setMode(item.id);
              setError(null);
              setResult(null);
              setCopied(null);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "any" ? (
        <form
          className="space-y-3 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            lookupAny();
          }}
        >
          <div>
            <Label htmlFor="ip-any">IPv4 address</Label>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
              <Input
                id="ip-any"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="8.8.8.8"
                className="font-mono"
                autoComplete="off"
                spellCheck={false}
              />
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4" />
                {loading ? "Looking up…" : "Look up"}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {IP_LOOKUP_API.examples.map((example) => (
              <button
                key={example}
                type="button"
                className={cn(
                  "min-h-9 rounded-lg border px-2.5 font-mono text-xs font-medium transition-colors",
                  query === example
                    ? "border-coral bg-coral text-white"
                    : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                )}
                onClick={() => {
                  setQuery(example);
                  void run(example);
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </form>
      ) : null}

      {loading ? <p className="text-sm text-[var(--muted-ink)]">Looking up…</p> : null}

      {error ? (
        <p className="rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-ink" role="alert">
          {error}
        </p>
      ) : null}

      {result && !loading ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-teal/40 bg-teal/10 px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">IP address</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-2xl font-semibold tabular-nums text-ink">{result.ip}</p>
              <Button type="button" size="sm" variant="outline" onClick={() => void copy("ip", result.ip)}>
                {copied === "ip" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === "ip" ? "Copied" : "Copy IP"}
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Country", result.country],
              ["Region / State", result.region],
              ["City", result.city],
              ["ISP", result.isp],
              ["Organization", result.org],
              ["Timezone", result.timezone],
              ["Coordinates", result.coordinates],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">{label}</p>
                <p className="mt-1 text-sm font-medium text-ink">{value}</p>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void copy("all", ipLookupCopyText(result))}>
            {copied === "all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied === "all" ? "Copied" : "Copy details"}
          </Button>
        </div>
      ) : null}

      <ToolNotice>
        IP geolocation is approximate and based on ISP registration data, not your precise location.
        {mode === "mine"
          ? " Your IP is detected via ipify in your browser, then geolocated through our server — not the hosting server’s IP."
          : " Only the IPv4 address you look up is sent to the geolocation provider."}
      </ToolNotice>

      {mode === "any" ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            abortRef.current?.abort();
            setQuery("");
            setResult(null);
            setError(null);
            setCopied(null);
            setLoading(false);
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "My IP", desc: "Detected in your browser" },
          { title: "Any IPv4", desc: "Look up 8.8.8.8 and more" },
          { title: "ISP & city", desc: "Timezone and coordinates" },
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
