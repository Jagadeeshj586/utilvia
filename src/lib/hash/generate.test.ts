import assert from "node:assert/strict";
import test from "node:test";
import { hashText } from "./generate";

test("hashes known text values", async () => {
  const result = await hashText("hello");
  assert.equal(result.MD5, "5d41402abc4b2a76b9719d911017c592");
  assert.equal(result["SHA-256"], "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
});

test("returns empty hashes for empty input", async () => {
  const result = await hashText("");
  assert.equal(result.MD5, "");
  assert.equal(result["SHA-256"], "");
});
