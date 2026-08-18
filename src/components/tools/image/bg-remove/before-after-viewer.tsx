"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CHECKER =
  "bg-[linear-gradient(45deg,#e6dfd8_25%,transparent_25%),linear-gradient(-45deg,#e6dfd8_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e6dfd8_75%),linear-gradient(-45deg,transparent_75%,#e6dfd8_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0]";

type PointerHandlers = {
  onPointerDown?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<HTMLElement>) => void;
};

export function BeforeAfterViewer({
  originalSrc,
  resultSrc,
  resultBackground,
  refining,
  resultPointerHandlers,
}: {
  originalSrc: string | null;
  resultSrc: string | null;
  resultBackground?: string;
  refining?: boolean;
  resultPointerHandlers?: PointerHandlers;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [originalSrc]);

  const onWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const next = Math.min(6, Math.max(1, scale * (event.deltaY < 0 ? 1.12 : 0.9)));
    setScale(next);
    if (next === 1) setOffset({ x: 0, y: 0 });
  };

  const panHandlers = refining
    ? undefined
    : {
        onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
          if (scale <= 1) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
        },
        onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
          if (!drag.current) return;
          setOffset({
            x: drag.current.ox + (event.clientX - drag.current.x),
            y: drag.current.oy + (event.clientY - drag.current.y),
          });
        },
        onPointerUp: () => {
          drag.current = null;
        },
        onPointerCancel: () => {
          drag.current = null;
        },
      };

  const fit = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted-ink)]">
          {Math.round(scale * 100)}%
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={() => setScale((s) => Math.max(1, +(s - 0.25).toFixed(2)))} aria-label="Zoom out">
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setScale((s) => Math.min(6, +(s + 0.25).toFixed(2)))} aria-label="Zoom in">
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={fit}>
            <Maximize2 className="h-3.5 w-3.5" />
            Fit
          </Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Frame
          label="Original"
          src={originalSrc}
          scale={scale}
          offset={offset}
          onWheel={onWheel}
          handlers={panHandlers}
        />
        <Frame
          label="Removed background"
          src={resultSrc}
          checker={!resultBackground}
          background={resultBackground}
          scale={scale}
          offset={offset}
          onWheel={onWheel}
          handlers={refining ? resultPointerHandlers : panHandlers}
          cursor={refining ? (resultPointerHandlers ? "crosshair" : "default") : scale > 1 ? "grab" : "default"}
        />
      </div>
    </div>
  );
}

function Frame({
  label,
  src,
  checker,
  background,
  scale,
  offset,
  onWheel,
  handlers,
  cursor,
}: {
  label: string;
  src: string | null;
  checker?: boolean;
  background?: string;
  scale: number;
  offset: { x: number; y: number };
  onWheel: (event: React.WheelEvent) => void;
  handlers?: PointerHandlers;
  cursor?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--hairline)] bg-canvas">
      <p className="border-b border-[var(--hairline)] px-3 py-2 text-xs font-medium text-[var(--muted-ink)]">{label}</p>
      <div
        className={cn(
          "relative flex min-h-56 touch-none items-center justify-center overflow-hidden sm:min-h-80",
          checker ? CHECKER : "bg-surface-soft",
        )}
        style={{ background: background || undefined, cursor }}
        onWheel={onWheel}
        onPointerDown={handlers?.onPointerDown}
        onPointerMove={handlers?.onPointerMove}
        onPointerUp={handlers?.onPointerUp}
        onPointerCancel={handlers?.onPointerCancel}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={label}
            draggable={false}
            className="max-h-[28rem] w-full select-none object-contain"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "center center",
            }}
          />
        ) : (
          <p className="text-sm text-[var(--muted-ink)]">No preview yet</p>
        )}
      </div>
    </div>
  );
}
