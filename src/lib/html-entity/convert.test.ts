import assert from "node:assert/strict";
import test from "node:test";
import { convertHtmlEntities, decodeHtmlEntities, encodeHtmlEntities } from "./convert";

test("encode matches WorkUtilities sample", () => {
  const input = `<div class="x">It's "ok" & fine © ® €`;
  const encoded = encodeHtmlEntities(input);
  assert.equal(
    encoded,
    "&lt;div class=&quot;x&quot;&gt;It&#39;s &quot;ok&quot; &amp; fine &copy; &reg; &euro;",
  );
});

test("decode reverses WorkUtilities sample", () => {
  const encoded = "&lt;div class=&quot;x&quot;&gt;It&#39;s &quot;ok&quot; &amp; fine &copy; &reg; &euro;";
  assert.equal(decodeHtmlEntities(encoded), `<div class="x">It's "ok" & fine © ® €`);
});

test("ampersand is encoded before other characters", () => {
  assert.equal(encodeHtmlEntities("&<>"), "&amp;&lt;&gt;");
});

test("decode supports numeric and hex entities", () => {
  assert.equal(decodeHtmlEntities("&#39;&#x27;&apos;"), "'''");
});

test("convertHtmlEntities respects mode", () => {
  assert.equal(convertHtmlEntities("<a>", "encode"), "&lt;a&gt;");
  assert.equal(convertHtmlEntities("&lt;a&gt;", "decode"), "<a>");
});

test("unknown named entities are left unchanged", () => {
  assert.equal(decodeHtmlEntities("&unknown;"), "&unknown;");
});
