export type RegexFlag = "g" | "i" | "m" | "s";

export type RegexMatch = {
  text: string;
  index: number;
  groups: string[];
  namedGroups: Record<string, string>;
};

export type RegexTestResult =
  | { ok: true; matches: RegexMatch[]; flags: string }
  | { ok: false; error: string; matches: [] };

export type HighlightSegment = {
  text: string;
  matched: boolean;
  matchIndex?: number;
};

export const REGEX_FLAGS: Array<{ id: RegexFlag; label: string; description: string }> = [
  { id: "g", label: "g", description: "Global" },
  { id: "i", label: "i", description: "Case-insensitive" },
  { id: "m", label: "m", description: "Multiline" },
  { id: "s", label: "s", description: "Dotall" },
];

export const REGEX_PRESETS = [
  {
    id: "email",
    label: "Email",
    pattern: String.raw`[\w.-]+@[\w.-]+\.\w+`,
    sample: "Contact me@example.com or support@utilvia.dev today.",
  },
  {
    id: "url",
    label: "URL",
    pattern: String.raw`https?:\/\/[\w.-]+\.[a-z]{2,}[\w\/.-]*`,
    sample: "Visit https://workutilities.com or http://example.org/docs.",
  },
  {
    id: "phone-us",
    label: "Phone (US)",
    pattern: String.raw`\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}`,
    sample: "Call (555) 123-4567 or 555.987.6543.",
  },
  {
    id: "phone-in",
    label: "Indian Phone",
    pattern: String.raw`[6-9]\d{9}`,
    sample: "Reach us at 9876543210 or +91 9123456789.",
  },
  {
    id: "date",
    label: "Date (YYYY-MM-DD)",
    pattern: String.raw`\d{4}-\d{2}-\d{2}`,
    sample: "Events on 2026-08-11 and 2025-01-01.",
  },
  {
    id: "hex",
    label: "Hex Color",
    pattern: String.raw`#[0-9A-Fa-f]{6}`,
    sample: "Brand colors: #cc785c and #5db8a6.",
  },
] as const;

export const DEFAULT_REGEX_PATTERN = "";
export const DEFAULT_REGEX_FLAGS: RegexFlag[] = ["g"];
export const DEFAULT_REGEX_SAMPLE = "";

export const REGEX_TESTER_FAQS = [
  {
    question: "What regex flags are supported?",
    answer: "g (global), i (case-insensitive), m (multiline), and s (dotall).",
  },
  {
    question: "How do I test an email regex?",
    answer:
      "Click the Email preset, or paste your own pattern, then enter sample addresses in the test string to see matches and highlights.",
  },
  {
    question: "Why is my regex invalid?",
    answer:
      "JavaScript will reject incomplete or illegal patterns (for example unescaped parentheses). Fix the syntax and the tester will run again instantly.",
  },
  {
    question: "Are matches highlighted?",
    answer: "Yes. Matching text is highlighted in the preview, and each match lists its index and capture groups.",
  },
  {
    question: "Is regex tester free?",
    answer: "Yes. It runs entirely in your browser with no signup required.",
  },
] as const;

export function sanitizeFlags(flags: string | Iterable<string>) {
  const source = typeof flags === "string" ? flags.split("") : [...flags];
  const allowed = new Set<RegexFlag>(["g", "i", "m", "s"]);
  const unique: RegexFlag[] = [];
  for (const flag of source) {
    if (!allowed.has(flag as RegexFlag)) continue;
    if (!unique.includes(flag as RegexFlag)) unique.push(flag as RegexFlag);
  }
  return unique;
}

export function flagsToString(flags: Iterable<string>) {
  return sanitizeFlags(flags).join("");
}

export function testRegex(pattern: string, flagsInput: string | Iterable<string>, sample: string): RegexTestResult {
  const flags = flagsToString(flagsInput);

  try {
    const re = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];

    if (flags.includes("g")) {
      for (const match of sample.matchAll(re)) {
        matches.push({
          text: match[0],
          index: match.index ?? 0,
          groups: match.slice(1).map((group) => group ?? ""),
          namedGroups: { ...(match.groups ?? {}) },
        });
        // Guard against zero-width infinite loops
        if (match[0] === "" && typeof match.index === "number") {
          if (re.lastIndex === match.index) re.lastIndex += 1;
        }
      }
    } else {
      const match = re.exec(sample);
      if (match) {
        matches.push({
          text: match[0],
          index: match.index ?? 0,
          groups: match.slice(1).map((group) => group ?? ""),
          namedGroups: { ...(match.groups ?? {}) },
        });
      }
    }

    return { ok: true, matches, flags };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid regular expression",
      matches: [],
    };
  }
}

export function buildHighlightSegments(sample: string, matches: RegexMatch[]): HighlightSegment[] {
  if (!matches.length) return sample ? [{ text: sample, matched: false }] : [];

  const sorted = [...matches].sort((a, b) => a.index - b.index || b.text.length - a.text.length);
  const segments: HighlightSegment[] = [];
  let cursor = 0;

  sorted.forEach((match, matchIndex) => {
    const start = match.index;
    const end = start + match.text.length;
    if (start < cursor) return;
    if (start > cursor) {
      segments.push({ text: sample.slice(cursor, start), matched: false });
    }
    segments.push({ text: sample.slice(start, end) || "\u200b", matched: true, matchIndex });
    cursor = Math.max(cursor, end === start ? end + 1 : end);
  });

  if (cursor < sample.length) {
    segments.push({ text: sample.slice(cursor), matched: false });
  }

  return segments;
}
