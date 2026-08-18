import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_DRAFT,
  ROBOTS_PRESETS,
  cloneDraft,
  generateRobotsTxt,
  isValidSitemapUrl,
} from "./generate";

describe("presets", () => {
  it("includes allow-all, block-all, folders, and SEO default", () => {
    const ids = ROBOTS_PRESETS.map((item) => item.id);
    for (const id of ["seo", "allow-all", "block-all", "block-folders"]) {
      assert.ok(ids.includes(id), id);
    }
  });

  it("generates a valid SEO default", () => {
    const result = generateRobotsTxt(DEFAULT_DRAFT);
    assert.equal(result.status, "valid");
    assert.match(result.text, /User-agent: \*/);
    assert.match(result.text, /Allow: \//);
    assert.match(result.text, /Disallow: \/admin/);
    assert.match(result.text, /Disallow: \/search/);
    assert.match(result.text, /Sitemap: https:\/\/example.com\/sitemap.xml/);
  });
});

describe("generateRobotsTxt", () => {
  it("emits multiple groups and skips empty paths", () => {
    const result = generateRobotsTxt({
      groups: [
        {
          id: "a",
          userAgent: "*",
          crawlDelay: "",
          rules: [
            { id: "1", kind: "allow", path: "/" },
            { id: "2", kind: "disallow", path: "  " },
          ],
        },
        {
          id: "b",
          userAgent: "GPTBot",
          crawlDelay: "10",
          rules: [{ id: "3", kind: "disallow", path: "/" }],
        },
      ],
      sitemaps: ["https://example.com/sitemap.xml", ""],
    });
    assert.match(result.text, /User-agent: GPTBot/);
    assert.match(result.text, /Crawl-delay: 10/);
    assert.equal(result.text.includes("Disallow:   "), false);
    assert.ok(result.issues.some((issue) => issue.level === "info" && /ignored by Google/.test(issue.message)));
  });

  it("flags invalid sitemap, paths, and crawl-delay", () => {
    const result = generateRobotsTxt({
      groups: [
        {
          id: "a",
          userAgent: "",
          crawlDelay: "-1",
          rules: [
            { id: "1", kind: "allow", path: "admin" },
            { id: "2", kind: "disallow", path: "/admin" },
            { id: "3", kind: "allow", path: "/admin" },
          ],
        },
      ],
      sitemaps: ["example.com/sitemap.xml"],
    });
    assert.equal(result.status, "error");
    assert.ok(result.issues.some((issue) => /user-agent/i.test(issue.message)));
    assert.ok(result.issues.some((issue) => /Sitemap/.test(issue.message)));
    assert.ok(result.issues.some((issue) => /Crawl-delay/.test(issue.message)));
    assert.ok(result.issues.some((issue) => /both Allow and Disallow/.test(issue.message)));
    assert.ok(!result.text.includes("Sitemap: example.com"));
  });

  it("block-all preset disallows the root", () => {
    const preset = ROBOTS_PRESETS.find((item) => item.id === "block-all")!;
    const result = generateRobotsTxt(preset.draft);
    assert.match(result.text, /Disallow: \//);
    assert.equal(result.text.includes("Allow:"), false);
  });

  it("every preset generates without errors", () => {
    for (const preset of ROBOTS_PRESETS) {
      const result = generateRobotsTxt(preset.draft);
      assert.notEqual(result.status, "error", preset.id);
      assert.match(result.text, /User-agent:/);
    }
  });
});

describe("helpers", () => {
  it("validates sitemap URLs and clones drafts", () => {
    assert.equal(isValidSitemapUrl("https://example.com/sitemap.xml"), true);
    assert.equal(isValidSitemapUrl("example.com/sitemap.xml"), false);
    const copy = cloneDraft();
    copy.groups[0]!.userAgent = "Bingbot";
    assert.equal(DEFAULT_DRAFT.groups[0]!.userAgent, "*");
  });
});
