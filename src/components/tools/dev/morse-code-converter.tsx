"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MORSE_ALPHABET,
  convertMorse,
  type MorseMode,
} from "@/lib/morse/convert";
import { cn } from "@/lib/utils";

export function MorseCodeConverterTool() {
  const [mode, setMode] = useState<MorseMode>("encode");
  const [input, setInput] = useState("");
  const [showAlphabet, setShowAlphabet] = useState(false);

  const output = useMemo(() => convertMorse(input, mode), [input, mode]);

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied!");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Conversion mode">
        {(
          [
            { value: "encode", label: "Text to Morse" },
            { value: "decode", label: "Morse to Text" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMode(option.value)}
            className={cn(
              "rounded-xl px-5 py-2 text-sm font-medium transition-colors",
              mode === option.value
                ? "bg-coral text-white"
                : "border border-[var(--hairline)] bg-surface-card text-ink hover:border-coral/40",
            )}
            aria-pressed={mode === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={mode === "encode" ? "Type text..." : "Paste Morse code (dots and dashes)..."}
          aria-label={mode === "encode" ? "Text input" : "Morse code input"}
          className="min-h-40 font-mono text-sm"
        />
        <Textarea
          readOnly
          value={output}
          placeholder="Output..."
          aria-label="Converted output"
          className="min-h-40 bg-surface-soft font-mono text-sm"
        />
      </div>

      <Button type="button" onClick={copyOutput} disabled={!output} className="min-h-11 gap-2 px-5">
        <Copy className="h-4 w-4" aria-hidden />
        Copy Output
      </Button>

      <div>
        <button
          type="button"
          onClick={() => setShowAlphabet((open) => !open)}
          className="flex w-full items-center justify-between rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3 text-sm font-medium text-ink"
          aria-expanded={showAlphabet}
        >
          Morse Alphabet Reference
          <ChevronDown className={cn("h-4 w-4 transition-transform", showAlphabet && "rotate-180")} aria-hidden />
        </button>

        {showAlphabet ? (
          <div className="mt-2 overflow-x-auto rounded-xl border border-[var(--hairline)] bg-surface-card p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Char</th>
                  <th className="pb-2 font-medium">Code</th>
                </tr>
              </thead>
              <tbody>
                {MORSE_ALPHABET.map((row) => (
                  <tr key={row.char} className="border-t border-[var(--hairline)]">
                    <td className="py-1.5 font-mono text-ink">{row.char}</td>
                    <td className="py-1.5 font-mono text-coral">{row.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
