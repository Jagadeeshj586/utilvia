export type UrlEncodeMode = "component" | "full";
export type UrlDirection = "encode" | "decode";

export const DEFAULT_URL_INPUT = "https://example.com/search?q=hello world&tag=a=b";

export const URL_ENCODE_EXAMPLES = [
  { label: "Space", from: " ", to: "%20" },
  { label: "&", from: "&", to: "%26" },
  { label: "=", from: "=", to: "%3D" },
] as const;

export function convertUrl(input: string, direction: UrlDirection, mode: UrlEncodeMode) {
  if (!input) return { output: "", error: null as string | null };
  try {
    if (direction === "encode") {
      const output = mode === "component" ? encodeURIComponent(input) : encodeURI(input);
      return { output, error: null };
    }
    const output = mode === "component" ? decodeURIComponent(input) : decodeURI(input);
    return { output, error: null };
  } catch {
    return {
      output: "",
      error: direction === "decode" ? "Invalid percent-encoding." : "Could not encode this input.",
    };
  }
}

export const URL_ENCODER_FAQS = [
  {
    question: "How to encode a URL online free?",
    answer:
      "Paste your text, choose Encode or Decode, pick Component or Full URI, and copy the result instantly — all in your browser.",
  },
  {
    question: "What is percent encoding?",
    answer:
      "Percent encoding replaces unsafe URL characters with a % followed by two hex digits, like space becoming %20.",
  },
  {
    question: "encodeURI vs encodeURIComponent?",
    answer:
      "encodeURIComponent encodes every special character and is best for query values. encodeURI keeps URL structure characters like : / ? & = and is best for full URLs.",
  },
  {
    question: "How to decode a URL?",
    answer: "Switch to Decode, paste the encoded text, and read the decoded output instantly.",
  },
  {
    question: "Is URL encoding safe online?",
    answer: "Yes. This tool runs locally in your browser. Your text is never uploaded to a server.",
  },
] as const;
