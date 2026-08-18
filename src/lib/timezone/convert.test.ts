import assert from "node:assert/strict";
import test from "node:test";
import {
  compareDateRelation,
  convertAcrossTimeZones,
  findWallTimeInstants,
  getUtcOffset,
  getZonedParts,
  instantToConvertedResult,
  isValidTimeZone,
  sanitizeTimeZoneList,
  wallTimeToInstant,
} from "./convert";

test("validates IANA time zones", () => {
  assert.equal(isValidTimeZone("Asia/Kolkata"), true);
  assert.equal(isValidTimeZone("America/New_York"), true);
  assert.equal(isValidTimeZone("Not/A_Zone"), false);
});

test("India to New York conversion", () => {
  const { source, results } = convertAcrossTimeZones({
    sourceDate: "2026-08-11",
    sourceTime: "19:30",
    sourceTimeZone: "Asia/Kolkata",
    destinationTimeZones: ["America/New_York"],
    format: "12",
  });
  assert.ok(source.instant);
  assert.equal(results.length, 1);
  assert.match(results[0].time, /10:00/);
  assert.equal(results[0].dateLabel, "same");
  assert.match(results[0].offset, /UTC-04:00/);
});

test("India to London conversion", () => {
  const { results } = convertAcrossTimeZones({
    sourceDate: "2026-08-11",
    sourceTime: "19:30",
    sourceTimeZone: "Asia/Kolkata",
    destinationTimeZones: ["Europe/London"],
    format: "24",
  });
  assert.equal(results[0].time, "15:00");
});

test("India to Tokyo conversion", () => {
  const { results } = convertAcrossTimeZones({
    sourceDate: "2026-08-11",
    sourceTime: "19:30",
    sourceTimeZone: "Asia/Kolkata",
    destinationTimeZones: ["Asia/Tokyo"],
    format: "24",
  });
  assert.equal(results[0].time, "23:00");
});

test("New York to London conversion", () => {
  const { results } = convertAcrossTimeZones({
    sourceDate: "2026-08-11",
    sourceTime: "10:00",
    sourceTimeZone: "America/New_York",
    destinationTimeZones: ["Europe/London"],
    format: "24",
  });
  assert.equal(results[0].time, "15:00");
});

test("same timezone conversion preserves wall time", () => {
  const { results } = convertAcrossTimeZones({
    sourceDate: "2026-08-11",
    sourceTime: "08:00",
    sourceTimeZone: "Asia/Kolkata",
    destinationTimeZones: ["Asia/Kolkata"],
    format: "24",
  });
  assert.equal(results[0].time, "08:00");
  assert.equal(results[0].dateLabel, "same");
});

test("date rollover to previous day", () => {
  const { results } = convertAcrossTimeZones({
    sourceDate: "2026-08-11",
    sourceTime: "08:00",
    sourceTimeZone: "Asia/Kolkata",
    destinationTimeZones: ["America/New_York"],
    format: "24",
  });
  assert.equal(results[0].dateLabel, "previous");
});

test("date rollover to next day", () => {
  const { results } = convertAcrossTimeZones({
    sourceDate: "2026-08-11",
    sourceTime: "20:00",
    sourceTimeZone: "America/New_York",
    destinationTimeZones: ["Asia/Tokyo"],
    format: "24",
  });
  assert.equal(results[0].dateLabel, "next");
});

test("DST spring forward nonexistent time is flagged", () => {
  const result = wallTimeToInstant("2026-03-08", "02:30", "America/New_York");
  assert.equal(result.instant, null);
  assert.equal(result.warning?.type, "nonexistent");
});

test("DST fall back ambiguous time has two candidates", () => {
  const candidates = findWallTimeInstants(2026, 11, 1, 1, 30, "America/New_York");
  assert.ok(candidates.length >= 2);
  const earlier = wallTimeToInstant("2026-11-01", "01:30", "America/New_York", "earlier");
  const later = wallTimeToInstant("2026-11-01", "01:30", "America/New_York", "later");
  assert.ok(earlier.instant);
  assert.ok(later.instant);
  assert.notEqual(earlier.instant.getTime(), later.instant.getTime());
});

test("timezone without DST keeps stable winter offset", () => {
  const winter = getUtcOffset(new Date("2026-01-15T12:00:00Z"), "Asia/Kolkata");
  const summer = getUtcOffset(new Date("2026-07-15T12:00:00Z"), "Asia/Kolkata");
  assert.equal(winter, "UTC+05:30");
  assert.equal(summer, "UTC+05:30");
});

test("multiple destination timezones convert independently", () => {
  const { results } = convertAcrossTimeZones({
    sourceDate: "2026-08-11",
    sourceTime: "08:00",
    sourceTimeZone: "Asia/Kolkata",
    destinationTimeZones: ["America/New_York", "Europe/London", "Asia/Tokyo", "Asia/Singapore"],
    format: "24",
  });
  assert.equal(results.length, 4);
  assert.equal(results.find((item) => item.timeZone === "Asia/Singapore")?.time, "10:30");
});

test("12-hour and 24-hour formatting", () => {
  const instant = wallTimeToInstant("2026-08-11", "19:30", "Asia/Kolkata").instant!;
  const twelve = instantToConvertedResult(instant, "Asia/Kolkata", "2026-08-11", "12");
  const twentyFour = instantToConvertedResult(instant, "Asia/Kolkata", "2026-08-11", "24");
  assert.ok(twelve);
  assert.ok(twentyFour);
  assert.match(twelve.time, /PM/i);
  assert.equal(twentyFour.time, "19:30");
});

test("invalid date and time are rejected", () => {
  assert.equal(wallTimeToInstant("2026-02-30", "10:00", "UTC").instant, null);
  assert.equal(wallTimeToInstant("2026-08-11", "99:00", "UTC").instant, null);
});

test("sanitize timezone list rejects invalid identifiers", () => {
  const sanitized = sanitizeTimeZoneList(["Asia/Kolkata", "Bad/Zone"], ["UTC"]);
  assert.deepEqual(sanitized, ["Asia/Kolkata"]);
});

test("compare date relation labels", () => {
  assert.equal(compareDateRelation("2026-08-11", getZonedParts(new Date("2026-08-10T12:00:00Z"), "UTC")), "previous");
  assert.equal(compareDateRelation("2026-08-11", getZonedParts(new Date("2026-08-11T12:00:00Z"), "UTC")), "same");
  assert.equal(compareDateRelation("2026-08-11", getZonedParts(new Date("2026-08-12T12:00:00Z"), "UTC")), "next");
});
