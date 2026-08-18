import assert from "node:assert/strict";
import test from "node:test";
import { convertCsvToJson, detectDelimiter, parseCsv } from "./convert";

test("parses quoted commas", () => {
  const rows = parseCsv('name,city\n"Ada Lovelace","London, UK"', ",");
  assert.deepEqual(rows[1], ["Ada Lovelace", "London, UK"]);
});

test("detects semicolon delimiter", () => {
  assert.equal(detectDelimiter("a;b;c\n1;2;3"), ";");
});

test("converts with headers", () => {
  const result = convertCsvToJson("name,city\nAlice,Mumbai\nBob,Delhi", {
    delimiter: "auto",
    headerRow: true,
    trimWhitespace: true,
  });
  assert.equal(result.error, null);
  assert.equal(result.rowCount, 2);
  assert.equal(result.columnCount, 2);
  assert.deepEqual(result.rows[0], { name: "Alice", city: "Mumbai" });
});

test("supports no-header mode", () => {
  const result = convertCsvToJson("Alice,Mumbai\nBob,Delhi", {
    delimiter: ",",
    headerRow: false,
    trimWhitespace: true,
  });
  assert.equal(result.headers[0], "col_1");
  assert.equal(result.rows[0].col_1, "Alice");
});

test("trims whitespace when enabled", () => {
  const result = convertCsvToJson("name,city\n Alice , Mumbai ", {
    delimiter: ",",
    headerRow: true,
    trimWhitespace: true,
  });
  assert.deepEqual(result.rows[0], { name: "Alice", city: "Mumbai" });
});
