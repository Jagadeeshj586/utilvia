"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function tryParse(input: string) {
  try {
    return { ok: true as const, value: JSON.parse(input) as unknown };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Invalid JSON" };
  }
}

function TreeView({ data, name = "root" }: { data: unknown; name?: string }) {
  if (data !== null && typeof data === "object") {
    const entries = Array.isArray(data) ? data.map((value, i) => [String(i), value]) : Object.entries(data);
    return (
      <details open className="ml-3">
        <summary className="cursor-pointer text-sm">
          <span className="font-medium text-primary">{name}</span>
          <span className="text-muted-foreground"> {Array.isArray(data) ? `Array(${data.length})` : "Object"}</span>
        </summary>
        {entries.map(([key, value]) => (
          <TreeView key={key} name={String(key)} data={value} />
        ))}
      </details>
    );
  }

  return (
    <div className="ml-3 text-sm">
      <span className="font-medium text-[var(--accent-teal)]">{name}: </span>
      <span className="font-mono text-muted-foreground">{JSON.stringify(data)}</span>
    </div>
  );
}

export function JsonFormatter() {
  const [input, setInput] = useState('{\n  "hello": "utilvia",\n  "local": true\n}\n');
  const parsed = useMemo(() => tryParse(input), [input]);

  const format = (space: number | null) => {
    if (!parsed.ok) {
      toast.error(parsed.error);
      return;
    }
    setInput(JSON.stringify(parsed.value, null, space ?? undefined) + "\n");
    toast.success(space ? "Formatted" : "Minified");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => format(2)}>Format</Button>
        <Button variant="outline" onClick={() => format(null)}>
          Minify
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await navigator.clipboard.writeText(input);
            toast.success("Copied");
          }}
        >
          Copy
        </Button>
        <Button variant="ghost" onClick={() => setInput("")}>
          Reset
        </Button>
      </div>
      {!parsed.ok ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {parsed.error}
        </p>
      ) : (
        <p className="text-sm text-[var(--success)]">Valid JSON</p>
      )}
      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="tree" disabled={!parsed.ok}>
            Tree
          </TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-[360px] font-mono text-[13px] leading-6"
            spellCheck={false}
          />
        </TabsContent>
        <TabsContent value="tree">
          <div className="max-h-[360px] overflow-auto rounded-lg border border-[var(--hairline)] bg-surface-soft p-3 font-mono">
            {parsed.ok ? <TreeView data={parsed.value} /> : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
