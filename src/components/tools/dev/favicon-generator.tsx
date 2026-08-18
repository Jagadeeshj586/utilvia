"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import JSZip from "jszip";
import { Check, Copy, Download, Globe, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  generateFaviconPackage,
  isAcceptedFaviconImage,
  revokeFaviconPreview,
  type FaviconFile,
} from "@/lib/favicon/generate";
import { copyText } from "@/lib/security/clipboard";
import { cn, downloadBlob } from "@/lib/utils";

export function FaviconGenerator() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FaviconFile[]>([]);
  const [htmlTags, setHtmlTags] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    return () => revokeFaviconPreview(previewUrl);
  }, [previewUrl]);

  const processFile = async (file: File) => {
    if (!isAcceptedFaviconImage(file)) {
      setError("Please upload an image file (PNG, JPG, or WebP).");
      return;
    }

    setBusy(true);
    setError(null);
    revokeFaviconPreview(previewUrl);

    try {
      const pack = await generateFaviconPackage(file);
      setFiles(pack.files);
      setHtmlTags(pack.htmlTags);
      setPreviewUrl(pack.previewUrl);
    } catch {
      setError("Failed to generate favicons. Try a different image.");
      setFiles([]);
      setHtmlTags("");
      setPreviewUrl(null);
    } finally {
      setBusy(false);
    }
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const downloadZip = async () => {
    if (!files.length) return;
    const zip = new JSZip();
    files.forEach((file) => zip.file(file.filename, file.blob));
    zip.file("favicon-html-tags.txt", htmlTags);
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "favicon-package.zip");
  };

  const onCopyTags = async () => {
    if (!htmlTags) return;
    const ok = await copyText(htmlTags);
    if (ok) {
      setCopied(true);
      toast.success("HTML tags copied");
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Could not copy tags");
    }
  };

  return (
    <div className="space-y-6">
      <label
        htmlFor="favicon-upload"
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition-colors duration-150",
          dragOver ? "border-primary bg-surface-card" : "border-[var(--hairline)] bg-surface-soft",
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--hairline)] bg-canvas text-primary">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Upload className="h-5 w-5" aria-hidden />}
        </span>
        <p className="mt-4 font-medium text-ink">Upload a square image (512×512 recommended)</p>
        <p className="mt-1 text-sm text-[var(--muted-ink)]">PNG, JPG, or WebP</p>
        <input
          ref={inputRef}
          id="favicon-upload"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label="Upload image"
          onChange={onInputChange}
        />
      </label>

      {busy ? <p className="text-sm text-[var(--muted-ink)]">Generating favicons...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {previewUrl ? (
        <section className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5 sm:p-6">
          <p className="mb-3 text-sm font-medium text-ink">Browser tab preview</p>
          <p className="sr-only">Favicon preview at 32x32 pixels in a simulated browser tab</p>
          <div className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-lg border border-[var(--hairline)] bg-canvas px-3 py-2 shadow-sm">
            {/* Blob preview URL — next/image does not apply to object URLs */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" width={16} height={16} className="h-4 w-4 shrink-0 rounded-sm" />
            <Globe className="h-3.5 w-3.5 shrink-0 text-[var(--muted-ink)]" aria-hidden />
            <span className="truncate text-sm text-[var(--body)]">Your Site</span>
          </div>
        </section>
      ) : null}

      {files.length ? (
        <section className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5 sm:p-6">
          <h2 className="font-display text-[22px] tracking-[-0.3px] text-ink">Generated files</h2>
          <ul className="mt-4 divide-y divide-[var(--hairline)]">
            {files.map((file) => (
              <li key={file.filename} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-[var(--body)]">{file.filename}</span>
                <span className="font-medium tabular-nums text-[var(--muted-ink)]">
                  {file.size === "ico" ? "ICO" : `${file.size}×${file.size}`}
                </span>
              </li>
            ))}
          </ul>
          <Button type="button" className="mt-5" onClick={() => void downloadZip()}>
            <Download className="h-4 w-4" />
            Download Favicon Package (ZIP)
          </Button>
        </section>
      ) : null}

      {htmlTags ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-[22px] tracking-[-0.3px] text-ink">HTML link tags</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => void onCopyTags()}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea readOnly value={htmlTags} className="min-h-[160px] font-mono text-sm leading-6" aria-label="HTML link tags" />
        </section>
      ) : null}
    </div>
  );
}
