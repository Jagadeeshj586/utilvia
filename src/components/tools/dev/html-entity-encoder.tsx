"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  COMMON_HTML_ENTITIES,
  convertHtmlEntities,
  type HtmlEntityMode,
} from "@/lib/html-entity/convert";
import { cn } from "@/lib/utils";

export function HtmlEntityEncoderTool() {
  const [mode, setMode] = useState<HtmlEntityMode>("encode");
  const [input, setInput] = useState("");

  const output = useMemo(() => convertHtmlEntities(input, mode), [input, mode]);

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Output copied.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Convert HTML entities</h2>
            <p className="mt-1 text-sm text-[var(--body)]">
              Encode special characters for safe HTML, or decode entities back to plain text.
            </p>
          </div>
          <div className="flex gap-2" role="group" aria-label="Conversion mode">
            {(["encode", "decode"] as const).map((option) => (
              <Button
                key={option}
                type="button"
                variant={mode === option ? "default" : "outline"}
                className="min-h-11 capitalize"
                aria-pressed={mode === option}
                onClick={() => setMode(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="html-entity-input">Input</Label>
            <Textarea
              id="html-entity-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                mode === "encode"
                  ? "Type text with <tags> & special chars..."
                  : "Paste HTML entities like &lt;div&gt;..."
              }
              className="mt-1 min-h-[200px] font-mono text-sm"
            />
          </div>
          <div>
            <Label htmlFor="html-entity-output">Output</Label>
            <Textarea
              id="html-entity-output"
              readOnly
              value={output}
              placeholder="Converted output appears here..."
              className="mt-1 min-h-[200px] font-mono text-sm"
              aria-live="polite"
            />
          </div>
        </div>

        <Button type="button" className="min-h-11" onClick={copyOutput} disabled={!output}>
          <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
          Copy Output
        </Button>
      </section>

      <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <h3 className="font-display text-lg font-semibold text-ink">Common HTML Entities</h3>
        <p className="mt-1 text-sm text-[var(--body)]">Quick reference for characters converted in encode mode.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--hairline)] text-muted-foreground">
                <th className="px-3 py-2 font-medium">Character</th>
                <th className="px-3 py-2 font-medium">Entity</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">Name</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_HTML_ENTITIES.map((row) => (
                <tr key={row.entity} className="border-b border-[var(--hairline)] last:border-0">
                  <td className="px-3 py-2.5 font-mono text-ink">{row.character}</td>
                  <td className="px-3 py-2.5 font-mono text-[var(--body)]">{row.entity}</td>
                  <td className={cn("hidden px-3 py-2.5 text-muted-foreground sm:table-cell")}>{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
