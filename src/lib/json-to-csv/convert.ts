export const DEFAULT_JSON_INPUT = `[
  {
    "name": "Ada Lovelace",
    "role": "Engineer",
    "active": true,
    "score": 98,
    "location": { "city": "London" },
    "notes": null
  },
  {
    "name": "Grace Hopper",
    "role": "Scientist",
    "active": false,
    "score": 100,
    "location": { "city": "New York" },
    "tags": ["compiler", "navy"]
  }
]`;

export const MAX_JSON_CHARS = 5_000_000;
export const MAX_ROWS = 50_000;
export const MAX_FLATTEN_DEPTH = 6;

export type JsonToCsvResult = {
  csv: string;
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  columnCount: number;
  error: string | null;
  note: string | null;
};

export const JSON_TO_CSV_FAQS = [
  {
    question: "How do I convert JSON to CSV?",
    answer:
      "Paste JSON or drop a .json file. Arrays of objects become rows. Nested fields flatten into dotted column names, and CSV updates as you type.",
  },
  {
    question: "How are nested objects and arrays handled?",
    answer:
      'Nested objects become columns like location.city. Arrays of primitives are joined with "; ". Arrays of objects stay as a JSON string in one cell so the table does not explode into extra columns.',
  },
  {
    question: "What JSON shapes are supported?",
    answer:
      'An array of objects, a single object, an array of values, or a wrapper such as { "data": [ ... ] } with one array. Missing keys become empty cells.',
  },
  {
    question: "Is my JSON uploaded to a server?",
    answer: "No. Parsing and conversion run entirely in your browser. Your data never leaves your device.",
  },
  {
    question: "Is the JSON to CSV converter free?",
    answer: "Yes. It is free to use with no signup required.",
  },
] as const;

const emptyResult = (): JsonToCsvResult => ({
  csv: "",
  headers: [],
  rows: [],
  rowCount: 0,
  columnCount: 0,
  error: null,
  note: null,
});

export function indexToLineColumn(text: string, index: number) {
  const safe = Math.max(0, Math.min(index, text.length));
  const slice = text.slice(0, safe);
  const lines = slice.split("\n");
  return { line: lines.length, column: (lines[lines.length - 1]?.length ?? 0) + 1 };
}

export function friendlyJsonError(error: unknown, source: string) {
  const message = error instanceof Error ? error.message : "Invalid JSON.";
  const match = /position\s+(\d+)/i.exec(message);
  if (!match) return `This is not valid JSON. ${message}`;
  const { line, column } = indexToLineColumn(source, Number(match[1]));
  return `Invalid JSON at line ${line}, column ${column}. Check for a missing comma, extra comma, or unquoted key.`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isPrimitive(value: unknown) {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

export function escapeCsvCell(value: string) {
  if (/[",\n\r]/.test(value) || /^\s|\s$/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function primitiveToString(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export function flattenRecord(value: unknown, prefix = "", depth = 0, out: Record<string, string> = {}) {
  if (depth > MAX_FLATTEN_DEPTH) {
    if (prefix) out[prefix] = primitiveToString(value);
    return out;
  }

  if (value === null || value === undefined) {
    if (prefix) out[prefix] = "";
    return out;
  }

  if (Array.isArray(value)) {
    if (!prefix) {
      out.value = value.every(isPrimitive) ? value.map(primitiveToString).join("; ") : JSON.stringify(value);
      return out;
    }
    out[prefix] = value.length === 0 ? "" : value.every(isPrimitive) ? value.map(primitiveToString).join("; ") : JSON.stringify(value);
    return out;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      if (prefix) out[prefix] = "";
      return out;
    }
    for (const [key, child] of entries) {
      const next = prefix ? `${prefix}.${key}` : key;
      flattenRecord(child, next, depth + 1, out);
    }
    return out;
  }

  if (prefix) out[prefix] = primitiveToString(value);
  else out.value = primitiveToString(value);
  return out;
}

export function unwrapRows(data: unknown): { rows: unknown[]; note: string | null } {
  if (Array.isArray(data)) return { rows: data, note: null };
  if (isPlainObject(data)) {
    const keys = Object.keys(data);
    if (keys.length === 1) {
      const only = data[keys[0]];
      if (Array.isArray(only)) {
        return { rows: only, note: `Using the "${keys[0]}" array.` };
      }
    }
    return { rows: [data], note: null };
  }
  return { rows: [data], note: null };
}

export function csvFileName(raw: string) {
  const trimmed = raw.trim() || "data";
  const withoutExt = trimmed.replace(/\.csv$/i, "");
  const safe = withoutExt.replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, " ").trim() || "data";
  return `${safe}.csv`;
}

export function suggestedCsvName(jsonFileName: string) {
  const base = jsonFileName.replace(/\.[^.]+$/, "") || "data";
  return csvFileName(base);
}

export function convertJsonToCsv(text: string): JsonToCsvResult {
  const empty = emptyResult();
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  if (!trimmed) return empty;
  if (trimmed.length > MAX_JSON_CHARS) {
    return { ...empty, error: "This JSON is too large to convert in the browser (limit 5 MB)." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch (error) {
    return { ...empty, error: friendlyJsonError(error, trimmed) };
  }

  const { rows: items, note } = unwrapRows(parsed);
  if (!items.length) {
    return { ...empty, error: "JSON parsed, but there are no rows to convert.", note };
  }

  const truncated = items.length > MAX_ROWS;
  const slice = truncated ? items.slice(0, MAX_ROWS) : items;
  const records = slice.map((item) => flattenRecord(item));
  const headerSet: string[] = [];
  const seen = new Set<string>();
  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!seen.has(key)) {
        seen.add(key);
        headerSet.push(key);
      }
    }
  }

  if (!headerSet.length) {
    return { ...empty, error: "Could not find any fields to turn into CSV columns.", note };
  }

  for (const record of records) {
    for (const header of headerSet) {
      if (record[header] == null) record[header] = "";
    }
  }

  const lines = [
    headerSet.map(escapeCsvCell).join(","),
    ...records.map((record) => headerSet.map((header) => escapeCsvCell(record[header] ?? "")).join(",")),
  ];

  return {
    csv: lines.join("\n"),
    headers: headerSet,
    rows: records,
    rowCount: records.length,
    columnCount: headerSet.length,
    error: null,
    note: truncated
      ? `${note ? `${note} ` : ""}Converted the first ${MAX_ROWS.toLocaleString("en-US")} of ${items.length.toLocaleString("en-US")} rows.`
      : note,
  };
}
