"use client";

import { useState } from "react";
import JSZip from "jszip";
import { Check, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PdfFileDrop } from "@/components/tools/pdf/pdf-file-drop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pdfReadError } from "@/lib/pdf/common";
import { parsePageRanges } from "@/lib/pdf/engine";
import { cn, downloadBlob, formatBytes, uint8ToBlob } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";

type SplitMode = "all" | "custom";
type SplitPage = { pageNumber: number; blob: Blob; filename: string };

const MODES: { id: SplitMode; label: string; hint: string }[] = [
  { id: "all", label: "Split All Pages", hint: "Every page becomes a separate PDF" },
  { id: "custom", label: "Extract Specific Pages", hint: "Enter page numbers to extract" },
];

export function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<SplitMode>("all");
  const [ranges, setRanges] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<SplitPage[]>([]);

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setRanges("");
    setPages([]);
    setError(null);
  };

  const onFile = async (next: File | null) => {
    setPages([]);
    setError(null);
    setFile(next);
    setPageCount(0);
    if (!next) return;
    try {
      const source = await PDFDocument.load(await next.arrayBuffer());
      const count = source.getPageCount();
      setPageCount(count);
      setRanges(count > 1 ? `1-${count}` : "1");
    } catch (caught) {
      const message = pdfReadError(caught, "Unable to read PDF.");
      setError(message);
      setFile(null);
      toast.error(message);
    }
  };

  const split = async () => {
    if (!file || !pageCount) return;
    const selected = mode === "all" ? Array.from({ length: pageCount }, (_, i) => i + 1) : parsePageRanges(ranges, pageCount);
    if (!selected.length) {
      setError("Enter valid page numbers (e.g. 1, 3, 5-7, 10).");
      return;
    }
    setBusy(true);
    setError(null);
    setPages([]);
    try {
      const source = await PDFDocument.load(await file.arrayBuffer());
      const nextPages: SplitPage[] = [];
      for (const pageNumber of selected) {
        const out = await PDFDocument.create();
        const [copied] = await out.copyPages(source, [pageNumber - 1]);
        out.addPage(copied);
        const blob = uint8ToBlob(await out.save(), "application/pdf");
        nextPages.push({
          pageNumber,
          blob,
          filename: `page_${pageNumber}.pdf`,
        });
      }
      setPages(nextPages);
      toast.success(`Split into ${nextPages.length} page${nextPages.length === 1 ? "" : "s"}`);
    } catch (caught) {
      const message = pdfReadError(caught, "Split failed. Please try again.");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    if (!pages.length) return;
    const zip = new JSZip();
    pages.forEach((page) => zip.file(page.filename, page.blob));
    downloadBlob(await zip.generateAsync({ type: "blob" }), `split_${Date.now()}.zip`);
  };

  return (
    <div className="space-y-6">
      <PdfFileDrop
        file={file}
        onFile={onFile}
        error={error}
        onError={setError}
        meta={pageCount ? `${pageCount} page${pageCount === 1 ? "" : "s"}` : null}
      />

      {file && !pages.length ? (
        <>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Split mode">
            {MODES.map((item) => {
              const selected = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setMode(item.id);
                    setError(null);
                  }}
                  className={cn(
                    "relative rounded-lg border px-4 py-3 text-left transition-colors",
                    selected ? "border-primary bg-surface-card" : "border-[var(--hairline)] bg-canvas hover:border-primary/50",
                  )}
                >
                  {selected ? <Check className="absolute right-3 top-3 h-4 w-4 text-primary" /> : null}
                  <span className="block text-sm font-medium text-ink">{item.label}</span>
                  <span className="mt-1 block text-xs text-[var(--muted-ink)]">{item.hint}</span>
                </button>
              );
            })}
          </div>

          {mode === "custom" ? (
            <div className="space-y-2">
              <Input
                value={ranges}
                onChange={(event) => {
                  setRanges(event.target.value);
                  setError(null);
                }}
                placeholder="e.g. 1, 3, 5-7, 10"
                aria-label="Page numbers to extract"
              />
              <p className="text-xs text-[var(--muted-ink)]">Use commas for individual pages, hyphens for ranges</p>
            </div>
          ) : null}

          <Button onClick={split} disabled={busy} className="w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Splitting...
              </>
            ) : (
              "Split PDF"
            )}
          </Button>
        </>
      ) : null}

      {pages.length ? (
        <div className="space-y-4">
          <ul className="space-y-2">
            {pages.map((page) => (
              <li
                key={page.pageNumber}
                className="flex items-center gap-3 rounded-lg border border-[var(--hairline)] bg-surface-card px-4 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">Page {page.pageNumber}</span>
                  <span className="block text-xs text-[var(--muted-ink)]">{formatBytes(page.blob.size)}</span>
                </span>
                <Button size="sm" variant="outline" onClick={() => downloadBlob(page.blob, page.filename)}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </li>
            ))}
          </ul>
          <Button onClick={downloadZip} className="w-full">
            Download All as ZIP
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--muted-ink)] transition-colors hover:text-ink"
            onClick={reset}
          >
            Split Another
          </button>
        </div>
      ) : null}
    </div>
  );
}
