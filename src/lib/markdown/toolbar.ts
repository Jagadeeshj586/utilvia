export type MarkdownWrap =
  | "h1"
  | "h2"
  | "bold"
  | "italic"
  | "link"
  | "image"
  | "quote"
  | "code"
  | "codeblock"
  | "ul"
  | "ol"
  | "table";

const WRAP: Record<MarkdownWrap, { before: string; after: string; placeholder?: string; block?: boolean }> = {
  h1: { before: "# ", after: "", placeholder: "Heading 1", block: true },
  h2: { before: "## ", after: "", placeholder: "Heading 2", block: true },
  bold: { before: "**", after: "**", placeholder: "bold text" },
  italic: { before: "*", after: "*", placeholder: "italic text" },
  link: { before: "[", after: "](https://example.com)", placeholder: "link text" },
  image: { before: "![", after: "](https://example.com/image.jpg)", placeholder: "alt text" },
  quote: { before: "> ", after: "", placeholder: "Quote", block: true },
  code: { before: "`", after: "`", placeholder: "code" },
  codeblock: { before: "```\n", after: "\n```", placeholder: "code block", block: true },
  ul: { before: "- ", after: "", placeholder: "List item", block: true },
  ol: { before: "1. ", after: "", placeholder: "List item", block: true },
  table: {
    before: "| Column | Value |\n| --- | --- |\n| ",
    after: " | 100 |",
    placeholder: "Row",
    block: true,
  },
};

export function applyMarkdownWrap(value: string, start: number, end: number, type: MarkdownWrap) {
  const rule = WRAP[type];
  const selected = value.slice(start, end) || rule.placeholder || "";
  const wrapped = `${rule.before}${selected}${rule.after}`;
  const next = `${value.slice(0, start)}${wrapped}${value.slice(end)}`;
  const cursor = start + wrapped.length;
  return { next, cursor };
}

export function handleTabInTextarea(value: string, start: number, end: number) {
  const next = `${value.slice(0, start)}  ${value.slice(end)}`;
  return { next, cursor: start + 2 };
}
