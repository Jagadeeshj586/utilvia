import assert from "node:assert/strict";
import test from "node:test";
import {
  clampDuration,
  cycleProgress,
  formatClock,
  nextModeAfterCompletion,
  nextModeAfterSkip,
  sanitizeSettings,
} from "./logic";

test("clamps durations", () => {
  assert.equal(clampDuration(0), 1);
  assert.equal(clampDuration(200), 120);
  assert.equal(clampDuration(25.4), 25);
});

test("formats clock", () => {
  assert.equal(formatClock(1500), "25:00");
  assert.equal(formatClock(65), "01:05");
  assert.equal(formatClock(-3), "00:00");
});

test("cycles to short or long break after focus", () => {
  assert.equal(nextModeAfterCompletion("focus", 1, 4), "shortBreak");
  assert.equal(nextModeAfterCompletion("focus", 2, 4), "shortBreak");
  assert.equal(nextModeAfterCompletion("focus", 4, 4), "longBreak");
  assert.equal(nextModeAfterCompletion("shortBreak", 4, 4), "focus");
  assert.equal(nextModeAfterCompletion("longBreak", 4, 4), "focus");
});

test("skip does not treat unfinished focus as completed", () => {
  assert.equal(nextModeAfterSkip("focus"), "shortBreak");
  assert.equal(nextModeAfterSkip("shortBreak"), "focus");
});

test("cycle progress wraps by interval", () => {
  assert.equal(cycleProgress(0, 4), 0);
  assert.equal(cycleProgress(1, 4), 1);
  assert.equal(cycleProgress(4, 4), 4);
  assert.equal(cycleProgress(5, 4), 1);
});

test("sanitizes settings", () => {
  const settings = sanitizeSettings({
    focusDuration: -5,
    shortBreakDuration: 999,
    longBreakDuration: 15,
    longBreakInterval: 0,
    autoStart: true,
    soundEnabled: false,
    notificationsEnabled: true,
  });
  assert.equal(settings.focusDuration, 1);
  assert.equal(settings.shortBreakDuration, 120);
  assert.equal(settings.longBreakInterval, 1);
  assert.equal(settings.autoStart, true);
});
