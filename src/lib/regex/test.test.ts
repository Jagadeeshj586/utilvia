import assert from "node:assert/strict";
import test from "node:test";
import {
  buildHighlightSegments,
  flagsToString,
  sanitizeFlags,
  testRegex,
} from "./test";

test("email preset matches WorkUtilities pattern", () => {
  const result = testRegex(String.raw`[\w.-]+@[\w.-]+\.\w+`, "g", "Contact me@example.com today");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].text, "me@example.com");
  assert.equal(result.matches[0].index, 8);
});

test("global flag returns multiple matches", () => {
  const result = testRegex(String.raw`\d+`, "g", "a1 b22 c333");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(
    result.matches.map((match) => match.text),
    ["1", "22", "333"],
  );
});

test("without global flag returns only first match", () => {
  const result = testRegex(String.raw`\d+`, "i", "a1 b22");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].text, "1");
});

test("capture groups are returned", () => {
  const result = testRegex(String.raw`(\w+)@(\w+)\.(\w+)`, "g", "ada@example.com");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.matches[0].groups, ["ada", "example", "com"]);
});

test("invalid regex returns error", () => {
  const result = testRegex("(", "g", "text");
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /Invalid|Unterminated|Unmatched/i);
});

test("highlight segments wrap matches", () => {
  const result = testRegex("cat", "g", "a cat and a cat");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const segments = buildHighlightSegments("a cat and a cat", result.matches);
  assert.deepEqual(
    segments.map((segment) => ({ text: segment.text, matched: segment.matched })),
    [
      { text: "a ", matched: false },
      { text: "cat", matched: true },
      { text: " and a ", matched: false },
      { text: "cat", matched: true },
    ],
  );
});

test("sanitize flags keeps unique gims only", () => {
  assert.equal(flagsToString("giigmx"), "gim");
  assert.deepEqual(sanitizeFlags(["s", "g", "s"]), ["s", "g"]);
});

test("hex color preset works", () => {
  const result = testRegex(String.raw`#[0-9A-Fa-f]{6}`, "g", "Brand #cc785c");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.matches[0].text, "#cc785c");
});
