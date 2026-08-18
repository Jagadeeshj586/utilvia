export type TimerMode = "focus" | "shortBreak" | "longBreak";

export interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStart: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface DailyStats {
  date: string;
  completedFocusSessions: number;
  totalFocusSeconds: number;
  lastSessionAt: number | null;
}

export interface PersistedPomodoroState {
  version: 1;
  settings: TimerSettings;
  mode: TimerMode;
  remainingSeconds: number;
  isRunning: boolean;
  completedFocusSessions: number;
  endTimestamp: number | null;
  dailyStats: DailyStats;
}

export const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStart: false,
  soundEnabled: true,
  notificationsEnabled: false,
};

export const MIN_DURATION = 1;
export const MAX_DURATION = 120;
export const MIN_INTERVAL = 1;
export const MAX_INTERVAL = 12;

export const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

export const POMODORO_FAQS = [
  {
    question: "How does the Pomodoro technique work?",
    answer:
      "Work in focused sessions (usually 25 minutes), then take a short break. After several focus sessions, take a longer break to recharge.",
  },
  {
    question: "When does the long break start?",
    answer:
      "By default, a long break starts after every 4 completed focus sessions. You can change this interval in Settings.",
  },
  {
    question: "Will the timer stay accurate if I switch tabs?",
    answer:
      "Yes. The timer uses timestamps, so it remains accurate even if the browser tab is inactive or your device sleeps.",
  },
  {
    question: "Are my settings saved?",
    answer:
      "Yes. Settings, timer state, and today's focus stats are saved in your browser's local storage.",
  },
  {
    question: "Can I customize durations?",
    answer:
      "Yes. Open Settings to change focus, short break, and long break lengths, plus auto-start, sound, and notifications.",
  },
] as const;
