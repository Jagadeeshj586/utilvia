import assert from "node:assert/strict";
import test from "node:test";
import { convertUrl, URL_ENCODE_EXAMPLES } from "./encode";

test("encodes uri component", () => {
  const { output, error } = convertUrl("hello world", "encode", "component");
  assert.equal(error, null);
  assert.equal(output, "hello%20world");
});

test("encodes full uri", () => {
  const { output } = convertUrl("https://example.com/a b", "encode", "full");
  assert.equal(output, "https://example.com/a%20b");
});

test("decodes uri component", () => {
  const { output, error } = convertUrl("hello%20world", "decode", "component");
  assert.equal(error, null);
  assert.equal(output, "hello world");
});

test("handles invalid decode", () => {
  const { output, error } = convertUrl("%E0%A4%A", "decode", "component");
  assert.ok(error);
  assert.equal(output, "");
});

test("example mappings", () => {
  for (const example of URL_ENCODE_EXAMPLES) {
    const { output } = convertUrl(example.from, "encode", "component");
    assert.equal(output, example.to);
  }
});
