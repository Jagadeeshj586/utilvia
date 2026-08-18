"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  compareTexts,
  DEFAULT_MODIFIED_TEXT,
  DEFAULT_ORIGINAL_TEXT,
  type DiffLine,
  type SplitDiffCell,
} from "@/lib/text/diff";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 500;

function lineClass(type: DiffLine["type"] | SplitDiffCell["type"]) {
  if (type === "add") return "bg-[#5db8a6]/15 text-[#2f6f63]";
  if (type === "remove") return "bg-[#cc785c]/15 text-[#8f4a35]";
  if (type === "empty") return "bg-surface-soft/60 text-transparent";
  return "text-[var(--body)]";
}

function LineNumber({ value }: { value: number | null }) {
  return (
    <span className="inline-block w-8 shrink-0 select-none pr-3 text-right tabular-nums text-muted-foreground">
      {value ?? ""}
    </span>
  );
}

function UnifiedDiff({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="overflow-auto rounded-lg border border-[var(--hairline)] bg-surface-soft font-mono text-sm">
      {lines.map((line, index) => (
        <div key={`${line.type}-${index}-${line.text.slice(0, 24)}`} className={cn("flex px-3 py-1", lineClass(line.type))}>
          <span className="mr-3 inline-block w-4 shrink-0 select-none">
            {line.type === "add" ? "+" : line.type === "remove" ? "−" : " "}
          </span>
          <span className="whitespace-pre-wrap break-all">{line.text || " "}</span>
        </div>
      ))}
    </div>
  );
}

function SplitDiff({ rows }: { rows: ReturnType<typeof compareTexts>["splitRows"] }) {
  return (
    <div className="overflow-auto rounded-lg border border-[var(--hairline)] bg-surface-soft font-mono text-sm">
      <div className="grid min-w-[640px] grid-cols-2">
        <div className="border-r border-[var(--hairline)]">
          <div className="border-b border-[var(--hairline)] px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Original
          </div>
          {rows.map((row, index) => (
            <div key={`left-${index}`} className={cn("flex px-3 py-1", lineClass(row.left.type))}>
              <LineNumber value={row.left.lineNumber} />
              <span className="whitespace-pre-wrap break-all">{row.left.text || " "}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="border-b border-[var(--hairline)] px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Modified
          </div>
          {rows.map((row, index) => (
            <div key={`right-${index}`} className={cn("flex px-3 py-1", lineClass(row.right.type))}>
              <LineNumber value={row.right.lineNumber} />
              <span className="whitespace-pre-wrap break-all">{row.right.text || " "}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TextDiffCheckerTool() {
  const [original, setOriginal] = useState(DEFAULT_ORIGINAL_TEXT);
  const [modified, setModified] = useState(DEFAULT_MODIFIED_TEXT);
  const [compareOriginal, setCompareOriginal] = useState(DEFAULT_ORIGINAL_TEXT);
  const [compareModified, setCompareModified] = useState(DEFAULT_MODIFIED_TEXT);
  const [view, setView] = useState<"split" | "unified">("unified");
  const [hasCompared, setHasCompared] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCompareOriginal(original);
      setCompareModified(modified);
      setHasCompared(true);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [original, modified]);

  const result = useMemo(
    () => compareTexts(compareOriginal, compareModified),
    [compareOriginal, compareModified],
  );

  const compareNow = () => {
    setCompareOriginal(original);
    setCompareModified(modified);
    setHasCompared(true);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="diff-original">Original Text</Label>
          <Textarea
            id="diff-original"
            value={original}
            onChange={(event) => setOriginal(event.target.value)}
            spellCheck={false}
            className="mt-2 min-h-[220px] font-mono text-sm leading-relaxed"
            placeholder="Paste original text here"
          />
        </div>
        <div>
          <Label htmlFor="diff-modified">Modified Text</Label>
          <Textarea
            id="diff-modified"
            value={modified}
            onChange={(event) => setModified(event.target.value)}
            spellCheck={false}
            className="mt-2 min-h-[220px] font-mono text-sm leading-relaxed"
            placeholder="Paste modified text here"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={compareNow}>
          Compare Texts
        </Button>
        {hasCompared ? (
          <p className="text-sm text-muted-foreground">
            {result.stats.removed} removed · {result.stats.added} added · {result.stats.unchanged} unchanged
          </p>
        ) : null}
      </div>

      {hasCompared ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">View:</span>
            {(["split", "unified"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  "min-h-10 rounded-lg border px-4 py-1.5 text-sm capitalize transition-colors",
                  view === mode
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-[var(--hairline)] bg-surface-soft text-ink hover:border-primary/40",
                )}
              >
                {mode === "split" ? "Split" : "Unified"}
              </button>
            ))}
          </div>
          {view === "split" ? <SplitDiff rows={result.splitRows} /> : <UnifiedDiff lines={result.lines} />}
        </div>
      ) : null}
    </div>
  );
}
