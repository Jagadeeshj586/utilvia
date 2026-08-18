"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CaseConverter } from "@/components/tools/text/case-converter";
import { CharacterCounter } from "@/components/tools/text/character-counter";
import { MarkdownTableGenerator } from "@/components/tools/text/markdown-table-generator";
import { MarkdownToHtmlTool } from "@/components/tools/text/markdown-to-html";
import { TextToSpeechTool } from "@/components/tools/text/text-to-speech";
import { TextDiffCheckerTool } from "@/components/tools/text/text-diff-checker";
import { WordCounter } from "@/components/tools/text/word-counter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { downloadText } from "@/lib/utils";

const LOREM = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
];

async function copyText(text: string, label = "Copied") {
  await navigator.clipboard.writeText(text);
  toast.success(label);
}

function MissingTool({ slug }: { slug: string }) {
  return (
    <p className="rounded-lg border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-8 text-center text-sm text-muted-foreground">
      No workspace for “{slug}” yet.
    </p>
  );
}

function LoremIpsumGenerator() {
  const [count, setCount] = useState(3);
  const [mode, setMode] = useState<"paragraphs" | "sentences" | "words" | "list">("paragraphs");
  const [startClassic, setStartClassic] = useState(true);
  const text = useMemo(() => {
    const n = Math.min(100, Math.max(1, Math.round(count) || 1));
    const sentences = LOREM.flatMap((para) => para.split(/(?<=\.)\s+/).filter(Boolean));
    const words = LOREM.join(" ").split(/\s+/);
    if (mode === "paragraphs") {
      const body = Array.from({ length: n }, (_, i) => LOREM[i % LOREM.length]);
      if (startClassic) body[0] = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${body[0]}`;
      return body.join("\n\n");
    }
    if (mode === "sentences") {
      const body = Array.from({ length: n }, (_, i) => sentences[i % sentences.length]);
      return body.join(" ");
    }
    if (mode === "list") {
      return Array.from({ length: n }, (_, i) => `- ${sentences[i % sentences.length]}`).join("\n");
    }
    return Array.from({ length: n }, (_, i) => words[i % words.length]).join(" ");
  }, [count, mode, startClassic]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Lorem output type">
        {(["paragraphs", "sentences", "words", "list"] as const).map((item) => (
          <Button key={item} type="button" size="sm" variant={mode === item ? "default" : "outline"} onClick={() => setMode(item)}>
            {item[0].toUpperCase() + item.slice(1)}
          </Button>
        ))}
      </div>
      <div className="grid max-w-xl gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="lorem-count">{mode[0].toUpperCase() + mode.slice(1)}</Label>
          <Input
            id="lorem-count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <label className="mt-7 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={startClassic} onChange={(e) => setStartClassic(e.target.checked)} />
          Start with “Lorem ipsum…”
        </label>
      </div>
      <Textarea readOnly value={text} className="min-h-[280px]" />
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => copyText(text)}>
          Copy
        </Button>
        <Button type="button" variant="outline" onClick={() => downloadText(text, "lorem-ipsum.txt")}>
          Download
        </Button>
      </div>
    </div>
  );
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "had", "has", "have", "he", "her", "his", "i",
  "in", "is", "it", "its", "of", "on", "or", "that", "the", "their", "them", "there", "these", "they", "this", "to",
  "was", "we", "were", "what", "when", "where", "which", "who", "will", "with", "you", "your",
]);

function KeywordDensity() {
  const [text, setText] = useState("");
  const [excludeStop, setExcludeStop] = useState(true);

  const stats = useMemo(() => {
    const words = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s'-]+/gu, " ")
      .split(/\s+/)
      .map((word) => word.replace(/^'+|'+$/g, ""))
      .filter(Boolean);
    const filtered = excludeStop ? words.filter((word) => !STOP_WORDS.has(word) && word.length > 1) : words;
    const counts = new Map<string, number>();
    for (const word of filtered) counts.set(word, (counts.get(word) ?? 0) + 1);
    const totalWords = words.length;
    const uniqueWords = new Set(filtered).size;
    const topKeywords = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 20)
      .map(([word, count]) => ({
        word,
        count,
        density: totalWords ? (count / totalWords) * 100 : 0,
      }));
    return { totalWords, uniqueWords, topKeywords };
  }, [excludeStop, text]);

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Paste your content here..."
        className="min-h-[220px]"
      />
      <label className="flex items-center justify-between gap-3 rounded-md border border-[var(--hairline)] px-3 py-2">
        <span className="text-sm">Exclude common words</span>
        <Switch checked={excludeStop} onCheckedChange={setExcludeStop} />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
          <p className="text-sm text-[var(--muted-ink)]">Total Words</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{stats.totalWords}</p>
        </div>
        <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
          <p className="text-sm text-[var(--muted-ink)]">Unique Words</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{stats.uniqueWords}</p>
        </div>
        <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
          <p className="text-sm text-[var(--muted-ink)]">Top Keywords</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{stats.topKeywords.length}</p>
        </div>
      </div>
      {stats.topKeywords.length ? (
        <div className="overflow-x-auto rounded-lg border border-[var(--hairline)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--hairline)] bg-surface-soft text-[var(--muted-ink)]">
              <tr>
                <th className="px-3 py-2 font-medium">Keyword</th>
                <th className="px-3 py-2 font-medium">Count</th>
                <th className="px-3 py-2 font-medium">Density</th>
              </tr>
            </thead>
            <tbody>
              {stats.topKeywords.map((item) => (
                <tr key={item.word} className="border-b border-[var(--hairline)] last:border-0">
                  <td className="px-3 py-2 font-medium text-ink">{item.word}</td>
                  <td className="px-3 py-2 tabular-nums">{item.count}</td>
                  <td className="px-3 py-2 tabular-nums">{item.density.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export function TextRouter({ slug }: { slug: string }) {
  switch (slug) {
    case "word-counter":
      return <WordCounter />;
    case "character-counter":
      return <CharacterCounter />;
    case "case-converter":
      return <CaseConverter />;
    case "lorem-ipsum-generator":
      return <LoremIpsumGenerator />;
    case "text-diff-checker":
      return <TextDiffCheckerTool />;
    case "markdown-to-html":
      return <MarkdownToHtmlTool />;
    case "markdown-table-generator":
      return <MarkdownTableGenerator />;
    case "text-to-speech":
      return <TextToSpeechTool />;
    case "keyword-density":
      return <KeywordDensity />;
    default:
      return <MissingTool slug={slug} />;
  }
}
