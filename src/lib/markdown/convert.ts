import { marked } from "marked";
import { formatHtml, minifyHtml } from "./html";
import { sanitizeHtml } from "./sanitize";

export const MAX_MARKDOWN_BYTES = 5 * 1024 * 1024;

export const DEFAULT_MARKDOWN = `# Welcome to Markdown to HTML

Convert your **Markdown** text to HTML instantly.

## Features

- Real-time preview
- Copy HTML with one click
- Supports all standard Markdown syntax

## Example Code

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

> This is a blockquote example.

[Visit Utilvia](/tools)
`;

export const EXAMPLE_MARKDOWN = `# Hello World

Welcome to the Markdown to HTML converter.

## Features

- Fast conversion
- Live preview
- HTML export
- GitHub-Flavored Markdown

**Start writing now!**
`;

export const EDITOR_PLACEHOLDER = `# Start writing Markdown

Type or paste your Markdown here...

## Example

This is **bold**, *italic*, and \`inline code\`.

- Item one
- Item two
- Item three
`;

export const MARKDOWN_EXTENSIONS = [".md", ".markdown", ".mdown", ".mkd"];

marked.setOptions({
  gfm: true,
  breaks: false,
});

export function convertMarkdown(input: string, formatted = true): { html: string; error: string | null } {
  if (!input.trim()) {
    return { html: "", error: null };
  }
  if (new Blob([input]).size > MAX_MARKDOWN_BYTES) {
    return {
      html: "",
      error: "This document is too large to process safely in the browser.",
    };
  }
  try {
    const raw = marked.parse(input) as string;
    const safe = sanitizeHtml(raw);
    const html = formatted ? formatHtml(safe) : minifyHtml(safe);
    return { html, error: null };
  } catch {
    return {
      html: "",
      error: "Unable to process this content. Please check your Markdown and try again.",
    };
  }
}

export function isMarkdownFile(file: File) {
  const lower = file.name.toLowerCase();
  return MARKDOWN_EXTENSIONS.some((ext) => lower.endsWith(ext)) || file.type.startsWith("text/");
}

export const MARKDOWN_TO_HTML_FAQS = [
  {
    question: "How to convert Markdown to HTML free?",
    answer:
      "Paste or type Markdown in the editor. The preview updates instantly and you can copy the generated HTML with one click — all in your browser, no signup.",
  },
  {
    question: "What Markdown syntax is supported?",
    answer:
      "Headings, bold, italic, links, lists, blockquotes, code blocks, fenced code, horizontal rules, tables, task lists, and strikethrough.",
  },
  {
    question: "Can I preview the rendered output?",
    answer: "Yes. Use the Preview tab to see how your Markdown renders before copying the HTML.",
  },
  {
    question: "Is Markdown conversion private?",
    answer: "Yes. Conversion runs locally in your browser with the marked library. Your content is never uploaded.",
  },
  {
    question: "Can I copy just the text content?",
    answer: "Yes. Use Copy Preview Text to copy the plain text from the rendered preview without HTML tags.",
  },
] as const;

export const SUPPORTED_MARKDOWN = [
  "Headings",
  "Bold",
  "Italic",
  "Links",
  "Images",
  "Lists",
  "Tables",
  "Code",
  "Blockquotes",
  "Task lists",
  "Strikethrough",
] as const;
