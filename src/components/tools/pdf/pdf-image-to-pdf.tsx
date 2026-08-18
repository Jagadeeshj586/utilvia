"use client";

import { useRef, useState } from "react";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, downloadBlob, formatBytes, uint8ToBlob } from "@/lib/utils";

const MAX_IMAGES = 10;
const MAX_BYTES = 10 * 1024 * 1024;
const A4 = PageSizes.A4;

type Item = { file: File; previewUrl: string };

function isSupportedImage(file: File) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    type === "image/jpeg" ||
    type === "image/png" ||
    type === "image/webp" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp")
  );
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

async function fileToJpegBytes(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(url);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, img.naturalWidth || img.width);
    canvas.height = Math.max(1, img.naturalHeight || img.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("Could not encode JPEG"))), "image/jpeg", 0.92);
    });
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function embedRaster(pdf: PDFDocument, file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (type.includes("png") || name.endsWith(".png")) {
    try {
      return await pdf.embedPng(bytes);
    } catch {
      /* convert */
    }
  }
  try {
    return await pdf.embedJpg(bytes);
  } catch {
    return await pdf.embedJpg(await fileToJpegBytes(file));
  }
}

export function ImageToPdf() {
  const inputRef = useRef<HTMLInputElement>(null);
  const addMoreRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);

  const clearPreviews = (next: Item[]) => next.forEach((item) => URL.revokeObjectURL(item.previewUrl));

  const ingest = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    const room = MAX_IMAGES - items.length;
    if (room <= 0) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    const accepted: Item[] = [];
    let nextError: string | null = null;
    for (const file of incoming.slice(0, room)) {
      if (!isSupportedImage(file)) {
        nextError = "Only JPG, PNG, and WebP images are supported.";
        continue;
      }
      if (file.size > MAX_BYTES) {
        nextError = "Each image must be 10MB or smaller.";
        continue;
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    if (incoming.length > room) nextError = `Only ${room} more image(s) could be added (max ${MAX_IMAGES}).`;
    setError(nextError);
    if (!accepted.length) return;
    setResult(null);
    setItems((current) => [...current, ...accepted]);
  };

  const remove = (index: number) => {
    setItems((current) => {
      const next = [...current];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return next;
    });
    setResult(null);
    setError(null);
  };

  const reset = () => {
    clearPreviews(items);
    setItems([]);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    if (addMoreRef.current) addMoreRef.current.value = "";
  };

  const convert = async () => {
    if (!items.length) return;
    setBusy(true);
    setError(null);
    try {
      const pdf = await PDFDocument.create();
      const [pageW, pageH] = A4;
      const margin = 36;
      for (const item of items) {
        const image = await embedRaster(pdf, item.file);
        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2;
        const scale = Math.min(maxW / image.width, maxH / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        const page = pdf.addPage([pageW, pageH]);
        page.drawImage(image, { x: (pageW - width) / 2, y: (pageH - height) / 2, width, height });
      }
      const blob = uint8ToBlob(await pdf.save(), "application/pdf");
      setResult({ blob, size: blob.size });
      toast.success(`Created PDF with ${items.length} image${items.length === 1 ? "" : "s"}`);
    } catch {
      setError("PDF creation failed. Please try different images.");
      toast.error("PDF creation failed. Please try different images.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple
        className="sr-only"
        aria-label="Upload image file"
        onChange={(event) => {
          if (event.target.files?.length) ingest(event.target.files);
          event.target.value = "";
        }}
      />
      <input
        ref={addMoreRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple
        className="sr-only"
        aria-label="Add more images"
        onChange={(event) => {
          if (event.target.files?.length) ingest(event.target.files);
          event.target.value = "";
        }}
      />

      {!items.length ? (
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
          <span className="mt-3 block text-sm font-medium">Drop your images here</span>
          <span className="mt-1 block text-xs text-[var(--muted-ink)]">or click to browse - up to 10 images, 10MB each</span>
        </button>
      ) : (
        <div className="space-y-3 rounded-lg border border-[var(--hairline)] bg-surface-card p-5">
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={`${item.file.name}-${index}`} className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-[var(--muted-ink)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{item.file.name}</span>
                  <span className="block text-xs text-[var(--muted-ink)]">{formatBytes(item.file.size)}</span>
                </span>
                <button
                  type="button"
                  className="rounded-md p-1.5 text-[var(--muted-ink)] transition-colors hover:bg-surface-soft hover:text-ink"
                  aria-label={`Remove ${item.file.name}`}
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--muted-ink)]">Images appear in the order you added them · A4 PDF page</p>
          {items.length < MAX_IMAGES ? (
            <button
              type="button"
              onClick={() => addMoreRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[var(--hairline)] py-2.5 text-sm text-[var(--muted-ink)] transition-colors hover:border-primary hover:text-ink"
            >
              <Plus className="h-4 w-4" />
              Add more images
            </button>
          ) : null}
        </div>
      )}

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {items.length > 0 && !result ? (
        <Button onClick={convert} disabled={busy} className="w-full">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating PDF...
            </>
          ) : (
            `Create PDF (${items.length} image${items.length === 1 ? "" : "s"})`
          )}
        </Button>
      ) : null}

      {result ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
              <p className="text-sm text-[var(--muted-ink)]">Images Combined</p>
              <p className="mt-1 text-xl font-semibold text-ink">{items.length}</p>
            </div>
            <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
              <p className="text-sm text-[var(--muted-ink)]">Output PDF Size</p>
              <p className="mt-1 text-xl font-semibold text-ink">{formatBytes(result.size)}</p>
            </div>
          </div>
          <Button onClick={() => downloadBlob(result.blob, `images_${Date.now()}.pdf`)} className="w-full">
            Download PDF
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--muted-ink)] transition-colors hover:text-ink"
            onClick={reset}
          >
            Create Another PDF
          </button>
        </div>
      ) : null}
    </div>
  );
}
