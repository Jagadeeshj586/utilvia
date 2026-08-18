import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addColumn,
  addRow,
  alignmentMarker,
  createTable,
  escapeCell,
  generateMarkdown,
  moveColumn,
  moveRow,
  parseMarkdownTable,
  removeColumn,
  removeRow,
  resizeTable,
  unescapeCell,
} from "./generate";

describe("markdown table cells", () => {
  it("escapes pipes, backslashes, and line breaks", () => {
    assert.equal(escapeCell("a|b"), "a\\|b");
    assert.equal(escapeCell("line\nbreak"), "line<br>break");
    assert.equal(unescapeCell("a\\|b"), "a|b");
    assert.equal(unescapeCell("line<br>break"), "line\nbreak");
  });

  it("writes GitHub alignment markers", () => {
    assert.equal(alignmentMarker("left"), ":---");
    assert.equal(alignmentMarker("center"), ":---:");
    assert.equal(alignmentMarker("right"), "---:");
  });
});

describe("generate and parse", () => {
  it("round-trips a header table with mixed alignment", () => {
    const markdown = generateMarkdown({
      includeHeader: true,
      headers: ["Name", "Score"],
      alignments: ["left", "right"],
      rows: [
        ["Ada", "98"],
        ["Grace", "100"],
      ],
    });
    assert.match(markdown, /^\| Name/);
    assert.match(markdown, /---:/);
    const parsed = parseMarkdownTable(markdown);
    assert.ok(parsed);
    assert.equal(parsed.includeHeader, true);
    assert.deepEqual(parsed.headers, ["Name", "Score"]);
    assert.deepEqual(parsed.alignments, ["left", "right"]);
    assert.deepEqual(parsed.rows[1], ["Grace", "100"]);
  });

  it("emits empty headers when the header row is off", () => {
    const markdown = generateMarkdown({
      includeHeader: false,
      headers: ["Hidden", "Nope"],
      alignments: ["center", "center"],
      rows: [["one", "two"]],
    });
    const lines = markdown.split("\n");
    assert.match(lines[0], /^\| +\| +\|$/);
    assert.match(lines[1], /:---:/);
    const parsed = parseMarkdownTable(markdown);
    assert.ok(parsed);
    assert.equal(parsed.includeHeader, false);
    assert.deepEqual(parsed.rows[0], ["one", "two"]);
  });

  it("keeps inline Markdown and escaped pipes", () => {
    const markdown = generateMarkdown({
      includeHeader: true,
      headers: ["Item"],
      alignments: ["left"],
      rows: [["**Bold** and a|b"]],
    });
    assert.match(markdown, /\*\*Bold\*\* and a\\\|b/);
    const parsed = parseMarkdownTable(markdown);
    assert.equal(parsed?.rows[0][0], "**Bold** and a|b");
  });
});

describe("grid edits", () => {
  it("resizes, then adds and removes rows and columns", () => {
    let table = createTable(2, 2);
    table = resizeTable(table, 4, 3);
    assert.equal(table.rows.length, 4);
    assert.equal(table.headers.length, 3);
    table = addRow(table);
    table = addColumn(table);
    assert.equal(table.rows.length, 5);
    assert.equal(table.headers.length, 4);
    table = removeRow(table, 0);
    table = removeColumn(table, 0);
    assert.equal(table.rows.length, 4);
    assert.equal(table.headers.length, 3);
  });

  it("reorders rows and columns", () => {
    const start = {
      includeHeader: true,
      headers: ["A", "B", "C"],
      alignments: ["left", "center", "right"] as const,
      rows: [
        ["1", "2", "3"],
        ["4", "5", "6"],
      ],
    };
    const rowsMoved = moveRow(start, 0, 1);
    assert.deepEqual(rowsMoved.rows[0], ["4", "5", "6"]);
    const colsMoved = moveColumn(start, 0, 2);
    assert.deepEqual(colsMoved.headers, ["B", "C", "A"]);
    assert.deepEqual(colsMoved.rows[0], ["2", "3", "1"]);
    assert.deepEqual(colsMoved.alignments, ["center", "right", "left"]);
  });
});
