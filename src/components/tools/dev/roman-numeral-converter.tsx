"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ROMAN_MAX,
  ROMAN_MIN,
  ROMAN_REFERENCE,
  convertRomanInput,
  type RomanMode,
} from "@/lib/roman/convert";
import { cn } from "@/lib/utils";

const MODES: Array<{ value: RomanMode; label: string }> = [
  { value: "to-roman", label: "Number → Roman" },
  { value: "to-number", label: "Roman → Number" },
];

export function RomanNumeralConverterTool() {
  const [mode, setMode] = useState<RomanMode>("to-roman");
  const [input, setInput] = useState("2026");
  const [showReference, setShowReference] = useState(false);

  const result = useMemo(() => convertRomanInput(input, mode), [input, mode]);

  const switchMode = (next: RomanMode) => {
    if (next === mode) return;
    if (result.ok && result.value) {
      setInput(result.value);
    }
    setMode(next);
  };

  const copyResult = async () => {
    if (!result.ok || !result.value) return;
    try {
      await navigator.clipboard.writeText(result.value);
      toast.success("Copied!");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Conversion mode">
        {MODES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => switchMode(option.value)}
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

      <div className="space-y-2">
        <Label htmlFor="roman-input">
          {mode === "to-roman" ? `Number (${ROMAN_MIN}–${ROMAN_MAX})` : "Roman numeral"}
        </Label>
        <Input
          id="roman-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={mode === "to-roman" ? "e.g. 2026" : "e.g. MMXXVI"}
          inputMode={mode === "to-roman" ? "numeric" : "text"}
          className={cn("text-base", mode === "to-number" && "font-mono uppercase tracking-wide")}
          autoCapitalize={mode === "to-number" ? "characters" : undefined}
          spellCheck={false}
        />
        {result.ok === false ? <p className="text-sm text-destructive">{result.error}</p> : null}
      </div>

      <div
        className="rounded-lg border border-[var(--hairline)] bg-canvas px-5 py-6 text-center sm:px-6"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-muted-foreground">Result</p>
        <p
          className={cn(
            "mt-2 break-all font-display text-[2.25rem] leading-none tracking-[-0.03em] text-ink sm:text-[2.75rem]",
            mode === "to-roman" && "font-mono tracking-wide",
          )}
        >
          {result.ok && result.value ? result.value : "—"}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5 gap-2"
          onClick={copyResult}
          disabled={!result.ok || !result.value}
        >
          <Copy className="h-4 w-4" aria-hidden />
          Copy result
        </Button>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowReference((open) => !open)}
          className="flex w-full items-center justify-between rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3 text-sm font-medium text-ink"
          aria-expanded={showReference}
        >
          Roman numeral reference
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", showReference && "rotate-180")}
            aria-hidden
          />
        </button>

        {showReference ? (
          <div className="mt-2 overflow-x-auto rounded-xl border border-[var(--hairline)] bg-surface-card p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Number</th>
                  <th className="pb-2 font-medium">Roman</th>
                </tr>
              </thead>
              <tbody>
                {ROMAN_REFERENCE.map((row) => (
                  <tr key={row.arabic} className="border-t border-[var(--hairline)]">
                    <td className="py-2 tabular-nums text-ink">{row.arabic}</td>
                    <td className="py-2 font-mono text-ink">{row.roman}</td>
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
