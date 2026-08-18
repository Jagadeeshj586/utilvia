export type NumberBase = "binary" | "decimal" | "hex" | "octal";

export const BINARY_EXAMPLES = [0, 1, 10, 255, 1024, 65535] as const;

export const BASE_FIELDS: Array<{
  id: NumberBase;
  label: string;
  baseLabel: string;
  hint: string;
  placeholder: string;
}> = [
  { id: "binary", label: "Binary", baseLabel: "Base 2", hint: "0 and 1 only", placeholder: "0" },
  { id: "decimal", label: "Decimal", baseLabel: "Base 10", hint: "0–9 only", placeholder: "0" },
  { id: "hex", label: "Hexadecimal", baseLabel: "Base 16", hint: "0–9, A–F", placeholder: "0" },
  { id: "octal", label: "Octal", baseLabel: "Base 8", hint: "0–7 only", placeholder: "0" },
];

const VALIDATORS: Record<NumberBase, RegExp> = {
  binary: /^[01]*$/,
  decimal: /^[0-9]*$/,
  hex: /^[0-9a-fA-F]*$/,
  octal: /^[0-7]*$/,
};

const VALIDATION_ERRORS: Record<NumberBase, string> = {
  binary: "Binary accepts 0 and 1 only.",
  decimal: "Decimal accepts digits 0–9 only.",
  hex: "Hexadecimal accepts 0–9 and A–F only.",
  octal: "Octal accepts digits 0–7 only.",
};

export type NumberSystemValues = Record<NumberBase, string>;

export function emptyNumberSystemValues(): NumberSystemValues {
  return { binary: "", decimal: "", hex: "", octal: "" };
}

export function convertNumberSystems(input: string, from: NumberBase): NumberSystemValues & { error: string | null } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ...emptyNumberSystemValues(), error: null };
  }

  if (!VALIDATORS[from].test(trimmed)) {
    return { ...emptyNumberSystemValues(), error: VALIDATION_ERRORS[from] };
  }

  let value: bigint;
  try {
    switch (from) {
      case "binary":
        value = BigInt(`0b${trimmed}`);
        break;
      case "decimal":
        value = BigInt(trimmed);
        break;
      case "hex":
        value = BigInt(`0x${trimmed}`);
        break;
      case "octal":
        value = BigInt(`0o${trimmed}`);
        break;
    }
  } catch {
    return { ...emptyNumberSystemValues(), error: "Enter a valid number for this base." };
  }

  if (value < BigInt(0)) {
    return { ...emptyNumberSystemValues(), error: "Negative numbers are not supported." };
  }

  return {
    binary: value.toString(2),
    decimal: value.toString(10),
    hex: value.toString(16).toUpperCase(),
    octal: value.toString(8),
    error: null,
  };
}

export const BINARY_CONVERTER_FAQS = [
  {
    question: "How to convert decimal to binary?",
    answer: "Enter a decimal number in the Decimal field. Binary, hexadecimal, and octal values update instantly.",
  },
  {
    question: "How to convert hex to decimal?",
    answer: "Type a hexadecimal value in the Hexadecimal field. All other formats update automatically.",
  },
  {
    question: "What characters are valid for each base?",
    answer: "Binary uses 0–1, octal uses 0–7, decimal uses 0–9, and hexadecimal uses 0–9 plus A–F.",
  },
  {
    question: "Can I copy converted values?",
    answer: "Yes. Each format has a Copy button so you can copy binary, decimal, hex, or octal output with one click.",
  },
  {
    question: "Is binary conversion free online?",
    answer: "Yes. This binary converter is free and runs entirely in your browser with no sign-up required.",
  },
] as const;
