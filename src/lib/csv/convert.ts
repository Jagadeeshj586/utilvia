export type CsvDelimiter = "auto" | "," | ";" | "\t" | "|";

export type CsvToJsonOptions = {
  delimiter: CsvDelimiter;
  headerRow: boolean;
  trimWhitespace: boolean;
};

export type CsvToJsonResult = {
  json: string;
  rows: Record<string, string>[];
  headers: string[];
  rowCount: number;
  columnCount: number;
  detectedDelimiter: Exclude<CsvDelimiter, "auto">;
  error: string | null;
};

export const DEFAULT_CSV_INPUT = `name,email,city
Alice,alice@example.com,Mumbai
Bob,bob@example.com,Delhi
Carol,carol@example.com,Bangalore`;

export const DELIMITER_OPTIONS: Array<{ id: CsvDelimiter; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: ",", label: "," },
  { id: ";", label: ";" },
  { id: "\t", label: "Tab" },
  { id: "|", label: "|" },
];

function countUnquoted(text: string, delimiter: string) {
  let count = 0;
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (!quoted && char === delimiter) count += 1;
  }
  return count;
}

export function detectDelimiter(text: string): Exclude<CsvDelimiter, "auto"> {
  const sample = text.split(/\r?\n/).slice(0, 10).join("\n");
  const candidates: Array<Exclude<CsvDelimiter, "auto">> = [",", ";", "\t", "|"];
  let best: Exclude<CsvDelimiter, "auto"> = ",";
  let bestScore = -1;
  for (const delimiter of candidates) {
    const score = countUnquoted(sample, delimiter);
    if (score > bestScore) {
      best = delimiter;
      bestScore = score;
    }
  }
  return best;
}

export function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((item) => item.length > 0) || rows.length === 0) rows.push(row);
  return rows.filter((item) => item.some((value) => value.trim().length > 0));
}

function uniqueHeaders(rawHeaders: string[], trimWhitespace: boolean) {
  const seen = new Map<string, number>();
  return rawHeaders.map((header, index) => {
    let name = trimWhitespace ? header.trim() : header;
    if (!name) name = `col_${index + 1}`;
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    return count === 0 ? name : `${name}_${count + 1}`;
  });
}

export function convertCsvToJson(text: string, options: CsvToJsonOptions): CsvToJsonResult {
  const empty: CsvToJsonResult = {
    json: "",
    rows: [],
    headers: [],
    rowCount: 0,
    columnCount: 0,
    detectedDelimiter: ",",
    error: null,
  };

  const trimmedInput = text.trim();
  if (!trimmedInput) return empty;

  try {
    const detectedDelimiter = options.delimiter === "auto" ? detectDelimiter(text) : options.delimiter;
    const matrix = parseCsv(text, detectedDelimiter);
    if (!matrix.length) return { ...empty, detectedDelimiter, error: "CSV is empty." };

    const columnCount = Math.max(...matrix.map((row) => row.length));
    const normalizeCell = (value: string | undefined) => {
      const next = value ?? "";
      return options.trimWhitespace ? next.trim() : next;
    };

    let headers: string[];
    let body: string[][];

    if (options.headerRow) {
      const rawHeaders = Array.from({ length: columnCount }, (_, index) => matrix[0]?.[index] ?? "");
      headers = uniqueHeaders(rawHeaders, options.trimWhitespace);
      body = matrix.slice(1);
    } else {
      headers = Array.from({ length: columnCount }, (_, index) => `col_${index + 1}`);
      body = matrix;
    }

    const rows = body.map((row) => {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = normalizeCell(row[index]);
      });
      return record;
    });

    return {
      json: JSON.stringify(rows, null, 2),
      rows,
      headers,
      rowCount: rows.length,
      columnCount,
      detectedDelimiter,
      error: null,
    };
  } catch (error) {
    return {
      ...empty,
      error: error instanceof Error ? error.message : "Could not parse CSV.",
    };
  }
}

export const CSV_TO_JSON_FAQS = [
  {
    question: "How to convert CSV to JSON online?",
    answer: "Paste CSV text or upload a .csv file. JSON output updates instantly and can be copied with one click.",
  },
  {
    question: "Does it handle quoted commas?",
    answer: 'Yes. Fields wrapped in double quotes can contain commas, and escaped quotes ("") are supported.',
  },
  {
    question: "Can I change the delimiter?",
    answer: "Yes. Choose Auto, comma, semicolon, tab, or pipe. Auto detects the most likely delimiter from your data.",
  },
  {
    question: "Is my CSV data uploaded to a server?",
    answer: "No. Conversion runs entirely in your browser. Your CSV never leaves your device.",
  },
  {
    question: "Is CSV to JSON conversion free?",
    answer: "Yes. This converter is free to use with no signup required.",
  },
] as const;
