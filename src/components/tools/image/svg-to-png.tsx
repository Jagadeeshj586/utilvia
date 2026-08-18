"use client";

import { useEffect, useMemo, useState, type DragEvent } from "react";
import { Download, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  parseSvgDimensions,
  resolveOutputSize,
  SVG_TO_PNG_SCALES,
} from "@/lib/svg-to-png/convert";
import { cn } from "@/lib/utils";

type BackgroundMode = "transparent" | "solid";

const CHECKER =
  "bg-[length:16px_16px] bg-[linear-gradient(45deg,#e8e6e1_25%,transparent_25%),linear-gradient(-45deg,#e8e6e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e8e6e1_75%),linear-gradient(-45deg,transparent_75%,#e8e6e1_75%)] bg-[position:0_0,0_8px,8px_-8px,-8px_0]";

async function svgToPngBlob(
  svgText: string,
  options: { width: number; height: number; background: string },
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to render SVG"));
    };
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  if (options.background !== "transparent") {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(image, 0, 0, options.width, options.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))), "image/png");
  });
}

function isSvgFile(file: File) {
  const name = file.name.toLowerCase();
  return file.type === "image/svg+xml" || name.endsWith(".svg");
}

export function SvgToPng() {
  const [svgText, setSvgText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [baseWidth, setBaseWidth] = useState(512);
  const [baseHeight, setBaseHeight] = useState(512);
  const [scale, setScale] = useState<(typeof SVG_TO_PNG_SCALES)[number]>(2);
  const [customWidthEnabled, setCustomWidthEnabled] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("transparent");
  const [solidColor, setSolidColor] = useState("#ffffff");
  const [showPaste, setShowPaste] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSvg = Boolean(svgText.trim());

  useEffect(() => {
    if (!svgText) {
      setPreviewUrl(null);
      return;
    }

    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);

    const dims = parseSvgDimensions(svgText);
    setBaseWidth(Math.round(dims.width));
    setBaseHeight(Math.round(dims.height));

    return () => URL.revokeObjectURL(url);
  }, [svgText]);

  const outputSize = useMemo(
    () =>
      resolveOutputSize({
        baseWidth,
        baseHeight,
        scale,
        customWidthEnabled,
        customWidth,
      }),
    [baseWidth, baseHeight, scale, customWidthEnabled, customWidth],
  );

  const loadSvg = (text: string, name: string | null = null) => {
    setSvgText(text);
    setFileName(name);
    setError(null);
    if (text.trim()) setShowPaste(false);
  };

  const clear = () => {
    setSvgText("");
    setFileName(null);
    setError(null);
    setShowPaste(false);
  };

  const ingestFile = async (file: File) => {
    if (!isSvgFile(file)) {
      setError("Please choose an .svg file.");
      return;
    }
    loadSvg(await file.text(), file.name);
  };

  const onDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) await ingestFile(file);
  };

  const download = async () => {
    if (!svgText.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await svgToPngBlob(svgText, {
        width: outputSize.width,
        height: outputSize.height,
        background: backgroundMode === "transparent" ? "transparent" : solidColor,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const base = fileName?.replace(/\.svg$/i, "") || "svg-export";
      anchor.download = `${base}-${outputSize.width}x${outputSize.height}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PNG export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {!hasSvg ? (
        <div className="space-y-3">
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={cn(
              "flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
              dragOver
                ? "border-coral bg-coral/5"
                : "border-[var(--hairline)] bg-surface-soft hover:border-coral/40",
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--hairline)] bg-canvas text-ink">
              <Upload className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">Drop an SVG here</span>
              <span className="mt-1 block text-xs text-muted-foreground">or click to browse</span>
            </span>
            <input
              type="file"
              accept=".svg,image/svg+xml"
              className="hidden"
              aria-label="Upload SVG"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) await ingestFile(file);
                event.target.value = "";
              }}
            />
          </label>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowPaste((open) => !open)}
              className="text-sm text-coral hover:underline"
            >
              {showPaste ? "Hide paste field" : "Or paste SVG code"}
            </button>
          </div>

          {showPaste ? (
            <div className="space-y-2">
              <Label htmlFor="svg-paste">SVG markup</Label>
              <Textarea
                id="svg-paste"
                value={svgText}
                onChange={(event) => loadSvg(event.target.value)}
                rows={7}
                spellCheck={false}
                autoFocus
                placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">...</svg>'
                className="font-mono text-sm"
              />
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--hairline)] bg-surface-soft px-3 py-2 text-sm">
            <p className="truncate text-ink">
              {fileName ? <span className="font-medium">{fileName}</span> : <span className="font-medium">Pasted SVG</span>}
              <span className="text-muted-foreground">
                {" "}
                · {baseWidth}×{baseHeight}
              </span>
            </p>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-canvas hover:text-ink"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Clear
            </button>
          </div>

          <div
            className={cn(
              "flex min-h-[12rem] items-center justify-center rounded-xl border border-[var(--hairline)] p-6",
              backgroundMode === "transparent" ? CHECKER : "bg-surface-card",
            )}
            style={backgroundMode === "solid" ? { backgroundColor: solidColor } : undefined}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="SVG preview before PNG conversion"
                className="max-h-52 max-w-full object-contain"
              />
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-medium text-ink">Resolution</p>
              <div className="flex flex-wrap gap-2">
                {SVG_TO_PNG_SCALES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setScale(value);
                      setCustomWidthEnabled(false);
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      !customWidthEnabled && scale === value
                        ? "border-coral bg-coral/10 text-coral"
                        : "border-[var(--hairline)] text-muted-foreground hover:border-coral/40 hover:text-ink",
                    )}
                    aria-pressed={!customWidthEnabled && scale === value}
                  >
                    {value}x
                    <span className="ml-1 text-xs opacity-70">
                      {baseWidth * value}×{baseHeight * value}
                    </span>
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={customWidthEnabled}
                  onChange={(event) => setCustomWidthEnabled(event.target.checked)}
                  className="rounded border-[var(--hairline)]"
                />
                Custom width
              </label>

              {customWidthEnabled ? (
                <input
                  type="number"
                  value={customWidth}
                  onChange={(event) => setCustomWidth(event.target.value)}
                  placeholder="Width in px, e.g. 1024"
                  min={1}
                  className="w-full rounded-lg border border-[var(--hairline)] bg-canvas px-3 py-2 text-sm text-ink"
                />
              ) : null}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-ink">Background</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setBackgroundMode("transparent")}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    backgroundMode === "transparent"
                      ? "border-coral bg-coral/10 text-coral"
                      : "border-[var(--hairline)] text-muted-foreground hover:border-coral/40 hover:text-ink",
                  )}
                  aria-pressed={backgroundMode === "transparent"}
                >
                  Transparent
                </button>
                <button
                  type="button"
                  onClick={() => setBackgroundMode("solid")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    backgroundMode === "solid"
                      ? "border-coral bg-coral/10 text-coral"
                      : "border-[var(--hairline)] text-muted-foreground hover:border-coral/40 hover:text-ink",
                  )}
                  aria-pressed={backgroundMode === "solid"}
                >
                  Solid
                  {backgroundMode === "solid" ? (
                    <input
                      type="color"
                      value={solidColor}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => {
                        setSolidColor(event.target.value);
                        setBackgroundMode("solid");
                      }}
                      className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                      aria-label="Background color"
                    />
                  ) : null}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Output{" "}
              <span className="font-medium text-ink">
                {outputSize.width} × {outputSize.height} px
              </span>
            </p>
            <Button
              type="button"
              onClick={download}
              disabled={busy || !Number.isFinite(outputSize.width) || outputSize.width < 1}
              className="min-h-11 gap-2 px-6 sm:min-w-[11rem]"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Converting…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" aria-hidden />
                  Download PNG
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
