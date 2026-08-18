"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  advanceFromElapsed,
  phaseProgress,
  remainingSeconds,
  sanitizeDurations,
} from "@/lib/box-breathing/logic";
import {
  DEFAULT_DURATIONS,
  type Durations,
  type PhaseId,
} from "@/lib/box-breathing/types";

export function useBoxBreathing(initial: Durations = DEFAULT_DURATIONS) {
  const [durations, setDurationsState] = useState<Durations>(() => sanitizeDurations(initial));
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<PhaseId>("inhale");
  const [rounds, setRounds] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const durationsRef = useRef(durations);
  const runningRef = useRef(running);
  const phaseRef = useRef(phase);
  const roundsRef = useRef(rounds);
  const elapsedRef = useRef(elapsed);
  const anchorRef = useRef<number | null>(null);

  durationsRef.current = durations;
  runningRef.current = running;
  phaseRef.current = phase;
  roundsRef.current = rounds;
  elapsedRef.current = elapsed;

  const applySnapshot = useCallback((nextPhase: PhaseId, nextRounds: number, nextElapsed: number) => {
    phaseRef.current = nextPhase;
    roundsRef.current = nextRounds;
    elapsedRef.current = nextElapsed;
    setPhase(nextPhase);
    setRounds(nextRounds);
    setElapsed(nextElapsed);
  }, []);

  const syncFromAnchor = useCallback(() => {
    if (anchorRef.current == null) return;
    const rawElapsed = (Date.now() - anchorRef.current) / 1000;
    const next = advanceFromElapsed(phaseRef.current, roundsRef.current, durationsRef.current, rawElapsed);
    applySnapshot(next.phase, next.rounds, next.elapsed);
    anchorRef.current = Date.now() - next.elapsed * 1000;
  }, [applySnapshot]);

  useEffect(() => {
    if (!running) return undefined;
    syncFromAnchor();
    const id = window.setInterval(syncFromAnchor, 50);
    return () => window.clearInterval(id);
  }, [running, syncFromAnchor]);

  const start = useCallback(() => {
    if (runningRef.current) return;
    anchorRef.current = Date.now() - elapsedRef.current * 1000;
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    syncFromAnchor();
    anchorRef.current = null;
    setRunning(false);
  }, [syncFromAnchor]);

  const toggle = useCallback(() => {
    if (runningRef.current) pause();
    else start();
  }, [pause, start]);

  const reset = useCallback(() => {
    anchorRef.current = null;
    setRunning(false);
    applySnapshot("inhale", 0, 0);
  }, [applySnapshot]);

  const setDurations = useCallback((next: Durations) => {
    setDurationsState(sanitizeDurations(next));
  }, []);

  const duration = durations[phase];
  const progress = phaseProgress(duration, elapsed);
  const counted = remainingSeconds(duration, elapsed);
  const remaining = counted === 0 ? duration : counted;

  return {
    durations,
    setDurations,
    running,
    phase,
    rounds,
    progress,
    remaining,
    elapsed,
    start,
    pause,
    toggle,
    reset,
  };
}
