import assert from "node:assert/strict";
import test from "node:test";
import { formatXmlUnchecked, minifyXml, processXml } from "./format";

const SAMPLE = '<?xml version="1.0"?><root><item id="1">Hello</item><item/></root>';

test("formats XML like WorkUtilities", () => {
  const formatted = formatXmlUnchecked(SAMPLE);
  assert.equal(
    formatted,
    '<?xml version="1.0"?>\r\n<root>\r\n  <item id="1">Hello</item>\r\n  <item/>\r\n</root>',
  );
});

test("minifies XML by collapsing whitespace between tags", () => {
  const pretty =
    '<?xml version="1.0"?>\r\n<root>\r\n  <item id="1">Hello</item>\r\n  <item/>\r\n</root>';
  assert.equal(minifyXml(pretty), SAMPLE);
});

test("processXml minify mode returns compact output", () => {
  const result = processXml(formatXmlUnchecked(SAMPLE), "minify");
  assert.equal(result.error, null);
  assert.equal(result.output, SAMPLE);
});

test("processXml returns empty output for blank input", () => {
  assert.deepEqual(processXml("   ", "format"), { output: "", error: null, isValid: false });
});

test("processXml format without DOMParser reports browser requirement", () => {
  const result = processXml("<root></root>", "format");
  assert.equal(result.output, "");
  assert.match(result.error ?? "", /browser environment/i);
});
