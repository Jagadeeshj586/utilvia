"use client";

import { useCallback, useState } from "react";
import { FileText, ImageIcon, Upload, X } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

type DropzoneProps = {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  maxSizeError?: string;
  files?: File[];
  onFiles: (files: File[]) => void;
  onRemove?: (index: number) => void;
  label?: string;
  hint?: string;
  compact?: boolean;
};

export function Dropzone({
  accept,
  multiple,
  maxSizeMB = 40,
  maxSizeError,
  files = [],
  onFiles,
  onRemove,
  label = "Drop your file here or choose a file",
  hint,
  compact = false,
}: DropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ingest = useCallback(
    (list: FileList | File[]) => {
      const incoming = Array.from(list);
      const tooBig = incoming.find((file) => file.size > maxSizeMB * 1024 * 1024);
      if (tooBig) {
        setError(maxSizeError ?? `${tooBig.name} is larger than ${maxSizeMB} MB.`);
        return;
      }
      setError(null);
      onFiles(multiple ? [...files, ...incoming] : incoming.slice(0, 1));
    },
    [files, maxSizeError, maxSizeMB, multiple, onFiles],
  );

  return (
    <div className="space-y-3">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length) ingest(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-lg border border-dashed px-6 text-center transition-all duration-200 ease-out",
          compact ? "min-h-[72px] flex-row gap-2 py-4" : "min-h-[160px] flex-col gap-2 py-8",
          dragOver
            ? "border-primary bg-surface-card"
            : "border-[var(--hairline)] bg-surface-soft",
        )}
      >
        {compact ? (
          <>
            <Upload className="h-5 w-5 shrink-0 text-[var(--muted-ink)]" aria-hidden />
            <span className="text-sm font-medium text-[var(--muted-ink)]">{label}</span>
          </>
        ) : (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--hairline)] bg-canvas text-ink">
              <Upload className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-medium">{label}</span>
              <span className="mt-1 block text-xs text-[var(--muted-ink)]">
                {hint ?? `Max ${maxSizeMB} MB per file.`}
              </span>
            </span>
          </>
        )}
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) ingest(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {files.length ? (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="flex items-center gap-3 rounded-md border border-[var(--hairline)] bg-canvas px-3 py-2"
            >
              {file.type.startsWith("image/") ? (
                <ImageIcon className="h-4 w-4 text-[var(--accent-amber)]" />
              ) : (
                <FileText className="h-4 w-4 text-primary" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm">
                {file.name}
                <span className="ml-2 text-xs text-[var(--muted-ink)]">{formatBytes(file.size)}</span>
              </span>
              {onRemove ? (
                <button
                  type="button"
                  className="rounded-md p-1 text-[var(--muted-ink)] transition-colors duration-150 hover:text-ink"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
