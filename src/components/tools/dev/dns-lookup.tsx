"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, Copy, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { ToolNotice } from "@/components/tools/tool-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DEFAULT_DNS_NAME,
  DEFAULT_DNS_TYPE,
  DNS_LOOKUP_API,
  RECORD_TYPES,
  formatTtl,
  lookupErrorMessage,
  resultCopyText,
  runLookup,
  sortRecords,
  validateLookupDraft,
  type DnsLookupResult,
  type DnsQueryType,
  type SortKey,
} from "@/lib/dns-lookup";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

const EXAMPLES = ["example.com", "google.com", "cloudflare.com", "1.1.1.1"];

export function DnsLookupTool() {
  const [name, setName] = useState(DEFAULT_DNS_NAME);
  const [type, setType] = useState<DnsQueryType>(DEFAULT_DNS_TYPE);
  const [result, setResult] = useState<DnsLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("type");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const abortRef = useRef<AbortController | null>(null);
  const nameError = validateLookupDraft(name);

  const rows = useMemo(
    () => (result ? sortRecords(result.records, sortKey, sortDir) : []),
    [result, sortKey, sortDir],
  );

  const lookup = async () => {
    if (nameError) {
      setError(nameError);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const next = await runLookup(name, type, controller.signal);
      if (controller.signal.aborted) return;
      setResult(next);
      if (next.rcode === 3) setError(null);
    } catch (caught: unknown) {
      const message = lookupErrorMessage(caught);
      if (message) {
        setResult(null);
        setError(message);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setName(DEFAULT_DNS_NAME);
    setType(DEFAULT_DNS_TYPE);
    setResult(null);
    setError(null);
    setCopied(null);
    setLoading(false);
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

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  const allCopy = result ? resultCopyText(result) : "";
  const canCopy = Boolean(result) && !loading;

  return (
    <div className="space-y-6">
      <ToolNotice>
        Queries {DNS_LOOKUP_API.primary.name} over HTTPS (with {DNS_LOOKUP_API.fallback.name} as fallback). Only the
        hostname and record type are sent. This is a public resolver’s view — not your ISP cache.
      </ToolNotice>

      <form
        className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void lookup();
        }}
      >
        <div>
          <Label htmlFor="dns-name">Domain or hostname</Label>
          <Input
            id="dns-name"
            value={name}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="example.com"
            aria-invalid={Boolean(name.trim() && nameError)}
            aria-describedby={name.trim() && nameError ? "dns-name-error" : "dns-name-hint"}
            className="mt-1 min-h-10 font-mono"
            onChange={(event) => setName(event.target.value)}
          />
          {name.trim() && nameError ? (
            <p id="dns-name-error" className="mt-1 text-xs text-destructive" role="alert">
              {nameError}
            </p>
          ) : (
            <p id="dns-name-hint" className="mt-1 text-xs text-[var(--muted-ink)]">
              Paste a domain, hostname, or IP (PTR). https:// and paths are stripped.
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Record type</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="DNS record type">
            {RECORD_TYPES.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.hint}
                className={cn(
                  "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                  type === item.id
                    ? "border-coral bg-coral text-white"
                    : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                )}
                onClick={() => setType(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Examples</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                className="min-h-10 rounded-lg border border-[var(--hairline)] bg-canvas px-3 font-mono text-sm text-ink hover:border-coral/40"
                onClick={() => {
                  setName(example);
                  setType(example.includes(":") || /^\d+\.\d+\.\d+\.\d+$/.test(example) ? "PTR" : type === "PTR" ? "A" : type);
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="submit" className="min-h-10 min-w-28 px-6" disabled={loading || Boolean(nameError)}>
            <Search className={cn("h-4 w-4", loading && "animate-spin motion-reduce:animate-none")} />
            {loading ? "Looking up…" : "Lookup"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            disabled={!canCopy}
            onClick={() => void copy("all", allCopy)}
          >
            {copied === "all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied === "all" ? "Copied" : "Copy"}
          </Button>
          <Button type="button" variant="outline" className="min-h-10" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5" aria-live="polite" aria-busy={loading}>
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Lookup result</p>
        {loading && !result ? (
          <div className="mt-4 space-y-3" aria-label="Looking up DNS records">
            <div className="h-10 animate-pulse rounded-lg bg-canvas" />
            <div className="h-40 animate-pulse rounded-lg bg-canvas" />
          </div>
        ) : error && !result ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
            <Button type="button" variant="outline" className="min-h-10" onClick={() => void lookup()}>
              Try again
            </Button>
          </div>
        ) : result ? (
          <>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <StatusChip
                label={result.status}
                tone={result.rcode === 0 ? "ok" : result.rcode === 3 ? "warn" : "bad"}
              />
              <StatusChip label={`${result.durationMs} ms`} />
              <StatusChip label={result.provider} />
              <StatusChip label={`${result.records.length} record${result.records.length === 1 ? "" : "s"}`} />
            </div>
            <p className="mt-2 text-sm text-[var(--muted-ink)]">
              {result.name} · {result.queryType === "ALL" ? "all types" : result.queryType} · {result.statusLabel}
            </p>

            {result.records.length === 0 ? (
              <p className="mt-6 rounded-lg border border-dashed border-[var(--hairline)] bg-canvas px-4 py-8 text-center text-sm text-[var(--muted-ink)]">
                No {result.queryType === "ALL" ? "" : `${result.queryType} `}records for {result.name}.
              </p>
            ) : (
              <>
                <ul className="mt-4 grid gap-3 md:hidden">
                  {rows.map((record, index) => (
                    <li key={`${record.type}-${record.name}-${record.value}-${index}`} className="rounded-lg border border-[var(--hairline)] bg-canvas p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-ink">
                          {record.type} · {record.name}
                        </p>
                        <CopyIconButton
                          copied={copied === `row-${index}`}
                          onClick={() => void copy(`row-${index}`, record.value)}
                          label={`Copy ${record.type} value`}
                        />
                      </div>
                      <p className="mt-2 break-all font-mono text-sm text-ink">{record.value}</p>
                      <p className="mt-2 text-xs text-[var(--muted-ink)]">
                        TTL {formatTtl(record.ttl)}
                        {record.priority != null ? ` · priority ${record.priority}` : ""}
                        {record.extra ? ` · ${record.extra}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 hidden md:block">
                  <Table>
                    <caption className="sr-only">
                      DNS records for {result.name}, sortable by type, name, value, priority, and TTL
                    </caption>
                    <TableHeader>
                      <TableRow>
                        <SortHead label="Type" active={sortKey === "type"} dir={sortDir} onClick={() => toggleSort("type")} />
                        <SortHead label="Name" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                        <SortHead label="Value" active={sortKey === "value"} dir={sortDir} onClick={() => toggleSort("value")} />
                        <SortHead
                          label="Priority"
                          active={sortKey === "priority"}
                          dir={sortDir}
                          onClick={() => toggleSort("priority")}
                        />
                        <SortHead label="TTL" active={sortKey === "ttl"} dir={sortDir} onClick={() => toggleSort("ttl")} />
                        <TableHead>Details</TableHead>
                        <TableHead className="w-12">
                          <span className="sr-only">Copy</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((record, index) => (
                        <TableRow key={`${record.type}-${record.name}-${record.value}-${index}`}>
                          <TableCell className="font-medium">{record.type}</TableCell>
                          <TableCell className="font-mono text-xs">{record.name}</TableCell>
                          <TableCell className="max-w-[280px] break-all font-mono text-xs">{record.value}</TableCell>
                          <TableCell className="tabular-nums">{record.priority ?? "—"}</TableCell>
                          <TableCell className="tabular-nums">{formatTtl(record.ttl)}</TableCell>
                          <TableCell className="max-w-[220px] text-xs text-[var(--muted-ink)]">
                            {record.extra ?? "—"}
                          </TableCell>
                          <TableCell>
                            <CopyIconButton
                              copied={copied === `row-${index}`}
                              onClick={() => void copy(`row-${index}`, record.value)}
                              label={`Copy ${record.type} value`}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-ink)]">Enter a domain, choose a record type, then look it up.</p>
        )}
      </div>
    </div>
  );
}

function SortHead({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  const Icon = dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 uppercase tracking-[1.5px] hover:text-ink"
        aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      >
        {label}
        {active ? <Icon className="h-3 w-3" aria-hidden /> : null}
      </button>
    </TableHead>
  );
}

function StatusChip({ label, tone = "neutral" }: { label: string; tone?: "ok" | "warn" | "bad" | "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-md border px-2.5 text-xs font-medium tabular-nums",
        tone === "ok" && "border-teal/40 bg-teal/10 text-teal",
        tone === "warn" && "border-[#e8a55a]/50 bg-[#e8a55a]/15 text-ink",
        tone === "bad" && "border-coral/40 bg-coral/10 text-coral",
        tone === "neutral" && "border-[var(--hairline)] bg-canvas text-[var(--muted-ink)]",
      )}
    >
      {label}
    </span>
  );
}

function CopyIconButton({ copied, onClick, label }: { copied: boolean; onClick: () => void; label: string }) {
  return (
    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={label} onClick={onClick}>
      {copied ? <Check className="h-4 w-4 text-teal" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
