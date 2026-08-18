"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPTY_HASH_RESULTS,
  HASH_ALGORITHMS,
  hashFileBytes,
  hashText,
  type HashAlgorithm,
  type HashResults,
} from "@/lib/hash/generate";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

export function HashGeneratorTool() {
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [hashes, setHashes] = useState<HashResults>(EMPTY_HASH_RESULTS);
  const [copied, setCopied] = useState<HashAlgorithm | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fileName) return undefined;
    let cancelled = false;
    void hashText(input).then((result) => {
      if (!cancelled) setHashes(result);
    });
    return () => {
      cancelled = true;
    };
  }, [fileName, input]);

  const onCopy = async (algorithm: HashAlgorithm) => {
    const value = hashes[algorithm];
    if (!value) return;
    const ok = await copyText(value);
    if (ok) {
      setCopied(algorithm);
      toast.success(`${algorithm} copied`);
      window.setTimeout(() => setCopied(null), 2000);
    }
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    setFileName(file.name);
    setInput("");
    setHashes(await hashFileBytes(bytes));
    event.target.value = "";
  };

  const onClearFile = () => {
    setFileName(null);
    setHashes(EMPTY_HASH_RESULTS);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="hash-input">Enter text to hash</Label>
        <Textarea
          id="hash-input"
          value={input}
          onChange={(event) => {
            setFileName(null);
            setInput(event.target.value);
          }}
          placeholder="Enter text to hash..."
          disabled={Boolean(fileName)}
          className="mt-2 min-h-[140px] font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input ref={fileInputRef} type="file" className="hidden" onChange={onFileChange} />
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Or hash a file
        </Button>
        {fileName ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-full border border-[var(--hairline)] bg-surface-soft px-3 py-1 font-mono">{fileName}</span>
            <Button type="button" variant="ghost" size="sm" onClick={onClearFile}>
              Clear file
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {HASH_ALGORITHMS.map((algorithm) => (
          <div key={algorithm} className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-medium text-ink">{algorithm}</p>
              <Button type="button" variant="outline" size="sm" disabled={!hashes[algorithm]} onClick={() => void onCopy(algorithm)}>
                {copied === algorithm ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied === algorithm ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className={cn("break-all font-mono text-sm tabular-nums", hashes[algorithm] ? "text-ink" : "text-muted-foreground")}>
              {hashes[algorithm] || "—"}
            </p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        MD5 and SHA-1 are not recommended for security use. Use SHA-256 or SHA-512 for cryptographic purposes.
      </p>
    </div>
  );
}
