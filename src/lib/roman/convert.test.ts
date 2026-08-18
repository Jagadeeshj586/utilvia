import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { convertRomanInput, fromRoman, toRoman } from "./convert";

describe("toRoman", () => {
  it("converts common values with subtractive notation", () => {
    assert.equal(toRoman(4), "IV");
    assert.equal(toRoman(9), "IX");
    assert.equal(toRoman(2026), "MMXXVI");
    assert.equal(toRoman(3999), "MMMCMXCIX");
  });

  it("rejects out-of-range values", () => {
    assert.throws(() => toRoman(0));
    assert.throws(() => toRoman(4000));
    assert.throws(() => toRoman(1.5));
  });
});

describe("fromRoman", () => {
  it("parses valid numerals", () => {
    assert.equal(fromRoman("iv"), 4);
    assert.equal(fromRoman("MMXXVI"), 2026);
  });

  it("rejects invalid combinations", () => {
    assert.throws(() => fromRoman("IIII"));
    assert.throws(() => fromRoman("IC"));
    assert.throws(() => fromRoman("ABC"));
  });
});

describe("convertRomanInput", () => {
  it("converts number to roman", () => {
    const result = convertRomanInput("2026", "to-roman");
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value, "MMXXVI");
  });

  it("converts roman to number", () => {
    const result = convertRomanInput("XLII", "to-number");
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value, "42");
  });

  it("returns empty for blank input", () => {
    assert.deepEqual(convertRomanInput("  ", "to-roman"), { ok: true, value: "" });
  });
});
