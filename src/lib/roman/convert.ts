export type RomanMode = "to-roman" | "to-number";

export const ROMAN_MAP: Array<[number, string]> = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export const ROMAN_REFERENCE = [
  { arabic: 1, roman: "I" },
  { arabic: 4, roman: "IV" },
  { arabic: 5, roman: "V" },
  { arabic: 9, roman: "IX" },
  { arabic: 10, roman: "X" },
  { arabic: 40, roman: "XL" },
  { arabic: 50, roman: "L" },
  { arabic: 90, roman: "XC" },
  { arabic: 100, roman: "C" },
  { arabic: 400, roman: "CD" },
  { arabic: 500, roman: "D" },
  { arabic: 900, roman: "CM" },
  { arabic: 1000, roman: "M" },
] as const;

export const ROMAN_MIN = 1;
export const ROMAN_MAX = 3999;

export const ROMAN_FAQS = [
  {
    question: "Why is 4 written as IV instead of IIII?",
    answer:
      "Standard Roman numerals use subtractive notation: a smaller value before a larger one means subtraction. So IV = 5 − 1 = 4, and IX = 10 − 1 = 9. Some clock faces still use IIII for stylistic reasons.",
  },
  {
    question: "What's the largest number you can write in standard Roman numerals?",
    answer:
      "Standard notation without overlines typically goes up to 3999 (MMMCMXCIX). This converter supports integers from 1 to 3999.",
  },
  {
    question: "Where are Roman numerals still commonly used today?",
    answer:
      "You'll see them in outlines, book chapters, clock faces, movie sequels, Super Bowl numbering, monarch titles, and formal documents.",
  },
  {
    question: "Can all numbers be converted to Roman numerals?",
    answer:
      "Only positive integers from 1 to 3999 are supported here. Zero, negatives, decimals, and numbers above 3999 are outside the standard range.",
  },
  {
    question: "Is Roman numeral converter free?",
    answer: "Yes. The Utilvia Roman Numeral Converter is free with no signup. Conversion runs entirely in your browser.",
  },
] as const;

export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < ROMAN_MIN || n > ROMAN_MAX) {
    throw new Error(`Enter an integer from ${ROMAN_MIN} to ${ROMAN_MAX}`);
  }

  let remaining = n;
  let out = "";
  for (const [value, symbol] of ROMAN_MAP) {
    while (remaining >= value) {
      out += symbol;
      remaining -= value;
    }
  }
  return out;
}

export function fromRoman(input: string): number {
  const value = input.toUpperCase().replace(/\s+/g, "");
  if (!value) throw new Error("Enter a Roman numeral");
  if (!/^[IVXLCDM]+$/.test(value)) throw new Error("Use only I, V, X, L, C, D, and M");

  let i = 0;
  let total = 0;
  while (i < value.length) {
    const two = ROMAN_MAP.find(([, symbol]) => symbol.length === 2 && value.startsWith(symbol, i));
    if (two) {
      total += two[0];
      i += 2;
      continue;
    }
    const one = ROMAN_MAP.find(([, symbol]) => symbol.length === 1 && value[i] === symbol);
    if (!one) throw new Error("Invalid Roman numerals");
    total += one[0];
    i += 1;
  }

  if (toRoman(total) !== value || total < ROMAN_MIN || total > ROMAN_MAX) {
    throw new Error("Invalid Roman numeral combination");
  }
  return total;
}

export type RomanConvertResult =
  | { ok: true; value: string }
  | { ok: false; error: string; value: string };

export function convertRomanInput(input: string, mode: RomanMode): RomanConvertResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, value: "" };

  try {
    if (mode === "to-roman") {
      if (!/^\d+$/.test(trimmed)) {
        throw new Error(`Enter an integer from ${ROMAN_MIN} to ${ROMAN_MAX}`);
      }
      return { ok: true, value: toRoman(Number(trimmed)) };
    }
    return { ok: true, value: String(fromRoman(trimmed)) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid input",
      value: "",
    };
  }
}
