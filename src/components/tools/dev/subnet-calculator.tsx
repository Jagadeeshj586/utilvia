"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CIDR_PRESETS,
  DEFAULT_CIDR,
  QUICK_REFERENCE_PREFIXES,
  applyPrefix,
  formatHostCount,
  ipInSubnet,
  maskToPrefix,
  parseCidr,
  referenceRow,
} from "@/lib/subnet/calculate";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

export function SubnetCalculator() {
  const [cidr, setCidr] = useState(DEFAULT_CIDR);
  const [mask, setMask] = useState("255.255.255.0");
  const [checkIp, setCheckIp] = useState("192.168.1.50");
  const [copied, setCopied] = useState<string | null>(null);

  const result = useMemo(() => parseCidr(cidr), [cidr]);
  const maskResult = useMemo(() => maskToPrefix(mask), [mask]);
  const membership = useMemo(() => ipInSubnet(checkIp, cidr), [checkIp, cidr]);

  const copy = async (label: string, value: string) => {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(label);
    toast.success(`${label} copied`);
    window.setTimeout(() => setCopied(null), 1600);
  };

  const prefix = result.ok ? result.value.prefix : 24;

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div>
          <Label htmlFor="cidr-input">CIDR notation</Label>
          <Input
            id="cidr-input"
            value={cidr}
            onChange={(event) => setCidr(event.target.value)}
            spellCheck={false}
            aria-invalid={result.ok ? undefined : true}
            className="mt-1 font-mono"
            placeholder="192.168.1.0/24"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <Label htmlFor="cidr-prefix">Prefix /{prefix}</Label>
            <span className="text-xs text-[var(--muted-ink)]">0–32</span>
          </div>
          <input
            id="cidr-prefix"
            type="range"
            min={0}
            max={32}
            value={prefix}
            onChange={(event) => setCidr(applyPrefix(cidr.includes("/") ? cidr : `${cidr}/24`, Number(event.target.value)))}
            className="w-full accent-coral"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CIDR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setCidr(preset.value)}
              className={cn(
                "min-h-10 rounded-lg border px-3 font-mono text-sm transition-colors",
                cidr.trim() === preset.value
                  ? "border-coral bg-coral text-white"
                  : "border-[var(--hairline)] bg-surface-soft text-ink hover:border-primary/40",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {!result.ok ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
            {result.error}
          </p>
        ) : null}
      </section>

      {result.ok ? (
        <section className="space-y-3 rounded-xl border border-primary/30 bg-surface-card p-4 sm:p-5">
          <h2 className="font-display text-xl font-semibold text-ink">Network details</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <ResultRow label="Network address" value={result.value.network} copied={copied} onCopy={copy} />
            <ResultRow label="Broadcast address" value={result.value.broadcast} copied={copied} onCopy={copy} />
            <ResultRow label="Subnet mask" value={result.value.subnetMask} copied={copied} onCopy={copy} />
            <ResultRow label="Wildcard mask" value={result.value.wildcardMask} copied={copied} onCopy={copy} />
            <ResultRow label="Total hosts" value={formatHostCount(result.value.totalHosts)} copied={copied} onCopy={copy} />
            <ResultRow label="Usable hosts" value={formatHostCount(result.value.usableHosts)} copied={copied} onCopy={copy} />
            <ResultRow label="First usable" value={result.value.firstUsable} copied={copied} onCopy={copy} />
            <ResultRow label="Last usable" value={result.value.lastUsable} copied={copied} onCopy={copy} />
            <ResultRow label="Network (binary)" value={result.value.networkBinary} copied={copied} onCopy={copy} wide />
            <ResultRow label="Mask (binary)" value={result.value.maskBinary} copied={copied} onCopy={copy} wide />
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <div>
            <h2 className="text-sm font-medium text-ink">Mask to CIDR</h2>
            <p className="mt-1 text-xs text-[var(--muted-ink)]">Convert a dotted-decimal mask to a prefix.</p>
          </div>
          <div>
            <Label htmlFor="mask-input">Subnet mask</Label>
            <Input
              id="mask-input"
              value={mask}
              onChange={(event) => setMask(event.target.value)}
              spellCheck={false}
              aria-invalid={maskResult.ok ? undefined : true}
              className="mt-1 font-mono"
              placeholder="255.255.255.0"
            />
          </div>
          {maskResult.ok ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--hairline)] bg-canvas px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted-ink)]">Prefix</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-ink">/{maskResult.prefix}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCidr(applyPrefix(result.ok ? result.value.ip : "192.168.1.0", maskResult.prefix))}
              >
                Apply
              </Button>
            </div>
          ) : (
            <p className="text-sm text-destructive" role="alert">
              {maskResult.error}
            </p>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <div>
            <h2 className="text-sm font-medium text-ink">IP in this subnet?</h2>
            <p className="mt-1 text-xs text-[var(--muted-ink)]">Check whether an address falls inside the CIDR block.</p>
          </div>
          <div>
            <Label htmlFor="check-ip">IPv4 address</Label>
            <Input
              id="check-ip"
              value={checkIp}
              onChange={(event) => setCheckIp(event.target.value)}
              spellCheck={false}
              className="mt-1 font-mono"
              placeholder="192.168.1.50"
            />
          </div>
          {membership.ok ? (
            <p
              className={cn(
                "rounded-lg border px-4 py-3 text-sm",
                membership.inside
                  ? "border-teal/40 bg-teal/10 text-ink"
                  : "border-[var(--hairline)] bg-canvas text-[var(--body)]",
              )}
            >
              {checkIp.trim() || "This address"} is {membership.inside ? "inside" : "outside"}{" "}
              {result.ok ? result.value.cidr : "the current CIDR"}.
            </p>
          ) : (
            <p className="text-sm text-destructive" role="alert">
              {membership.error}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div>
          <h2 className="text-sm font-medium text-ink">Quick reference</h2>
          <p className="mt-1 text-xs text-[var(--muted-ink)]">Tap a row to apply that prefix to the current address.</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prefix</TableHead>
              <TableHead>Subnet mask</TableHead>
              <TableHead className="text-right">Total hosts</TableHead>
              <TableHead className="text-right">Usable hosts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {QUICK_REFERENCE_PREFIXES.map((item) => {
              const row = referenceRow(item);
              const active = result.ok && result.value.prefix === item;
              return (
                <TableRow
                  key={item}
                  className={cn("cursor-pointer", active && "bg-coral/5")}
                  tabIndex={0}
                  onClick={() => setCidr(applyPrefix(cidr.includes("/") ? cidr : DEFAULT_CIDR, item))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setCidr(applyPrefix(cidr.includes("/") ? cidr : DEFAULT_CIDR, item));
                    }
                  }}
                >
                  <TableCell className="font-mono font-medium">/{row.prefix}</TableCell>
                  <TableCell className="font-mono">{row.subnetMask}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatHostCount(row.totalHosts)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatHostCount(row.usableHosts)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

function ResultRow({
  label,
  value,
  copied,
  onCopy,
  wide,
}: {
  label: string;
  value: string;
  copied: string | null;
  onCopy: (label: string, value: string) => void;
  wide?: boolean;
}) {
  const isCopied = copied === label;
  return (
    <div className={cn("flex items-start justify-between gap-3 rounded-lg border border-[var(--hairline)] bg-canvas px-3 py-2.5", wide && "sm:col-span-2")}>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">{label}</p>
        <p className="mt-1 break-all font-mono text-sm text-ink">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => onCopy(label, value)}
        className="mt-0.5 rounded-md p-1.5 text-[var(--muted-ink)] hover:bg-surface-soft hover:text-ink"
        aria-label={`Copy ${label}`}
      >
        {isCopied ? <Check className="h-4 w-4 text-coral" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
