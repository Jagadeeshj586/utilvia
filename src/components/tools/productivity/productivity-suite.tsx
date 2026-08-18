"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const AudioRecorder = dynamic(() => import("@/components/tools/productivity/audio-recorder").then((m) => m.AudioRecorder), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const BoxBreathingTimer = dynamic(() => import("@/components/tools/productivity/box-breathing-timer").then((m) => m.BoxBreathingTimer), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const RandomNumberGeneratorTool = dynamic(() => import("@/components/tools/productivity/random-number-generator").then((m) => m.RandomNumberGeneratorTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const PomodoroTimer = dynamic(() => import("@/components/tools/productivity/pomodoro-timer").then((m) => m.PomodoroTimer), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });

function MissingTool({ slug }: { slug: string }) {
  return (
    <p className="rounded-lg border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-8 text-center text-sm text-muted-foreground">
      No workspace for “{slug}” yet.
    </p>
  );
}

function pad(n: number, size = 2) {
  return String(n).padStart(size, "0");
}

function formatMs(ms: number) {
  const total = Math.max(0, Math.floor(ms));
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  const hundredths = Math.floor((total % 1000) / 10);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
}

function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const startedAt = useRef<number | null>(null);
  const baseElapsed = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
    const tick = () => {
      if (startedAt.current == null) return;
      setElapsed(baseElapsed.current + (Date.now() - startedAt.current));
    };
    tick();
    const id = window.setInterval(tick, 50);
    return () => window.clearInterval(id);
  }, [running]);

  return (
    <div className="mx-auto max-w-xl space-y-6 text-center">
      <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-4 py-6">
        <p className="font-mono text-5xl font-semibold tabular-nums">{formatMs(elapsed)}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          onClick={() => {
            if (running) {
              baseElapsed.current = elapsed;
              startedAt.current = null;
              setRunning(false);
            } else {
              startedAt.current = Date.now();
              setRunning(true);
            }
          }}
        >
          {running ? "Pause" : "Start"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!running && elapsed === 0}
          onClick={() => {
            if (!running && elapsed === 0) return;
            setLaps((current) => [elapsed, ...current]);
          }}
        >
          Lap
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setRunning(false);
            startedAt.current = null;
            baseElapsed.current = 0;
            setElapsed(0);
            setLaps([]);
          }}
        >
          Reset
        </Button>
      </div>
      {laps.length ? (
        <ul className="space-y-2 text-left">
          {laps.map((lap, index) => (
            <li
              key={`${lap}-${index}`}
              className="flex items-center justify-between rounded-lg border border-[var(--hairline)] bg-surface-soft px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">Lap {laps.length - index}</span>
              <span className="font-mono tabular-nums">{formatMs(lap)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ProductivityRouter({ slug }: { slug: string }) {
  switch (slug) {
    case "pomodoro-timer":
      return <PomodoroTimer />;
    case "stopwatch":
      return <Stopwatch />;
    case "box-breathing-timer":
      return <BoxBreathingTimer />;
    case "audio-recorder":
      return <AudioRecorder />;
    case "random-number-generator":
      return <RandomNumberGeneratorTool />;
    default:
      return <MissingTool slug={slug} />;
  }
}
