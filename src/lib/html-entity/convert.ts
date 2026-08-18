export type HtmlEntityMode = "encode" | "decode";

export type HtmlEntityPair = {
  character: string;
  entity: string;
  label: string;
};

/** Reference table shown in the UI — matches WorkUtilities order. */
export const COMMON_HTML_ENTITIES: HtmlEntityPair[] = [
  { character: "&", entity: "&amp;", label: "Ampersand" },
  { character: "<", entity: "&lt;", label: "Less than" },
  { character: ">", entity: "&gt;", label: "Greater than" },
  { character: '"', entity: "&quot;", label: "Double quote" },
  { character: "'", entity: "&#39;", label: "Apostrophe" },
  { character: "©", entity: "&copy;", label: "Copyright" },
  { character: "®", entity: "&reg;", label: "Registered" },
  { character: "€", entity: "&euro;", label: "Euro" },
];

/** Encode map used for conversion (order matters: & first). */
const ENCODE_MAP: Array<[string, string]> = [
  ["&", "&amp;"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ['"', "&quot;"],
  ["'", "&#39;"],
  ["©", "&copy;"],
  ["®", "&reg;"],
  ["€", "&euro;"],
];

const NAMED_DECODE_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  copy: "©",
  reg: "®",
  euro: "€",
  nbsp: "\u00A0",
};

export const HTML_ENTITY_FAQS = [
  {
    question: "What is an HTML entity?",
    answer: "A character reference like &lt; that represents a special character in HTML.",
  },
  {
    question: "How do I encode < and >?",
    answer: 'Switch to encode mode and type or paste text containing < and >. They become &lt; and &gt; instantly.',
  },
  {
    question: "Can I decode entities back?",
    answer: "Yes. Choose decode mode and paste encoded text such as &lt;div&gt; to restore the original characters.",
  },
  {
    question: "What entities are supported?",
    answer:
      "Encoding covers &, <, >, quotes, ©, ®, and €. Decoding also accepts common named entities and numeric references like &#39; or &#x27;.",
  },
  {
    question: "Is HTML entity tool free?",
    answer: "Yes. It runs entirely in your browser with no signup required.",
  },
] as const;

export function encodeHtmlEntities(value: string) {
  let output = value;
  for (const [character, entity] of ENCODE_MAP) {
    output = output.split(character).join(entity);
  }
  return output;
}

export function decodeHtmlEntities(value: string) {
  return value.replace(/&(#(?:x[0-9a-fA-F]+|\d+)|[a-zA-Z][a-zA-Z0-9]+);/g, (full, body: string) => {
    if (body[0] === "#") {
      const codePoint =
        body[1] === "x" || body[1] === "X" ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10);
      if (!Number.isFinite(codePoint)) return full;
      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return full;
      }
    }
    const named = NAMED_DECODE_MAP[body.toLowerCase()];
    return named ?? full;
  });
}

export function convertHtmlEntities(value: string, mode: HtmlEntityMode) {
  return mode === "encode" ? encodeHtmlEntities(value) : decodeHtmlEntities(value);
}
