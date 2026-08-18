import assert from "node:assert/strict";
import test from "node:test";
import { calculateDiscount } from "./discount";

test("calculates percent off", () => {
  const result = calculateDiscount({
    mode: "percent-off",
    originalPrice: 1000,
    discountPercent: 20,
  });
  assert.equal(result.error, null);
  assert.equal(result.originalPrice, 1000);
  assert.equal(result.discountAmount, 200);
  assert.equal(result.finalPrice, 800);
  assert.equal(result.discountPercent, 20);
});

test("finds discount percent", () => {
  const result = calculateDiscount({
    mode: "find-percent",
    originalPrice: 1000,
    finalPrice: 800,
  });
  assert.equal(result.error, null);
  assert.equal(result.discountPercent, 20);
  assert.equal(result.discountAmount, 200);
});

test("finds original price", () => {
  const result = calculateDiscount({
    mode: "find-original",
    finalPrice: 800,
    discountPercent: 20,
  });
  assert.equal(result.error, null);
  assert.equal(result.originalPrice, 1000);
  assert.equal(result.discountAmount, 200);
});

test("rejects final price above original in find percent mode", () => {
  const result = calculateDiscount({
    mode: "find-percent",
    originalPrice: 800,
    finalPrice: 1000,
  });
  assert.match(result.error ?? "", /cannot be higher/i);
});
