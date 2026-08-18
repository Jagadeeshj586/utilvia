"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_SVG,
  PREVIEW_BACKGROUNDS,
  looksLikeSvg,
  prettifySvg,
  previewDocument,
  sanitizeSvg,
  type PreviewBackground,
} from "@/lib/svg-preview/svg";
import { copyText } from "@/lib/security/clipboard";
import { cn, downloadText } from "@/lib/utils";

export function SvgCodePreviewer() {
  const [svg, setSvg] = useState(DEFAULT_SVG);
  const [background, setBackground] = useState<PreviewBackground>("checker");
  const [copied, setCopied] = useState(false);

  const sanitized = useMemo(() => sanitizeSvg(svg), [svg]);
  const hasSvg = looksLikeSvg(svg);
  const srcDoc = useMemo(() => previewDocument(sanitized, background), [background, sanitized]);

  const copy = async () => {
    const ok = await copyText(svg);
    if (!ok) {
      toast.error("Could not copy SVG");
      return;
    }
    setCopied(true);
    toast.success("SVG copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    if (!svg.trim()) {
      toast.error("Paste SVG markup first.");
      return;
    }
    downloadText(svg, "preview.svg", "image/svg+xml");
    toast.success("Download started");
  };

  const prettify = () => {
    const result = prettifySvg(svg);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSvg(result.value);
    toast.success("Prettified");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="min-h-10" onClick={() => void copy()}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button type="button" variant="outline" className="min-h-10" onClick={download}>
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button type="button" variant="outline" className="min-h-10" onClick={prettify}>
            <WandSparkles className="h-4 w-4" />
            Prettify
          </Button>
          <Button type="button" variant="outline" className="min-h-10" onClick={() => setSvg(DEFAULT_SVG)}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Preview background">
          {PREVIEW_BACKGROUNDS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={background === item.id}
              onClick={() => setBackground(item.id)}
              className={cn(
                "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                background === item.id
                  ? "border-coral bg-coral text-white"
                  : "border-[var(--hairline)] bg-canvas text-ink hover:border-primary/40",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="svg-code">SVG code</Label>
          <Textarea
            id="svg-code"
            value={svg}
            onChange={(event) => setSvg(event.target.value)}
            spellCheck={false}
            className="mt-2 min-h-[320px] font-mono text-xs sm:min-h-[420px]"
            placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...>'
          />
        </div>
        <div>
          <Label>Preview</Label>
          <div className="mt-2 overflow-hidden rounded-xl border border-[var(--hairline)]">
            {svg.trim() && hasSvg && sanitized.trim() ? (
              <iframe
                title="SVG preview"
                sandbox=""
                srcDoc={srcDoc}
                key={srcDoc}
                className="h-[320px] w-full sm:h-[420px]"
              />
            ) : (
              <div className="flex h-[320px] items-center justify-center bg-surface-soft px-6 text-center text-sm text-[var(--muted-ink)] sm:h-[420px]">
                {svg.trim()
                  ? "Markup should include an <svg> root. Scripts and event handlers are stripped before preview."
                  : "Paste SVG markup to see a live preview."}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-[var(--muted-ink)]">
            Preview is sanitized: script tags, event handlers, and javascript: URLs are removed.
          </p>
        </div>
      </div>
    </div>
  );
}
