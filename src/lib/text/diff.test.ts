import assert from "node:assert/strict";
import test from "node:test";
import { compareTexts, diffLines } from "./diff";

test("detects unchanged lines", () => {
  const lines = diffLines("alpha\nbeta", "alpha\nbeta");
  assert.deepEqual(lines, [
    { type: "same", text: "alpha" },
    { type: "same", text: "beta" },
  ]);
});

test("detects added and removed lines", () => {
  const result = compareTexts("Hello World\nLine two\nLine three", "Hello World\nLine 2 changed\nLine three\nLine four");
  assert.equal(result.stats.unchanged, 2);
  assert.equal(result.stats.removed, 1);
  assert.equal(result.stats.added, 2);
});

test("builds aligned split rows", () => {
  const result = compareTexts("keep\nold", "keep\nnew");
  assert.equal(result.splitRows.length, 3);
  assert.equal(result.splitRows[0].left.text, "keep");
  assert.equal(result.splitRows[0].right.text, "keep");
  assert.ok(result.splitRows.some((row) => row.left.type === "remove" && row.left.text === "old"));
  assert.ok(result.splitRows.some((row) => row.right.type === "add" && row.right.text === "new"));
});
