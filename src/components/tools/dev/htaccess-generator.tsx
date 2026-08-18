"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, Info, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  WWW_MODES,
  cloneHtaccess,
  generateHtaccess,
  type HtaccessConfig,
  type WwwMode,
} from "@/lib/htaccess/generate";
import { copyText } from "@/lib/security/clipboard";
import { cn, downloadText } from "@/lib/utils";

export function HtaccessGenerator() {
  const [config, setConfig] = useState<HtaccessConfig>(() => cloneHtaccess());
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => generateHtaccess(config), [config]);
  const canExport = Boolean(result.text);

  const patch = (partial: Partial<HtaccessConfig>) => {
    setConfig((current) => ({ ...current, ...partial }));
    setCopied(false);
  };

  const reset = () => {
    setConfig(cloneHtaccess());
    setCopied(false);
  };

  const copy = async () => {
    if (!canExport) return;
    const ok = await copyText(result.text);
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(true);
    toast.success("Copied .htaccess");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    if (!canExport) return;
    downloadText(result.text, ".htaccess", "text/plain;charset=utf-8");
    toast.success("Downloading .htaccess");
  };

  const notes = result.issues.filter((issue) => issue.level !== "info");
  const info = result.issues.find((issue) => issue.level === "info");

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted-ink)]">
        Toggle the rules you need. The preview updates as you edit — then copy or download the file.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Configure</p>

          <ToggleRow
            id="ht-https"
            label="Redirect HTTP to HTTPS"
            hint="Forces all HTTP traffic to HTTPS with a permanent 301 redirect."
            checked={config.httpsRedirect}
            onCheckedChange={(httpsRedirect) => patch({ httpsRedirect })}
          />

          <div>
            <LabelWithHint label="WWW redirect" hint="Choose whether to force www, remove www, or leave URLs unchanged." />
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="WWW redirect">
              {WWW_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  title={mode.hint}
                  aria-pressed={config.wwwMode === mode.id}
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    config.wwwMode === mode.id
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => patch({ wwwMode: mode.id as WwwMode })}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <LabelWithHint
              label="Custom error pages"
              hint="Optional paths Apache should serve for 404, 403, and 500 responses."
            />
            <ErrorPathField
              id="ht-404"
              label="404 Not Found"
              placeholder="/404.html"
              value={config.error404}
              onChange={(error404) => patch({ error404 })}
            />
            <ErrorPathField
              id="ht-403"
              label="403 Forbidden"
              placeholder="/403.html"
              value={config.error403}
              onChange={(error403) => patch({ error403 })}
            />
            <ErrorPathField
              id="ht-500"
              label="500 Internal Server Error"
              placeholder="/500.html"
              value={config.error500}
              onChange={(error500) => patch({ error500 })}
            />
          </div>

          <ToggleRow
            id="ht-cache"
            label="Browser caching"
            hint="Sets cache expiry headers for static assets using mod_expires — speeds up repeat visits."
            checked={config.browserCaching}
            onCheckedChange={(browserCaching) => patch({ browserCaching })}
          />
          <ToggleRow
            id="ht-gzip"
            label="GZIP compression"
            hint="Compresses text assets before sending using mod_deflate — reduces bandwidth."
            checked={config.gzip}
            onCheckedChange={(gzip) => patch({ gzip })}
          />
          <ToggleRow
            id="ht-indexes"
            label="Disable directory listing"
            hint="Prevents visitors from browsing folder contents when no index file exists."
            checked={config.disableDirectoryListing}
            onCheckedChange={(disableDirectoryListing) => patch({ disableDirectoryListing })}
          />

          <div>
            <LabelWithHint
              label="Block IP addresses"
              hint="Deny access from specific IP addresses — one IP, CIDR range, or hostname per line."
            />
            <Textarea
              id="ht-ips"
              value={config.blockIps}
              spellCheck={false}
              placeholder={"192.0.2.1\n198.51.100.0/24"}
              className="mt-2 min-h-[96px] font-mono text-sm"
              aria-label="IP addresses to block"
              onChange={(event) => patch({ blockIps: event.target.value })}
            />
          </div>

          <div>
            <LabelWithHint
              label="Protect sensitive files"
              hint="Block direct access to files like .env or config.php — one pattern per line."
            />
            <Textarea
              id="ht-files"
              value={config.protectFiles}
              spellCheck={false}
              placeholder={".env\nconfig.php"}
              className="mt-2 min-h-[96px] font-mono text-sm"
              aria-label="Sensitive file patterns"
              onChange={(event) => patch({ protectFiles: event.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5 lg:sticky lg:top-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Live preview</p>
              <p className="mt-2 text-sm text-[var(--muted-ink)]">
                {canExport ? "Ready to copy or download." : "Nothing to export yet."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" className="min-h-10" disabled={!canExport} onClick={() => void copy()}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button type="button" variant="outline" className="min-h-10" disabled={!canExport} onClick={download}>
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button type="button" variant="outline" className="min-h-10" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {notes.length ? (
            <ul className="space-y-1.5 text-sm" aria-live="polite">
              {notes.map((issue, index) => (
                <li key={`${issue.level}-${index}`} className="text-ink">
                  {issue.level === "warning" ? "Note: " : "Error: "}
                  {issue.message}
                </li>
              ))}
            </ul>
          ) : info ? (
            <p className="text-sm text-[var(--muted-ink)]">{info.message}</p>
          ) : null}

          <Textarea
            readOnly
            value={result.text || "# Toggle rules on the left to generate .htaccess"}
            className="min-h-[320px] font-mono text-sm"
            aria-label="Generated .htaccess"
          />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <Label htmlFor={id}>{label}</Label>
          <HintButton hint={hint} />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted-ink)]">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5 shrink-0" />
    </div>
  );
}

function ErrorPathField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        spellCheck={false}
        placeholder={placeholder}
        className="mt-1 min-h-10 font-mono text-sm"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function LabelWithHint({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <p className="text-sm font-medium text-ink">{label}</p>
      <HintButton hint={hint} />
    </div>
  );
}

function HintButton({ hint }: { hint: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted-ink)] hover:text-ink"
          aria-label={hint}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{hint}</TooltipContent>
    </Tooltip>
  );
}
