import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  advanceFromElapsed,
  clampPhaseSeconds,
  durationsMatch,
  markerOffset,
  nextPhase,
  phaseProgress,
  remainingSeconds,
  sanitizeDurations,
} from "./logic";
import { DEFAULT_DURATIONS, PRESET_4_7_8 } from "./types";

describe("clampPhaseSeconds", () => {
  it("keeps values between 3 and 8", () => {
    assert.equal(clampPhaseSeconds(2), 3);
    assert.equal(clampPhaseSeconds(9), 8);
    assert.equal(clampPhaseSeconds(4.4), 4);
    assert.equal(clampPhaseSeconds(Number.NaN), 4);
  });
});

describe("phase helpers", () => {
  it("cycles inhale → hold → exhale → hold → inhale", () => {
    assert.equal(nextPhase("inhale"), "hold1");
    assert.equal(nextPhase("hold1"), "exhale");
    assert.equal(nextPhase("exhale"), "hold2");
    assert.equal(nextPhase("hold2"), "inhale");
  });

  it("counts remaining seconds without showing 0 mid-phase", () => {
    assert.equal(remainingSeconds(4, 0), 4);
    assert.equal(remainingSeconds(4, 0.2), 4);
    assert.equal(remainingSeconds(4, 3.2), 1);
    assert.equal(remainingSeconds(4, 4), 0);
  });

  it("maps marker to square corners", () => {
    assert.deepEqual(markerOffset("inhale", 0), { x: 0, y: 1 });
    assert.deepEqual(markerOffset("inhale", 1), { x: 0, y: 0 });
    assert.deepEqual(markerOffset("hold1", 1), { x: 1, y: 0 });
    assert.deepEqual(markerOffset("exhale", 1), { x: 1, y: 1 });
    assert.deepEqual(markerOffset("hold2", 1), { x: 0, y: 1 });
  });

  it("advances a full round and leftover time", () => {
    const result = advanceFromElapsed("inhale", 0, DEFAULT_DURATIONS, 16.5);
    assert.equal(result.phase, "inhale");
    assert.equal(result.rounds, 1);
    assert.equal(result.elapsed, 0.5);
  });

  it("recognizes the 4-7-8 preset", () => {
    assert.equal(durationsMatch(sanitizeDurations(PRESET_4_7_8), PRESET_4_7_8), true);
    assert.equal(durationsMatch(DEFAULT_DURATIONS, PRESET_4_7_8), false);
  });

  it("clamps progress to 0–1", () => {
    assert.equal(phaseProgress(4, -1), 0);
    assert.equal(phaseProgress(4, 2), 0.5);
    assert.equal(phaseProgress(4, 9), 1);
  });
});
