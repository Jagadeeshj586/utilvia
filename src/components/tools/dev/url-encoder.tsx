"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  convertUrl,
  DEFAULT_URL_INPUT,
  URL_ENCODE_EXAMPLES,
  type UrlDirection,
  type UrlEncodeMode,
} from "@/lib/url/encode";
import { copyText } from "@/lib/security/clipboard";

export function UrlEncoderTool() {
  const [input, setInput] = useState(DEFAULT_URL_INPUT);
  const [direction, setDirection] = useState<UrlDirection>("encode");
  const [mode, setMode] = useState<UrlEncodeMode>("component");
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => convertUrl(input, direction, mode), [direction, input, mode]);

  const onCopy = async () => {
    if (!output) return;
    const ok = await copyText(output);
    if (ok) {
      setCopied(true);
      toast.success("Output copied");
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Could not copy output");
    }
  };

  const onSwap = () => {
    if (!output) return;
    setInput(output);
    setDirection((current) => (current === "encode" ? "decode" : "encode"));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={direction} onValueChange={(value) => setDirection(value as UrlDirection)}>
          <TabsList>
            <TabsTrigger value="encode">Encode</TabsTrigger>
            <TabsTrigger value="decode">Decode</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={mode} onValueChange={(value) => setMode(value as UrlEncodeMode)}>
          <TabsList>
            <TabsTrigger value="component">Component</TabsTrigger>
            <TabsTrigger value="full">Full URI</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void onCopy()} disabled={!output}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? "Copied!" : "Copy Output"}
        </Button>
        <Button type="button" variant="outline" onClick={onSwap} disabled={!output}>
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Swap
        </Button>
        <Button type="button" variant="outline" onClick={() => setInput("")}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="url-input">Input</Label>
          <Textarea
            id="url-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            className="mt-2 min-h-[220px] font-mono text-sm leading-relaxed"
          />
        </div>
        <div>
          <Label htmlFor="url-output">Output</Label>
          <Textarea id="url-output" readOnly value={output} className="mt-2 min-h-[220px] font-mono text-sm leading-relaxed" />
        </div>
      </div>

      <section>
        <h3 className="text-sm font-medium text-ink">Examples</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {URL_ENCODE_EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              className="rounded-full border border-[var(--hairline)] bg-surface-soft px-3 py-1.5 font-mono text-xs text-[var(--body)] transition-colors hover:border-primary/40 hover:text-primary"
              onClick={() => {
                setDirection("encode");
                setMode("component");
                setInput(example.from);
              }}
            >
              {example.label} → {example.to}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
