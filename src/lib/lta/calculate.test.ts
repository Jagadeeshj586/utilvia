import assert from "node:assert/strict";
import test from "node:test";
import { calculateLta } from "./calculate";
import { LTA_RULES } from "./rules";

test("matches WorkUtilities default (₹50,000 LTA, ₹40,000 expense)", () => {
  const result = calculateLta({
    ltaReceived: 50_000,
    actualTravelExpense: 40_000,
    numberOfTrips: 2,
  });
  assert.ok(result);
  assert.equal(result.exemptAmount, 40_000);
  assert.equal(result.taxableAmount, 10_000);
  assert.equal(result.tripsExceedBlockLimit, false);
});

test("exempt equals LTA when expense is higher", () => {
  const result = calculateLta({
    ltaReceived: 50_000,
    actualTravelExpense: 60_000,
    numberOfTrips: 1,
  });
  assert.ok(result);
  assert.equal(result.exemptAmount, 50_000);
  assert.equal(result.taxableAmount, 0);
});

test("flags trips above block limit without changing amounts", () => {
  const result = calculateLta({
    ltaReceived: 50_000,
    actualTravelExpense: 40_000,
    numberOfTrips: LTA_RULES.maxJourneysPerBlock + 1,
  });
  assert.ok(result);
  assert.equal(result.exemptAmount, 40_000);
  assert.equal(result.taxableAmount, 10_000);
  assert.equal(result.tripsExceedBlockLimit, true);
});

test("returns null for invalid inputs", () => {
  assert.equal(calculateLta({ ltaReceived: -1, actualTravelExpense: 10_000, numberOfTrips: 1 }), null);
  assert.equal(calculateLta({ ltaReceived: 10_000, actualTravelExpense: -1, numberOfTrips: 1 }), null);
});
