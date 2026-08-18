import assert from "node:assert/strict";
import test from "node:test";
import {
  formatListCsv,
  formatListOutput,
  generateNumberList,
  generateSingleNumber,
  normalizeRange,
  rollDice,
} from "./generate";

test("normalizes reversed ranges", () => {
  assert.deepEqual(normalizeRange(100, 1), { min: 1, max: 100 });
});

test("generates a single number within bounds", () => {
  for (let i = 0; i < 50; i += 1) {
    const result = generateSingleNumber({ min: 1, max: 10 });
    assert.equal(result.error, null);
    assert.ok(result.value >= 1 && result.value <= 10);
  }
});

test("generates unique lists without duplicates", () => {
  const result = generateNumberList({ min: 1, max: 10, count: 10, unique: true });
  assert.equal(result.error, null);
  assert.equal(result.values.length, 10);
  assert.equal(new Set(result.values).size, 10);
});

test("rejects impossible unique list sizes", () => {
  const result = generateNumberList({ min: 1, max: 5, count: 10, unique: true });
  assert.match(result.error ?? "", /unique/i);
  assert.equal(result.values.length, 0);
});

test("rolls dice within die bounds", () => {
  const result = rollDice({ sides: 6, count: 3 });
  assert.equal(result.error, null);
  assert.equal(result.values.length, 3);
  assert.ok(result.values.every((value) => value >= 1 && value <= 6));
  assert.equal(result.total, result.values.reduce((sum, value) => sum + value, 0));
});

test("formats list output", () => {
  assert.equal(formatListOutput([1, 2, 3]), "1\n2\n3");
  assert.equal(formatListCsv([1, 2, 3]), "1, 2, 3");
});
