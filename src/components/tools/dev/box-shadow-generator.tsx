"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronUp, Copy, Download, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  COLOR_FORMATS,
  DEFAULT_SHADOW,
  PREVIEW_BACKGROUNDS,
  SHADOW_LIMITS,
  SHADOW_PRESETS,
  addLayer,
  boxShadowValue,
  clonePreview,
  cloneShadow,
  formatLayer,
  formatLayerColor,
  generateShadowCss,
  matchPresetId,
  moveLayer,
  parseLayerColor,
  removeLayer,
  updateLayer,
  type ColorFormat,
  type ShadowConfig,
  type ShadowLayer,
  type ShadowPreview,
  type ShadowPreviewBg,
} from "@/lib/box-shadow/shadow";
import { copyText } from "@/lib/security/clipboard";
import { cn, downloadText } from "@/lib/utils";

const CHECKER =
  "bg-[length:16px_16px] bg-[linear-gradient(45deg,#e8e6e1_25%,transparent_25%),linear-gradient(-45deg,#e8e6e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e8e6e1_75%),linear-gradient(-45deg,transparent_75%,#e8e6e1_75%)] bg-[position:0_0,0_8px,8px_-8px,-8px_0]";

const PREVIEW_SCENE: Record<ShadowPreviewBg, string> = {
  cream: "#faf9f5",
  soft: "#efece4",
  dark: "#181715",
  checker: "",
};

export function BoxShadowGenerator() {
  const [config, setConfig] = useState<ShadowConfig>(() => cloneShadow());
  const [preview, setPreview] = useState<ShadowPreview>(() => clonePreview());
  const [selectedId, setSelectedId] = useState(DEFAULT_SHADOW.layers[0]!.id);
  const [colorDraft, setColorDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => generateShadowCss(config), [config]);
  const value = useMemo(() => boxShadowValue(config), [config]);
  const selected = config.layers.find((item) => item.id === selectedId) ?? config.layers[0]!;
  const presetId = matchPresetId(config);
  const parsedColor = parseLayerColor(colorDraft ?? formatLayerColor(selected, config.colorFormat));
  const onDark = preview.background === "dark";

  const apply = (next: ShadowConfig | { error: string }) => {
    if ("error" in next) {
      toast.error(next.error);
      return;
    }
    setConfig(next);
    setCopied(false);
  };

  const patchLayer = (id: string, patch: Partial<Omit<ShadowLayer, "id">>) => {
    apply(updateLayer(config, id, patch));
  };

  const reset = () => {
    const next = cloneShadow();
    setConfig(next);
    setPreview(clonePreview());
    setSelectedId(next.layers[0]!.id);
    setColorDraft(null);
    setCopied(false);
  };

  const copy = async () => {
    const ok = await copyText(css);
    if (!ok) {
      toast.error("Could not copy CSS");
      return;
    }
    setCopied(true);
    toast.success("CSS copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    downloadText(css, "box-shadow.css", "text/css;charset=utf-8");
    toast.success("Downloading box-shadow.css");
  };

  const onAdd = () => {
    const next = addLayer(config);
    if ("error" in next) {
      toast.error(next.error);
      return;
    }
    setConfig(next);
    setSelectedId(next.layers[next.layers.length - 1]!.id);
    setColorDraft(null);
    setCopied(false);
  };

  const onRemove = (id: string) => {
    const next = removeLayer(config, id);
    if ("error" in next) {
      toast.error(next.error);
      return;
    }
    setConfig(next);
    if (selectedId === id) setSelectedId(next.layers[0]!.id);
    setColorDraft(null);
    setCopied(false);
  };

  const applyPreset = (id: string) => {
    const preset = SHADOW_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    const next = cloneShadow(preset.config);
    next.colorFormat = config.colorFormat;
    setConfig(next);
    setSelectedId(next.layers[0]!.id);
    setColorDraft(null);
    setCopied(false);
  };

  const setFormat = (colorFormat: ColorFormat) => {
    setColorDraft(null);
    setConfig((current) => ({ ...current, colorFormat }));
    setCopied(false);
  };

  const commitColor = (raw: string) => {
    setColorDraft(raw);
    const parsed = parseLayerColor(raw);
    if (!parsed) return;
    patchLayer(selected.id, parsed);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted-ink)]">
        Tune offset, blur, spread, color, and inset layers, then copy or download the CSS. The preview updates as you
        edit.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button type="button" className="min-h-10 min-w-28 px-6" onClick={() => void copy()}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy CSS"}
        </Button>
        <Button type="button" variant="outline" className="min-h-10" onClick={download}>
          <Download className="h-4 w-4" />
          Download CSS
        </Button>
        <Button type="button" variant="outline" className="min-h-10" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Configure</p>
            <p className="mt-3 text-sm font-medium text-ink">Presets</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SHADOW_PRESETS.map((preset) => (
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

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">Shadow layers</p>
              <Button
                type="button"
                variant="outline"
                className="min-h-10"
                onClick={onAdd}
                disabled={config.layers.length >= SHADOW_LIMITS.maxLayers}
              >
                <Plus className="h-4 w-4" />
                Add layer
              </Button>
            </div>
            <ul className="mt-3 space-y-2">
              {config.layers.map((item, index) => {
                const active = item.id === selected.id;
                return (
                  <li key={item.id}>
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2",
                        active ? "border-coral bg-coral/10" : "border-[var(--hairline)] bg-canvas",
                      )}
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => {
                          setSelectedId(item.id);
                          setColorDraft(null);
                        }}
                      >
                        <span className="block text-sm font-medium text-ink">
                          Layer {index + 1}
                          {item.inset ? " · inset" : ""}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-xs text-[var(--muted-ink)]">
                          {formatLayer(item, config.colorFormat)}
                        </span>
                      </button>
                      <span
                        className="h-8 w-8 shrink-0 rounded-md border border-[var(--hairline)]"
                        style={{ background: formatLayerColor(item, "hex") }}
                        aria-hidden
                      />
                      <IconButton
                        label="Move earlier"
                        disabled={index === 0}
                        onClick={() => apply(moveLayer(config, item.id, -1))}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        label="Move later"
                        disabled={index === config.layers.length - 1}
                        onClick={() => apply(moveLayer(config, item.id, 1))}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        label="Remove layer"
                        disabled={config.layers.length <= SHADOW_LIMITS.minLayers}
                        onClick={() => onRemove(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--hairline)] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Inset shadow</p>
              <p className="text-xs text-[var(--muted-ink)]">Draw this layer inside the box instead of behind it.</p>
            </div>
            <Switch
              checked={selected.inset}
              onCheckedChange={(inset) => patchLayer(selected.id, { inset })}
              aria-label="Inset shadow"
            />
          </div>

          <SliderField
            label="Horizontal offset"
            unit="px"
            min={SHADOW_LIMITS.offset.min}
            max={SHADOW_LIMITS.offset.max}
            value={selected.offsetX}
            onChange={(offsetX) => patchLayer(selected.id, { offsetX })}
          />
          <SliderField
            label="Vertical offset"
            unit="px"
            min={SHADOW_LIMITS.offset.min}
            max={SHADOW_LIMITS.offset.max}
            value={selected.offsetY}
            onChange={(offsetY) => patchLayer(selected.id, { offsetY })}
          />
          <SliderField
            label="Blur radius"
            unit="px"
            min={SHADOW_LIMITS.blur.min}
            max={SHADOW_LIMITS.blur.max}
            value={selected.blur}
            onChange={(blur) => patchLayer(selected.id, { blur })}
          />
          <SliderField
            label="Spread radius"
            unit="px"
            min={SHADOW_LIMITS.spread.min}
            max={SHADOW_LIMITS.spread.max}
            value={selected.spread}
            onChange={(spread) => patchLayer(selected.id, { spread })}
          />
          <SliderField
            label="Shadow opacity"
            unit="%"
            min={SHADOW_LIMITS.opacity.min}
            max={SHADOW_LIMITS.opacity.max}
            value={selected.opacity}
            onChange={(opacity) => patchLayer(selected.id, { opacity })}
          />

          <div>
            <Label htmlFor="shadow-color">Shadow color</Label>
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-10 w-12 overflow-hidden rounded-lg border border-[var(--hairline)]">
                <input
                  id="shadow-color-picker"
                  type="color"
                  value={selected.color}
                  aria-label="Shadow color picker"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={(event) => {
                    setColorDraft(null);
                    patchLayer(selected.id, { color: event.target.value });
                  }}
                />
                <span className="pointer-events-none absolute inset-0" style={{ background: selected.color }} />
              </div>
              <Input
                id="shadow-color"
                value={colorDraft ?? formatLayerColor(selected, config.colorFormat)}
                spellCheck={false}
                aria-invalid={colorDraft != null && !parsedColor}
                className="min-h-10 font-mono text-sm"
                onChange={(event) => commitColor(event.target.value)}
                onBlur={() => setColorDraft(null)}
              />
            </div>
            {colorDraft != null && !parsedColor ? (
              <p className="mt-1 text-xs text-destructive" role="alert">
                Enter a HEX, RGB, or HSL color — for example #141413, rgb(20, 20, 19), or hsl(60, 3%, 8%).
              </p>
            ) : (
              <p className="mt-1 text-xs text-[var(--muted-ink)]">Accepts HEX, RGB, and HSL, with or without alpha.</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-ink">CSS color format</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Color format">
              {COLOR_FORMATS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={config.colorFormat === item.id}
                  title={item.hint}
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    config.colorFormat === item.id
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => setFormat(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
            <p className="text-sm font-medium text-ink">Live preview</p>
            <p className="mt-1 text-xs text-[var(--muted-ink)]">
              The sample box uses the same box-shadow value as the CSS below.
            </p>
            <div
              className={cn(
                "mt-3 grid min-h-[240px] place-items-center overflow-hidden rounded-lg border border-[var(--hairline)] p-6",
                preview.background === "checker" ? CHECKER : "",
              )}
              style={preview.background === "checker" ? undefined : { background: PREVIEW_SCENE[preview.background] }}
            >
              <div
                role="img"
                aria-label="Box shadow preview"
                className="border border-black/5"
                style={{
                  width: preview.width,
                  height: preview.height,
                  borderRadius: preview.radius,
                  background: preview.elementColor,
                  boxShadow: value,
                }}
              />
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-ink">Preview background</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PREVIEW_BACKGROUNDS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={preview.background === item.id}
                      className={cn(
                        "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                        preview.background === item.id
                          ? "border-coral bg-coral text-white"
                          : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                      )}
                      onClick={() => setPreview((current) => ({ ...current, background: item.id }))}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <SliderField
                label="Element width"
                unit="px"
                min={SHADOW_LIMITS.previewSize.min}
                max={SHADOW_LIMITS.previewSize.max}
                value={preview.width}
                onChange={(width) => setPreview((current) => ({ ...current, width }))}
              />
              <SliderField
                label="Element height"
                unit="px"
                min={SHADOW_LIMITS.previewSize.min}
                max={SHADOW_LIMITS.previewSize.max}
                value={preview.height}
                onChange={(height) => setPreview((current) => ({ ...current, height }))}
              />
              <SliderField
                label="Corner radius"
                unit="px"
                min={SHADOW_LIMITS.radius.min}
                max={SHADOW_LIMITS.radius.max}
                value={preview.radius}
                onChange={(radius) => setPreview((current) => ({ ...current, radius }))}
              />

              <div>
                <Label htmlFor="preview-fill">Element color</Label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    id="preview-fill"
                    type="color"
                    value={preview.elementColor}
                    aria-label="Preview element color"
                    className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--hairline)] bg-transparent"
                    onChange={(event) => setPreview((current) => ({ ...current, elementColor: event.target.value }))}
                  />
                  <p className={cn("font-mono text-sm", onDark ? "text-[var(--muted-ink)]" : "text-[var(--body)]")}>
                    {preview.elementColor}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
            <p className="text-sm font-medium text-ink">Generated CSS</p>
            <p className="mt-1 text-xs text-[var(--muted-ink)]">Updates as you edit. Paste into a stylesheet.</p>
            <CssPreview css={css} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderField({
  label,
  unit,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(String(value));
    setError(null);
  }, [value]);

  const commit = (raw: string, clampNow: boolean) => {
    setDraft(raw);
    if (raw.trim() === "" || raw === "-" || raw === "." || raw === "-.") {
      setError(`Enter a number from ${min} to ${max}.`);
      return;
    }
    const next = Number(raw);
    if (!Number.isFinite(next)) {
      setError("Enter a valid number.");
      return;
    }
    if (next < min || next > max) {
      setError(`Use a value between ${min} and ${max}${unit === "%" ? "%" : ` ${unit}`}.`);
      if (clampNow) {
        const clamped = Math.min(max, Math.max(min, Math.round(next)));
        onChange(clamped);
        setDraft(String(clamped));
      }
      return;
    }
    setError(null);
    onChange(Math.round(next));
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <div className="flex items-center gap-1">
          <Input
            inputMode="numeric"
            aria-label={label}
            aria-invalid={Boolean(error)}
            value={draft}
            className="h-8 w-[4.5rem] px-2 text-right tabular-nums"
            onChange={(event) => commit(event.target.value, false)}
            onBlur={() => commit(draft, true)}
          />
          <span className="w-6 text-xs text-[var(--muted-ink)]">{unit}</span>
        </div>
      </div>
      <Slider
        className="mt-3"
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([next]) => {
          setError(null);
          setDraft(String(next));
          onChange(next);
        }}
        aria-label={label}
      />
      {error ? (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted-ink)] transition-colors hover:bg-surface-soft hover:text-ink disabled:pointer-events-none disabled:opacity-40"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function CssPreview({ css }: { css: string }) {
  const tokens = tokenizeCss(css);
  return (
    <pre
      className="mt-3 overflow-x-auto rounded-lg bg-[#181715] p-4 font-mono text-[13px] leading-relaxed text-[#faf9f5]"
      aria-label="Generated box-shadow CSS"
    >
      <code>
        {tokens.map((token, index) => (
          <span key={`${token.kind}-${index}`} className={tokenClass(token.kind)}>
            {token.text}
          </span>
        ))}
      </code>
    </pre>
  );
}

type CssTokenKind = "plain" | "selector" | "property" | "number" | "func" | "punct";

function tokenizeCss(css: string): Array<{ text: string; kind: CssTokenKind }> {
  const tokens: Array<{ text: string; kind: CssTokenKind }> = [];
  const pattern =
    /(\.[A-Za-z][\w-]*)|(\b(?:box-shadow)\b)|(\b(?:inset|rgba?|hsla?)\b)|(-?\d+\.?\d*(?:px|%)?)|([{}\[\]();:,])/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(css))) {
    if (match.index > last) tokens.push({ text: css.slice(last, match.index), kind: "plain" });
    if (match[1]) tokens.push({ text: match[1], kind: "selector" });
    else if (match[2]) tokens.push({ text: match[2], kind: "property" });
    else if (match[3]) tokens.push({ text: match[3], kind: match[3] === "inset" ? "property" : "func" });
    else if (match[4]) tokens.push({ text: match[4], kind: "number" });
    else tokens.push({ text: match[0], kind: "punct" });
    last = match.index + match[0].length;
  }
  if (last < css.length) tokens.push({ text: css.slice(last), kind: "plain" });
  return tokens;
}

function tokenClass(kind: CssTokenKind) {
  if (kind === "selector") return "text-[#faf9f5]";
  if (kind === "property") return "text-[#cc785c]";
  if (kind === "func") return "text-[#5db8a6]";
  if (kind === "number") return "text-[#e8a55a]";
  if (kind === "punct") return "text-[#a09d96]";
  return "text-[#faf9f5]";
}
