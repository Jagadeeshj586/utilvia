import { emptyDailyStats, normalizeDailyStats, sanitizeSettings } from "./logic";
import {
  DEFAULT_SETTINGS,
  type PersistedPomodoroState,
  type TimerMode,
  type TimerSettings,
} from "./types";

export const POMODORO_STORAGE_KEY = "toolhub-pomodoro-v1";

export function createDefaultPersistedState(): PersistedPomodoroState {
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS },
    mode: "focus",
    remainingSeconds: DEFAULT_SETTINGS.focusDuration * 60,
    isRunning: false,
    completedFocusSessions: 0,
    endTimestamp: null,
    dailyStats: emptyDailyStats(),
  };
}

export function loadPersistedState(): PersistedPomodoroState {
  if (typeof window === "undefined") return createDefaultPersistedState();
  try {
    const raw = window.localStorage.getItem(POMODORO_STORAGE_KEY);
    if (!raw) return createDefaultPersistedState();
    const parsed = JSON.parse(raw) as Partial<PersistedPomodoroState>;
    const settings = sanitizeSettings(parsed.settings);
    const mode: TimerMode =
      parsed.mode === "shortBreak" || parsed.mode === "longBreak" || parsed.mode === "focus"
        ? parsed.mode
        : "focus";
    const remainingSeconds =
      typeof parsed.remainingSeconds === "number" && Number.isFinite(parsed.remainingSeconds)
        ? Math.max(0, Math.floor(parsed.remainingSeconds))
        : settings.focusDuration * 60;

    return {
      version: 1,
      settings,
      mode,
      remainingSeconds,
      isRunning: Boolean(parsed.isRunning),
      completedFocusSessions: Math.max(0, Math.floor(parsed.completedFocusSessions || 0)),
      endTimestamp:
        typeof parsed.endTimestamp === "number" && Number.isFinite(parsed.endTimestamp)
          ? parsed.endTimestamp
          : null,
      dailyStats: normalizeDailyStats(parsed.dailyStats),
    };
  } catch {
    return createDefaultPersistedState();
  }
}

export function savePersistedState(state: PersistedPomodoroState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

export function mergeSettings(current: TimerSettings, next: Partial<TimerSettings>) {
  return sanitizeSettings({ ...current, ...next });
}
