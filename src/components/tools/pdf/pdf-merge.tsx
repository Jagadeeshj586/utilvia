"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileText, Loader2, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { mergePdfFiles, validateMergeFiles } from "@/lib/pdf/merge";
import { cn, downloadBlob, formatBytes, uint8ToBlob } from "@/lib/utils";

type MergeResult = {
  blob: Blob;
  pageCount: number;
  size: number;
};

export function PdfMerge() {
  const inputRef = useRef<HTMLInputElement>(null);
  const addMoreRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MergeResult | null>(null);

  const resetResult = () => setResult(null);

  const ingest = (list: FileList | File[]) => {
    const { accepted, error: nextError } = validateMergeFiles(Array.from(list));
    if (nextError) setError(nextError);
    if (!accepted.length) return;
    setError(nextError);
    setResult(null);
    setFiles((current) => [...current, ...accepted]);
  };

  const remove = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
    resetResult();
    setError(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    setFiles((current) => {
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    resetResult();
  };

  const clear = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    if (addMoreRef.current) addMoreRef.current.value = "";
  };

  const merge = async () => {
    if (files.length < 2) return;
    setBusy(true);
    setError(null);
    resetResult();
    try {
      const { bytes, pageCount } = await mergePdfFiles(files);
      const blob = uint8ToBlob(bytes, "application/pdf");
      setResult({ blob, pageCount, size: blob.size });
      toast.success(`Merged ${pageCount} page${pageCount === 1 ? "" : "s"}`);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Merge failed. Please check your PDF files and try again.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result) return;
    downloadBlob(result.blob, `merged_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="sr-only"
        aria-label="Upload PDF files"
        onChange={(event) => {
          if (event.target.files?.length) ingest(event.target.files);
          event.target.value = "";
        }}
      />
      <input
        ref={addMoreRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="sr-only"
        aria-label="Add more PDF files"
        onChange={(event) => {
          if (event.target.files?.length) ingest(event.target.files);
          event.target.value = "";
        }}
      />

      {!files.length ? (
        <button
          type="button"
          aria-label="File upload area"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragOver(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            if (event.dataTransfer.files.length) ingest(event.dataTransfer.files);
          }}
          className={cn(
            "flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center transition-colors duration-150",
            dragOver ? "border-primary bg-surface-card" : "border-[var(--hairline)] bg-surface-soft",
          )}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--hairline)] bg-canvas text-ink">
            <Upload className="h-5 w-5" />
          </span>
          <span className="mt-3 block text-sm font-medium">Drop your PDF files here</span>
          <span className="mt-1 block text-xs text-[var(--muted-ink)]">or click to browse - multiple files, 50MB each</span>
        </button>
      ) : (
        <div className="space-y-3 rounded-lg border border-[var(--hairline)] bg-surface-card p-5">
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-[var(--muted-ink)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-soft text-primary">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{file.name}</span>
                  <span className="block text-xs text-[var(--muted-ink)]">{formatBytes(file.size)}</span>
                </span>
                <span className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-[var(--muted-ink)] transition-colors hover:bg-surface-soft hover:text-ink disabled:opacity-30"
                    aria-label={`Move ${file.name} up`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-[var(--muted-ink)] transition-colors hover:bg-surface-soft hover:text-ink disabled:opacity-30"
                    aria-label={`Move ${file.name} down`}
                    disabled={index === files.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-[var(--muted-ink)] transition-colors hover:bg-surface-soft hover:text-ink"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--muted-ink)]">Files will be merged in the order shown</p>
          <button
            type="button"
            onClick={() => addMoreRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[var(--hairline)] py-2.5 text-sm text-[var(--muted-ink)] transition-colors hover:border-primary hover:text-ink"
          >
            <Plus className="h-4 w-4" />
            Add more PDFs
          </button>
        </div>
      )}

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {files.length >= 2 && !result ? (
        <Button onClick={merge} disabled={busy} className="w-full">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Merging…
            </>
          ) : (
            `Merge ${files.length} PDFs`
          )}
        </Button>
      ) : null}

      {result ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
              <p className="text-sm text-[var(--muted-ink)]">Pages Merged</p>
              <p className="mt-1 text-xl font-semibold text-ink">
                {result.pageCount} page{result.pageCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
              <p className="text-sm text-[var(--muted-ink)]">Output Size</p>
              <p className="mt-1 text-xl font-semibold text-ink">{formatBytes(result.size)}</p>
            </div>
          </div>
          <Button onClick={download} className="w-full">
            Download Merged PDF
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--muted-ink)] transition-colors hover:text-ink"
            onClick={() => {
              clear();
              window.setTimeout(() => inputRef.current?.click(), 0);
            }}
          >
            Merge More
          </button>
        </div>
      ) : null}
    </div>
  );
}
