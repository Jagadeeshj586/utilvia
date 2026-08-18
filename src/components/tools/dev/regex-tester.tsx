"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_REGEX_FLAGS,
  DEFAULT_REGEX_PATTERN,
  DEFAULT_REGEX_SAMPLE,
  REGEX_FLAGS,
  REGEX_PRESETS,
  buildHighlightSegments,
  flagsToString,
  testRegex,
  type RegexFlag,
} from "@/lib/regex/test";
import { cn } from "@/lib/utils";

export function RegexTesterTool() {
  const [pattern, setPattern] = useState(DEFAULT_REGEX_PATTERN);
  const [flags, setFlags] = useState<RegexFlag[]>([...DEFAULT_REGEX_FLAGS]);
  const [sample, setSample] = useState(DEFAULT_REGEX_SAMPLE);

  const result = useMemo(() => testRegex(pattern, flags, sample), [flags, pattern, sample]);
  const segments = useMemo(
    () => (result.ok ? buildHighlightSegments(sample, result.matches) : []),
    [result, sample],
  );

  const toggleFlag = (flag: RegexFlag) => {
    setFlags((current) => (current.includes(flag) ? current.filter((item) => item !== flag) : [...current, flag]));
  };

  const applyPreset = (preset: (typeof REGEX_PRESETS)[number]) => {
    setPattern(preset.pattern);
    setFlags(["g"]);
    setSample(preset.sample);
  };

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Pattern</h2>
          <p className="mt-1 text-sm text-[var(--body)]">Enter a regular expression and choose flags. Results update live.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <Label htmlFor="re-pattern">Regular expression</Label>
            <div className="mt-1 flex min-h-11 items-center overflow-hidden rounded-md border border-[var(--hairline)] bg-canvas focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
              <span className="select-none px-3 font-mono text-muted-foreground" aria-hidden="true">
                /
              </span>
              <Input
                id="re-pattern"
                value={pattern}
                onChange={(event) => setPattern(event.target.value)}
                placeholder="pattern"
                spellCheck={false}
                className="h-11 border-0 bg-transparent px-0 font-mono shadow-none focus-visible:ring-0"
                aria-invalid={result.ok ? undefined : true}
              />
              <span className="select-none px-3 font-mono text-muted-foreground" aria-hidden="true">
                /{flagsToString(flags)}
              </span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">Flags</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Regex flags">
              {REGEX_FLAGS.map((flag) => {
                const active = flags.includes(flag.id);
                return (
                  <button
                    key={flag.id}
                    type="button"
                    onClick={() => toggleFlag(flag.id)}
                    aria-pressed={active}
                    title={flag.description}
                    className={cn(
                      "min-h-11 min-w-11 rounded-lg border px-3 font-mono text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-[var(--hairline)] bg-surface-soft text-ink hover:border-primary/40",
                    )}
                  >
                    {flag.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Common patterns</p>
          <div className="flex flex-wrap gap-2">
            {REGEX_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="min-h-10 rounded-lg border border-[var(--hairline)] bg-surface-soft px-3 text-sm text-ink transition-colors hover:border-primary/40"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {!result.ok ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
            Invalid regex: {result.error}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <div>
            <Label htmlFor="re-sample">Test string</Label>
            <Textarea
              id="re-sample"
              value={sample}
              onChange={(event) => setSample(event.target.value)}
              placeholder="Enter test string..."
              className="mt-1 min-h-[180px] font-mono text-sm"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-semibold text-ink">Highlighted matches</h3>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {result.ok ? `${result.matches.length} match${result.matches.length === 1 ? "" : "es"}` : "—"}
            </span>
          </div>

          <div
            className="min-h-[180px] whitespace-pre-wrap break-words rounded-lg border border-[var(--hairline)] bg-surface-soft p-3 font-mono text-sm leading-relaxed text-[var(--body)]"
            aria-live="polite"
          >
            {!sample ? (
              <span className="text-muted-foreground">Matched text will appear highlighted here.</span>
            ) : !result.ok ? (
              <span className="text-muted-foreground">Fix the pattern to preview highlights.</span>
            ) : segments.length ? (
              segments.map((segment, index) =>
                segment.matched ? (
                  <mark
                    key={`${index}-${segment.matchIndex}`}
                    className="rounded bg-primary/25 px-0.5 text-ink"
                  >
                    {segment.text}
                  </mark>
                ) : (
                  <span key={`${index}-plain`}>{segment.text}</span>
                ),
              )
            ) : (
              <span>{sample}</span>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5" aria-live="polite">
        <h3 className="font-display text-lg font-semibold text-ink">
          Matches {result.ok ? `(${result.matches.length})` : ""}
        </h3>

        {!result.ok ? (
          <p className="mt-3 text-sm text-muted-foreground">No match list while the pattern is invalid.</p>
        ) : result.matches.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No matches.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {result.matches.map((match, index) => (
              <li
                key={`${match.index}-${index}-${match.text}`}
                className="rounded-xl border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Match {index + 1}
                </p>
                <p className="mt-1 text-[var(--body)]">
                  Index: <span className="font-mono tabular-nums text-ink">{match.index}</span>
                </p>
                <p className="mt-1 text-[var(--body)]">
                  Match: <span className="font-mono text-ink">&quot;{match.text}&quot;</span>
                </p>
                {match.groups.length ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Groups:{" "}
                    <span className="font-mono text-[var(--body)]">
                      {match.groups.map((group, groupIndex) => `$${groupIndex + 1}=${JSON.stringify(group)}`).join(" · ")}
                    </span>
                  </p>
                ) : null}
                {Object.keys(match.namedGroups).length ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Named:{" "}
                    <span className="font-mono text-[var(--body)]">
                      {Object.entries(match.namedGroups)
                        .map(([name, value]) => `${name}=${JSON.stringify(value)}`)
                        .join(" · ")}
                    </span>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
