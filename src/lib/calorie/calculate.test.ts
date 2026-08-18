import assert from "node:assert/strict";
import test from "node:test";
import { calculateBmr, calculateCalorieDeficit, fromCm, fromKg, toCm, toKg } from "./calculate";

test("male BMR matches Mifflin–St Jeor", () => {
  // 10*70 + 6.25*170 - 5*30 + 5 = 1617.5
  assert.equal(calculateBmr(70, 170, 30, "male"), 1617.5);
});

test("female BMR matches Mifflin–St Jeor", () => {
  // 10*70 + 6.25*170 - 5*30 - 161 = 1451.5
  assert.equal(calculateBmr(70, 170, 30, "female"), 1451.5);
});

test("moderate deficit matches WorkUtilities sample", () => {
  const result = calculateCalorieDeficit({
    sex: "male",
    age: 30,
    weightKg: 70,
    heightCm: 170,
    activity: "moderately-active",
    goal: "moderate",
  });
  assert.ok(result);
  assert.equal(result.bmr, 1618);
  assert.equal(result.tdee, 2508);
  assert.equal(result.deficit, 500);
  assert.equal(result.dailyTarget, 2008);
});

test("maintain goal has zero deficit", () => {
  const result = calculateCalorieDeficit({
    sex: "male",
    age: 30,
    weightKg: 70,
    heightCm: 170,
    activity: "moderately-active",
    goal: "maintain",
  });
  assert.ok(result);
  assert.equal(result.deficit, 0);
  assert.equal(result.dailyTarget, result.tdee);
});

test("unit conversions round-trip", () => {
  assert.ok(Math.abs(toKg(154.324, "imperial") - 70) < 0.01);
  assert.ok(Math.abs(toCm(66.929, "imperial") - 170) < 0.01);
  assert.ok(Math.abs(fromKg(70, "imperial") - 154.324) < 0.01);
  assert.ok(Math.abs(fromCm(170, "imperial") - 66.929) < 0.01);
});
