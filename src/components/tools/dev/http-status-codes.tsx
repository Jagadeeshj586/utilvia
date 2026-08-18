"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HTTP_STATUS_CLASSES,
  filterHttpStatusCodes,
  statusCopyText,
  type HttpStatusClass,
  type HttpStatusCode,
} from "@/lib/http-status/codes";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

const CLASS_BADGE: Record<HttpStatusClass, string> = {
  "1xx": "bg-surface-soft text-[var(--body)]",
  "2xx": "bg-teal/10 text-teal",
  "3xx": "bg-amber/15 text-amber",
  "4xx": "bg-coral/10 text-coral",
  "5xx": "bg-[#c64545]/10 text-[#c64545]",
};

export function HttpStatusCodesTool() {
  const [query, setQuery] = useState("");
  const [classId, setClassId] = useState<"all" | HttpStatusClass>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const results = useMemo(() => filterHttpStatusCodes(query, classId), [classId, query]);

  const copyItem = async (item: HttpStatusCode, value: string, label: string) => {
    const ok = await copyText(value);
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(label);
    toast.success(`${item.code} copied`);
    window.setTimeout(() => setCopied((current) => (current === label ? null : current)), 1600);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "30+ codes", desc: "1xx through 5xx covered" },
          { title: "Searchable", desc: "Filter by code or keyword" },
          { title: "Copy ready", desc: "Code snippets included" },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3">
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-[var(--muted-ink)]">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-ink)]" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search 404, redirect, timeout…"
          aria-label="Search HTTP status codes"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Status class">
        {HTTP_STATUS_CLASSES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={classId === item.id}
            className={cn(
              "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
              classId === item.id
                ? "border-coral bg-coral text-white"
                : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
            )}
            onClick={() => setClassId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-[var(--muted-ink)]">
        {results.length} {results.length === 1 ? "code" : "codes"}
        {query.trim() ? ` matching “${query.trim()}”` : classId === "all" ? " · 1xx through 5xx" : ` · ${classId}`}
      </p>

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-8 text-center text-sm text-[var(--muted-ink)]">
          No codes match that search. Try a number like 401 or a word like redirect.
        </p>
      ) : (
        <ul className="space-y-4">
          {results.map((item) => (
            <li key={item.code} className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-2xl font-semibold tabular-nums text-ink">{item.code}</p>
                  <div>
                    <p className="text-base font-medium text-ink">{item.name}</p>
                    <span className={cn("mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium", CLASS_BADGE[item.classId])}>
                      {item.category}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void copyItem(item, statusCopyText(item), `code-${item.code}`)}
                >
                  {copied === `code-${item.code}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </Button>
              </div>

              <p className="mt-3 text-sm text-[var(--body)]">{item.meaning}</p>

              <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">When you&apos;ll see this</dt>
                  <dd className="mt-1 text-sm text-[var(--body)]">{item.when}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">Common causes</dt>
                  <dd className="mt-1">
                    <ul className="list-disc space-y-1 pl-4 text-sm text-[var(--body)]">
                      {item.causes.map((cause) => (
                        <li key={cause}>{cause}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">What to do</dt>
                  <dd className="mt-1 text-sm text-[var(--body)]">{item.action}</dd>
                </div>
              </dl>

              {item.snippet ? (
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-ink)]">Snippet</p>
                    <button
                      type="button"
                      className="text-xs font-medium text-coral hover:text-[var(--coral-active)]"
                      onClick={() => void copyItem(item, item.snippet ?? "", `snip-${item.code}`)}
                    >
                      {copied === `snip-${item.code}` ? "Copied" : "Copy snippet"}
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-canvas p-3 font-mono text-xs leading-relaxed text-ink">
                    <code>{item.snippet}</code>
                  </pre>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
