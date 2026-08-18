export type SqlToolMode = "format" | "minify";

export type SqlToken = {
  type: "string" | "word" | "other";
  value: string;
};

export const SQL_KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "INNER",
  "LEFT",
  "RIGHT",
  "FULL",
  "OUTER",
  "CROSS",
  "ON",
  "AND",
  "OR",
  "NOT",
  "IN",
  "IS",
  "NULL",
  "AS",
  "ORDER",
  "BY",
  "GROUP",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "CREATE",
  "TABLE",
  "ALTER",
  "DROP",
  "INDEX",
  "VIEW",
  "UNION",
  "ALL",
  "DISTINCT",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "BETWEEN",
  "LIKE",
  "EXISTS",
  "PRIMARY",
  "KEY",
  "FOREIGN",
  "REFERENCES",
  "DEFAULT",
  "ASC",
  "DESC",
  "WITH",
  "OVER",
  "PARTITION",
  "CAST",
  "COUNT",
  "SUM",
  "AVG",
]);

export const SQL_BREAK_KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "INNER",
  "LEFT",
  "RIGHT",
  "FULL",
  "CROSS",
  "GROUP",
  "HAVING",
  "ORDER",
  "LIMIT",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "CREATE",
  "ALTER",
  "DROP",
  "UNION",
  "WITH",
]);

export const SQL_FAQS = [
  {
    question: "Does this validate SQL syntax?",
    answer:
      "No. This is a formatting pass only. It beautifies or minifies your query; it does not check whether the SQL will run on a specific database.",
  },
  {
    question: "Will formatting change execution?",
    answer:
      "Formatting should not change query meaning. Whitespace and keyword capitalization are adjusted for readability. Always review output before running it in production.",
  },
  {
    question: "Does it work for MySQL and PostgreSQL?",
    answer:
      "Yes for common statement types such as SELECT, INSERT, UPDATE, DELETE, and CREATE TABLE. Dialect-specific syntax may not get perfect indentation.",
  },
  {
    question: "Can I minify SQL?",
    answer: "Yes. Switch to minify mode to collapse the query toward a single compact line for logs or constrained paste areas.",
  },
  {
    question: "Is SQL formatter free?",
    answer: "Yes. The Utilvia SQL Formatter is free with no signup required. Queries stay in your browser.",
  },
] as const;

export function tokenizeSql(input: string): SqlToken[] {
  const tokens: SqlToken[] = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index];

    if (char === "'" || char === '"') {
      const quote = char;
      let value = quote;
      index += 1;
      while (index < input.length) {
        value += input[index];
        if (input[index] === quote && input[index - 1] !== "\\") {
          index += 1;
          break;
        }
        index += 1;
      }
      tokens.push({ type: "string", value });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let value = char;
      index += 1;
      while (index < input.length && /[a-zA-Z0-9_]/.test(input[index])) {
        value += input[index];
        index += 1;
      }
      tokens.push({ type: "word", value });
      continue;
    }

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    let value = char;
    index += 1;
    while (index < input.length && !/[a-zA-Z_'" \t\n\r]/.test(input[index])) {
      value += input[index];
      index += 1;
    }
    tokens.push({ type: "other", value });
  }

  return tokens;
}

export function formatSql(sql: string): string {
  const tokens = tokenizeSql(sql.trim());
  if (tokens.length === 0) return "";

  const lines: string[] = [];
  let current = "";
  let indent = 0;

  const flush = () => {
    if (current.trim()) {
      lines.push(`${"  ".repeat(indent)}${current.trim()}`);
    }
    current = "";
  };

  for (const token of tokens) {
    const value = token.type === "word" ? token.value.toUpperCase() : token.value;

    if (token.type === "word" && SQL_KEYWORDS.has(value)) {
      if (SQL_BREAK_KEYWORDS.has(value)) {
        flush();
        if (value === "AND" || value === "OR") {
          current = `${value} `;
        } else if (value === "ON" || value === "SET" || value === "VALUES") {
          current = `${value} `;
        } else {
          lines.push(`${"  ".repeat(Math.max(indent, 0))}${value}`);
          if (value === "WHERE" || value === "HAVING") {
            indent = 1;
          } else if (value === "SELECT") {
            indent = 0;
          }
        }
      } else if (value === "AND" || value === "OR") {
        flush();
        indent = 1;
        current = `${value} `;
      } else {
        current += `${value} `;
      }
    } else {
      current += token.value + (token.type === "other" && token.value === "," ? "" : " ");
    }
  }

  flush();
  return lines.join("\n").replace(/ +\n/g, "\n").trim();
}

export function minifySql(sql: string): string {
  return tokenizeSql(sql.trim())
    .map((token) => token.value)
    .join(" ")
    .replace(/\s+([,();=])/g, "$1")
    .replace(/([(,;=])\s+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function processSql(input: string, mode: SqlToolMode): string {
  if (!input.trim()) return "";
  return mode === "format" ? formatSql(input) : minifySql(input);
}
