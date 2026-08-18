import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { looksLikeSvg, prettifySvg, previewDocument, stripUnsafeSvg } from "./svg";

describe("looksLikeSvg", () => {
  it("accepts an svg root", () => {
    assert.equal(looksLikeSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), true);
    assert.equal(looksLikeSvg("<div>nope</div>"), false);
  });
});

describe("stripUnsafeSvg", () => {
  it("removes script tags and event handlers", () => {
    const dirty = `<svg><script>alert(1)</script><circle onclick="alert(1)" r="4"/></svg>`;
    const clean = stripUnsafeSvg(dirty);
    assert.equal(clean.includes("<script"), false);
    assert.equal(clean.includes("onclick"), false);
  });

  it("removes style tags", () => {
    const dirty = `<svg><style>body{background:red}</style><circle r="4"/></svg>`;
    const clean = stripUnsafeSvg(dirty);
    assert.equal(/<style/i.test(clean), false);
  });

  it("strips javascript URLs", () => {
    const dirty = `<svg><a href="javascript:alert(1)">x</a></svg>`;
    const clean = stripUnsafeSvg(dirty);
    assert.equal(/javascript:/i.test(clean), false);
  });
});

describe("prettifySvg", () => {
  it("indents compact markup", () => {
    const result = prettifySvg('<svg><g><circle r="4"/></g></svg>');
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.match(result.value, /\n\s+<circle/);
  });

  it("rejects empty or non-svg input", () => {
    assert.equal(prettifySvg("").ok, false);
    assert.equal(prettifySvg("<div/>").ok, false);
  });
});

describe("previewDocument", () => {
  it("embeds sanitized markup and a background", () => {
    const html = previewDocument("<svg></svg>", "white");
    assert.match(html, /background:#ffffff/);
    assert.match(html, /<svg><\/svg>/);
  });
});
