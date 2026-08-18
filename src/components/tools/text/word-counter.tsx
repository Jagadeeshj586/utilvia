"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const STOP = new Set([
  "a", "an", "the", "and", "or", "but", "if", "in", "on", "at", "to", "for", "of", "with", "by", "from", "as", "is", "are", "was", "were", "be", "been", "it", "this", "that", "these", "those", "i", "you", "he", "she", "we", "they", "my", "your", "our", "their",
]);

const PLATFORMS = [
  { name: "Twitter/X post", limit: 280 },
  { name: "LinkedIn post", limit: 3000 },
  { name: "Meta description", limit: 160 },
  { name: "Instagram caption", limit: 2200 },
  { name: "SMS", limit: 160 },
];

const ABBREV = /\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e|U\.S|U\.K)\./gi;

function timeLabel(words: number, wpm: number) {
  if (words === 0) return "0 min";
  if (words < wpm) return "< 1 min";
  const mins = Math.ceil(words / wpm);
  return mins === 1 ? "1 min" : `${mins} min`;
}

function countSentences(text: string) {
  if (!text.trim()) return 0;
  const normalized = text.replace(/\.{3,}/g, "…").replace(ABBREV, (match) => match.replace(".", "\0"));
  return normalized
    .split(/[.!?]+/)
    .map((part) => part.replace(/\u0000/g, ".").trim())
    .filter(Boolean).length;
}

function topKeywords(text: string, words: number) {
  const counts = new Map<string, number>();
  for (const raw of text.toLowerCase().match(/[a-z0-9']+/gi) ?? []) {
    if (raw.length < 2 || STOP.has(raw)) continue;
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([word, count]) => ({ word, count, percent: words > 0 ? (count / words) * 100 : 0 }));
}

export function WordCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const charactersWithSpaces = text.length;
    const charactersWithoutSpaces = text.replace(/\s/g, "").length;
    if (!trimmed) {
      return {
        words: 0,
        charactersWithSpaces,
        charactersWithoutSpaces,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        readingTime: "0 min",
        speakingTime: "0 min",
        keywords: [] as Array<{ word: string; count: number; percent: number }>,
      };
    }
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    return {
      words,
      charactersWithSpaces,
      charactersWithoutSpaces,
      sentences: countSentences(text),
      paragraphs: text.trim() ? text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).length : 0,
      lines: text ? text.split(/\r?\n/).length : 0,
      readingTime: timeLabel(words, 200),
      speakingTime: timeLabel(words, 130),
      keywords: topKeywords(text, words),
    };
  }, [text]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Words", stats.words.toLocaleString("en-IN")],
          ["Characters (with spaces)", stats.charactersWithSpaces.toLocaleString("en-IN")],
          ["Characters (no spaces)", stats.charactersWithoutSpaces.toLocaleString("en-IN")],
          ["Sentences", stats.sentences.toLocaleString("en-IN")],
          ["Paragraphs", stats.paragraphs.toLocaleString("en-IN")],
          ["Lines", stats.lines.toLocaleString("en-IN")],
          ["Reading time", stats.readingTime],
          ["Speaking time", stats.speakingTime],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Start typing or paste your text here..."
        className="min-h-[280px] font-mono text-[13px] leading-6"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={async () => {
            if (!text) return;
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success("Copied!");
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? "Copied!" : "Copy text"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setText("")}>
          Clear
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--hairline)]">
          <p className="border-b border-[var(--hairline)] px-4 py-3 text-sm font-semibold">Top keywords</p>
          {stats.keywords.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[var(--muted-ink)]">Top keywords appear here once you add text.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-[var(--muted-ink)]">
                <tr>
                  <th className="px-4 py-2 font-medium">Word</th>
                  <th className="px-4 py-2 font-medium">Count</th>
                  <th className="px-4 py-2 font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {stats.keywords.map((item) => (
                  <tr key={item.word} className="border-t border-[var(--hairline)]">
                    <td className="px-4 py-2">{item.word}</td>
                    <td className="px-4 py-2 tabular-nums">{item.count}</td>
                    <td className="px-4 py-2 tabular-nums">{item.percent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="rounded-lg border border-[var(--hairline)]">
          <p className="border-b border-[var(--hairline)] px-4 py-3 text-sm font-semibold">Platform limits</p>
          <div className="divide-y divide-[var(--hairline)]">
            {PLATFORMS.map((platform) => {
              const percent = Math.min(100, Math.round((stats.charactersWithSpaces / platform.limit) * 100));
              const over = stats.charactersWithSpaces > platform.limit;
              return (
                <div key={platform.name} className="px-4 py-3">
                  <div className="flex justify-between text-sm">
                    <span>{platform.name}</span>
                    <span className={over ? "text-destructive" : "text-[var(--muted-ink)]"}>
                      {stats.charactersWithSpaces.toLocaleString("en-IN")} / {platform.limit.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-soft">
                    <div className={`h-full ${over ? "bg-destructive" : "bg-primary"}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
