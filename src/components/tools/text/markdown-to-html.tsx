"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMarkdownConverter } from "@/hooks/use-markdown-converter";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

const previewClassName =
  "min-h-[360px] max-w-none text-sm leading-relaxed text-[var(--body)] [&_a]:text-primary [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--hairline)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-canvas [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mb-3 [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_hr]:my-4 [&_li]:ml-5 [&_li]:list-disc [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-canvas [&_pre]:p-3 [&_ul]:my-2";

export function MarkdownToHtmlTool() {
  const { markdown, setMarkdown, html, previewHtml, previewText, stats, error } = useMarkdownConverter();
  const [outputTab, setOutputTab] = useState<"preview" | "html">("preview");
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  const statsLabel = useMemo(
    () => `${stats.words.toLocaleString()} ${stats.words === 1 ? "word" : "words"} · ${stats.lines.toLocaleString()} ${stats.lines === 1 ? "line" : "lines"}`,
    [stats.lines, stats.words],
  );

  const onCopyHtml = async () => {
    if (!html) return;
    const ok = await copyText(html);
    if (ok) {
      setCopiedHtml(true);
      toast.success("HTML copied");
      window.setTimeout(() => setCopiedHtml(false), 2000);
    } else {
      toast.error("Could not copy HTML");
    }
  };

  const onCopyPreview = async () => {
    if (!previewText) return;
    const ok = await copyText(previewText);
    if (ok) {
      setCopiedPreview(true);
      toast.success("Preview text copied");
      window.setTimeout(() => setCopiedPreview(false), 2000);
    } else {
      toast.error("Could not copy preview text");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void onCopyHtml()} disabled={!html}>
            {copiedHtml ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copiedHtml ? "Copied!" : "Copy HTML"}
          </Button>
          <Button type="button" variant="outline" onClick={() => void onCopyPreview()} disabled={!previewText}>
            {copiedPreview ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copiedPreview ? "Copied!" : "Copy Preview Text"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setMarkdown("")}>
            Clear
          </Button>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">{statsLabel}</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="markdown-input" className="text-sm font-medium text-ink">
            Markdown
          </Label>
          <Textarea
            id="markdown-input"
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            spellCheck={false}
            className="mt-2 min-h-[360px] font-mono text-sm leading-relaxed"
          />
        </div>

        <div>
          <Tabs value={outputTab} onValueChange={(value) => setOutputTab(value as "preview" | "html")}>
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-2">
              <div
                className={cn("overflow-auto rounded-lg border border-[var(--hairline)] bg-surface-soft p-4", previewClassName)}
                dangerouslySetInnerHTML={{
                  __html: previewHtml || "<p class='text-muted-foreground'>Preview will appear here.</p>",
                }}
              />
            </TabsContent>
            <TabsContent value="html" className="mt-2">
              <Textarea
                readOnly
                value={html}
                aria-label="Generated HTML"
                className="min-h-[360px] font-mono text-sm leading-relaxed"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
