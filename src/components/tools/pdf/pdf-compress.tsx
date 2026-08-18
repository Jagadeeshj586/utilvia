"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Dropzone } from "@/components/tools/dropzone";
import { Button } from "@/components/ui/button";
import { COMPRESS_LEVELS, compressPdfFile, type CompressLevel } from "@/lib/pdf/compress";
import { cn, downloadBlob, formatBytes, uint8ToBlob } from "@/lib/utils";

export function PdfCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressLevel>("medium");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [output, setOutput] = useState<Uint8Array | null>(null);

  const savedPct = useMemo(() => {
    if (!file || !output || file.size <= 0) return null;
    return Math.max(0, Math.round((1 - output.byteLength / file.size) * 100));
  }, [file, output]);

  const reset = () => {
    setFile(null);
    setOutput(null);
    setProgress(null);
  };

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    setOutput(null);
    setProgress({ current: 0, total: 1 });
    try {
      const bytes = await compressPdfFile(file, level, (current, total) => setProgress({ current, total }));
      setOutput(bytes);
      const base = file.name.replace(/\.pdf$/i, "") || "document";
      downloadBlob(uint8ToBlob(bytes, "application/pdf"), `compressed_${base}.pdf`);
      const pct = Math.max(0, Math.round((1 - bytes.byteLength / file.size) * 100));
      toast.success(pct > 0 ? `Downloaded - ${pct}% smaller` : "Downloaded compressed PDF");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not compress PDF");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <Dropzone
        accept="application/pdf"
        maxSizeMB={50}
        files={file ? [file] : []}
        onFiles={(files) => {
          setFile(files[0] ?? null);
          setOutput(null);
          setProgress(null);
        }}
        onRemove={reset}
        label="Drop your PDF here"
        hint="or click to browse - max 50MB"
      />

      <div>
        <p className="mb-2 text-[14px] font-medium text-ink">Choose compression</p>
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Compression level">
          {COMPRESS_LEVELS.map((item) => {
            const selected = level === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={busy}
                onClick={() => {
                  setLevel(item.id);
                  setOutput(null);
                }}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left transition-colors duration-150",
                  selected
                    ? "border-primary bg-surface-soft text-ink"
                    : "border-[var(--hairline)] bg-canvas text-[var(--body)] hover:border-primary/50",
                )}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="text-[14px] font-semibold tracking-[-0.01em]">{item.label}</span>
                  {selected ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
                  ) : null}
                </span>
                <span className="mt-1 block pr-7 text-[12px] leading-snug text-[var(--muted-ink)]">{item.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={compress} disabled={!file || busy}>
        {busy
          ? progress && progress.total > 0 && progress.current > 0
            ? `Compressing page ${progress.current} of ${progress.total}…`
            : "Compressing…"
          : "Compress PDF"}
      </Button>

      {file ? (
        <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-3 text-[14px]">
          <p className="text-[var(--muted-ink)]">
            Original <span className="font-tabular font-medium text-ink">{formatBytes(file.size)}</span>
          </p>
          {output ? (
            <>
              <p className="mt-1 text-[var(--muted-ink)]">
                Compressed <span className="font-tabular font-medium text-ink">{formatBytes(output.byteLength)}</span>
              </p>
              <p className="mt-1 font-medium text-ink">
                {savedPct && savedPct > 0 ? `${savedPct}% smaller` : "Already compact - little extra could be removed"}
              </p>
            </>
          ) : (
            <p className="mt-1 text-[13px] text-[var(--muted-ink)]">
              Pick Low, Medium, or High, then compress. The file downloads automatically.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
