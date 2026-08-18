const PURIFY_CONFIG = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ["target", "rel", "class"],
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
};

function stripUnsafeHtml(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    return stripUnsafeHtml(html);
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require("dompurify") as typeof import("dompurify").default;
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

export function isSafeHtml(html: string): boolean {
  const sanitized = sanitizeHtml(html);
  return !sanitized.toLowerCase().includes("<script");
}
