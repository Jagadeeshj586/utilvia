"use client";

import { useState } from "react";
import JSZip from "jszip";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PdfFileDrop } from "@/components/tools/pdf/pdf-file-drop";
import { Button } from "@/components/ui/button";
import { pdfReadError, stemName } from "@/lib/pdf/common";
import { loadPdf, renderPageToCanvas } from "@/lib/pdf/engine";
import { cn, downloadBlob } from "@/lib/utils";

type Format = "image/jpeg" | "image/png";
type ConvertMode = "first" | "all";

function canvasToBlob(canvas: HTMLCanvasElement, type: Format, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Conversion failed. Please try again."))), type, quality);
  });
}

export function PdfToImage({ format = "image/jpeg" }: { format?: Format }) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ConvertMode>("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const ext = format === "image/png" ? "png" : "jpg";
  const label = format === "image/png" ? "PNG" : "JPG";

  const reset = () => {
    setFile(null);
    setError(null);
    setDone(false);
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const pdf = await loadPdf(file);
      const base = stemName(file.name);
      if (mode === "first") {
        const canvas = await renderPageToCanvas(pdf, 1, 2);
        const blob = await canvasToBlob(canvas, format, 0.92);
        downloadBlob(blob, `${base}_page_1.${ext}`);
        toast.success(`✅ Downloaded page 1 as ${label}`);
      } else {
        const zip = new JSZip();
        for (let page = 1; page <= pdf.numPages; page += 1) {
          const canvas = await renderPageToCanvas(pdf, page, 2);
          const blob = await canvasToBlob(canvas, format, 0.92);
          zip.file(`${base}_page_${page}.${ext}`, blob);
        }
        downloadBlob(await zip.generateAsync({ type: "blob" }), `${base}_pages.zip`);
        toast.success(`✅ Downloaded as ZIP file with ${label} images`);
      }
      setDone(true);
    } catch (caught) {
      const message = pdfReadError(caught, "Conversion failed. Please try again.");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PdfFileDrop file={file} onFile={(next) => { setFile(next); setDone(false); }} error={error} onError={setError} />

      {file ? (
        <>
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">Pages to convert</p>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Pages to convert">
              {(
                [
                  { id: "first" as const, label: "First page only", hint: `Convert page 1 as ${label}` },
                  { id: "all" as const, label: "Convert all pages", hint: `All pages downloaded as a ZIP file` },
                ] as const
              ).map((item) => {
                const selected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setMode(item.id);
                      setDone(false);
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
          </div>

          <Button onClick={convert} disabled={busy} className="w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Converting pages...
              </>
            ) : (
              `Convert to ${label}`
            )}
          </Button>
          {done ? (
            <button
              type="button"
              className="w-full text-center text-sm text-[var(--muted-ink)] transition-colors hover:text-ink"
              onClick={reset}
            >
              Convert another
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
