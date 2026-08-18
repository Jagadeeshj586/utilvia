import assert from "node:assert/strict";
import test from "node:test";
import { calculateFromHourly, calculateHourlySalary, salaryToHourly } from "./calculate";

test("matches WorkUtilities default ($25/hr, 40h, 52 weeks)", () => {
  const result = calculateFromHourly(25, 40, 52);
  assert.equal(result.hourly, 25);
  assert.equal(result.daily, 200);
  assert.equal(result.weekly, 1000);
  assert.equal(result.biweekly, 2000);
  assert.equal(result.monthly, 52000 / 12);
  assert.equal(result.annual, 52000);
  assert.equal(Math.round(result.monthly), 4333);
});

test("converts annual salary back to hourly", () => {
  assert.equal(salaryToHourly(52000, 40, 52), 25);
  const result = calculateHourlySalary({
    mode: "salary",
    hourlyRate: 0,
    annualSalary: 52000,
    hoursPerWeek: 40,
    weeksPerYear: 52,
  });
  assert.ok(result);
  assert.equal(result.hourly, 25);
  assert.equal(result.annual, 52000);
});

test("falls back to 40 hours and 52 weeks when values are invalid", () => {
  const result = calculateHourlySalary({
    mode: "hourly",
    hourlyRate: 25,
    annualSalary: 0,
    hoursPerWeek: 0,
    weeksPerYear: 0,
  });
  assert.ok(result);
  assert.equal(result.annual, 52000);
});

test("returns null for negative rates", () => {
  assert.equal(
    calculateHourlySalary({
      mode: "hourly",
      hourlyRate: -1,
      annualSalary: 0,
      hoursPerWeek: 40,
      weeksPerYear: 52,
    }),
    null,
  );
});
