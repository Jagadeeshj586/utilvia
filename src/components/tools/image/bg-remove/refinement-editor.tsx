"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Paintbrush, Redo2, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { BrushMode, BrushSizePreset } from "@/lib/image/background-removal";

const SIZE_RATIO: Record<BrushSizePreset, number> = {
  small: 0.018,
  medium: 0.045,
  large: 0.1,
};

type Stroke = {
  mode: BrushMode;
  size: number;
  softness: number;
  points: Array<[number, number]>;
};

function brushRadius(preset: BrushSizePreset, width: number, height: number) {
  return Math.max(3, Math.round(Math.min(width, height) * SIZE_RATIO[preset]));
}

function interpolate(x0: number, y0: number, x1: number, y1: number, spacing: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / Math.max(1, spacing)));
  const points: Array<[number, number]> = [];
  for (let i = 1; i <= steps; i += 1) points.push([x0 + (dx * i) / steps, y0 + (dy * i) / steps]);
  return points;
}

export function stampBrush(
  alpha: Uint8ClampedArray,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number,
  softness: number,
  mode: BrushMode,
) {
  const inner = radius * (1 - softness);
  const x0 = Math.max(0, Math.floor(cx - radius));
  const x1 = Math.min(width - 1, Math.ceil(cx + radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const y1 = Math.min(height - 1, Math.ceil(cy + radius));
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const d = Math.hypot(x - cx, y - cy);
      if (d > radius) continue;
      const w = d <= inner || radius <= inner + 0.001 ? 1 : 1 - (d - inner) / (radius - inner);
      const i = y * width + x;
      if (mode === "restore") alpha[i] = Math.round(alpha[i] + (255 - alpha[i]) * w);
      else alpha[i] = Math.round(alpha[i] * (1 - w));
    }
  }
}

function replay(base: Uint8ClampedArray, width: number, height: number, strokes: Stroke[]) {
  const alpha = new Uint8ClampedArray(base);
  for (const stroke of strokes) {
    let prev: [number, number] | null = null;
    for (const point of stroke.points) {
      const pts = prev ? interpolate(prev[0], prev[1], point[0], point[1], Math.max(1, stroke.size * 0.35)) : [point];
      for (const [x, y] of pts) stampBrush(alpha, width, height, x, y, stroke.size, stroke.softness, stroke.mode);
      prev = point;
    }
  }
  return alpha;
}

export function useRefinementOverlay({
  width,
  height,
  baseAlpha,
  enabled,
  onAlphaChange,
}: {
  width: number;
  height: number;
  baseAlpha: Uint8ClampedArray | null;
  enabled: boolean;
  onAlphaChange: (alpha: Uint8ClampedArray) => void;
}) {
  const [mode, setMode] = useState<BrushMode>("restore");
  const [sizePreset, setSizePreset] = useState<BrushSizePreset>("medium");
  const [softness, setSoftness] = useState(0.45);
  const strokesRef = useRef<Stroke[]>([]);
  const redoRef = useRef<Stroke[]>([]);
  const painting = useRef<Stroke | null>(null);
  const liveAlpha = useRef<Uint8ClampedArray | null>(null);
  const lastPoint = useRef<[number, number] | null>(null);
  const raf = useRef<number | null>(null);
  const [, bump] = useState(0);

  const radius = baseAlpha ? brushRadius(sizePreset, width, height) : 12;

  const publish = useCallback(
    (strokes: Stroke[] = strokesRef.current) => {
      if (!baseAlpha) return;
      onAlphaChange(replay(baseAlpha, width, height, strokes));
      bump((n) => n + 1);
    },
    [baseAlpha, height, onAlphaChange, width],
  );

  useEffect(() => {
    strokesRef.current = [];
    redoRef.current = [];
    if (baseAlpha) onAlphaChange(new Uint8ClampedArray(baseAlpha));
    bump((n) => n + 1);
  }, [baseAlpha, onAlphaChange]);

  const imagePoint = (event: React.PointerEvent<HTMLElement>, img: HTMLImageElement) => {
    const rect = img.getBoundingClientRect();
    return {
      inside:
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom,
      x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * width,
      y: ((event.clientY - rect.top) / Math.max(1, rect.height)) * height,
    };
  };

  const pointerHandlers =
    enabled && baseAlpha
      ? {
          onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
            const img = event.currentTarget.querySelector("img");
            if (!img || !baseAlpha) return;
            const point = imagePoint(event, img);
            if (!point.inside) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            painting.current = { mode, size: radius, softness, points: [[point.x, point.y]] };
            lastPoint.current = [point.x, point.y];
            liveAlpha.current = replay(baseAlpha, width, height, [...strokesRef.current, painting.current]);
            onAlphaChange(liveAlpha.current);
            event.preventDefault();
          },
          onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
            if (!painting.current || !liveAlpha.current) return;
            const img = event.currentTarget.querySelector("img");
            if (!img) return;
            const point = imagePoint(event, img);
            const prev = lastPoint.current ?? [point.x, point.y];
            const pts = interpolate(prev[0], prev[1], point.x, point.y, Math.max(1, radius * 0.35));
            for (const [x, y] of pts) {
              stampBrush(liveAlpha.current, width, height, x, y, radius, softness, mode);
            }
            painting.current.points.push([point.x, point.y]);
            lastPoint.current = [point.x, point.y];
            if (raf.current) return;
            raf.current = window.requestAnimationFrame(() => {
              raf.current = null;
              if (liveAlpha.current) onAlphaChange(new Uint8ClampedArray(liveAlpha.current));
            });
          },
          onPointerUp: () => {
            if (!painting.current) return;
            strokesRef.current = [...strokesRef.current, painting.current];
            redoRef.current = [];
            painting.current = null;
            lastPoint.current = null;
            liveAlpha.current = null;
            if (raf.current) {
              window.cancelAnimationFrame(raf.current);
              raf.current = null;
            }
            publish();
          },
          onPointerCancel: () => {
            painting.current = null;
            lastPoint.current = null;
            liveAlpha.current = null;
          },
        }
      : undefined;

  return {
    mode,
    setMode,
    sizePreset,
    setSizePreset,
    softness,
    setSoftness,
    canUndo: strokesRef.current.length > 0,
    canRedo: redoRef.current.length > 0,
    undo: () => {
      if (!strokesRef.current.length) return;
      redoRef.current = [...redoRef.current, strokesRef.current[strokesRef.current.length - 1]];
      strokesRef.current = strokesRef.current.slice(0, -1);
      publish(strokesRef.current);
    },
    redo: () => {
      if (!redoRef.current.length) return;
      strokesRef.current = [...strokesRef.current, redoRef.current[redoRef.current.length - 1]];
      redoRef.current = redoRef.current.slice(0, -1);
      publish(strokesRef.current);
    },
    reset: () => {
      strokesRef.current = [];
      redoRef.current = [];
      publish([]);
    },
    pointerHandlers,
  };
}

export function RefinementControls({
  mode,
  setMode,
  sizePreset,
  setSizePreset,
  softness,
  setSoftness,
  canUndo,
  canRedo,
  undo,
  redo,
  reset,
  disabled,
}: {
  mode: BrushMode;
  setMode: (mode: BrushMode) => void;
  sizePreset: BrushSizePreset;
  setSizePreset: (preset: BrushSizePreset) => void;
  softness: number;
  setSoftness: (value: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-[var(--hairline)] bg-surface-soft p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Manual refine</p>
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" disabled={disabled || !canUndo} onClick={undo}>
            <Undo2 className="h-3.5 w-3.5" />
            Undo
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={disabled || !canRedo} onClick={redo}>
            <Redo2 className="h-3.5 w-3.5" />
            Redo
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={disabled || !canUndo} onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={mode === "restore" ? "default" : "outline"} onClick={() => setMode("restore")}>
          <Paintbrush className="h-3.5 w-3.5" />
          Restore
        </Button>
        <Button type="button" size="sm" variant={mode === "erase" ? "default" : "outline"} onClick={() => setMode("erase")}>
          <Eraser className="h-3.5 w-3.5" />
          Erase
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Brush size</Label>
          <div className="flex flex-wrap gap-1.5">
            {(["small", "medium", "large"] as const).map((preset) => (
              <Button key={preset} type="button" size="sm" variant={sizePreset === preset ? "default" : "outline"} onClick={() => setSizePreset(preset)}>
                {preset[0].toUpperCase() + preset.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Softness</Label>
            <span className="tabular-nums text-[var(--muted-ink)]">{Math.round(softness * 100)}%</span>
          </div>
          <Slider min={0} max={1} step={0.05} value={[softness]} onValueChange={([value]) => setSoftness(value)} />
        </div>
      </div>
      <p className="text-xs text-[var(--muted-ink)]">
        Paint on the result to restore missing subject or erase leftover background. Edits only change the mask.
      </p>
    </div>
  );
}
