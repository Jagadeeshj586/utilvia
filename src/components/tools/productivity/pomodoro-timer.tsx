"use client";

import { useEffect, useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  Settings2,
  SkipForward,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePomodoroTimer } from "@/hooks/use-pomodoro-timer";
import { formatClock, formatFocusDuration } from "@/lib/pomodoro/logic";
import { MODE_LABELS, type TimerMode } from "@/lib/pomodoro/types";
import { cn } from "@/lib/utils";

const MODES: TimerMode[] = ["focus", "shortBreak", "longBreak"];

function SessionDots({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-label={`${filled} of ${total} sessions in this cycle`}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            index < filled ? "bg-primary" : "bg-[var(--hairline)]",
          )}
        />
      ))}
    </div>
  );
}

export function PomodoroTimer() {
  const timer = usePomodoroTimer();
  const { theme, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState(timer.settings);

  useEffect(() => {
    if (settingsOpen) setDraft(timer.settings);
  }, [settingsOpen, timer.settings]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        timer.toggle();
      } else if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        timer.reset();
      } else if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        timer.skip();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [timer.toggle, timer.reset, timer.skip]);

  const saveSettings = async () => {
    timer.updateSettings(draft);
    if (draft.notificationsEnabled) {
      const ok = await timer.enableNotifications();
      if (!ok) {
        toast.message("Notifications are blocked in this browser.");
        setDraft((current) => ({ ...current, notificationsEnabled: false }));
      }
    }
    setSettingsOpen(false);
    toast.success("Settings saved");
  };

  const clock = formatClock(timer.remainingSeconds);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, timer.progress)));

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--body)]">Focus better. Work smarter.</p>
          <p className="mt-1 text-xs text-muted-foreground">Space start/pause · R reset · S skip</p>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="icon" aria-label="Open settings">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>Customize durations, auto-start, sound, and notifications.</DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="focus-duration">Focus (minutes)</Label>
                    <Input
                      id="focus-duration"
                      type="number"
                      min={1}
                      max={120}
                      value={draft.focusDuration}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, focusDuration: Number(event.target.value) }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="short-break">Short break</Label>
                    <Input
                      id="short-break"
                      type="number"
                      min={1}
                      max={120}
                      value={draft.shortBreakDuration}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, shortBreakDuration: Number(event.target.value) }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="long-break">Long break</Label>
                    <Input
                      id="long-break"
                      type="number"
                      min={1}
                      max={120}
                      value={draft.longBreakDuration}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, longBreakDuration: Number(event.target.value) }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="long-interval">Long break after</Label>
                    <Input
                      id="long-interval"
                      type="number"
                      min={1}
                      max={12}
                      value={draft.longBreakInterval}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, longBreakInterval: Number(event.target.value) }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-[var(--hairline)] bg-surface-soft p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="auto-start">Auto-start next session</Label>
                    <Switch
                      id="auto-start"
                      checked={draft.autoStart}
                      onCheckedChange={(checked) => setDraft((current) => ({ ...current, autoStart: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="sound">Sound</Label>
                    <Switch
                      id="sound"
                      checked={draft.soundEnabled}
                      onCheckedChange={(checked) => setDraft((current) => ({ ...current, soundEnabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="notifications">Desktop notifications</Label>
                    <Switch
                      id="notifications"
                      checked={draft.notificationsEnabled}
                      onCheckedChange={(checked) =>
                        setDraft((current) => ({ ...current, notificationsEnabled: checked }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Appearance</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["system", "light", "dark"] as const).map((value) => (
                      <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant={(theme ?? "system") === value ? "default" : "outline"}
                        onClick={() => setTheme(value)}
                      >
                        {value[0].toUpperCase() + value.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-3 text-xs text-muted-foreground">
                  Keyboard shortcuts: Space (start/pause), R (reset), S (skip)
                </div>

                <Button type="button" className="w-full" onClick={() => void saveSettings()}>
                  Save settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {MODES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => timer.selectMode(item)}
            className={cn(
              "min-h-11 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              timer.mode === item
                ? "bg-primary text-primary-foreground"
                : "border border-[var(--hairline)] bg-surface-soft text-[var(--body)] hover:border-primary/40",
            )}
          >
            {MODE_LABELS[item]}
          </button>
        ))}
      </div>

      <div
        className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${MODE_LABELS[timer.mode]} ${clock}`}
      >
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} fill="none" className="stroke-[var(--hairline)]" strokeWidth="5" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className="stroke-primary transition-[stroke-dashoffset] duration-300 motion-reduce:transition-none"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="relative z-10 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {MODE_LABELS[timer.mode]}
          </p>
          <p className="mt-2 font-display text-5xl font-semibold tabular-nums tracking-tight text-ink sm:text-6xl">
            {clock}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" className="min-h-11 min-w-[120px]" onClick={() => void timer.toggle()}>
          {timer.isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {timer.isRunning ? "Pause" : timer.awaitingManualStart ? "Start next" : "Start"}
        </Button>
        <Button type="button" variant="outline" className="min-h-11" onClick={timer.reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button type="button" variant="outline" className="min-h-11" onClick={timer.skip}>
          <SkipForward className="mr-2 h-4 w-4" />
          Skip
        </Button>
      </div>

      <div className="space-y-3 text-center">
        <p className="text-sm text-[var(--body)]">
          Session {timer.sessionsInCycle || 0} of {timer.settings.longBreakInterval}
        </p>
        <SessionDots filled={timer.sessionsInCycle} total={timer.settings.longBreakInterval} />
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-4 text-center sm:text-left">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Today&apos;s focus</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">
            {timer.dailyStats.completedFocusSessions} sessions
          </p>
          <p className="mt-1 text-sm text-[var(--body)]">
            {formatFocusDuration(timer.dailyStats.totalFocusSeconds)} focused
          </p>
        </div>
        <div className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-4 text-center sm:text-left">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Cycle progress</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">
            {timer.sessionsInCycle}/{timer.settings.longBreakInterval}
          </p>
          <p className="mt-1 text-sm text-[var(--body)]">
            {timer.mode === "focus" ? "In a focus block" : "On a break"}
          </p>
        </div>
      </section>
    </div>
  );
}
