"use client";

import { useMemo, useState } from "react";
import { AlignLeft, Copy, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { processSql, type SqlToolMode } from "@/lib/sql/format";
import { cn } from "@/lib/utils";

export function SqlFormatterTool() {
  const [mode, setMode] = useState<SqlToolMode>("format");
  const [input, setInput] = useState("");

  const output = useMemo(() => processSql(input, mode), [input, mode]);

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
      <div className="flex flex-wrap gap-2" role="group" aria-label="SQL tool mode">
        {(
          [
            { value: "format", label: "format", icon: AlignLeft },
            { value: "minify", label: "minify", icon: Minimize2 },
          ] as const
        ).map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors",
                mode === option.value
                  ? "border-coral bg-coral/10 text-coral"
                  : "border-[var(--hairline)] text-muted-foreground hover:border-coral/40 hover:text-ink",
              )}
              aria-pressed={mode === option.value}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <div className="flex min-w-0 flex-col">
          <div className="mb-2 flex h-8 items-center justify-between gap-3">
            <Label htmlFor="sql-input">Input SQL</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-muted-foreground"
              onClick={() => setInput("")}
              disabled={!input}
            >
              Clear
            </Button>
          </div>
          <Textarea
            id="sql-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={16}
            spellCheck={false}
            placeholder="SELECT id, name FROM users WHERE active = 1 ORDER BY created_at DESC;"
            className="min-h-[20rem] flex-1 font-mono text-sm"
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="mb-2 flex h-8 items-center justify-between gap-3">
            <Label htmlFor="sql-output">Output</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={copyOutput}
              disabled={!output}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Copy
            </Button>
          </div>
          <Textarea
            id="sql-output"
            readOnly
            value={output}
            rows={16}
            spellCheck={false}
            placeholder="Formatted SQL appears here..."
            className="min-h-[20rem] flex-1 bg-surface-soft font-mono text-sm"
            aria-live="polite"
          />
        </div>
      </div>
    </div>
  );
}
