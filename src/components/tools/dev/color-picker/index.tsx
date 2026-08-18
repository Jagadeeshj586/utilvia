"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { contrastRatio, contrastSummary, wcagResults } from "@/lib/color/contrast";
import { cssHsla, cssRgba, normalizeHex, validateHex } from "@/lib/color/conversion";
import { extractDominantColors, loadImageFromFile, sampleColorFromImage } from "@/lib/color/image";
import { colorName } from "@/lib/color/names";
import {
  analogousPalette,
  complementaryPalette,
  monochromaticPalette,
  shadeScale,
  splitComplementaryPalette,
  tetradicPalette,
  tintScale,
  triadicPalette,
  type PaletteSwatch,
} from "@/lib/color/palette";
import { copyText } from "@/lib/security/clipboard";
import {
  clearColorHistory,
  clearLocalColorData,
  loadColorHistory,
  loadFavorites,
  removeFavorite,
  toggleFavorite,
} from "@/lib/color/storage";
import { cn } from "@/lib/utils";
import { useColorPicker } from "@/hooks/use-color-picker";
import {
  ArrowLeftRight,
  Heart,
  ImagePlus,
  Pipette,
  RotateCcw,
  Share2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { CMYK } from "@/lib/color/types";

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    const ok = await copyText(value);
    if (ok) {
      setCopied(true);
      toast.success(label ?? "Copied!");
      window.setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Could not copy");
    }
  };
  return (
    <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 px-2" onClick={() => void onCopy()} aria-label={`Copy ${label ?? value}`}>
      {copied ? <Check className="h-3.5 w-3.5 text-teal" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
    </Button>
  );
}

function Checkerboard({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div
      className={cn("bg-[length:12px_12px] bg-[position:0_0,6px_6px]", className)}
      style={{
        backgroundImage:
          "linear-gradient(45deg, #e8e6df 25%, transparent 25%), linear-gradient(-45deg, #e8e6df 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8e6df 75%), linear-gradient(-45deg, transparent 75%, #e8e6df 75%)",
      }}
    >
      {children}
    </div>
  );
}

function ColorCanvas({
  hue,
  saturation,
  value,
  onChange,
}: {
  hue: number;
  saturation: number;
  value: number;
  onChange: (s: number, v: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    const gradH = ctx.createLinearGradient(0, 0, width, 0);
    gradH.addColorStop(0, "#ffffff");
    gradH.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
    ctx.fillStyle = gradH;
    ctx.fillRect(0, 0, width, height);
    const gradV = ctx.createLinearGradient(0, 0, 0, height);
    gradV.addColorStop(0, "rgba(0,0,0,0)");
    gradV.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = gradV;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  useEffect(() => {
    draw();
  }, [draw]);

  const pick = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(rect.width, Math.max(0, clientX - rect.left));
    const y = Math.min(rect.height, Math.max(0, clientY - rect.top));
    onChange((x / rect.width) * 100, 100 - (y / rect.height) * 100);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    pick(event.clientX, event.clientY);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return;
    pick(event.clientX, event.clientY);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const step = event.shiftKey ? 10 : 2;
    let s = saturation;
    let v = value;
    if (event.key === "ArrowLeft") s -= step;
    if (event.key === "ArrowRight") s += step;
    if (event.key === "ArrowUp") v += step;
    if (event.key === "ArrowDown") v -= step;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      onChange(Math.min(100, Math.max(0, s)), Math.min(100, Math.max(0, v)));
    }
  };

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={560}
        height={280}
        role="slider"
        tabIndex={0}
        aria-label="Saturation and brightness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(saturation)}
        className="h-[220px] w-full cursor-crosshair rounded-xl border border-[var(--hairline)] sm:h-[280px]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
      />
      <span
        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
        style={{
          left: `${saturation}%`,
          top: `${100 - value}%`,
          background: `hsl(${hue}, ${saturation}%, ${value / 2}%)`,
        }}
      />
    </div>
  );
}

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <Label>Hue</Label>
        <span className="font-mono text-muted-foreground">{Math.round(hue)}°</span>
      </div>
      <div
        className="relative h-3 rounded-full"
        style={{
          background:
            "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        }}
      >
        <Slider
          value={[hue]}
          min={0}
          max={360}
          step={1}
          onValueChange={([h]) => onChange(h)}
          aria-label="Hue"
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}

function AlphaSlider({ alpha, color, onChange }: { alpha: number; color: string; onChange: (a: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <Label>Alpha</Label>
        <span className="font-mono text-muted-foreground">{Math.round(alpha * 100)}%</span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full">
        <Checkerboard className="absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to right, transparent, ${color})` }}
        />
        <Slider
          value={[alpha * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([a]) => onChange(a / 100)}
          aria-label="Alpha"
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1 flex items-center gap-1">
        <Input
          type="number"
          min={min}
          max={max}
          value={Math.round(value)}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-9 font-mono text-sm"
        />
        {suffix ? <span className="text-xs text-muted-foreground">{suffix}</span> : null}
      </div>
    </div>
  );
}

function PaletteRow({ title, swatches }: { title: string; swatches: PaletteSwatch[] }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-ink">{title}</h4>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {swatches.map((swatch) => (
          <div key={`${title}-${swatch.label}`} className="overflow-hidden rounded-lg border border-[var(--hairline)]">
            <div className="h-14" style={{ background: swatch.formats.hex.slice(0, 7) }} />
            <div className="flex items-center justify-between gap-1 px-2 py-1.5">
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{swatch.label}</p>
                <p className="truncate font-mono text-xs">{swatch.formats.hex.slice(0, 7)}</p>
              </div>
              <CopyButton value={swatch.formats.hex.slice(0, 7)} label={swatch.label} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WcagBadge({ label, level }: { label: string; level: "pass" | "fail" }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--hairline)] px-3 py-2 text-sm">
      <span>{label}</span>
      <span className={cn("font-medium", level === "pass" ? "text-teal" : "text-destructive")}>
        {level === "pass" ? "Pass ✓" : "Fail ✗"}
      </span>
    </div>
  );
}

export function ColorPickerTool() {
  const picker = useColorPicker();
  const { formats, hsv, alpha, previewHex } = picker;
  const [hexInput, setHexInput] = useState(formats.hex.slice(0, 7));
  const [hexError, setHexError] = useState<string | null>(null);
  const [history, setHistory] = useState(loadColorHistory());
  const [favorites, setFavorites] = useState(loadFavorites());
  const [contrastFg, setContrastFg] = useState(formats.hex.slice(0, 7));
  const [contrastBg, setContrastBg] = useState("#faf9f5");
  const [paletteTab, setPaletteTab] = useState("complementary");
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [gradientAngle, setGradientAngle] = useState(90);
  const [gradientColors, setGradientColors] = useState(["#cc785c", "#e8a55a", "#5db8a6"]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [extracted, setExtracted] = useState<string[]>([]);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pickedFromImage, setPickedFromImage] = useState<string | null>(null);
  const isFavorite = favorites.some((item) => item.hex === formats.hex.slice(0, 7));

  useEffect(() => {
    setHexInput(formats.hex.slice(0, 7));
    setHexError(null);
  }, [formats.hex]);

  const ratio = contrastRatio(contrastFg, contrastBg);
  const wcag = ratio ? wcagResults(ratio) : null;

  const gradientBackground =
    gradientType === "linear"
      ? `linear-gradient(${gradientAngle}deg, ${gradientColors.join(", ")})`
      : `radial-gradient(circle at center, ${gradientColors.join(", ")})`;

  const gradientCss = `background: ${gradientBackground};`;

  const onHexCommit = () => {
    if (!validateHex(hexInput)) {
      setHexError("Enter a valid HEX color.");
      return;
    }
    picker.setFromHex(hexInput);
    setHexError(null);
  };

  const onShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Color Picker", url: picker.shareUrl });
        return;
      } catch {
        /* user cancelled */
      }
    }
    const ok = await copyText(picker.shareUrl);
    if (ok) toast.success("Share link copied");
  };

  const onImageFile = async (file: File) => {
    setImageError(null);
    try {
      const img = await loadImageFromFile(file);
      setImage(img);
      setExtracted([]);
      setPickedFromImage(null);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Unable to load image.");
    }
  };

  const onImagePointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!image) return;
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const sample = sampleColorFromImage(image, x, y, canvas);
    if (sample) setPickedFromImage(sample.hex.slice(0, 7));
  };

  const onImageClick = () => {
    if (pickedFromImage) picker.setFromHex(pickedFromImage);
  };

  useEffect(() => {
    if (!image || !imageCanvasRef.current) return;
    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const maxW = 640;
    const scale = Math.min(1, maxW / image.width);
    canvas.width = Math.floor(image.width * scale);
    canvas.height = Math.floor(image.height * scale);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  }, [image]);

  const paletteMap: Record<string, PaletteSwatch[]> = {
    complementary: complementaryPalette(formats),
    analogous: analogousPalette(formats),
    triadic: triadicPalette(formats),
    split: splitComplementaryPalette(formats),
    tetradic: tetradicPalette(formats),
    mono: monochromaticPalette(formats),
  };

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Pick, convert, analyze, and export colors. Your colors and images are processed locally in your browser.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <ColorCanvas
            hue={hsv.h}
            saturation={hsv.s}
            value={hsv.v}
            onChange={(s, v) => picker.setHsv({ ...hsv, s, v })}
          />
          <HueSlider hue={hsv.h} onChange={picker.setHue} />
          <AlphaSlider alpha={alpha} color={formats.hex.slice(0, 7)} onChange={picker.setAlpha} />
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-[var(--hairline)]">
            <Checkerboard className="relative">
              <div className="h-32 sm:h-40" style={{ background: previewHex }} />
            </Checkerboard>
            <div className="space-y-3 border-t border-[var(--hairline)] bg-surface-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">{colorName(formats.hex)}</p>
                  <p className="font-mono text-sm">{formats.hex.slice(0, 7)}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = toggleFavorite({ hex: formats.hex.slice(0, 7), alpha, name: colorName(formats.hex) });
                      setFavorites(next);
                    }}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={cn("h-4 w-4", isFavorite && "fill-primary text-primary")} />
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void onShare()} aria-label="Share color">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={picker.reset} aria-label="Reset color">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {[
                ["HEX", formats.hex.slice(0, 7)],
                ["RGB", cssRgba(formats.rgb, alpha)],
                ["HSL", cssHsla(formats.hsl, alpha)],
                ["HSV", `hsv(${Math.round(formats.hsv.h)}, ${Math.round(formats.hsv.s)}%, ${Math.round(formats.hsv.v)}%)`],
                [
                  "CMYK",
                  `cmyk(${Math.round(formats.cmyk.c)}%, ${Math.round(formats.cmyk.m)}%, ${Math.round(formats.cmyk.y)}%, ${Math.round(formats.cmyk.k)}%)`,
                ],
                ["Alpha", `${Math.round(alpha * 100)}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-2 rounded-lg bg-surface-soft px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="truncate font-mono text-sm">{value}</p>
                  </div>
                  <CopyButton value={value} label={label} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <h3 className="font-display text-lg font-semibold text-ink">Color formats</h3>
        <Tabs defaultValue="hex" className="mt-4">
          <TabsList className="flex h-auto flex-wrap gap-1">
            {["hex", "rgb", "hsl", "hsv", "cmyk"].map((tab) => (
              <TabsTrigger key={tab} value={tab} className="uppercase">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="hex">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label htmlFor="hex-input">HEX</Label>
                <Input
                  id="hex-input"
                  value={hexInput}
                  onChange={(event) => setHexInput(event.target.value)}
                  onBlur={onHexCommit}
                  onKeyDown={(event) => event.key === "Enter" && onHexCommit()}
                  className="mt-1 font-mono"
                />
                {hexError ? <p className="mt-1 text-sm text-destructive">{hexError}</p> : null}
              </div>
              <CopyButton value={formats.hex.slice(0, 7)} label="HEX" />
            </div>
          </TabsContent>
          <TabsContent value="rgb">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(["r", "g", "b"] as const).map((channel) => (
                <NumberField
                  key={channel}
                  label={channel.toUpperCase()}
                  value={formats.rgb[channel]}
                  min={0}
                  max={255}
                  onChange={(value) => picker.setFromRgb({ ...formats.rgb, [channel]: value })}
                />
              ))}
              <NumberField label="A" value={alpha * 255} min={0} max={255} onChange={(value) => picker.setAlpha(value / 255)} />
            </div>
          </TabsContent>
          <TabsContent value="hsl">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <NumberField label="H" value={formats.hsl.h} min={0} max={360} suffix="°" onChange={(h) => picker.setFromHsl({ ...formats.hsl, h })} />
              <NumberField label="S" value={formats.hsl.s} min={0} max={100} suffix="%" onChange={(s) => picker.setFromHsl({ ...formats.hsl, s })} />
              <NumberField label="L" value={formats.hsl.l} min={0} max={100} suffix="%" onChange={(l) => picker.setFromHsl({ ...formats.hsl, l })} />
            </div>
          </TabsContent>
          <TabsContent value="hsv">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <NumberField label="H" value={formats.hsv.h} min={0} max={360} suffix="°" onChange={(h) => picker.setFromHsv({ ...formats.hsv, h })} />
              <NumberField label="S" value={formats.hsv.s} min={0} max={100} suffix="%" onChange={(s) => picker.setFromHsv({ ...formats.hsv, s })} />
              <NumberField label="V" value={formats.hsv.v} min={0} max={100} suffix="%" onChange={(v) => picker.setFromHsv({ ...formats.hsv, v })} />
            </div>
          </TabsContent>
          <TabsContent value="cmyk">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(["c", "m", "y", "k"] as const).map((channel) => (
                <NumberField
                  key={channel}
                  label={channel.toUpperCase()}
                  value={formats.cmyk[channel]}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={(value) => picker.setFromCmyk({ ...formats.cmyk, [channel]: value } as CMYK)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <h3 className="font-display text-lg font-semibold text-ink">CSS snippets</h3>
        <div className="mt-4 space-y-2">
          {[
            `color: ${formats.hex.slice(0, 7)};`,
            `background-color: ${formats.hex.slice(0, 7)};`,
            `color: ${cssRgba(formats.rgb, alpha)};`,
            `color: ${cssHsla(formats.hsl, alpha)};`,
          ].map((snippet) => (
            <div key={snippet} className="flex items-center justify-between gap-2 rounded-lg bg-surface-soft px-3 py-2">
              <code className="truncate font-mono text-xs sm:text-sm">{snippet}</code>
              <CopyButton value={snippet} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-ink">Generate palette</h3>
          <select
            value={paletteTab}
            onChange={(event) => setPaletteTab(event.target.value)}
            className="h-9 rounded-lg border border-[var(--hairline)] bg-canvas px-3 text-sm"
            aria-label="Palette type"
          >
            <option value="complementary">Complementary</option>
            <option value="analogous">Analogous</option>
            <option value="triadic">Triadic</option>
            <option value="split">Split complementary</option>
            <option value="tetradic">Tetradic</option>
            <option value="mono">Monochromatic</option>
          </select>
        </div>
        <div className="mt-4">
          <PaletteRow title={paletteTab} swatches={paletteMap[paletteTab] ?? []} />
        </div>
        <div className="mt-6 space-y-4">
          <PaletteRow title="Shades" swatches={shadeScale(formats)} />
          <PaletteRow title="Tints" swatches={tintScale(formats)} />
        </div>
        <div className="mt-4">
          <CopyButton
            value={(paletteMap[paletteTab] ?? []).map((s) => s.formats.hex.slice(0, 7)).join("\n")}
            label="Palette export"
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-semibold text-ink">Contrast checker</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setContrastFg(contrastBg);
                setContrastBg(contrastFg);
              }}
            >
              <ArrowLeftRight className="mr-1 h-4 w-4" />
              Swap
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="fg-color">Foreground</Label>
              <Input id="fg-color" value={contrastFg} onChange={(event) => setContrastFg(event.target.value)} className="mt-1 font-mono" />
            </div>
            <div>
              <Label htmlFor="bg-color">Background</Label>
              <Input id="bg-color" value={contrastBg} onChange={(event) => setContrastBg(event.target.value)} className="mt-1 font-mono" />
            </div>
          </div>
          {ratio && wcag ? (
            <div className="mt-4 space-y-3">
              <p className="text-2xl font-semibold tabular-nums">{ratio.toFixed(2)}:1</p>
              <p className="text-sm text-muted-foreground">{contrastSummary(ratio)}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <WcagBadge label="Normal text AA" level={wcag.normalAA} />
                <WcagBadge label="Normal text AAA" level={wcag.normalAAA} />
                <WcagBadge label="Large text AA" level={wcag.largeAA} />
                <WcagBadge label="Large text AAA" level={wcag.largeAAA} />
              </div>
              <div className="rounded-lg border border-[var(--hairline)] p-4" style={{ background: normalizeHex(contrastBg) ?? "#fff", color: normalizeHex(contrastFg) ?? "#000" }}>
                <p className="text-3xl font-semibold">Aa</p>
                <p className="mt-2 text-sm">The quick brown fox jumps over the lazy dog.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setContrastFg(formats.hex.slice(0, 7))}>
                Use current color as foreground
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-destructive">Enter valid foreground and background colors.</p>
          )}
        </section>

        <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <h3 className="font-display text-lg font-semibold text-ink">Gradient generator</h3>
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <Button type="button" variant={gradientType === "linear" ? "default" : "outline"} size="sm" onClick={() => setGradientType("linear")}>
                Linear
              </Button>
              <Button type="button" variant={gradientType === "radial" ? "default" : "outline"} size="sm" onClick={() => setGradientType("radial")}>
                Radial
              </Button>
            </div>
            {gradientType === "linear" ? (
              <div>
                <Label>Angle: {gradientAngle}°</Label>
                <Slider value={[gradientAngle]} min={0} max={360} step={1} onValueChange={([a]) => setGradientAngle(a)} className="mt-2" />
              </div>
            ) : null}
            {gradientColors.map((color, index) => (
              <div key={`grad-${index}`}>
                <Label>Color {index + 1}</Label>
                <Input
                  value={color}
                  onChange={(event) => {
                    const next = [...gradientColors];
                    next[index] = event.target.value;
                    setGradientColors(next);
                  }}
                  className="mt-1 font-mono"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setGradientColors([...gradientColors.slice(0, 2), formats.hex.slice(0, 7)])}
            >
              Use current color
            </Button>
            <div className="h-24 rounded-lg border border-[var(--hairline)]" style={{ background: gradientBackground }} />
            <CopyButton value={gradientCss} label="CSS gradient" />
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <h3 className="font-display text-lg font-semibold text-ink">Pick color from image</h3>
        <p className="mt-1 text-sm text-muted-foreground">Upload PNG, JPG, or WebP. Click a pixel to apply the color.</p>
        <label
          className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-8 transition hover:border-primary/40"
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files?.[0];
            if (file) void onImageFile(file);
          }}
        >
          <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">Upload or drop an image</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onImageFile(file);
              event.target.value = "";
            }}
          />
        </label>
        {imageError ? <p className="mt-2 text-sm text-destructive">{imageError}</p> : null}
        {image ? (
          <div className="mt-4 space-y-3">
            <canvas
              ref={imageCanvasRef}
              className="max-h-80 w-full cursor-crosshair rounded-lg border border-[var(--hairline)]"
              onPointerMove={onImagePointer}
              onClick={onImageClick}
            />
            {pickedFromImage ? (
              <div className="flex items-center gap-3 rounded-lg bg-surface-soft p-3">
                <div className="h-10 w-10 rounded-md border border-[var(--hairline)]" style={{ background: pickedFromImage }} />
                <div>
                  <p className="text-xs text-muted-foreground">Selected</p>
                  <p className="font-mono text-sm">{pickedFromImage}</p>
                </div>
                <CopyButton value={pickedFromImage} />
              </div>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!image) return;
                setExtracted(extractDominantColors(image, 10));
              }}
            >
              <Pipette className="mr-2 h-4 w-4" />
              Extract colors
            </Button>
            {extracted.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {extracted.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    className="overflow-hidden rounded-lg border border-[var(--hairline)] text-left"
                    onClick={() => picker.setFromHex(hex)}
                  >
                    <div className="h-12" style={{ background: hex }} />
                    <p className="px-2 py-1 font-mono text-xs">{hex}</p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-[var(--hairline)] px-4 py-6 text-sm text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
            Upload an image to pick colors from it.
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">Recent colors</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                clearColorHistory();
                setHistory([]);
              }}
            >
              Clear
            </Button>
          </div>
          {history.length ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {history.map((item) => (
                <div key={`${item.hex}-${item.savedAt}`} className="flex items-center gap-2 rounded-lg border border-[var(--hairline)] p-2">
                  <button type="button" className="h-8 w-8 shrink-0 rounded-md border border-[var(--hairline)]" style={{ background: item.hex }} onClick={() => picker.setFromHex(item.hex, item.alpha)} aria-label={`Select ${item.hex}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs">{item.hex}</p>
                  </div>
                  <CopyButton value={item.hex} />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No recent colors yet.</p>
          )}
        </section>

        <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <h3 className="font-display text-lg font-semibold text-ink">Favorites</h3>
          {favorites.length ? (
            <div className="mt-4 space-y-2">
              {favorites.map((item) => (
                <div key={item.hex} className="flex items-center gap-2 rounded-lg border border-[var(--hairline)] p-2">
                  <button type="button" className="h-8 w-8 shrink-0 rounded-md border border-[var(--hairline)]" style={{ background: item.hex }} onClick={() => picker.setFromHex(item.hex, item.alpha)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{item.name ?? item.hex}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">{item.hex}</p>
                  </div>
                  <CopyButton value={item.hex} />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFavorites(removeFavorite(item.hex))} aria-label="Remove favorite">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Save colors you use frequently.</p>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            clearLocalColorData();
            setHistory([]);
            setFavorites([]);
            toast.success("Local color data cleared");
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear local data
        </Button>
        <CopyButton value={(paletteMap[paletteTab] ?? []).map((s) => s.formats.hex.slice(0, 7)).join(", ")} label="Export palette" />
      </div>
    </div>
  );
}
