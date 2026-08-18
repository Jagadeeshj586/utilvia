"use client";

import { useEffect } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoxBreathing } from "@/hooks/use-box-breathing";
import { durationsMatch, markerOffset } from "@/lib/box-breathing/logic";
import {
  DEFAULT_DURATIONS,
  PHASE_INSTRUCTIONS,
  PHASE_LABELS,
  PRESET_4_7_8,
  TIMING_FIELDS,
  type Durations,
  type PhaseId,
} from "@/lib/box-breathing/types";
import { cn } from "@/lib/utils";

const VIEW = 100;
const PAD = 14;
const SPAN = VIEW - PAD * 2;

const SIDES: Array<{ id: PhaseId; d: string }> = [
  { id: "inhale", d: `M ${PAD} ${PAD + SPAN} L ${PAD} ${PAD}` },
  { id: "hold1", d: `M ${PAD} ${PAD} L ${PAD + SPAN} ${PAD}` },
  { id: "exhale", d: `M ${PAD + SPAN} ${PAD} L ${PAD + SPAN} ${PAD + SPAN}` },
  { id: "hold2", d: `M ${PAD + SPAN} ${PAD + SPAN} L ${PAD} ${PAD + SPAN}` },
];

export function BoxBreathingTimer() {
  const timer = useBoxBreathing();
  const offset = markerOffset(timer.phase, timer.progress);
  const markerX = PAD + offset.x * SPAN;
  const markerY = PAD + offset.y * SPAN;
  const is478 = durationsMatch(timer.durations, PRESET_4_7_8);
  const isBox = durationsMatch(timer.durations, DEFAULT_DURATIONS);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return;
      if (event.code === "Space") {
        event.preventDefault();
        timer.toggle();
      } else if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        timer.reset();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [timer.toggle, timer.reset]);

  const applyDurations = (next: Durations) => {
    timer.reset();
    timer.setDurations(next);
  };

  const updateDuration = (key: PhaseId, value: number) => {
    timer.setDurations({ ...timer.durations, [key]: value });
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <p className="text-center text-sm text-[var(--body)]">
        Follow the marker around the square: inhale, hold, exhale, hold.
      </p>

      <div className="flex flex-col items-center">
        <p className={cn("mb-1 text-xs font-medium", timer.phase === "hold1" ? "text-coral" : "text-[var(--muted-ink)]")}>
          Hold
        </p>
        <div className="flex w-full items-center gap-2">
          <p
            className={cn(
              "w-8 shrink-0 text-center text-xs font-medium [writing-mode:vertical-rl] rotate-180 sm:w-10",
              timer.phase === "inhale" ? "text-coral" : "text-[var(--muted-ink)]",
            )}
          >
            Inhale
          </p>
          <div
            className="relative mx-auto aspect-square w-full max-w-[280px]"
            role="timer"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`${PHASE_LABELS[timer.phase]} ${timer.remaining} seconds. Round ${timer.rounds} completed.`}
          >
            <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="h-full w-full" aria-hidden="true">
              {SIDES.map((side) => (
                <path
                  key={side.id}
                  d={side.d}
                  fill="none"
                  strokeWidth={timer.phase === side.id ? 3.2 : 2}
                  strokeLinecap="round"
                  className={timer.phase === side.id ? "stroke-coral" : "stroke-[var(--hairline)]"}
                />
              ))}
              <circle
                cx={markerX}
                cy={markerY}
                r={4.2}
                className="fill-coral"
                style={{ filter: "drop-shadow(0 0 4px rgba(204, 120, 92, 0.65))" }}
              />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="font-display text-5xl font-semibold tabular-nums tracking-tight text-ink sm:text-6xl">
                {timer.remaining}
              </p>
              <p className="mt-1 text-sm font-medium text-coral">{PHASE_LABELS[timer.phase]}</p>
            </div>
          </div>
          <p
            className={cn(
              "w-8 shrink-0 text-center text-xs font-medium [writing-mode:vertical-rl] sm:w-10",
              timer.phase === "exhale" ? "text-coral" : "text-[var(--muted-ink)]",
            )}
          >
            Exhale
          </p>
        </div>
        <p className={cn("mt-1 text-xs font-medium", timer.phase === "hold2" ? "text-coral" : "text-[var(--muted-ink)]")}>
          Hold
        </p>
      </div>

      <p className="text-center text-sm text-[var(--muted-ink)]">{PHASE_INSTRUCTIONS[timer.phase]}</p>
      <p className="text-center text-sm text-[var(--body)]">Round {timer.rounds} completed</p>

      <div className="flex flex-col gap-2">
        <Button type="button" className="h-11 w-full" onClick={timer.toggle}>
          {timer.running ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {timer.elapsed > 0 || timer.phase !== "inhale" || timer.rounds > 0 ? "Resume" : "Start"}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" className="h-11 w-full" onClick={timer.reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
      <p className="text-center text-xs text-[var(--muted-ink)]">Space start/pause · R reset</p>
      <p className="text-center text-xs text-[var(--muted-ink)]">A practice aid for pacing your breath — not medical advice.</p>

      <div className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">Phase timing (3–8 seconds)</p>
          <div className="flex flex-wrap gap-2">
            <PresetChip active={isBox} disabled={timer.running} onClick={() => applyDurations(DEFAULT_DURATIONS)}>
              4-4-4-4
            </PresetChip>
            <PresetChip active={is478} disabled={timer.running} onClick={() => applyDurations(PRESET_4_7_8)}>
              4-7-8 preset
            </PresetChip>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TIMING_FIELDS.map((field) => (
            <div key={field.key}>
              <Label htmlFor={`phase-${field.key}`} className="text-xs text-[var(--muted-ink)]">
                {field.label}
              </Label>
              <Input
                id={`phase-${field.key}`}
                type="number"
                min={3}
                max={8}
                inputMode="numeric"
                disabled={timer.running}
                value={timer.durations[field.key]}
                onChange={(event) => updateDuration(field.key, Number(event.target.value))}
                className="mt-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PresetChip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
        active
          ? "border-coral bg-coral text-white"
          : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
      )}
    >
      {children}
    </button>
  );
}
