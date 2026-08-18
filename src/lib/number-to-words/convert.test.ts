import assert from "node:assert/strict";
import test from "node:test";
import {
  convertNumberToWords,
  formatGroupedNumber,
  toWordsIndian,
  toWordsInternational,
} from "./convert";

test("converts indian system amounts", () => {
  assert.equal(toWordsIndian(100000), "one lakh");
  assert.equal(toWordsIndian(10000000), "one crore");
});

test("converts international system amounts", () => {
  assert.equal(toWordsInternational(100000), "one hundred thousand");
  assert.equal(toWordsInternational(1000000), "one million");
});

test("formats indian and international grouping", () => {
  assert.equal(formatGroupedNumber(100000, "indian"), "1,00,000");
  assert.equal(formatGroupedNumber(100000, "international"), "100,000");
});

test("builds capitalized output with currency suffix", () => {
  const result = convertNumberToWords({
    input: "100000",
    system: "indian",
    currencySuffix: true,
    currency: "INR",
  });
  assert.equal(result.error, null);
  assert.equal(result.words, "One lakh Rupees");
});

test("rejects values above indian max", () => {
  const result = convertNumberToWords({
    input: "10000000000",
    system: "indian",
    currencySuffix: false,
    currency: "INR",
  });
  assert.match(result.error ?? "", /9,99,99,99,999/);
});
