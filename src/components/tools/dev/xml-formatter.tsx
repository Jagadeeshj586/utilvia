"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { processXml, type XmlToolMode } from "@/lib/xml/format";
import { cn } from "@/lib/utils";

const MODES: Array<{ value: XmlToolMode; label: string }> = [
  { value: "format", label: "format" },
  { value: "minify", label: "minify" },
  { value: "validate", label: "validate" },
];

export function XmlFormatterTool() {
  const [mode, setMode] = useState<XmlToolMode>("format");
  const [input, setInput] = useState("");

  const { output, error, isValid } = useMemo(() => processXml(input, mode), [input, mode]);
  const showValidBanner = mode === "validate" && Boolean(input.trim()) && isValid;

  const copyOutput = async () => {
    if (!output || mode === "validate") return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied!");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="XML tool mode">
        {MODES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMode(option.value)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium capitalize transition-colors",
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
          placeholder="<root>...</root>"
          aria-label="XML input"
          className="min-h-56 font-mono text-xs sm:text-sm"
        />
        <Textarea
          readOnly
          value={output}
          placeholder="Output..."
          aria-label="XML output"
          className="min-h-56 bg-surface-soft font-mono text-xs sm:text-sm"
        />
      </div>

      {error ? (
        <div
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}

      {showValidBanner ? (
        <div
          className="flex items-center gap-2 rounded-xl border border-teal/30 bg-teal/10 p-4 text-sm text-teal"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Valid XML
        </div>
      ) : null}

      {mode !== "validate" ? (
        <Button type="button" onClick={copyOutput} disabled={!output} className="min-h-11 gap-2 px-5">
          <Copy className="h-4 w-4" aria-hidden />
          Copy Output
        </Button>
      ) : null}
    </div>
  );
}
