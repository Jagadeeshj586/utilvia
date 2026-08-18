"use client";

import { useRef, useState, type ReactNode } from "react";
import { FileText, Upload, X } from "lucide-react";
import { validatePdfFile } from "@/lib/pdf/common";
import { cn, formatBytes } from "@/lib/utils";

type PdfFileDropProps = {
  file: File | null;
  onFile: (file: File | null) => void;
  error?: string | null;
  onError?: (error: string | null) => void;
  label?: string;
  hint?: string;
  meta?: ReactNode;
};

export function PdfFileDrop({
  file,
  onFile,
  error,
  onError,
  label = "Drop your PDF here",
  hint = "or click to browse - max 50MB",
  meta,
}: PdfFileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const ingest = (incoming: File | undefined) => {
    if (!incoming) return;
    const nextError = validatePdfFile(incoming);
    onError?.(nextError);
    if (nextError) return;
    onFile(incoming);
  };

  const clear = () => {
    onFile(null);
    onError?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        aria-label="Upload PDF file"
        onChange={(event) => {
          ingest(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {!file ? (
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
            ingest(event.dataTransfer.files[0]);
          }}
          className={cn(
            "flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center transition-colors duration-150",
            dragOver ? "border-primary bg-surface-card" : "border-[var(--hairline)] bg-surface-soft",
          )}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--hairline)] bg-canvas text-ink">
            <Upload className="h-5 w-5" />
          </span>
          <span className="mt-3 block text-sm font-medium">{label}</span>
          <span className="mt-1 block text-xs text-[var(--muted-ink)]">{hint}</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--hairline)] bg-surface-card p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-soft text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{file.name}</span>
            <span className="block text-xs text-[var(--muted-ink)]">
              {formatBytes(file.size)}
              {meta ? <> · {meta}</> : null}
            </span>
          </span>
          <button
            type="button"
            className="rounded-md p-1.5 text-[var(--muted-ink)] transition-colors hover:bg-surface-soft hover:text-ink"
            aria-label="Remove file"
            onClick={clear}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
