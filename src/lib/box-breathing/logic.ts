import {
  DEFAULT_DURATIONS,
  MAX_PHASE_SECONDS,
  MIN_PHASE_SECONDS,
  PHASE_ORDER,
  type Durations,
  type PhaseId,
} from "./types";

export function clampPhaseSeconds(value: number) {
  if (!Number.isFinite(value)) return 4;
  return Math.min(MAX_PHASE_SECONDS, Math.max(MIN_PHASE_SECONDS, Math.round(value)));
}

export function sanitizeDurations(input: Partial<Durations> | null | undefined): Durations {
  const base = { ...DEFAULT_DURATIONS, ...(input ?? {}) };
  return {
    inhale: clampPhaseSeconds(base.inhale),
    hold1: clampPhaseSeconds(base.hold1),
    exhale: clampPhaseSeconds(base.exhale),
    hold2: clampPhaseSeconds(base.hold2),
  };
}

export function nextPhase(phase: PhaseId): PhaseId {
  return PHASE_ORDER[(PHASE_ORDER.indexOf(phase) + 1) % PHASE_ORDER.length];
}

export function completesRound(phase: PhaseId) {
  return phase === "hold2";
}

export function remainingSeconds(duration: number, elapsed: number) {
  if (elapsed >= duration) return 0;
  return Math.max(1, Math.ceil(duration - elapsed));
}

export function phaseProgress(duration: number, elapsed: number) {
  if (duration <= 0) return 1;
  return Math.min(1, Math.max(0, elapsed / duration));
}

/** Normalized 0–1 coordinates on the square. Origin is top-left. Inhale travels up the left side. */
export function markerOffset(phase: PhaseId, progress: number) {
  const t = Math.min(1, Math.max(0, progress));
  if (phase === "inhale") return { x: 0, y: 1 - t };
  if (phase === "hold1") return { x: t, y: 0 };
  if (phase === "exhale") return { x: 1, y: t };
  return { x: 1 - t, y: 1 };
}

export function durationsMatch(a: Durations, b: Durations) {
  return PHASE_ORDER.every((phase) => a[phase] === b[phase]);
}

export function advanceFromElapsed(
  phase: PhaseId,
  rounds: number,
  durations: Durations,
  elapsed: number,
): { phase: PhaseId; rounds: number; elapsed: number } {
  let current = phase;
  let completed = rounds;
  let remaining = elapsed;
  let guard = 0;

  while (remaining >= durations[current] && guard < 64) {
    remaining -= durations[current];
    if (completesRound(current)) completed += 1;
    current = nextPhase(current);
    guard += 1;
  }

  return { phase: current, rounds: completed, elapsed: Math.max(0, remaining) };
}
