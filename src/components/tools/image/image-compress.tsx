"use client";

import { useEffect, useMemo, useState } from "react";
import imageCompression from "browser-image-compression";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dropzone } from "@/components/tools/dropzone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { downloadBlob, formatBytes } from "@/lib/utils";

const MAX_MB = 10;

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

function outputType(file: File) {
  if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) return "image/png";
  if (file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function outputExt(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function ImageCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.75);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<Blob | null>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const outputUrl = useMemo(() => (output ? URL.createObjectURL(output) : null), [output]);

  useEffect(() => {
    if (!file) {
      setOutput(null);
      return;
    }
    let cancelled = false;
    setBusy(true);
    setError(null);
    const type = outputType(file);
    imageCompression(file, {
      maxSizeMB: MAX_MB,
      maxWidthOrHeight: 4096,
      initialQuality: quality,
      fileType: type,
      useWebWorker: true,
    })
      .then((blob) => {
        if (!cancelled) setOutput(blob);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Compression failed. Please try a different image.");
          toast.error("Compression failed. Please try a different image.");
        }
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file, quality]);

  const reset = () => {
    setFile(null);
    setOutput(null);
    setError(null);
  };

  const download = () => {
    if (!file || !output) return;
    const ext = outputExt(output.type || outputType(file));
    downloadBlob(output, `${file.name.replace(/\.[^.]+$/, "")}_compressed.${ext}`);
  };

  return (
    <div className="space-y-6">
      <Dropzone
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        maxSizeMB={MAX_MB}
        files={file ? [file] : []}
        onFiles={(files) => {
          const next = files[0] ?? null;
          if (!next) return;
          if (!isSupportedImage(next)) {
            setError("Please select a JPG, PNG, or WebP image.");
            return;
          }
          if (next.size > MAX_MB * 1024 * 1024) {
            setError("File too large. Maximum size is 10MB.");
            return;
          }
          setError(null);
          setFile(next);
        }}
        onRemove={reset}
        label="Drop your image here"
        hint="or click to browse - max 10MB"
      />

      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}

      {file ? (
        <>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Compression quality</Label>
              <span className="tabular-nums text-[var(--muted-ink)]">{Math.round(quality * 100)}%</span>
            </div>
            <Slider min={0.2} max={1} step={0.05} value={[quality]} onValueChange={([value]) => setQuality(value)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Preview label="Before" src={previewUrl} hint={formatBytes(file.size)} />
            <Preview
              label="After"
              src={outputUrl}
              hint={busy ? "Compressing..." : output ? formatBytes(output.size) : undefined}
            />
          </div>

          <Button onClick={download} disabled={!output || busy} className="w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Compressing...
              </>
            ) : (
              "Download Compressed Image"
            )}
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--muted-ink)] transition-colors hover:text-ink"
            onClick={reset}
          >
            Compress Another
          </button>
        </>
      ) : null}
    </div>
  );
}

function Preview({ label, src, hint }: { label: string; src: string | null; hint?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--hairline)]">
      <div className="flex items-center justify-between border-b border-[var(--hairline)] px-3 py-2">
        <p className="text-xs font-medium text-[var(--muted-ink)]">{label}</p>
        {hint ? <p className="text-xs tabular-nums text-[var(--muted-ink)]">{hint}</p> : null}
      </div>
      <div className="flex min-h-48 items-center justify-center bg-surface-soft">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={label} className="max-h-80 w-full object-contain" />
        ) : (
          <p className="text-sm text-[var(--muted-ink)]">No preview yet</p>
        )}
      </div>
    </div>
  );
}
