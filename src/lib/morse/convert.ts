export type MorseMode = "encode" | "decode";

export const MORSE_MAP: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
  " ": "/",
};

export const MORSE_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([char, code]) => [code, char]),
);

export const MORSE_ALPHABET = Object.entries(MORSE_MAP)
  .filter(([char]) => char !== " ")
  .map(([char, code]) => ({ char, code }));

export const MORSE_FAQS = [
  {
    question: "How do I write Morse code?",
    answer:
      "Use dots (.) and dashes (-) for each letter, separate letters with a space, and separate words with a slash (/). Example: HELLO → .... . .-.. .-.. ---",
  },
  {
    question: "What is SOS in Morse?",
    answer: "SOS is ... --- ... (three dots, three dashes, three dots).",
  },
  {
    question: "Are numbers supported?",
    answer: "Yes. Digits 0–9 and common punctuation are included in the alphabet reference and converter.",
  },
  {
    question: "Is conversion instant?",
    answer: "Yes. Output updates as you type in Text to Morse or Morse to Text mode.",
  },
  {
    question: "Is Morse code converter free?",
    answer: "Yes. The Utilvia Morse Code Converter is free with no signup required.",
  },
] as const;

export function textToMorse(text: string): string {
  if (!text) return "";
  return text
    .toUpperCase()
    .split("")
    .map((char) => MORSE_MAP[char] || "")
    .filter(Boolean)
    .join(" ");
}

export function morseToText(morse: string): string {
  if (!morse.trim()) return "";
  return morse
    .trim()
    .split(" ")
    .map((token) => MORSE_REVERSE[token] || "")
    .join("");
}

export function convertMorse(input: string, mode: MorseMode): string {
  return mode === "encode" ? textToMorse(input) : morseToText(input);
}
