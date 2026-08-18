"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { countCharacters } from "@/lib/text/character-count";

const STAT_LABELS = [
  ["Characters", "characters"],
  ["No Spaces", "noSpaces"],
  ["Words", "words"],
  ["Sentences", "sentences"],
  ["Paragraphs", "paragraphs"],
] as const;

export function CharacterCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => countCharacters(text), [text]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STAT_LABELS.map(([label, key]) => (
          <div key={key} className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-4 text-center">
            <p className="text-2xl font-semibold tabular-nums text-ink" aria-live="polite">
              {stats[key].toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="character-counter-text" className="sr-only">
          Text to count characters
        </label>
        <Textarea
          id="character-counter-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Start typing or paste your text here..."
          className="min-h-[280px] text-base leading-relaxed"
          aria-label="Text to count characters"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={!text} onClick={() => setText("")}>
          Clear
        </Button>
      </div>
    </div>
  );
}
