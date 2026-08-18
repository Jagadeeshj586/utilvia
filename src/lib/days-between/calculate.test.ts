import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateDaysBetween,
  calendarBreakdown,
  daysBetweenCalendarDates,
  parseDateInput,
  relativeToToday,
  toDateInputValue,
} from "./calculate";

describe("parseDateInput", () => {
  it("parses valid local dates", () => {
    const date = parseDateInput("2026-01-03");
    assert.ok(date);
    assert.equal(date.getFullYear(), 2026);
    assert.equal(date.getMonth(), 0);
    assert.equal(date.getDate(), 3);
  });

  it("rejects invalid calendar dates", () => {
    assert.equal(parseDateInput("2026-02-31"), null);
    assert.equal(parseDateInput("not-a-date"), null);
  });
});

describe("daysBetweenCalendarDates", () => {
  it("does not count the start date as a full day", () => {
    const start = parseDateInput("2026-01-01")!;
    const end = parseDateInput("2026-01-03")!;
    assert.equal(daysBetweenCalendarDates(start, end), 2);
  });

  it("handles leap years", () => {
    const start = parseDateInput("2024-02-28")!;
    const end = parseDateInput("2024-03-01")!;
    assert.equal(daysBetweenCalendarDates(start, end), 2);
  });
});

describe("calendarBreakdown", () => {
  it("breaks down a multi-year span", () => {
    const earlier = parseDateInput("2024-01-15")!;
    const later = parseDateInput("2026-03-20")!;
    assert.deepEqual(calendarBreakdown(earlier, later), { years: 2, months: 2, days: 5 });
  });
});

describe("calculateDaysBetween", () => {
  it("returns absolute days and marks swapped ranges", () => {
    const forward = calculateDaysBetween("2026-01-01", "2026-01-03");
    assert.ok(forward);
    assert.equal(forward.totalDays, 2);
    assert.equal(forward.swapped, false);

    const reverse = calculateDaysBetween("2026-01-03", "2026-01-01");
    assert.ok(reverse);
    assert.equal(reverse.totalDays, 2);
    assert.equal(reverse.swapped, true);
  });
});

describe("relativeToToday", () => {
  it("labels end date as today", () => {
    const today = parseDateInput("2026-08-14")!;
    const result = relativeToToday("2026-01-01", "2026-08-14", today);
    assert.ok(result);
    assert.equal(result.kind, "end-today");
    assert.equal(result.label, "End date is today");
  });

  it("formats countdown from today", () => {
    const today = parseDateInput("2026-08-14")!;
    const result = relativeToToday("2026-08-01", "2026-08-21", today);
    assert.ok(result);
    assert.equal(result.kind, "countdown");
    assert.equal(result.daysFromTodayToEnd, 7);
  });
});

describe("toDateInputValue", () => {
  it("formats local YYYY-MM-DD", () => {
    assert.equal(toDateInputValue(new Date(2026, 7, 14)), "2026-08-14");
  });
});
