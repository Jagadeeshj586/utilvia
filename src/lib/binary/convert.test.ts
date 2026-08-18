import assert from "node:assert/strict";
import test from "node:test";
import { convertNumberSystems } from "./convert";

test("converts decimal 255 to all bases", () => {
  const result = convertNumberSystems("255", "decimal");
  assert.equal(result.error, null);
  assert.equal(result.binary, "11111111");
  assert.equal(result.decimal, "255");
  assert.equal(result.hex, "FF");
  assert.equal(result.octal, "377");
});

test("converts binary input", () => {
  const result = convertNumberSystems("1010", "binary");
  assert.equal(result.error, null);
  assert.equal(result.decimal, "10");
});

test("converts hex input", () => {
  const result = convertNumberSystems("ff", "hex");
  assert.equal(result.error, null);
  assert.equal(result.decimal, "255");
});

test("validates invalid binary digits", () => {
  const result = convertNumberSystems("102", "binary");
  assert.match(result.error ?? "", /0 and 1/i);
});

test("validates invalid octal digits", () => {
  const result = convertNumberSystems("89", "octal");
  assert.match(result.error ?? "", /0–7/i);
});
