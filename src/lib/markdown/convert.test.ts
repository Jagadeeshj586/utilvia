import assert from "node:assert/strict";
import test from "node:test";
import { convertMarkdown, EXAMPLE_MARKDOWN } from "./convert";
import { formatHtml, htmlForDownload } from "./html";
import { sanitizeHtml } from "./sanitize";
import { countWords, markdownStats } from "./statistics";

test("converts headings and emphasis", () => {
  const { html, error } = convertMarkdown("# Title\n\n**bold** and *italic*");
  assert.equal(error, null);
  assert.match(html, /<h1>Title<\/h1>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<em>italic<\/em>/);
});

test("converts fenced code and blockquotes", () => {
  const { html } = convertMarkdown("```js\nconsole.log(1);\n```\n\n> quote");
  assert.match(html, /<pre>/);
  assert.match(html, /<blockquote>/);
});

test("sanitizes malicious html", () => {
  const raw = '<script>alert("XSS")</script><img src=x onerror=alert(1)><p>Safe</p>';
  const safe = sanitizeHtml(raw);
  assert.doesNotMatch(safe.toLowerCase(), /<script/);
  assert.match(safe, /Safe/);
});

test("formats html with line breaks", () => {
  const formatted = formatHtml("<h1>Hello</h1><p>Text</p><ul><li>One</li></ul>");
  assert.match(formatted, /<h1>Hello<\/h1>\s*\n/);
});

test("builds full html document for download", () => {
  const doc = htmlForDownload("<p>Hello</p>", "document");
  assert.match(doc, /<!DOCTYPE html>/);
  assert.match(doc, /<p>Hello<\/p>/);
});

test("counts markdown statistics", () => {
  const stats = markdownStats(EXAMPLE_MARKDOWN);
  assert.ok(stats.characters > 0);
  assert.ok(stats.words > 0);
  assert.ok(stats.lines > 0);
  assert.equal(countWords(""), 0);
});
