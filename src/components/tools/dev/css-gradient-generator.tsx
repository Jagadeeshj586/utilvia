"use client";

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Check, ChevronDown, ChevronUp, Copy, Info, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ANGLE_PRESETS,
  COLOR_FORMATS,
  DEFAULT_GRADIENT,
  GRADIENT_PRESETS,
  GRADIENT_TYPES,
  MAX_STOPS,
  MIN_STOPS,
  POSITION_OPTIONS,
  addStop,
  cloneGradient,
  formatStopColor,
  generateCss,
  gradientFunction,
  moveStop,
  parseColorInput,
  removeStop,
  sortStops,
  updateStop,
  type ColorFormat,
  type GradientConfig,
  type GradientType,
} from "@/lib/css-gradient/gradient";
import { copyText } from "@/lib/security/clipboard";
import { cn } from "@/lib/utils";

const CHECKER =
  "bg-[length:16px_16px] bg-[linear-gradient(45deg,#e8e6e1_25%,transparent_25%),linear-gradient(-45deg,#e8e6e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e8e6e1_75%),linear-gradient(-45deg,transparent_75%,#e8e6e1_75%)] bg-[position:0_0,0_8px,8px_-8px,-8px_0]";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

export function CssGradientGenerator() {
  const [config, setConfig] = useState<GradientConfig>(() => cloneGradient());
  const [selectedId, setSelectedId] = useState(DEFAULT_GRADIENT.stops[0].id);
  const [colorDrafts, setColorDrafts] = useState<Record<string, string>>({});
  const [fullWidth, setFullWidth] = useState(true);
  const [width, setWidth] = useState(480);
  const [height, setHeight] = useState(220);
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => generateCss(config), [config]);
  const value = useMemo(() => gradientFunction(config), [config]);
  const stops = useMemo(() => sortStops(config.stops), [config.stops]);
  const selected = stops.find((stop) => stop.id === selectedId) ?? stops[0];

  const apply = (next: GradientConfig | { error: string }) => {
    if ("error" in next) {
      toast.error(next.error);
      return;
    }
    setConfig(next);
  };

  const setType = (type: GradientType) => setConfig((current) => ({ ...current, type }));
  const setFormat = (colorFormat: ColorFormat) => {
    setColorDrafts({});
    setConfig((current) => ({ ...current, colorFormat }));
  };

  const reset = () => {
    setConfig(cloneGradient());
    setSelectedId(DEFAULT_GRADIENT.stops[0].id);
    setColorDrafts({});
    setFullWidth(true);
    setWidth(480);
    setHeight(220);
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

  const onAdd = (position?: number) => {
    const next = addStop(config, position);
    if ("error" in next) {
      toast.error(next.error);
      return;
    }
    const added = next.stops.find((stop) => !config.stops.some((item) => item.id === stop.id));
    setConfig(next);
    if (added) setSelectedId(added.id);
  };

  const onRemove = (id: string) => {
    const next = removeStop(config, id);
    if ("error" in next) {
      toast.error(next.error);
      return;
    }
    setConfig(next);
    if (selectedId === id) setSelectedId(next.stops[0]?.id ?? "");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="min-h-10 min-w-28 px-6" onClick={() => void copy()}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy CSS"}
        </Button>
        <Button type="button" variant="outline" className="min-h-10" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
          <fieldset>
            <LegendWithHint
              label="Gradient type"
              hint="Linear blends along a line, radial from a point, and conic around a center."
            />
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Gradient type">
              {GRADIENT_TYPES.map((item) => (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-pressed={config.type === item.id}
                      className={cn(
                        "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                        config.type === item.id
                          ? "border-coral bg-coral text-white"
                          : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                      )}
                      onClick={() => setType(item.id)}
                    >
                      {item.label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{item.hint}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--hairline)] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Repeating</p>
              <p className="text-xs text-[var(--muted-ink)]">Tile the gradient instead of stretching it once.</p>
            </div>
            <Switch
              checked={config.repeating}
              onCheckedChange={(repeating) => setConfig((current) => ({ ...current, repeating }))}
              aria-label="Repeating gradient"
            />
          </div>

          {config.type !== "radial" ? (
            <div className="space-y-2">
              <LegendWithHint
                label={`Angle (${Math.round(config.angle)}°)`}
                hint={config.type === "conic" ? "Starting angle of the color sweep." : "Direction of the blend. 0° is up, 90° is right."}
              />
              <Slider
                min={0}
                max={360}
                step={1}
                value={[config.angle]}
                onValueChange={([angle]) => setConfig((current) => ({ ...current, angle }))}
                aria-label="Gradient angle"
              />
              <div className="flex flex-wrap gap-1.5">
                {ANGLE_PRESETS.map((item) => (
                  <Tooltip key={item.angle}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={item.hint}
                        aria-pressed={config.angle === item.angle}
                        className={cn(
                          "h-9 w-9 rounded-md border text-sm transition-colors",
                          config.angle === item.angle
                            ? "border-coral bg-coral text-white"
                            : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                        )}
                        onClick={() => setConfig((current) => ({ ...current, angle: item.angle }))}
                      >
                        {item.label}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{item.hint}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Shape</Label>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Radial shape">
                {(["ellipse", "circle"] as const).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    aria-pressed={config.radialShape === shape}
                    className={cn(
                      "min-h-10 rounded-lg border px-3 text-sm font-medium capitalize transition-colors",
                      config.radialShape === shape
                        ? "border-coral bg-coral text-white"
                        : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                    )}
                    onClick={() => setConfig((current) => ({ ...current, radialShape: shape }))}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
          )}

          {config.type !== "linear" ? (
            <div>
              <LegendWithHint label="Center position" hint="Where the gradient originates." />
              <select
                className={selectClass}
                value={config.at}
                aria-label="Center position"
                onChange={(event) => setConfig((current) => ({ ...current, at: event.target.value }))}
              >
                {POSITION_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <LegendWithHint
                label="Color stops"
                hint="Drag handles to move stops. Click the bar to add a stop. Keep between 2 and 12."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-9"
                disabled={config.stops.length >= MAX_STOPS}
                onClick={() => onAdd()}
              >
                <Plus className="h-4 w-4" />
                Add stop
              </Button>
            </div>
            <StopBar
              config={config}
              selectedId={selected?.id ?? ""}
              onSelect={setSelectedId}
              onMove={(id, position) => apply(updateStop(config, id, { position }))}
              onAdd={(position) => onAdd(position)}
            />
          </div>

          <ul className="space-y-3">
            {stops.map((stop, index) => {
              const draft = colorDrafts[stop.id];
              const parsed = draft == null ? true : Boolean(parseColorInput(draft));
              return (
                <li
                  key={stop.id}
                  className={cn(
                    "space-y-3 rounded-lg border px-3 py-3",
                    selected?.id === stop.id ? "border-coral/50 bg-coral/5" : "border-[var(--hairline)] bg-canvas",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      className="text-sm font-medium text-ink"
                      onClick={() => setSelectedId(stop.id)}
                    >
                      Stop {index + 1}
                      <span className="ml-2 text-xs font-normal text-[var(--muted-ink)]">{Math.round(stop.position)}%</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <IconButton
                        label="Move earlier"
                        disabled={index === 0}
                        onClick={() => apply(moveStop(config, stop.id, -1))}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        label="Move later"
                        disabled={index === stops.length - 1}
                        onClick={() => apply(moveStop(config, stop.id, 1))}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        label="Remove stop"
                        disabled={config.stops.length <= MIN_STOPS}
                        onClick={() => onRemove(stop.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)]">
                    <div className={cn("relative h-10 w-10 overflow-hidden rounded-md border border-[var(--hairline)]", CHECKER)}>
                      <input
                        type="color"
                        aria-label={`Stop ${index + 1} color picker`}
                        value={stop.color}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={(event) => {
                          setColorDrafts((current) => {
                            const next = { ...current };
                            delete next[stop.id];
                            return next;
                          });
                          apply(updateStop(config, stop.id, { color: event.target.value }));
                          setSelectedId(stop.id);
                        }}
                      />
                      <span className="pointer-events-none absolute inset-0" style={{ background: formatStopColor(stop, "hex") }} />
                    </div>
                    <div>
                      <Input
                        value={draft ?? formatStopColor(stop, config.colorFormat)}
                        spellCheck={false}
                        aria-invalid={!parsed}
                        aria-label={`Stop ${index + 1} color value`}
                        className="font-mono text-sm"
                        onFocus={() => setSelectedId(stop.id)}
                        onBlur={() => {
                          setColorDrafts((current) => {
                            const next = { ...current };
                            delete next[stop.id];
                            return next;
                          });
                        }}
                        onChange={(event) => {
                          const raw = event.target.value;
                          setColorDrafts((current) => ({ ...current, [stop.id]: raw }));
                          const color = parseColorInput(raw);
                          if (color) {
                            apply(
                              updateStop(config, stop.id, {
                                color: raw,
                              }),
                            );
                          }
                        }}
                      />
                      {!parsed ? (
                        <p className="mt-1 text-xs text-destructive" role="alert">
                          Use HEX, rgb(), or hsl().
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Position ({Math.round(stop.position)}%)</Label>
                      <Slider
                        className="mt-3"
                        min={0}
                        max={100}
                        step={0.5}
                        value={[stop.position]}
                        onValueChange={([position]) => {
                          setSelectedId(stop.id);
                          apply(updateStop(config, stop.id, { position }));
                        }}
                        aria-label={`Stop ${index + 1} position`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Opacity ({Math.round(stop.opacity * 100)}%)</Label>
                      <Slider
                        className="mt-3"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[stop.opacity]}
                        onValueChange={([opacity]) => {
                          setSelectedId(stop.id);
                          apply(updateStop(config, stop.id, { opacity }));
                        }}
                        aria-label={`Stop ${index + 1} opacity`}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <fieldset>
            <LegendWithHint label="CSS color format" hint="Changes stop fields and the copied CSS together." />
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Color format">
              {COLOR_FORMATS.map((item) => (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-pressed={config.colorFormat === item.id}
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
                  </TooltipTrigger>
                  <TooltipContent>{item.hint}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
            <p className="text-sm font-medium text-ink">Live preview</p>
            <p className="mt-1 text-xs text-[var(--muted-ink)]">Checkerboard shows through transparent stops.</p>
            <div className={cn("mt-3 overflow-auto rounded-lg border border-[var(--hairline)] p-3", CHECKER)}>
              <div
                role="img"
                aria-label="Gradient preview"
                className="mx-auto rounded-md shadow-[0_8px_24px_rgba(20,20,19,0.12)]"
                style={{
                  width: fullWidth ? "100%" : width,
                  height,
                  background: value,
                }}
              />
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--hairline)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">Full width</p>
                  <p className="text-xs text-[var(--muted-ink)]">Stretch the preview across the panel.</p>
                </div>
                <Switch checked={fullWidth} onCheckedChange={setFullWidth} aria-label="Full width preview" />
              </div>
              {!fullWidth ? (
                <div>
                  <Label>Width ({width}px)</Label>
                  <Slider className="mt-3" min={160} max={720} step={10} value={[width]} onValueChange={([next]) => setWidth(next)} />
                </div>
              ) : null}
              <div>
                <Label>Height ({height}px)</Label>
                <Slider className="mt-3" min={120} max={420} step={10} value={[height]} onValueChange={([next]) => setHeight(next)} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
            <Label htmlFor="css-gradient-output">Generated CSS</Label>
            <Textarea
              id="css-gradient-output"
              readOnly
              value={css}
              spellCheck={false}
              className="mt-2 min-h-[88px] font-mono text-xs sm:text-sm"
            />
            <p className="mt-2 text-xs text-[var(--muted-ink)]">Paste into a stylesheet or an inline style. Updates as you edit.</p>
          </div>

          <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
            <p className="text-sm font-medium text-ink">Presets</p>
            <p className="mt-1 text-xs text-[var(--muted-ink)]">Start from a Utilvia-flavored gradient, then tweak.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="group overflow-hidden rounded-lg border border-[var(--hairline)] text-left transition-colors hover:border-coral/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/15"
                  onClick={() => {
                    const next = cloneGradient(preset.config);
                    next.colorFormat = config.colorFormat;
                    setConfig(next);
                    setSelectedId(next.stops[0]?.id ?? "");
                    setColorDrafts({});
                  }}
                >
                  <span
                    className="block h-12 w-full"
                    style={{ background: gradientFunction({ ...preset.config, colorFormat: "hex" }) }}
                    aria-hidden
                  />
                  <span className="block px-2 py-1.5 text-xs font-medium text-ink">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StopBar({
  config,
  selectedId,
  onSelect,
  onMove,
  onAdd,
}: {
  config: GradientConfig;
  selectedId: string;
  onSelect: (id: string) => void;
  onMove: (id: string, position: number) => void;
  onAdd: (position: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<string | null>(null);
  const moved = useRef(false);
  const stops = sortStops(config.stops);
  const barCss = gradientFunction({ ...config, type: "linear", repeating: false, angle: 90, colorFormat: "hex" });

  const positionFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.round(((clientX - rect.left) / rect.width) * 1000) / 10;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault();
    event.stopPropagation();
    dragging.current = id;
    moved.current = false;
    onSelect(id);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    if (Math.abs(event.movementX) + Math.abs(event.movementY) > 1) moved.current = true;
    onMove(dragging.current, positionFromClientX(event.clientX));
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  return (
    <div
      ref={trackRef}
      className={cn("relative h-12 cursor-pointer rounded-lg border border-[var(--hairline)]", CHECKER)}
      role="group"
      aria-label="Gradient stops"
      onPointerDown={() => {
        moved.current = false;
      }}
      onClick={(event) => {
        if (moved.current) return;
        if ((event.target as HTMLElement).closest("[data-stop-handle]")) return;
        onAdd(positionFromClientX(event.clientX));
      }}
    >
      <div className="absolute inset-0 rounded-[7px]" style={{ background: barCss }} />
      {stops.map((stop, index) => (
        <button
          key={stop.id}
          type="button"
          data-stop-handle
          aria-label={`Stop ${index + 1} at ${Math.round(stop.position)} percent`}
          aria-pressed={stop.id === selectedId}
          className={cn(
            "absolute top-1/2 z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20",
            stop.id === selectedId ? "z-20 border-ink" : "border-white",
          )}
          style={{ left: `${stop.position}%`, background: formatStopColor(stop, "hex") }}
          onPointerDown={(event) => onPointerDown(event, stop.id)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              onMove(stop.id, stop.position - (event.shiftKey ? 5 : 1));
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              onMove(stop.id, stop.position + (event.shiftKey ? 5 : 1));
            } else if (event.key === "Home") {
              event.preventDefault();
              onMove(stop.id, 0);
            } else if (event.key === "End") {
              event.preventDefault();
              onMove(stop.id, 100);
            }
          }}
        />
      ))}
    </div>
  );
}

function LegendWithHint({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <p className="text-sm font-medium text-ink">{label}</p>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted-ink)] hover:text-ink"
            aria-label={hint}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{hint}</TooltipContent>
      </Tooltip>
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
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-ink)] transition-colors hover:bg-surface-soft hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          onClick={onClick}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
