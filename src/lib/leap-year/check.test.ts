import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkLeapYear,
  findNextLeapYear,
  findPreviousLeapYear,
  isLeapYear,
  leapYearExplanation,
  parseYearInput,
} from "./check";

describe("isLeapYear", () => {
  it("applies the full Gregorian rule", () => {
    assert.equal(isLeapYear(2024), true);
    assert.equal(isLeapYear(2026), false);
    assert.equal(isLeapYear(1900), false);
    assert.equal(isLeapYear(2000), true);
  });
});

describe("leapYearExplanation", () => {
  it("explains each rule branch", () => {
    assert.match(leapYearExplanation(2000), /divisible by 400/);
    assert.match(leapYearExplanation(1900), /century year/);
    assert.match(leapYearExplanation(2024), /divisible by 4/);
    assert.match(leapYearExplanation(2026), /not divisible by 4/);
  });
});

describe("findPreviousLeapYear / findNextLeapYear", () => {
  it("finds neighbors for a non-leap year", () => {
    assert.equal(findPreviousLeapYear(2026), 2024);
    assert.equal(findNextLeapYear(2026), 2028);
  });

  it("skips the current year when finding neighbors", () => {
    assert.equal(findPreviousLeapYear(2024), 2020);
    assert.equal(findNextLeapYear(2024), 2028);
  });
});

describe("parseYearInput", () => {
  it("accepts integer years", () => {
    assert.equal(parseYearInput("2026"), 2026);
    assert.equal(parseYearInput("-44"), -44);
  });

  it("rejects invalid values", () => {
    assert.equal(parseYearInput(""), null);
    assert.equal(parseYearInput("20.26"), null);
    assert.equal(parseYearInput("abc"), null);
  });
});

describe("checkLeapYear", () => {
  it("returns a full result payload", () => {
    const result = checkLeapYear(2026);
    assert.equal(result.isLeap, false);
    assert.equal(result.headline, "Not a Leap Year");
    assert.equal(result.previousLeapYear, 2024);
    assert.equal(result.nextLeapYear, 2028);
  });
});
