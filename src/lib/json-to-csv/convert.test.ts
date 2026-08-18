import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  convertJsonToCsv,
  csvFileName,
  escapeCsvCell,
  flattenRecord,
  friendlyJsonError,
  indexToLineColumn,
  unwrapRows,
} from "./convert";

describe("flattenRecord", () => {
  it("flattens nested objects with dotted keys", () => {
    assert.deepEqual(flattenRecord({ location: { city: "London" }, score: 98 }), {
      "location.city": "London",
      score: "98",
    });
  });

  it("joins primitive arrays and stringifies object arrays", () => {
    assert.equal(flattenRecord({ tags: ["a", "b"] }).tags, "a; b");
    assert.equal(flattenRecord({ items: [{ id: 1 }] }).items, '[{"id":1}]');
  });

  it("turns null into an empty cell", () => {
    assert.equal(flattenRecord({ notes: null }).notes, "");
  });
});

describe("escapeCsvCell", () => {
  it("quotes commas, quotes, and newlines", () => {
    assert.equal(escapeCsvCell("Ada, A."), '"Ada, A."');
    assert.equal(escapeCsvCell('She said "hi"'), '"She said ""hi"""');
    assert.equal(escapeCsvCell("line\nbreak"), '"line\nbreak"');
    assert.equal(escapeCsvCell("plain"), "plain");
  });
});

describe("convertJsonToCsv", () => {
  it("converts an array of objects and unions headers", () => {
    const result = convertJsonToCsv(
      JSON.stringify([
        { name: "Ada", role: "Engineer" },
        { name: "Grace", active: false },
      ]),
    );
    assert.equal(result.error, null);
    assert.equal(result.rowCount, 2);
    assert.deepEqual(result.headers, ["name", "role", "active"]);
    assert.match(result.csv, /^name,role,active\nAda,Engineer,\nGrace,,false$/);
  });

  it("converts a single object into one row", () => {
    const result = convertJsonToCsv(JSON.stringify({ name: "Ada", score: 1 }));
    assert.equal(result.rowCount, 1);
    assert.equal(result.rows[0].name, "Ada");
  });

  it("unwraps a single array wrapper", () => {
    const wrapped = unwrapRows({ data: [{ id: 1 }, { id: 2 }] });
    assert.equal(wrapped.rows.length, 2);
    assert.match(wrapped.note ?? "", /data/);
  });

  it("handles booleans, numbers, null, and missing keys", () => {
    const result = convertJsonToCsv(
      JSON.stringify([
        { ok: true, n: 0, extra: "x" },
        { ok: false, n: null },
      ]),
    );
    assert.equal(result.rows[0].ok, "true");
    assert.equal(result.rows[0].n, "0");
    assert.equal(result.rows[1].n, "");
    assert.equal(result.rows[1].extra, "");
  });

  it("returns a friendly error for invalid JSON", () => {
    const result = convertJsonToCsv('{"name":');
    assert.ok(result.error);
    assert.match(result.error ?? "", /Invalid JSON|not valid JSON/i);
  });

  it("returns empty output for blank input", () => {
    const result = convertJsonToCsv("   ");
    assert.equal(result.csv, "");
    assert.equal(result.error, null);
  });
});

describe("helpers", () => {
  it("maps a parse position to line and column", () => {
    assert.deepEqual(indexToLineColumn("ab\ncd", 4), { line: 2, column: 2 });
  });

  it("adds a .csv extension to download names", () => {
    assert.equal(csvFileName("report"), "report.csv");
    assert.equal(csvFileName("report.csv"), "report.csv");
    assert.equal(csvFileName("a/b.csv"), "a-b.csv");
  });

  it("explains JSON errors with a line number when possible", () => {
    try {
      JSON.parse("{");
    } catch (error) {
      const message = friendlyJsonError(error, "{");
      assert.match(message, /JSON/i);
    }
  });
});
