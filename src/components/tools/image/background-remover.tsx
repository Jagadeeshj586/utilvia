"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, RefreshCw, RotateCcw, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { Dropzone } from "@/components/tools/dropzone";
import { ToolNotice } from "@/components/tools/tool-notice";
import { BeforeAfterViewer } from "@/components/tools/image/bg-remove/before-after-viewer";
import { ProcessingState } from "@/components/tools/image/bg-remove/processing-state";
import { RefinementControls, useRefinementOverlay } from "@/components/tools/image/bg-remove/refinement-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DROPZONE_ACCEPT,
  MAX_FILE_MB,
  downloadStem,
  exportWithBackground,
  isSupportedImage,
  preloadSegmentation,
  removeBackgroundFromFile,
  toUserMessage,
  type BackgroundFill,
  type ProcessingStage,
  type QualityPreset,
  type RgbColor,
} from "@/lib/image/background-removal";
import { downloadBlob } from "@/lib/utils";

const FILL_COLORS: Record<Exclude<BackgroundFill, "custom" | "transparent">, RgbColor> = {
  white: { r: 255, g: 255, b: 255 },
  black: { r: 0, g: 0, b: 0 },
};

function hexToRgb(hex: string): RgbColor {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const n = Number.parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function fillRgb(fill: BackgroundFill, custom: string): RgbColor | null {
  if (fill === "transparent") return null;
  if (fill === "custom") return hexToRgb(custom || "#ffffff");
  return FILL_COLORS[fill];
}

function fillCss(fill: BackgroundFill, custom: string): string | undefined {
  const rgb = fillRgb(fill, custom);
  return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : undefined;
}

export function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<QualityPreset>("high");
  const [keepShadow, setKeepShadow] = useState(true);
  const [fill, setFill] = useState<BackgroundFill>("transparent");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [refining, setRefining] = useState(false);
  const [stage, setStage] = useState<ProcessingStage | null>(null);
  const [stageDetail, setStageDetail] = useState<string | undefined>();
  const [downloadProgress, setDownloadProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rgb, setRgb] = useState<ImageData | null>(null);
  const [aiAlpha, setAiAlpha] = useState<Uint8ClampedArray | null>(null);
  const [workAlpha, setWorkAlpha] = useState<Uint8ClampedArray | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const originalUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  useEffect(() => {
    void preloadSegmentation();
  }, []);

  const setPreviewUrl = useCallback((url: string | null) => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = url;
    setResultUrl(url);
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const refreshPreview = useCallback(
    async (alpha: Uint8ClampedArray, colorPlane: ImageData, background: RgbColor | null) => {
      const blob = await exportWithBackground(colorPlane, alpha, background);
      setPreviewUrl(URL.createObjectURL(blob));
    },
    [setPreviewUrl],
  );

  const onAlphaChange = useCallback((alpha: Uint8ClampedArray) => {
    setWorkAlpha(alpha);
  }, []);

  const refine = useRefinementOverlay({
    width: rgb?.width ?? 1,
    height: rgb?.height ?? 1,
    baseAlpha: aiAlpha,
    enabled: refining && Boolean(rgb && aiAlpha),
    onAlphaChange,
  });

  useEffect(() => {
    if (!rgb || !workAlpha) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void refreshPreview(workAlpha, rgb, fillRgb(fill, customColor)).then(() => {
        if (cancelled) return;
      });
    }, 40);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [customColor, fill, refreshPreview, rgb, workAlpha]);

  const resetAll = () => {
    abortRef.current?.abort();
    setFile(null);
    setError(null);
    setStage(null);
    setStageDetail(undefined);
    setRgb(null);
    setAiAlpha(null);
    setWorkAlpha(null);
    setPreviewUrl(null);
    setRefining(false);
    setBusy(false);
    setDownloadProgress(null);
  };

  const process = async (nextFile: File, nextQuality = quality, nextKeepShadow = keepShadow) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    setStage("validate");
    setStageDetail(undefined);
    setRgb(null);
    setAiAlpha(null);
    setWorkAlpha(null);
    setPreviewUrl(null);
    setRefining(false);
    setDownloadProgress(null);

    try {
      const result = await removeBackgroundFromFile(nextFile, {
        quality: nextQuality,
        keepShadow: nextKeepShadow,
        signal: controller.signal,
        onStage: (next, detail) => {
          setStage(next);
          setStageDetail(detail);
        },
        onDownloadProgress: (loaded, total) => setDownloadProgress({ loaded, total }),
      });
      setRgb(result.original);
      setAiAlpha(result.alpha);
      setWorkAlpha(new Uint8ClampedArray(result.alpha));
      setStage("done");
      toast.success("Background removed");
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = toUserMessage(err);
      setError(message);
      setStage("segment");
      toast.error(message);
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false);
        setDownloadProgress(null);
      }
    }
  };

  const onFiles = (files: File[]) => {
    const next = files[0] ?? null;
    if (!next) return;
    if (!isSupportedImage(next)) {
      setError("Please upload a JPG, PNG, WEBP, or HEIC image.");
      toast.error("Please upload a JPG, PNG, WEBP, or HEIC image.");
      return;
    }
    setFile(next);
    void process(next);
  };

  const download = async () => {
    if (!file || !rgb || !workAlpha) return;
    try {
      const blob = await exportWithBackground(rgb, workAlpha, fillRgb(fill, customColor));
      downloadBlob(blob, `${downloadStem(file.name)}-background-removed.png`);
    } catch {
      toast.error("Could not export PNG.");
    }
  };

  return (
    <div className="space-y-6">
      <ToolNotice>
        Processing stays on your device. The AI model downloads once (~40–80MB) and is cached locally. Images are not stored.
        Optional cloud engines can be enabled with <code className="font-mono">BACKGROUND_REMOVAL_API_KEY</code>.
      </ToolNotice>

      {!file ? (
        <Dropzone
          accept={DROPZONE_ACCEPT}
          maxSizeMB={MAX_FILE_MB}
          maxSizeError={`This image is too large. Please upload an image smaller than ${MAX_FILE_MB} MB.`}
          files={[]}
          onFiles={onFiles}
          label="Drop an image here or click to upload"
          hint="JPG, PNG, WEBP, or HEIC - max 20MB"
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--hairline)] bg-surface-soft px-3 py-2 text-sm">
          <span className="min-w-0 truncate">{file.name}</span>
          <Button type="button" size="sm" variant="outline" onClick={resetAll}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Quality</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["standard", "Standard"],
                  ["high", "High Quality"],
                  ["maximum", "Maximum Quality"],
                ] as const
              ).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={quality === value ? "default" : "outline"}
                  onClick={() => setQuality(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-ink)]">
              Standard is faster. High Quality is the default. Maximum uses the largest model and strongest edge refinement.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--hairline)] bg-canvas px-3 py-3">
          <div>
            <Label htmlFor="keep-shadow">Keep natural shadow</Label>
            <p className="text-xs text-[var(--muted-ink)]">On by default</p>
          </div>
          <Switch id="keep-shadow" checked={keepShadow} onCheckedChange={setKeepShadow} />
        </div>
      </div>

      {busy || (error && !rgb) ? (
        <ProcessingState stage={error ? stage : stage} detail={stageDetail} error={Boolean(error && !rgb)} downloading={downloadProgress} />
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {file && (originalUrl || resultUrl) ? (
        <BeforeAfterViewer
          originalSrc={originalUrl}
          resultSrc={resultUrl}
          resultBackground={fillCss(fill, customColor)}
          refining={refining}
          resultPointerHandlers={refine.pointerHandlers}
        />
      ) : null}

      {rgb && workAlpha ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Background</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["transparent", "Transparent"],
                  ["white", "White"],
                  ["black", "Black"],
                  ["custom", "Custom color"],
                ] as const
              ).map(([value, label]) => (
                <Button key={value} type="button" size="sm" variant={fill === value ? "default" : "outline"} onClick={() => setFill(value)}>
                  {label}
                </Button>
              ))}
              {fill === "custom" ? (
                <Input
                  type="color"
                  value={customColor}
                  onChange={(event) => setCustomColor(event.target.value)}
                  className="h-10 w-14 cursor-pointer p-1"
                  aria-label="Custom background color"
                />
              ) : null}
            </div>
            <p className="text-xs text-[var(--muted-ink)]">
              The internal result stays transparent. Color is applied only to preview and download.
            </p>
          </div>

          {refining ? (
            <RefinementControls
              mode={refine.mode}
              setMode={refine.setMode}
              sizePreset={refine.sizePreset}
              setSizePreset={refine.setSizePreset}
              softness={refine.softness}
              setSoftness={refine.setSoftness}
              canUndo={refine.canUndo}
              canRedo={refine.canRedo}
              undo={refine.undo}
              redo={refine.redo}
              reset={refine.reset}
              disabled={busy}
            />
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button type="button" onClick={download} disabled={busy}>
              <Download className="h-4 w-4" />
              Download PNG
            </Button>
            <Button type="button" variant={refining ? "default" : "outline"} onClick={() => setRefining((value) => !value)} disabled={busy}>
              <WandSparkles className="h-4 w-4" />
              {refining ? "Done refining" : "Refine"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!file || busy}
              onClick={() => file && void process(file, quality, keepShadow)}
            >
              <RefreshCw className="h-4 w-4" />
              Reprocess
            </Button>
            <Button type="button" variant="outline" onClick={resetAll}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
