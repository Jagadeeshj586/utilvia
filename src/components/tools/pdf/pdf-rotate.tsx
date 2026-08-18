"use client";

import { useState } from "react";
import { Loader2, RotateCw } from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";
import { toast } from "sonner";
import { PdfFileDrop } from "@/components/tools/pdf/pdf-file-drop";
import { Button } from "@/components/ui/button";
import { pdfReadError, stemName } from "@/lib/pdf/common";
import { loadPdf, renderPageToCanvas } from "@/lib/pdf/engine";
import { downloadBlob, formatBytes, uint8ToBlob } from "@/lib/utils";

type Preview = { pageNumber: number; dataUrl: string };

export function PdfRotate() {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [rotations, setRotations] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  const reset = () => {
    setFile(null);
    setPreviews([]);
    setRotations([]);
    setResult(null);
    setError(null);
  };

  const onFile = async (next: File | null) => {
    setResult(null);
    setError(null);
    setPreviews([]);
    setRotations([]);
    setFile(next);
    if (!next) return;
    setLoading(true);
    try {
      const pdf = await loadPdf(next);
      const nextPreviews: Preview[] = [];
      for (let page = 1; page <= pdf.numPages; page += 1) {
        const canvas = await renderPageToCanvas(pdf, page, 0.55);
        nextPreviews.push({ pageNumber: page, dataUrl: canvas.toDataURL("image/jpeg", 0.72) });
      }
      setPreviews(nextPreviews);
      setRotations(Array.from({ length: pdf.numPages }, () => 0));
    } catch (caught) {
      const message = pdfReadError(caught, "Unable to read PDF. The file may be corrupted or password-protected.");
      setError(message);
      setFile(null);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const rotatePage = (index: number) => {
    setRotations((current) => current.map((value, i) => (i === index ? (value + 90) % 360 : value)));
    setResult(null);
  };

  const rotateAll = () => {
    setRotations((current) => current.map((value) => (value + 90) % 360));
    setResult(null);
  };

  const apply = async () => {
    if (!file || !rotations.length) return;
    setBusy(true);
    setError(null);
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      pdf.getPages().forEach((page, index) => {
        const current = page.getRotation().angle;
        page.setRotation(degrees((((current + (rotations[index] ?? 0)) % 360) + 360) % 360));
      });
      const blob = uint8ToBlob(await pdf.save(), "application/pdf");
      setResult(blob);
      downloadBlob(blob, `rotated_${stemName(file.name)}.pdf`);
      toast.success("Rotated PDF downloaded");
    } catch (caught) {
      const message = pdfReadError(caught, "Rotation failed. Please try again.");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PdfFileDrop
        file={file}
        onFile={onFile}
        error={error}
        onError={setError}
        meta={previews.length ? `${previews.length} page${previews.length === 1 ? "" : "s"}` : loading ? "Reading PDF..." : null}
      />

      {loading ? <p className="text-sm text-[var(--muted-ink)]">Loading page previews...</p> : null}

      {previews.length ? (
        <>
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={rotateAll}>
              <RotateCw className="h-4 w-4" />
              Rotate all 90°
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((preview, index) => (
              <div key={preview.pageNumber} className="rounded-lg border border-[var(--hairline)] bg-surface-card p-5">
                <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-md bg-surface-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview.dataUrl}
                    alt={`Page ${preview.pageNumber}`}
                    className="max-h-48 max-w-full object-contain transition-transform duration-200"
                    style={{ transform: `rotate(${rotations[index] ?? 0}deg)` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--muted-ink)]">
                    Page {preview.pageNumber}
                    {(rotations[index] ?? 0) ? ` · ${rotations[index]}°` : ""}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => rotatePage(index)}>
                    Rotate 90°
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={apply} disabled={busy} className="w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Download Rotated PDF"
            )}
          </Button>
          {result ? (
            <p className="text-center text-sm text-[var(--muted-ink)]">Output size {formatBytes(result.size)}</p>
          ) : null}
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--muted-ink)] transition-colors hover:text-ink"
            onClick={reset}
          >
            Rotate another
          </button>
        </>
      ) : null}
    </div>
  );
}
