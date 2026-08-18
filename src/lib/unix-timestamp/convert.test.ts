import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dateTimeToUnix,
  detectTimestampUnit,
  formatInstant,
  parseTimeWithSeconds,
  parseTimestampInput,
  timestampToDate,
} from "./convert";

describe("detectTimestampUnit", () => {
  it("treats present-day values as seconds and 13-digit values as milliseconds", () => {
    assert.equal(detectTimestampUnit(1_609_459_200), "seconds");
    assert.equal(detectTimestampUnit(1_704_067_200_000), "milliseconds");
    assert.equal(detectTimestampUnit(0), "seconds");
  });
});

describe("parseTimestampInput", () => {
  it("parses epoch zero", () => {
    const parsed = parseTimestampInput("0");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.milliseconds, 0);
    assert.equal(parsed.detected, "seconds");
  });

  it("auto-detects milliseconds from length", () => {
    const parsed = parseTimestampInput("1704067200000");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.detected, "milliseconds");
    assert.equal(parsed.seconds, 1_704_067_200);
  });

  it("honors an explicit seconds unit on a large number", () => {
    const parsed = parseTimestampInput("1704067200000", "seconds");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.detected, "seconds");
    assert.equal(parsed.milliseconds, 1_704_067_200_000_000);
  });

  it("rejects empty and non-numeric input", () => {
    assert.equal(parseTimestampInput("").ok, false);
    assert.equal(parseTimestampInput("not-a-time").ok, false);
  });

  it("allows separators and fractional seconds", () => {
    const parsed = parseTimestampInput("1,609,459,200.5");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.milliseconds, 1_609_459_200_500);
  });
});

describe("timestampToDate", () => {
  it("converts 1000000000 to 9 Sep 2001 in UTC", () => {
    const result = timestampToDate("1000000000", "auto", "UTC");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.result.isoDate, "2001-09-09");
    assert.equal(result.result.time, "01:46:40");
    assert.equal(result.result.weekday, "Sunday");
    assert.equal(result.result.seconds, 1_000_000_000);
  });

  it("converts millisecond new year 2024", () => {
    const result = timestampToDate("1704067200000", "auto", "UTC");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.result.isoDate, "2024-01-01");
    assert.equal(result.result.time, "00:00:00");
  });
});

describe("dateTimeToUnix", () => {
  it("converts a UTC wall time back to epoch seconds", () => {
    const result = dateTimeToUnix("2021-01-01", "00:00:00", "UTC");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.result.seconds, 1_609_459_200);
    assert.equal(result.result.milliseconds, 1_609_459_200_000);
  });

  it("includes seconds past the minute", () => {
    const result = dateTimeToUnix("2021-01-01", "00:00:40", "UTC");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.result.seconds, 1_609_459_240);
  });

  it("rejects an invalid time", () => {
    const result = dateTimeToUnix("2021-01-01", "25:00", "UTC");
    assert.equal(result.ok, false);
  });
});

describe("parseTimeWithSeconds", () => {
  it("accepts HH:MM and HH:MM:SS", () => {
    assert.deepEqual(parseTimeWithSeconds("9:05"), { hour: 9, minute: 5, second: 0 });
    assert.deepEqual(parseTimeWithSeconds("23:59:59"), { hour: 23, minute: 59, second: 59 });
    assert.equal(parseTimeWithSeconds("24:00"), null);
  });
});

describe("formatInstant", () => {
  it("formats epoch zero in UTC", () => {
    const result = formatInstant(0, "UTC");
    assert.equal("error" in result, false);
    if ("error" in result) return;
    assert.equal(result.date, "January 1, 1970");
    assert.equal(result.time, "00:00:00");
    assert.equal(result.weekday, "Thursday");
    assert.equal(result.offset, "UTC+00:00");
  });
});
