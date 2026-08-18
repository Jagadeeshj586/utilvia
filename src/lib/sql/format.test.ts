import assert from "node:assert/strict";
import test from "node:test";
import { formatSql, minifySql, processSql } from "./format";

const SAMPLE = "SELECT id, name FROM users WHERE active = 1 AND role = 'admin' ORDER BY created_at DESC;";

test("formats SQL like WorkUtilities", () => {
  assert.equal(
    formatSql(SAMPLE),
    [
      "SELECT",
      "id ,name",
      "FROM",
      "users",
      "WHERE",
      "  active = 1",
      "  AND role = 'admin'",
      "  ORDER",
      "  BY created_at DESC ;",
    ].join("\n"),
  );
});

test("minifies formatted SQL", () => {
  assert.equal(
    minifySql(formatSql(SAMPLE)),
    "SELECT id,name FROM users WHERE active=1 AND role='admin' ORDER BY created_at DESC;",
  );
});

test("preserves string literals", () => {
  const result = formatSql("SELECT 'hello world' FROM dual");
  assert.match(result, /'hello world'/);
});

test("processSql returns empty for blank input", () => {
  assert.equal(processSql("   ", "format"), "");
  assert.equal(processSql("   ", "minify"), "");
});

test("processSql switches by mode", () => {
  assert.equal(processSql(SAMPLE, "format"), formatSql(SAMPLE));
  assert.equal(processSql(SAMPLE, "minify"), minifySql(SAMPLE));
});
