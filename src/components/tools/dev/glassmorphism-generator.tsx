"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_GLASS,
  EXPORT_FORMATS,
  GLASS_LIMITS,
  GLASS_PRESETS,
  PREVIEW_BACKGROUNDS,
  cloneGlass,
  generateGlassOutput,
  glassPreviewStyle,
  isValidTint,
  matchPresetId,
  normalizeTint,
  type GlassConfig,
  type GlassExportFormat,
  type GlassPreviewBg,
} from "@/lib/glassmorphism/glass";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

const PREVIEW_SCENE: Record<GlassPreviewBg, string> = {
  gradient: "linear-gradient(135deg, #cc785c 0%, #e8a55a 48%, #5db8a6 100%)",
  photo: [
    "radial-gradient(ellipse 42% 34% at 78% 18%, rgba(232,165,90,0.95) 0%, transparent 62%)",
    "radial-gradient(ellipse 55% 42% at 12% 88%, rgba(204,120,92,0.7) 0%, transparent 68%)",
    "radial-gradient(ellipse 30% 24% at 42% 36%, rgba(93,184,166,0.35) 0%, transparent 70%)",
    "linear-gradient(180deg, #e7efe9 0%, #f3e6d4 38%, #d9b49a 68%, #8a5a48 100%)",
  ].join(", "),
  dark: [
    "radial-gradient(ellipse 50% 40% at 22% 18%, rgba(204,120,92,0.38), transparent 58%)",
    "radial-gradient(ellipse 40% 36% at 86% 78%, rgba(232,165,90,0.22), transparent 55%)",
    "linear-gradient(180deg, #252320, #181715)",
  ].join(", "),
};

export function GlassmorphismGenerator() {
  const [config, setConfig] = useState<GlassConfig>(() => cloneGlass());
  const [tintDraft, setTintDraft] = useState(DEFAULT_GLASS.tint);
  const [previewBg, setPreviewBg] = useState<GlassPreviewBg>("gradient");
  const [format, setFormat] = useState<GlassExportFormat>("css");
  const [copied, setCopied] = useState(false);

  const presetId = matchPresetId(config);
  const output = useMemo(() => generateGlassOutput(config, format), [config, format]);
  const previewStyle = useMemo(() => glassPreviewStyle(config), [config]);
  const onDark = previewBg === "dark";

  const patch = (partial: Partial<GlassConfig>) => {
    setConfig((current) => ({ ...current, ...partial }));
    setCopied(false);
  };

  const applyPreset = (id: string) => {
    const preset = GLASS_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setConfig(cloneGlass(preset.config));
    setTintDraft(preset.config.tint);
    setCopied(false);
  };

  const reset = () => {
    setConfig(cloneGlass());
    setTintDraft(DEFAULT_GLASS.tint);
    setPreviewBg("gradient");
    setFormat("css");
    setCopied(false);
  };

  const copy = async () => {
    const ok = await copyText(output);
    if (!ok) {
      toast.error("Could not copy CSS");
      return;
    }
    setCopied(true);
    toast.success("Copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const commitTint = (value: string) => {
    setTintDraft(value);
    const tint = normalizeTint(value);
    if (tint) patch({ tint });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted-ink)]">
        Tune blur, tint, and radius, then copy CSS, Tailwind, or variables. The preview updates as you edit.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Configure</p>
            <p className="mt-3 text-sm font-medium text-ink">Presets</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {GLASS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={presetId === preset.id}
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    presetId === preset.id
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <SliderRow
            label="Blur"
            valueLabel={`${config.blur}px`}
            min={GLASS_LIMITS.blur.min}
            max={GLASS_LIMITS.blur.max}
            value={config.blur}
            onChange={(blur) => patch({ blur })}
          />
          <SliderRow
            label="Transparency"
            valueLabel={`${config.transparency}%`}
            min={GLASS_LIMITS.transparency.min}
            max={GLASS_LIMITS.transparency.max}
            value={config.transparency}
            onChange={(transparency) => patch({ transparency })}
          />
          <SliderRow
            label="Saturation"
            valueLabel={`${config.saturation}%`}
            min={GLASS_LIMITS.saturation.min}
            max={GLASS_LIMITS.saturation.max}
            value={config.saturation}
            onChange={(saturation) => patch({ saturation })}
          />

          <div>
            <Label htmlFor="glass-tint">Background color tint</Label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="glass-tint-picker"
                type="color"
                value={normalizeTint(config.tint) ?? "#ffffff"}
                aria-label="Glass tint color picker"
                className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--hairline)] bg-transparent"
                onChange={(event) => {
                  setTintDraft(event.target.value);
                  patch({ tint: event.target.value });
                }}
              />
              <Input
                id="glass-tint"
                value={tintDraft}
                spellCheck={false}
                aria-invalid={!isValidTint(tintDraft)}
                className="min-h-10 font-mono text-sm"
                onChange={(event) => commitTint(event.target.value)}
                onBlur={() => setTintDraft(config.tint)}
              />
            </div>
          </div>

          <SliderRow
            label="Border radius"
            valueLabel={`${config.radius}px`}
            min={GLASS_LIMITS.radius.min}
            max={GLASS_LIMITS.radius.max}
            value={config.radius}
            onChange={(radius) => patch({ radius })}
          />

          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <Switch
                id="glass-border"
                checked={config.borderEnabled}
                onCheckedChange={(borderEnabled) => patch({ borderEnabled })}
              />
              <Label htmlFor="glass-border">Border</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="glass-shadow"
                checked={config.shadowEnabled}
                onCheckedChange={(shadowEnabled) => patch({ shadowEnabled })}
              />
              <Label htmlFor="glass-shadow">Shadow</Label>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Preview background</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PREVIEW_BACKGROUNDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={previewBg === item.id}
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    previewBg === item.id
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => setPreviewBg(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4">
          <div
            className="grid min-h-[280px] place-items-center overflow-hidden rounded-xl border border-[var(--hairline)] p-6 sm:p-10"
            style={{ background: PREVIEW_SCENE[previewBg] }}
          >
            <div className="w-full max-w-sm p-6" style={previewStyle}>
              <p className={cn("font-display text-xl font-semibold tracking-tight", onDark ? "text-[#faf9f5]" : "text-ink")}>
                Glassmorphism preview
              </p>
              <p className={cn("mt-2 text-sm leading-relaxed", onDark ? "text-[#a09d96]" : "text-[var(--body)]")}>
                Frosted glass over a busy background. Copy the snippet when the blur and tint look right.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Output</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EXPORT_FORMATS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={format === item.id}
                      className={cn(
                        "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                        format === item.id
                          ? "border-coral bg-coral text-white"
                          : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                      )}
                      onClick={() => {
                        setFormat(item.id);
                        setCopied(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" className="min-h-10 min-w-28 px-6" onClick={() => void copy()}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button type="button" variant="outline" className="min-h-10" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>

            <Textarea
              readOnly
              value={output}
              className="mt-4 min-h-[240px] font-mono text-sm"
              aria-label="Generated glassmorphism CSS"
            />
            {format === "css" ? (
              <p className="mt-3 text-xs text-[var(--muted-ink)]">
                Includes a Firefox <code className="font-mono">@supports</code> fallback with a more opaque background.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  valueLabel,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-sm tabular-nums text-[var(--muted-ink)]">{valueLabel}</span>
      </div>
      <Slider
        className="mt-3"
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        aria-label={label}
      />
    </div>
  );
}
