"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { toast } from "sonner";
import { PdfFileDrop } from "@/components/tools/pdf/pdf-file-drop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { pdfReadError, stemName } from "@/lib/pdf/common";
import { cn, downloadBlob, uint8ToBlob } from "@/lib/utils";

type Position = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
type Format = "number" | "page-x" | "page-x-of-y";

const POSITIONS: { id: Position; label: string }[] = [
  { id: "top-left", label: "Top left" },
  { id: "top-center", label: "Top center" },
  { id: "top-right", label: "Top right" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-center", label: "Bottom center" },
  { id: "bottom-right", label: "Bottom right" },
];

const FORMATS: { id: Format; label: string }[] = [
  { id: "number", label: "1" },
  { id: "page-x", label: "Page 1" },
  { id: "page-x-of-y", label: "Page 1 of 10" },
];

function formatLabel(format: Format, page: number, total: number) {
  if (format === "page-x") return `Page ${page}`;
  if (format === "page-x-of-y") return `Page ${page} of ${total}`;
  return String(page);
}

export function PdfPageNumbers() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [format, setFormat] = useState<Format>("number");
  const [start, setStart] = useState(1);
  const [skipFirst, setSkipFirst] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setResult(null);
    setError(null);
  };

  const onFile = async (next: File | null) => {
    setResult(null);
    setError(null);
    setFile(next);
    setPageCount(0);
    if (!next) return;
    try {
      const pdf = await PDFDocument.load(await next.arrayBuffer());
      setPageCount(pdf.getPageCount());
    } catch (caught) {
      const message = pdfReadError(caught, "Unable to read PDF.");
      setError(message);
      setFile(null);
      toast.error(message);
    }
  };

  const stamp = async () => {
    if (!file) return;
    if (start < 1) {
      setError("Starting number must be at least 1.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const numbered = skipFirst ? pages.slice(1) : pages;
      const total = numbered.length;
      numbered.forEach((page, index) => {
        const label = formatLabel(format, start + index, total);
        const size = 11;
        const width = font.widthOfTextAtSize(label, size);
        const { width: pageW, height: pageH } = page.getSize();
        const margin = 28;
        const x = position.endsWith("left")
          ? margin
          : position.endsWith("right")
            ? pageW - width - margin
            : (pageW - width) / 2;
        const y = position.startsWith("top") ? pageH - margin - size : margin;
        page.drawText(label, { x, y, size, font, color: rgb(0.25, 0.25, 0.28) });
      });
      const blob = uint8ToBlob(await pdf.save(), "application/pdf");
      setResult(blob);
      toast.success("Page numbers added");
    } catch (caught) {
      const message = pdfReadError(caught, "Failed to add page numbers. Please try again.");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!file || !result) return;
    downloadBlob(result, `numbered_${stemName(file.name)}.pdf`);
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

      {file ? (
        <>
          <div className="space-y-2">
            <Label>Position</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {POSITIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPosition(item.id);
                    setResult(null);
                  }}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors",
                    position === item.id ? "border-primary bg-surface-card text-ink" : "border-[var(--hairline)] text-[var(--muted-ink)] hover:border-primary/50",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFormat(item.id);
                    setResult(null);
                  }}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors",
                    format === item.id ? "border-primary bg-surface-card text-ink" : "border-[var(--hairline)] text-[var(--muted-ink)] hover:border-primary/50",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-number">Starting number</Label>
              <Input
                id="start-number"
                type="number"
                min={1}
                value={start}
                onChange={(event) => {
                  setStart(Math.max(1, Number(event.target.value) || 1));
                  setResult(null);
                }}
              />
            </div>
            <label className="flex items-center justify-between gap-3 rounded-md border border-[var(--hairline)] px-3 py-2 sm:mt-7">
              <span className="text-sm">Skip first page (cover/title page)</span>
              <Switch
                checked={skipFirst}
                onCheckedChange={(checked) => {
                  setSkipFirst(checked);
                  setResult(null);
                }}
              />
            </label>
          </div>

          {!result ? (
            <Button onClick={stamp} disabled={busy} className="w-full">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding numbers...
                </>
              ) : (
                "Add Page Numbers"
              )}
            </Button>
          ) : (
            <Button onClick={download} className="w-full">
              <Check className="h-4 w-4" />
              Download Numbered PDF
            </Button>
          )}
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--muted-ink)] transition-colors hover:text-ink"
            onClick={reset}
          >
            Number another
          </button>
        </>
      ) : null}
    </div>
  );
}
