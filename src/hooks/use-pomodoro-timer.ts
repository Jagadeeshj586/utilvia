"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  completionMessage,
  computeRemainingFromTimestamp,
  cycleProgress,
  documentTitle,
  durationSecondsForMode,
  emptyDailyStats,
  normalizeDailyStats,
  nextModeAfterCompletion,
  nextModeAfterSkip,
  todayKey,
} from "@/lib/pomodoro/logic";
import { playPomodoroChime, unlockPomodoroAudio } from "@/lib/pomodoro/sound";
import {
  createDefaultPersistedState,
  loadPersistedState,
  mergeSettings,
  savePersistedState,
} from "@/lib/pomodoro/storage";
import type { DailyStats, TimerMode, TimerSettings } from "@/lib/pomodoro/types";

export function usePomodoroTimer() {
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>(createDefaultPersistedState().settings);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);
  const [dailyStats, setDailyStats] = useState<DailyStats>(emptyDailyStats());
  const [awaitingManualStart, setAwaitingManualStart] = useState(false);

  const endTimestampRef = useRef<number | null>(null);
  const settingsRef = useRef(settings);
  const modeRef = useRef(mode);
  const remainingRef = useRef(remainingSeconds);
  const completedRef = useRef(completedFocusSessions);
  const dailyRef = useRef(dailyStats);
  const isRunningRef = useRef(isRunning);
  const completingRef = useRef(false);

  settingsRef.current = settings;
  modeRef.current = mode;
  remainingRef.current = remainingSeconds;
  completedRef.current = completedFocusSessions;
  dailyRef.current = dailyStats;
  isRunningRef.current = isRunning;

  const persist = useCallback(() => {
    savePersistedState({
      version: 1,
      settings: settingsRef.current,
      mode: modeRef.current,
      remainingSeconds: remainingRef.current,
      isRunning: isRunningRef.current,
      completedFocusSessions: completedRef.current,
      endTimestamp: endTimestampRef.current,
      dailyStats: dailyRef.current,
    });
  }, []);

  const notifyCompletion = useCallback((currentMode: TimerMode, nextMode: TimerMode) => {
    const message = completionMessage(currentMode, nextMode);
    if (settingsRef.current.soundEnabled) playPomodoroChime();
    if (
      settingsRef.current.notificationsEnabled &&
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification(message.title, { body: message.body });
      } catch {
        /* ignore */
      }
    }
  }, []);

  const applyMode = useCallback((nextMode: TimerMode, autoStart: boolean) => {
    const duration = durationSecondsForMode(nextMode, settingsRef.current);
    setMode(nextMode);
    setRemainingSeconds(duration);
    remainingRef.current = duration;
    modeRef.current = nextMode;
    setAwaitingManualStart(!autoStart);
    if (autoStart) {
      endTimestampRef.current = Date.now() + duration * 1000;
      setIsRunning(true);
      isRunningRef.current = true;
    } else {
      endTimestampRef.current = null;
      setIsRunning(false);
      isRunningRef.current = false;
    }
  }, []);

  const completeSession = useCallback(() => {
    if (completingRef.current) return;
    completingRef.current = true;

    const currentMode = modeRef.current;
    let nextCompleted = completedRef.current;
    let nextDaily = normalizeDailyStats(dailyRef.current);

    if (currentMode === "focus") {
      nextCompleted += 1;
      const focusedSeconds = durationSecondsForMode("focus", settingsRef.current);
      nextDaily = {
        ...nextDaily,
        date: todayKey(),
        completedFocusSessions: nextDaily.completedFocusSessions + 1,
        totalFocusSeconds: nextDaily.totalFocusSeconds + focusedSeconds,
        lastSessionAt: Date.now(),
      };
      setCompletedFocusSessions(nextCompleted);
      setDailyStats(nextDaily);
      completedRef.current = nextCompleted;
      dailyRef.current = nextDaily;
    }

    const nextMode = nextModeAfterCompletion(
      currentMode,
      nextCompleted,
      settingsRef.current.longBreakInterval,
    );
    notifyCompletion(currentMode, nextMode);
    applyMode(nextMode, settingsRef.current.autoStart);
    completingRef.current = false;
    persist();
  }, [applyMode, notifyCompletion, persist]);

  useEffect(() => {
    const saved = loadPersistedState();
    const stats = normalizeDailyStats(saved.dailyStats);
    let remaining = saved.remainingSeconds;
    let running = saved.isRunning;
    let endTimestamp = saved.endTimestamp;

    if (running && endTimestamp) {
      const computed = computeRemainingFromTimestamp(endTimestamp);
      if (computed == null || computed <= 0) {
        remaining = 0;
        running = false;
        endTimestamp = null;
      } else {
        remaining = computed;
      }
    } else {
      endTimestamp = null;
      running = false;
    }

    setSettings(saved.settings);
    setMode(saved.mode);
    setRemainingSeconds(remaining);
    setIsRunning(running);
    setCompletedFocusSessions(saved.completedFocusSessions);
    setDailyStats(stats);
    endTimestampRef.current = endTimestamp;
    settingsRef.current = saved.settings;
    modeRef.current = saved.mode;
    remainingRef.current = remaining;
    completedRef.current = saved.completedFocusSessions;
    dailyRef.current = stats;
    isRunningRef.current = running;
    setHydrated(true);

    if (remaining === 0 && saved.isRunning) {
      window.setTimeout(() => completeSession(), 0);
    }
    // Hydrate once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persist();
  }, [
    hydrated,
    settings,
    mode,
    remainingSeconds,
    isRunning,
    completedFocusSessions,
    dailyStats,
    persist,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    document.title = documentTitle(remainingSeconds, mode, isRunning);
    return () => {
      document.title = "Pomodoro Timer";
    };
  }, [hydrated, isRunning, mode, remainingSeconds]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const tick = () => {
      if (!endTimestampRef.current) return;
      const next = Math.max(0, Math.round((endTimestampRef.current - Date.now()) / 1000));
      setRemainingSeconds(next);
      remainingRef.current = next;
      if (next <= 0) completeSession();
    };

    tick();
    const id = window.setInterval(tick, 250);

    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [completeSession, isRunning]);

  const start = useCallback(async () => {
    await unlockPomodoroAudio();
    if (
      settingsRef.current.notificationsEnabled &&
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      try {
        await Notification.requestPermission();
      } catch {
        /* ignore */
      }
    }
    endTimestampRef.current = Date.now() + remainingRef.current * 1000;
    setIsRunning(true);
    setAwaitingManualStart(false);
  }, []);

  const pause = useCallback(() => {
    if (endTimestampRef.current) {
      const next = Math.max(0, Math.round((endTimestampRef.current - Date.now()) / 1000));
      setRemainingSeconds(next);
      remainingRef.current = next;
    }
    endTimestampRef.current = null;
    setIsRunning(false);
  }, []);

  const toggle = useCallback(() => {
    if (isRunningRef.current) pause();
    else void start();
  }, [pause, start]);

  const reset = useCallback(() => {
    const duration = durationSecondsForMode(modeRef.current, settingsRef.current);
    endTimestampRef.current = null;
    setIsRunning(false);
    setRemainingSeconds(duration);
    remainingRef.current = duration;
    setAwaitingManualStart(false);
  }, []);

  const skip = useCallback(() => {
    const nextMode = nextModeAfterSkip(modeRef.current);
    applyMode(nextMode, settingsRef.current.autoStart);
  }, [applyMode]);

  const selectMode = useCallback((nextMode: TimerMode) => {
    if (nextMode === modeRef.current && !isRunningRef.current) {
      reset();
      return;
    }
    applyMode(nextMode, false);
  }, [applyMode, reset]);

  const updateSettings = useCallback((partial: Partial<TimerSettings>) => {
    const next = mergeSettings(settingsRef.current, partial);
    setSettings(next);
    settingsRef.current = next;
    if (!isRunningRef.current) {
      const duration = durationSecondsForMode(modeRef.current, next);
      setRemainingSeconds(duration);
      remainingRef.current = duration;
    }
  }, []);

  const enableNotifications = useCallback(async () => {
    if (typeof Notification === "undefined") {
      updateSettings({ notificationsEnabled: false });
      return false;
    }
    let permission = Notification.permission;
    if (permission === "default") {
      try {
        permission = await Notification.requestPermission();
      } catch {
        permission = "denied";
      }
    }
    const enabled = permission === "granted";
    updateSettings({ notificationsEnabled: enabled });
    return enabled;
  }, [updateSettings]);

  const totalDuration = durationSecondsForMode(mode, settings);
  const progress = totalDuration ? 1 - remainingSeconds / totalDuration : 0;
  const sessionsInCycle = cycleProgress(completedFocusSessions, settings.longBreakInterval);

  return {
    hydrated,
    settings,
    mode,
    remainingSeconds,
    isRunning,
    completedFocusSessions,
    dailyStats,
    awaitingManualStart,
    progress,
    sessionsInCycle,
    totalDuration,
    start,
    pause,
    toggle,
    reset,
    skip,
    selectMode,
    updateSettings,
    enableNotifications,
  };
}
