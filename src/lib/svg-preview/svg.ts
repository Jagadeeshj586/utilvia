import { formatXmlUnchecked } from "@/lib/xml/format";

export type PreviewBackground = "checker" | "white" | "dark";

export const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120">
  <rect width="240" height="120" rx="16" fill="#faf9f5" stroke="#eadfd4"/>
  <circle cx="60" cy="60" r="28" fill="#cc785c"/>
  <text x="108" y="68" font-family="Inter, sans-serif" font-size="22" fill="#141413">Utilvia</text>
</svg>`;

export const PREVIEW_BACKGROUNDS: Array<{ id: PreviewBackground; label: string }> = [
  { id: "checker", label: "Checker" },
  { id: "white", label: "White" },
  { id: "dark", label: "Dark" },
];

export const SVG_PREVIEW_FAQS = [
  {
    question: "What is SVG and why is it used for web icons?",
    answer:
      "SVG is a vector format. Icons stay sharp at any size and the markup can be edited, colored, and inlined in HTML.",
  },
  {
    question: "Can I edit SVG colors and sizes without an image editor?",
    answer:
      "Yes. Change fill, stroke, width, height, or viewBox in the code and the preview updates immediately.",
  },
  {
    question: "Is it safe to paste SVG code from the internet into a previewer?",
    answer:
      "This tool strips script tags, event handlers, and javascript: URLs before rendering. Still treat untrusted files with care — sanitizing reduces XSS risk, it does not make every file harmless.",
  },
  {
    question: "How is SVG different from PNG?",
    answer:
      "PNG is a raster image of pixels. SVG describes shapes, so it scales without blur and usually has a smaller file size for icons.",
  },
  {
    question: "Is SVG code previewer free?",
    answer: "Yes. It runs in your browser with no signup. Markup stays on your device.",
  },
] as const;

export function looksLikeSvg(markup: string) {
  return /<svg[\s>]/i.test(markup);
}

export function stripUnsafeSvg(markup: string) {
  return markup
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/<(iframe|object|embed|link)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(iframe|object|embed|link)\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|xlink:href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, "$1=$2$2")
    .replace(/javascript:/gi, "");
}

export function sanitizeSvg(markup: string) {
  const stripped = stripUnsafeSvg(markup);
  if (typeof window === "undefined") return stripped;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require("dompurify") as typeof import("dompurify").default;
  return DOMPurify.sanitize(stripped, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script", "style", "foreignObject", "iframe", "object", "embed", "link"],
  });
}

export function prettifySvg(markup: string): { ok: true; value: string } | { ok: false; error: string } {
  const trimmed = markup.trim();
  if (!trimmed) return { ok: false, error: "Paste SVG markup first." };
  if (!looksLikeSvg(trimmed)) return { ok: false, error: "Markup should include an <svg> root." };
  try {
    return { ok: true, value: formatXmlUnchecked(trimmed).replace(/\r\n/g, "\n") };
  } catch {
    return { ok: false, error: "Could not prettify this markup." };
  }
}

export function previewDocument(sanitized: string, background: PreviewBackground) {
  const surface =
    background === "white"
      ? "background:#ffffff;"
      : background === "dark"
        ? "background:#181715;"
        : "background-color:#faf9f5;background-image:linear-gradient(45deg,#e8e6e1 25%,transparent 25%),linear-gradient(-45deg,#e8e6e1 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e8e6e1 75%),linear-gradient(-45deg,transparent 75%,#e8e6e1 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0;";
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;display:grid;place-items:center;${surface}}svg{max-width:90%;max-height:90%;height:auto;}</style></head><body>${sanitized}</body></html>`;
}
