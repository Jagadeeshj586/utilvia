"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const encode = () => {
    try {
      setError(null);
      setOutput(btoa(unescape(encodeURIComponent(input))));
    } catch {
      setError("Could not encode that text.");
    }
  };

  const decode = () => {
    try {
      setError(null);
      setOutput(decodeURIComponent(escape(atob(input))));
    } catch {
      setError("That is not valid Base64. Check padding and characters.");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor="b64-in">Input</Label>
        <Textarea id="b64-in" value={input} onChange={(e) => setInput(e.target.value)} className="mt-2 min-h-[220px] font-mono text-sm" />
      </div>
      <div>
        <Label htmlFor="b64-out">Output</Label>
        <Textarea id="b64-out" readOnly value={output} className="mt-2 min-h-[220px] font-mono text-sm" />
      </div>
      {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
      <div className="flex flex-wrap gap-2 md:col-span-2">
        <Button type="button" onClick={encode}>
          Encode
        </Button>
        <Button type="button" variant="outline" onClick={decode}>
          Decode
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            await navigator.clipboard.writeText(output);
            toast.success("Copied");
          }}
        >
          Copy
        </Button>
        <Button type="button" variant="ghost" onClick={() => { setInput(""); setOutput(""); setError(null); }}>
          Clear
        </Button>
      </div>
    </div>
  );
}
