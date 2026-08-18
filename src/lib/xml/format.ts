export type XmlToolMode = "format" | "minify" | "validate";

export type XmlProcessResult = {
  output: string;
  error: string | null;
  isValid: boolean;
};

export const XML_FAQS = [
  {
    question: "Does it validate XML?",
    answer:
      "Yes. Use Validate mode to check for XML syntax errors. Valid documents show a success message; invalid ones show the parser error.",
  },
  {
    question: "Can I minify XML?",
    answer: "Yes. Minify mode removes unnecessary whitespace between tags so the XML is compact for transport or storage.",
  },
  {
    question: "Is my XML uploaded?",
    answer: "No. Formatting and validation run entirely in your browser. Nothing is sent to a server.",
  },
  {
    question: "What if XML is invalid?",
    answer:
      "Format and Validate modes show an error message when the document cannot be parsed. Fix the markup and try again.",
  },
  {
    question: "Is XML formatter free?",
    answer: "Yes. The Utilvia XML Formatter is free with no signup required.",
  },
] as const;

function getParserErrorMessage(xml: string): string | null {
  if (typeof DOMParser === "undefined") {
    throw new Error("XML formatting requires a browser environment");
  }
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    return parserError.textContent || "Invalid XML";
  }
  return null;
}

/** WorkUtilities-compatible beautify (validates first when DOMParser is available). */
export function formatXml(xml: string): string {
  const parserError = getParserErrorMessage(xml);
  if (parserError) {
    throw new Error(`Invalid XML: ${parserError}`);
  }

  let formatted = "";
  let indent = "";
  xml.split(/>\s*</).forEach((part) => {
    if (part.match(/^\/\w/)) {
      indent = indent.substring(2);
    }
    formatted += `${indent}<${part}>\r\n`;
    if (part.match(/^<?\w[^>]*[^/]$/) && !part.startsWith("?")) {
      indent += "  ";
    }
  });
  return formatted.substring(1, formatted.length - 3);
}

export function minifyXml(xml: string): string {
  return xml.replace(/>\s+</g, "><").trim();
}

export function validateXml(xml: string): { valid: boolean; error?: string } {
  try {
    if (typeof DOMParser === "undefined") {
      return { valid: false, error: "XML validation requires a browser" };
    }
    const parserError = getParserErrorMessage(xml);
    if (parserError) {
      return { valid: false, error: parserError };
    }
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid XML",
    };
  }
}

/** Pure beautify used in unit tests — same algorithm as WorkUtilities, no DOMParser. */
export function formatXmlUnchecked(xml: string): string {
  let formatted = "";
  let indent = "";
  xml.split(/>\s*</).forEach((part) => {
    if (part.match(/^\/\w/)) {
      indent = indent.substring(2);
    }
    formatted += `${indent}<${part}>\r\n`;
    if (part.match(/^<?\w[^>]*[^/]$/) && !part.startsWith("?")) {
      indent += "  ";
    }
  });
  return formatted.substring(1, formatted.length - 3);
}

export function processXml(input: string, mode: XmlToolMode): XmlProcessResult {
  if (!input.trim()) {
    return { output: "", error: null, isValid: false };
  }

  try {
    if (mode === "format") {
      return { output: formatXml(input), error: null, isValid: false };
    }

    if (mode === "minify") {
      return { output: minifyXml(input), error: null, isValid: false };
    }

    const result = validateXml(input);
    if (!result.valid) {
      return { output: "", error: result.error ?? "Invalid XML", isValid: false };
    }
    return { output: "✓ Valid XML", error: null, isValid: true };
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? error.message : "Invalid XML",
      isValid: false,
    };
  }
}
