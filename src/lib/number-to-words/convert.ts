export type NumberSystem = "indian" | "international";
export type CurrencySuffix = "INR" | "USD";

export const INDIAN_MAX = 9_999_999_999;
export const INTERNATIONAL_MAX = 999_999_999_999;

export const INDIAN_EXAMPLES = [1_000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000] as const;
export const INTERNATIONAL_EXAMPLES = [1_000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000] as const;

const ONES = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function belowThousand(num: number): string {
  if (num < 20) return ONES[num];
  if (num < 100) return `${TENS[Math.floor(num / 10)]}${num % 10 ? ` ${ONES[num % 10]}` : ""}`.trim();
  return `${ONES[Math.floor(num / 100)]} hundred${num % 100 ? ` ${belowThousand(num % 100)}` : ""}`.trim();
}

function chunkWords(num: number, scales: { value: number; label: string }[]) {
  if (num === 0) return "zero";
  const parts: string[] = [];
  let rest = num;
  for (const scale of scales) {
    const qty = Math.floor(rest / scale.value);
    if (qty) {
      parts.push(`${belowThousand(qty)} ${scale.label}`);
      rest %= scale.value;
    }
  }
  if (rest) parts.push(belowThousand(rest));
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function toWordsIndian(num: number) {
  return chunkWords(num, [
    { value: 10_000_000, label: "crore" },
    { value: 100_000, label: "lakh" },
    { value: 1000, label: "thousand" },
  ]);
}

export function toWordsInternational(num: number) {
  return chunkWords(num, [
    { value: 1_000_000_000, label: "billion" },
    { value: 1_000_000, label: "million" },
    { value: 1000, label: "thousand" },
  ]);
}

export function capitalizeWords(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatGroupedNumber(value: number | string, system: NumberSystem) {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  if (system === "international") {
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  if (digits.length <= 3) return digits;
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${lastThree}`;
}

export function parseDigits(input: string) {
  return input.replace(/\D/g, "");
}

export function maxForSystem(system: NumberSystem) {
  return system === "indian" ? INDIAN_MAX : INTERNATIONAL_MAX;
}

export function maxLabelForSystem(system: NumberSystem) {
  return system === "indian" ? "9,99,99,99,999" : "999,999,999,999";
}

export type NumberToWordsResult = {
  words: string;
  error: string | null;
  numeric: number | null;
};

export function convertNumberToWords(options: {
  input: string;
  system: NumberSystem;
  currencySuffix: boolean;
  currency: CurrencySuffix;
}): NumberToWordsResult {
  const digits = parseDigits(options.input);
  if (!digits) {
    return { words: "", error: null, numeric: null };
  }

  const numeric = Number(digits);
  if (!Number.isSafeInteger(numeric)) {
    return { words: "", error: "Enter a valid whole number.", numeric: null };
  }

  const max = maxForSystem(options.system);
  if (numeric > max) {
    return {
      words: "",
      error: `Enter a number up to ${maxLabelForSystem(options.system)}.`,
      numeric: null,
    };
  }

  const base =
    options.system === "indian" ? toWordsIndian(numeric) || "zero" : toWordsInternational(numeric) || "zero";
  let words = capitalizeWords(base);

  if (options.currencySuffix) {
    words = `${words} ${options.currency === "INR" ? "Rupees" : "Dollars"}`;
  }

  return { words, error: null, numeric };
}

export const NUMBER_TO_WORDS_FAQS = [
  {
    question: "How to convert number to words in Indian system?",
    answer: "Choose Indian System, enter a number, and see the result using crore, lakh, and thousand naming.",
  },
  {
    question: "What is the difference between Indian and International?",
    answer:
      "Indian system uses crore and lakh with 2-digit grouping after thousands. International uses billion and million with 3-digit grouping.",
  },
  {
    question: "Can I add Rupees or Dollars suffix?",
    answer: "Yes. Enable Add currency suffix and choose INR or USD to append Rupees or Dollars to the words.",
  },
  {
    question: "What is the maximum number supported?",
    answer: "Indian system supports up to 9,99,99,99,999. International system supports up to 999,999,999,999.",
  },
  {
    question: "Is number to words converter free?",
    answer: "Yes. This converter is free and runs entirely in your browser with no sign-up required.",
  },
] as const;
