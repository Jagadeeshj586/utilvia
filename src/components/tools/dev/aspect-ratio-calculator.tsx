"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Check, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ASPECT_RATIO_PRESETS,
  calculateAspectRatio,
  calculateHeight,
  calculateWidth,
  dimensionFromRatio,
  formatDecimal,
  parseDimension,
  POPULAR_RESOLUTIONS,
  type AspectRatioPreset,
} from "@/lib/aspect-ratio/calculate";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

type Mode = "ratio" | "height" | "width" | "resize" | "custom";

const DEFAULT_WIDTH = "1920";
const DEFAULT_HEIGHT = "1080";

function DimensionField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <Input
          id={id}
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          className="font-mono tabular-nums"
        />
        <span className="text-sm text-muted-foreground">px</span>
      </div>
      {error ? (
        <p className="mt-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CopyAction({ label, value, disabled }: { label: string; value: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || !value}
      onClick={async () => {
        const ok = await copyText(value);
        if (ok) {
          setCopied(true);
          toast.success(`${label} copied`);
          window.setTimeout(() => setCopied(false), 2000);
        }
      }}
    >
      {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

function RatioPreview({ ratioW, ratioH, label }: { ratioW: number; ratioH: number; label: string }) {
  const safeW = ratioW > 0 ? ratioW : 1;
  const safeH = ratioH > 0 ? ratioH : 1;
  const isPortrait = safeH > safeW;

  return (
    <div className="flex h-56 items-center justify-center rounded-lg border border-[var(--hairline)] bg-surface-soft p-4">
      <div
        className={cn(
          "flex max-h-full max-w-full items-center justify-center rounded-md border border-primary/30 bg-primary/10 transition-all duration-300 motion-reduce:transition-none",
          isPortrait ? "h-full w-auto" : "h-auto w-full",
        )}
        style={{ aspectRatio: `${safeW} / ${safeH}` }}
      >
        <span className="px-3 py-1 font-mono text-sm font-medium text-ink">{label}</span>
      </div>
    </div>
  );
}

export function AspectRatioCalculatorTool() {
  const [mode, setMode] = useState<Mode>("ratio");
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [origWidth, setOrigWidth] = useState(DEFAULT_WIDTH);
  const [origHeight, setOrigHeight] = useState(DEFAULT_HEIGHT);
  const [targetWidth, setTargetWidth] = useState("1280");
  const [targetHeight, setTargetHeight] = useState("720");
  const [resizeWidth, setResizeWidth] = useState(DEFAULT_WIDTH);
  const [resizeHeight, setResizeHeight] = useState(DEFAULT_HEIGHT);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [customRatioW, setCustomRatioW] = useState("16");
  const [customRatioH, setCustomRatioH] = useState("9");
  const [customWidth, setCustomWidth] = useState("1600");
  const [selectedPreset, setSelectedPreset] = useState<string | null>("16:9");

  const [swapping, setSwapping] = useState(false);

  const widthParsed = parseDimension(width);
  const heightParsed = parseDimension(height);

  const ratioResult = useMemo(() => {
    if (!widthParsed.value || !heightParsed.value) return null;
    return calculateAspectRatio(widthParsed.value, heightParsed.value);
  }, [heightParsed.value, widthParsed.value]);

  const heightResult = useMemo(() => {
    const ow = parseDimension(origWidth).value;
    const oh = parseDimension(origHeight).value;
    const tw = parseDimension(targetWidth).value;
    if (!ow || !oh || !tw) return null;
    const exact = calculateHeight(ow, oh, tw);
    return { exact, rounded: Math.round(exact), targetWidth: tw };
  }, [origHeight, origWidth, targetWidth]);

  const widthResult = useMemo(() => {
    const ow = parseDimension(origWidth).value;
    const oh = parseDimension(origHeight).value;
    const th = parseDimension(targetHeight).value;
    if (!ow || !oh || !th) return null;
    const exact = calculateWidth(ow, oh, th);
    return { exact, rounded: Math.round(exact), targetHeight: th };
  }, [origHeight, origWidth, targetHeight]);

  const customResult = useMemo(() => {
    const rw = parseDimension(customRatioW).value;
    const rh = parseDimension(customRatioH).value;
    const cw = parseDimension(customWidth).value;
    if (!rw || !rh || !cw) return null;
    const dims = dimensionFromRatio(rw, rh, cw);
    if (!dims) return null;
    return { width: cw, height: dims.height, exact: dims.height, rounded: Math.round(dims.height), label: `${rw}:${rh}` };
  }, [customRatioH, customRatioW, customWidth]);

  const applyDimensions = (w: number, h: number, preset?: string) => {
    const nextW = String(w);
    const nextH = String(h);
    setWidth(nextW);
    setHeight(nextH);
    setOrigWidth(nextW);
    setOrigHeight(nextH);
    setResizeWidth(nextW);
    setResizeHeight(nextH);
    setSelectedPreset(preset ?? null);
  };

  const applyPreset = (preset: AspectRatioPreset) => {
    applyDimensions(preset.width, preset.height, preset.label);
    setCustomRatioW(String(preset.w));
    setCustomRatioH(String(preset.h));
  };

  const onSwap = () => {
    setSwapping(true);
    setWidth(height);
    setHeight(width);
    setSelectedPreset(null);
    window.setTimeout(() => setSwapping(false), 300);
  };

  const onReset = () => {
    applyDimensions(1920, 1080, "16:9");
    setTargetWidth("1280");
    setTargetHeight("720");
    setCustomRatioW("16");
    setCustomRatioH("9");
    setCustomWidth("1600");
    setLockAspectRatio(true);
    setMode("ratio");
  };

  const onResizeWidthChange = (value: string) => {
    setResizeWidth(value);
    if (!lockAspectRatio) return;
    const w = parseDimension(value).value;
    const ow = parseDimension(width).value;
    const oh = parseDimension(height).value;
    if (w && ow && oh) setResizeHeight(formatDecimal(calculateHeight(ow, oh, w)));
  };

  const onResizeHeightChange = (value: string) => {
    setResizeHeight(value);
    if (!lockAspectRatio) return;
    const h = parseDimension(value).value;
    const ow = parseDimension(width).value;
    const oh = parseDimension(height).value;
    if (h && ow && oh) setResizeWidth(formatDecimal(calculateWidth(ow, oh, h)));
  };

  const activePreview = useMemo(() => {
    if (mode === "ratio" && ratioResult) {
      return { ratioW: ratioResult.ratioW, ratioH: ratioResult.ratioH, label: ratioResult.simplified };
    }
    if (mode === "custom") {
      const rw = parseDimension(customRatioW).value;
      const rh = parseDimension(customRatioH).value;
      if (rw && rh) return { ratioW: rw, ratioH: rh, label: `${rw}:${rh}` };
    }
    if (mode === "height") {
      const ow = parseDimension(origWidth).value;
      const oh = parseDimension(origHeight).value;
      if (ow && oh) {
        const r = calculateAspectRatio(ow, oh);
        return { ratioW: r.ratioW, ratioH: r.ratioH, label: r.simplified };
      }
    }
    if (mode === "width") {
      const ow = parseDimension(origWidth).value;
      const oh = parseDimension(origHeight).value;
      if (ow && oh) {
        const r = calculateAspectRatio(ow, oh);
        return { ratioW: r.ratioW, ratioH: r.ratioH, label: r.simplified };
      }
    }
    if (mode === "resize") {
      const rw = parseDimension(resizeWidth).value;
      const rh = parseDimension(resizeHeight).value;
      if (rw && rh) {
        const r = calculateAspectRatio(rw, rh);
        return { ratioW: r.ratioW, ratioH: r.ratioH, label: r.simplified };
      }
    }
    return { ratioW: 16, ratioH: 9, label: "16:9" };
  }, [
    customRatioH,
    customRatioW,
    mode,
    origHeight,
    origWidth,
    ratioResult,
    resizeHeight,
    resizeWidth,
  ]);

  const resultCard = (
    <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-4 sm:p-5" aria-live="polite">
      <h3 className="font-display text-lg font-semibold text-ink">Result</h3>
      {mode === "ratio" && ratioResult ? (
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Aspect ratio</p>
            <p className="font-display text-3xl font-semibold text-ink">{ratioResult.simplified}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Width</p>
              <p className="font-mono text-sm">{widthParsed.value} px</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Height</p>
              <p className="font-mono text-sm">{heightParsed.value} px</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Decimal ratio</p>
              <p className="font-mono text-sm">{formatDecimal(ratioResult.decimal)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Simplified ratio</p>
              <p className="font-mono text-sm">{ratioResult.simplified}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyAction label="Copy Ratio" value={ratioResult.simplified} />
            <CopyAction label="Copy Dimensions" value={`${widthParsed.value} × ${heightParsed.value} px`} />
            <CopyAction label="Copy Decimal" value={formatDecimal(ratioResult.decimal)} />
          </div>
        </div>
      ) : null}
      {mode === "height" && heightResult ? (
        <div className="mt-4 space-y-3">
          <p className="font-display text-3xl font-semibold text-ink">
            {heightResult.targetWidth} × {formatDecimal(heightResult.exact)} px
          </p>
          <p className="text-sm text-muted-foreground">Exact height: {formatDecimal(heightResult.exact)} px</p>
          <p className="text-sm text-muted-foreground">Rounded height: {heightResult.rounded} px</p>
          <CopyAction label="Copy Dimensions" value={`${heightResult.targetWidth} × ${formatDecimal(heightResult.exact)} px`} />
        </div>
      ) : null}
      {mode === "width" && widthResult ? (
        <div className="mt-4 space-y-3">
          <p className="font-display text-3xl font-semibold text-ink">
            {formatDecimal(widthResult.exact)} × {widthResult.targetHeight} px
          </p>
          <p className="text-sm text-muted-foreground">Exact width: {formatDecimal(widthResult.exact)} px</p>
          <p className="text-sm text-muted-foreground">Rounded width: {widthResult.rounded} px</p>
          <CopyAction label="Copy Dimensions" value={`${formatDecimal(widthResult.exact)} × ${widthResult.targetHeight} px`} />
        </div>
      ) : null}
      {mode === "resize" ? (
        <div className="mt-4 space-y-3">
          <p className="font-display text-3xl font-semibold text-ink">
            {resizeWidth || "—"} × {resizeHeight || "—"} px
          </p>
          <CopyAction label="Copy Dimensions" value={`${resizeWidth} × ${resizeHeight} px`} disabled={!resizeWidth || !resizeHeight} />
        </div>
      ) : null}
      {mode === "custom" && customResult ? (
        <div className="mt-4 space-y-3">
          <p className="font-display text-3xl font-semibold text-ink">{customResult.label}</p>
          <p className="font-mono text-sm">
            {customResult.width} × {formatDecimal(customResult.exact)} px
          </p>
          <p className="text-sm text-muted-foreground">Rounded height: {customResult.rounded} px</p>
          <CopyAction label="Copy Dimensions" value={`${customResult.width} × ${formatDecimal(customResult.exact)} px`} />
        </div>
      ) : null}
      {!ratioResult && mode === "ratio" ? <p className="mt-4 text-sm text-muted-foreground">Enter width and height to calculate the ratio.</p> : null}
      <div className="mt-6">
        <RatioPreview ratioW={activePreview.ratioW} ratioH={activePreview.ratioH} label={activePreview.label} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <TabsList className="flex h-auto flex-wrap gap-1">
              <TabsTrigger value="ratio">Calculate Ratio</TabsTrigger>
              <TabsTrigger value="height">Calculate Height</TabsTrigger>
              <TabsTrigger value="width">Calculate Width</TabsTrigger>
              <TabsTrigger value="resize">Resize</TabsTrigger>
              <TabsTrigger value="custom">Custom Ratio</TabsTrigger>
            </TabsList>

            <TabsContent value="ratio" className="mt-4 space-y-4">
              <div
                className={cn(
                  "grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end transition-transform duration-300 motion-reduce:transition-none",
                  swapping && "scale-[0.98] motion-reduce:scale-100",
                )}
              >
                <DimensionField id="ratio-width" label="Width" value={width} onChange={setWidth} error={widthParsed.error} />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mb-1 h-11 w-11 shrink-0"
                  onClick={onSwap}
                  aria-label="Swap width and height"
                >
                  <ArrowUpDown className={cn("h-4 w-4 transition-transform duration-300 motion-reduce:transition-none", swapping && "rotate-180")} />
                </Button>
                <DimensionField id="ratio-height" label="Height" value={height} onChange={setHeight} error={heightParsed.error} />
              </div>
            </TabsContent>

            <TabsContent value="height" className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DimensionField id="orig-width-h" label="Original width" value={origWidth} onChange={setOrigWidth} error={parseDimension(origWidth).error} />
                <DimensionField id="orig-height-h" label="Original height" value={origHeight} onChange={setOrigHeight} error={parseDimension(origHeight).error} />
              </div>
              <DimensionField id="target-width-h" label="Target width" value={targetWidth} onChange={setTargetWidth} error={parseDimension(targetWidth).error} />
            </TabsContent>

            <TabsContent value="width" className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DimensionField id="orig-width-w" label="Original width" value={origWidth} onChange={setOrigWidth} error={parseDimension(origWidth).error} />
                <DimensionField id="orig-height-w" label="Original height" value={origHeight} onChange={setOrigHeight} error={parseDimension(origHeight).error} />
              </div>
              <DimensionField id="target-height-w" label="Target height" value={targetHeight} onChange={setTargetHeight} error={parseDimension(targetHeight).error} />
            </TabsContent>

            <TabsContent value="resize" className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DimensionField id="current-width" label="Current width" value={width} onChange={setWidth} error={widthParsed.error} />
                <DimensionField id="current-height" label="Current height" value={height} onChange={setHeight} error={heightParsed.error} />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="lock-ratio" checked={lockAspectRatio} onCheckedChange={setLockAspectRatio} />
                <Label htmlFor="lock-ratio">Lock aspect ratio</Label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <DimensionField id="resize-width" label="New width" value={resizeWidth} onChange={onResizeWidthChange} error={parseDimension(resizeWidth).error} />
                <DimensionField id="resize-height" label="New height" value={resizeHeight} onChange={onResizeHeightChange} error={parseDimension(resizeHeight).error} />
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                <DimensionField id="custom-ratio-w" label="Ratio width" value={customRatioW} onChange={setCustomRatioW} error={parseDimension(customRatioW).error} />
                <span className="pb-2 text-center font-mono text-muted-foreground">:</span>
                <DimensionField id="custom-ratio-h" label="Ratio height" value={customRatioH} onChange={setCustomRatioH} error={parseDimension(customRatioH).error} />
              </div>
              <DimensionField id="custom-width" label="Width" value={customWidth} onChange={setCustomWidth} error={parseDimension(customWidth).error} />
            </TabsContent>
          </Tabs>
        </div>

        {resultCard}
      </div>

      <section>
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Common aspect ratios</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {ASPECT_RATIO_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className={cn(
                "rounded-lg border px-3 py-3 text-left transition-colors hover:border-primary/40",
                selectedPreset === preset.label ? "border-primary bg-primary/5" : "border-[var(--hairline)] bg-surface-soft",
              )}
            >
              <p className="font-mono text-sm font-medium text-ink">{preset.label}</p>
              <p className="text-xs text-muted-foreground">{preset.name}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {preset.width} × {preset.height}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Popular resolutions</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_RESOLUTIONS.map((resolution) => (
            <button
              key={resolution.label}
              type="button"
              onClick={() => applyDimensions(resolution.width, resolution.height)}
              className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-3 py-3 text-left transition-colors hover:border-primary/40"
            >
              <p className="text-sm font-medium text-ink">{resolution.label}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {resolution.width} × {resolution.height}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-4 text-sm leading-relaxed text-[var(--body)]">
        <h3 className="font-display text-lg font-semibold text-ink">Formula</h3>
        <p className="mt-3">
          Target Height = Target Width × Original Height ÷ Original Width
        </p>
        <p className="mt-2">
          Target Width = Target Height × Original Width ÷ Original Height
        </p>
      </section>
    </div>
  );
}
