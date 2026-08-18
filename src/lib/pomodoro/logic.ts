import {
  DEFAULT_SETTINGS,
  MAX_DURATION,
  MAX_INTERVAL,
  MIN_DURATION,
  MIN_INTERVAL,
  MODE_LABELS,
  type DailyStats,
  type TimerMode,
  type TimerSettings,
} from "./types";

export function clampDuration(value: number) {
  if (!Number.isFinite(value)) return MIN_DURATION;
  return Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.round(value)));
}

export function clampInterval(value: number) {
  if (!Number.isFinite(value)) return MIN_INTERVAL;
  return Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, Math.round(value)));
}

export function sanitizeSettings(input: Partial<TimerSettings> | null | undefined): TimerSettings {
  const base = { ...DEFAULT_SETTINGS, ...(input ?? {}) };
  return {
    focusDuration: clampDuration(base.focusDuration),
    shortBreakDuration: clampDuration(base.shortBreakDuration),
    longBreakDuration: clampDuration(base.longBreakDuration),
    longBreakInterval: clampInterval(base.longBreakInterval),
    autoStart: Boolean(base.autoStart),
    soundEnabled: Boolean(base.soundEnabled),
    notificationsEnabled: Boolean(base.notificationsEnabled),
  };
}

export function durationSecondsForMode(mode: TimerMode, settings: TimerSettings) {
  if (mode === "focus") return settings.focusDuration * 60;
  if (mode === "shortBreak") return settings.shortBreakDuration * 60;
  return settings.longBreakDuration * 60;
}

export function formatClock(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatFocusDuration(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function emptyDailyStats(date = todayKey()): DailyStats {
  return {
    date,
    completedFocusSessions: 0,
    totalFocusSeconds: 0,
    lastSessionAt: null,
  };
}

export function normalizeDailyStats(stats: DailyStats | null | undefined, now = Date.now()): DailyStats {
  const today = todayKey(new Date(now));
  if (!stats || stats.date !== today) return emptyDailyStats(today);
  return {
    date: today,
    completedFocusSessions: Math.max(0, Math.floor(stats.completedFocusSessions || 0)),
    totalFocusSeconds: Math.max(0, Math.floor(stats.totalFocusSeconds || 0)),
    lastSessionAt: stats.lastSessionAt ?? null,
  };
}

/** Sessions completed in the current cycle (1..interval). */
export function cycleProgress(completedFocusSessions: number, interval: number) {
  const safeInterval = Math.max(1, interval);
  if (completedFocusSessions <= 0) return 0;
  const mod = completedFocusSessions % safeInterval;
  return mod === 0 ? safeInterval : mod;
}

export function nextModeAfterCompletion(
  currentMode: TimerMode,
  completedFocusSessionsAfter: number,
  longBreakInterval: number,
): TimerMode {
  if (currentMode === "focus") {
    return completedFocusSessionsAfter % Math.max(1, longBreakInterval) === 0 ? "longBreak" : "shortBreak";
  }
  return "focus";
}

export function nextModeAfterSkip(currentMode: TimerMode): TimerMode {
  if (currentMode === "focus") {
    // Skipping focus does not count as completed; move to a short break.
    return "shortBreak";
  }
  return "focus";
}

export function completionMessage(mode: TimerMode, nextMode: TimerMode) {
  if (mode === "focus") {
    return {
      title: "Focus session complete",
      body: nextMode === "longBreak" ? "Time for a long break." : "Time for a short break.",
    };
  }
  return {
    title: "Break complete",
    body: "Ready to focus?",
  };
}

export function documentTitle(remainingSeconds: number, mode: TimerMode, isRunning: boolean) {
  const clock = formatClock(remainingSeconds);
  if (!isRunning) return "Pomodoro Timer";
  return `${clock} · ${MODE_LABELS[mode]} · Pomodoro Timer`;
}

export function computeRemainingFromTimestamp(endTimestamp: number | null, now = Date.now()) {
  if (endTimestamp == null) return null;
  return Math.max(0, Math.round((endTimestamp - now) / 1000));
}
