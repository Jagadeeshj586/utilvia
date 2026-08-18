export type ColumnAlign = "left" | "center" | "right";

export const MD_TABLE_LIMITS = {
  minRows: 1,
  maxRows: 50,
  minCols: 1,
  maxCols: 20,
} as const;

export type MarkdownTableState = {
  headers: string[];
  rows: string[][];
  alignments: ColumnAlign[];
  includeHeader: boolean;
};

export type MarkdownTableTemplate = {
  id: string;
  label: string;
  hint: string;
  state: MarkdownTableState;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value) || min));
}

function blankRow(cols: number) {
  return Array.from({ length: cols }, () => "");
}

export function createTable(rows = 3, cols = 3): MarkdownTableState {
  const columnCount = clamp(cols, MD_TABLE_LIMITS.minCols, MD_TABLE_LIMITS.maxCols);
  const rowCount = clamp(rows, MD_TABLE_LIMITS.minRows, MD_TABLE_LIMITS.maxRows);
  return {
    headers: Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`),
    rows: Array.from({ length: rowCount }, () => blankRow(columnCount)),
    alignments: Array.from({ length: columnCount }, () => "left" as ColumnAlign),
    includeHeader: true,
  };
}

export function cloneTable(state: MarkdownTableState): MarkdownTableState {
  return {
    headers: [...state.headers],
    rows: state.rows.map((row) => [...row]),
    alignments: [...state.alignments],
    includeHeader: state.includeHeader,
  };
}

export function resizeTable(state: MarkdownTableState, rows: number, cols: number): MarkdownTableState {
  const columnCount = clamp(cols, MD_TABLE_LIMITS.minCols, MD_TABLE_LIMITS.maxCols);
  const rowCount = clamp(rows, MD_TABLE_LIMITS.minRows, MD_TABLE_LIMITS.maxRows);
  const next = cloneTable(state);
  next.headers = Array.from({ length: columnCount }, (_, index) => next.headers[index] ?? `Column ${index + 1}`);
  next.alignments = Array.from({ length: columnCount }, (_, index) => next.alignments[index] ?? "left");
  next.rows = Array.from({ length: rowCount }, (_, rowIndex) =>
    Array.from({ length: columnCount }, (_, colIndex) => next.rows[rowIndex]?.[colIndex] ?? ""),
  );
  return next;
}

export function escapeCell(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r\n|\n|\r/g, "<br>");
}

export function unescapeCell(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\\\|/g, "|")
    .replace(/\\\\/g, "\\");
}

export function alignmentMarker(align: ColumnAlign) {
  if (align === "center") return ":---:";
  if (align === "right") return "---:";
  return ":---";
}

export function parseAlignment(token: string): ColumnAlign {
  const trimmed = token.trim();
  const left = trimmed.startsWith(":");
  const right = trimmed.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  return "left";
}

function padCells(rows: string[][]) {
  const widths = rows[0]?.map((_, col) => Math.max(...rows.map((row) => (row[col] ?? "").length))) ?? [];
  return rows.map((row) => row.map((cell, col) => (cell ?? "").padEnd(widths[col] ?? 0)));
}

export function generateMarkdown(state: MarkdownTableState) {
  const cols = Math.max(state.headers.length, ...state.rows.map((row) => row.length), 1);
  const headers = Array.from({ length: cols }, (_, index) =>
    state.includeHeader ? escapeCell(state.headers[index] ?? "") : "",
  );
  const body = state.rows.map((row) => Array.from({ length: cols }, (_, index) => escapeCell(row[index] ?? "")));
  const alignments = Array.from({ length: cols }, (_, index) => alignmentMarker(state.alignments[index] ?? "left"));
  const padded = padCells([headers, alignments, ...body]);
  return padded.map((row) => `| ${row.join(" | ")} |`).join("\n");
}

export function splitMarkdownRow(line: string) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let current = "";
  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    const next = trimmed[index + 1];
    if (char === "\\" && next === "|") {
      current += "\\|";
      index += 1;
      continue;
    }
    if (char === "|") {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

export function parseMarkdownTable(markdown: string): MarkdownTableState | null {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"));
  if (lines.length < 2) return null;
  const headerCells = splitMarkdownRow(lines[0]);
  const dividerCells = splitMarkdownRow(lines[1]);
  if (!dividerCells.length || !dividerCells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, "")))) {
    return null;
  }
  const cols = Math.max(headerCells.length, dividerCells.length, MD_TABLE_LIMITS.minCols);
  if (cols > MD_TABLE_LIMITS.maxCols) return null;
  const alignments = Array.from({ length: cols }, (_, index) => parseAlignment(dividerCells[index] ?? "---"));
  const headers = Array.from({ length: cols }, (_, index) => unescapeCell(headerCells[index] ?? ""));
  const rows = lines.slice(2).map((line) => {
    const cells = splitMarkdownRow(line);
    return Array.from({ length: cols }, (_, index) => unescapeCell(cells[index] ?? ""));
  });
  const body = rows.length ? rows.slice(0, MD_TABLE_LIMITS.maxRows) : [blankRow(cols)];
  return {
    headers,
    rows: body,
    alignments,
    includeHeader: headers.some((cell) => cell.length > 0),
  };
}

export function moveRow(state: MarkdownTableState, from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= state.rows.length || to >= state.rows.length) return state;
  const next = cloneTable(state);
  const [row] = next.rows.splice(from, 1);
  next.rows.splice(to, 0, row);
  return next;
}

export function moveColumn(state: MarkdownTableState, from: number, to: number) {
  const cols = state.headers.length;
  if (from === to || from < 0 || to < 0 || from >= cols || to >= cols) return state;
  const next = cloneTable(state);
  const move = <T,>(list: T[]) => {
    const copy = [...list];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  };
  next.headers = move(next.headers);
  next.alignments = move(next.alignments);
  next.rows = next.rows.map((row) => move(row));
  return next;
}

export function addRow(state: MarkdownTableState, at = state.rows.length) {
  if (state.rows.length >= MD_TABLE_LIMITS.maxRows) return state;
  const next = cloneTable(state);
  next.rows.splice(clamp(at, 0, next.rows.length), 0, blankRow(next.headers.length));
  return next;
}

export function removeRow(state: MarkdownTableState, index: number) {
  if (state.rows.length <= MD_TABLE_LIMITS.minRows) return state;
  const next = cloneTable(state);
  next.rows.splice(index, 1);
  return next;
}

export function addColumn(state: MarkdownTableState, at = state.headers.length) {
  if (state.headers.length >= MD_TABLE_LIMITS.maxCols) return state;
  const next = cloneTable(state);
  const index = clamp(at, 0, next.headers.length);
  next.headers.splice(index, 0, `Column ${next.headers.length + 1}`);
  next.alignments.splice(index, 0, "left");
  next.rows = next.rows.map((row) => {
    const copy = [...row];
    copy.splice(index, 0, "");
    return copy;
  });
  return next;
}

export function removeColumn(state: MarkdownTableState, index: number) {
  if (state.headers.length <= MD_TABLE_LIMITS.minCols) return state;
  const next = cloneTable(state);
  next.headers.splice(index, 1);
  next.alignments.splice(index, 1);
  next.rows = next.rows.map((row) => row.filter((_, col) => col !== index));
  return next;
}

export const MD_TABLE_TEMPLATES: MarkdownTableTemplate[] = [
  {
    id: "team",
    label: "Team",
    hint: "Name, role, city",
    state: {
      includeHeader: true,
      headers: ["Name", "Role", "City"],
      alignments: ["left", "left", "left"],
      rows: [
        ["Ada Lovelace", "Engineer", "London"],
        ["Grace Hopper", "Scientist", "New York"],
        ["Alan Turing", "Mathematician", "Manchester"],
      ],
    },
  },
  {
    id: "compare",
    label: "Compare",
    hint: "Feature matrix",
    state: {
      includeHeader: true,
      headers: ["Feature", "Free", "Pro"],
      alignments: ["left", "center", "center"],
      rows: [
        ["Projects", "3", "Unlimited"],
        ["**Priority support**", "—", "Yes"],
        ["Export", "`CSV`", "`CSV` + PDF"],
      ],
    },
  },
  {
    id: "schedule",
    label: "Schedule",
    hint: "Day, time, topic",
    state: {
      includeHeader: true,
      headers: ["Day", "Time", "Topic"],
      alignments: ["left", "right", "left"],
      rows: [
        ["Monday", "09:00", "Planning"],
        ["Wednesday", "14:30", "Review"],
        ["Friday", "16:00", "Demo"],
      ],
    },
  },
  {
    id: "blank",
    label: "Blank 3×3",
    hint: "Empty grid",
    state: createTable(3, 3),
  },
];

export const MD_TABLE_DEFAULT = cloneTable(MD_TABLE_TEMPLATES[0].state);

export const MD_TABLE_FAQS = [
  {
    question: "How do I create a Markdown table?",
    answer:
      "Pick a template or set the number of rows and columns, then type in the spreadsheet. The Markdown updates as you type. Copy it into GitHub, Notion, or any Markdown file.",
  },
  {
    question: "Can I align columns left, center, or right?",
    answer:
      "Yes. Use the alignment buttons on each column. That writes :---, :---:, or ---: in the separator row, which GitHub-flavored Markdown understands.",
  },
  {
    question: "What happens to pipes and line breaks in a cell?",
    answer:
      "Pipes are escaped as \\| so they do not split columns. Line breaks become <br> so they render inside the cell. Bold, italic, code, and links are left as Markdown.",
  },
  {
    question: "Is a header row required?",
    answer:
      "GitHub-flavored Markdown still needs a header line, but you can turn the header off. The generator then emits empty header cells and treats every spreadsheet row as data.",
  },
  {
    question: "Does my table leave the browser?",
    answer: "No. Editing, preview, copy, and download all run on your device. Close the tab to clear the grid.",
  },
] as const;
