const BLOCK_TAGS = ["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "pre", "blockquote", "table", "thead", "tbody", "tr", "hr"];

export function formatHtml(html: string): string {
  let formatted = html.trim();
  for (const tag of BLOCK_TAGS) {
    formatted = formatted.replaceAll(`</${tag}>`, `</${tag}>\n`);
    formatted = formatted.replaceAll(new RegExp(`<${tag}(\\s|>)`, "g"), `\n<${tag}$1`);
  }
  return formatted
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .trim();
}

export function minifyHtml(html: string): string {
  return html.replace(/>\s+</g, "><").trim();
}

export type DownloadMode = "fragment" | "document";

export function buildHtmlDocument(body: string, title = "Converted Markdown") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body>

${body}

</body>
</html>
`;
}

export function htmlForDownload(body: string, mode: DownloadMode) {
  return mode === "document" ? buildHtmlDocument(body) : body;
}

export function htmlToPreviewText(html: string) {
  if (typeof document === "undefined") {
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  const container = document.createElement("div");
  container.innerHTML = html;
  return container.textContent?.replace(/\s+/g, " ").trim() ?? "";
}
