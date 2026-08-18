import { PASSPHRASE_WORDS } from "./passphrase-words";
import { isWebCryptoAvailable, secureRandomInt } from "./random";

export const PASSPHRASE_LIMITS = {
  minWords: 3,
  maxWords: 8,
  defaultWords: 4,
} as const;

export type PassphraseSeparator = "-" | "_" | " " | "." | "";

export type PassphraseOptions = {
  wordCount: number;
  separator: PassphraseSeparator;
  capitalize: boolean;
  includeNumber: boolean;
};

export const DEFAULT_PASSPHRASE_OPTIONS: PassphraseOptions = {
  wordCount: PASSPHRASE_LIMITS.defaultWords,
  separator: "-",
  capitalize: false,
  includeNumber: false,
};

export const PASSPHRASE_SEPARATORS: { value: PassphraseSeparator; label: string }[] = [
  { value: "-", label: "Hyphen (-)" },
  { value: "_", label: "Underscore (_)" },
  { value: " ", label: "Space ( )" },
  { value: ".", label: "Period (.)" },
  { value: "", label: "None" },
];

export function clampWordCount(value: number): number {
  if (!Number.isFinite(value)) return PASSPHRASE_LIMITS.defaultWords;
  return Math.min(PASSPHRASE_LIMITS.maxWords, Math.max(PASSPHRASE_LIMITS.minWords, Math.round(value)));
}

function pickWord(): string {
  return PASSPHRASE_WORDS[secureRandomInt(PASSPHRASE_WORDS.length)];
}

export function generatePassphrase(options: PassphraseOptions): string {
  if (!isWebCryptoAvailable()) {
    throw new Error("Secure randomness is unavailable in this browser. Update your browser or open this page over HTTPS.");
  }

  const wordCount = clampWordCount(options.wordCount);
  const words = Array.from({ length: wordCount }, () => {
    const word = pickWord();
    return options.capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
  });

  let phrase = words.join(options.separator);
  if (options.includeNumber) {
    const number = String(secureRandomInt(90) + 10);
    phrase = options.separator ? `${phrase}${options.separator}${number}` : `${phrase}${number}`;
  }
  return phrase;
}

export function generatePassphrases(options: PassphraseOptions, count: number): string[] {
  const bulk = Math.min(20, Math.max(1, Math.round(count) || 1));
  return Array.from({ length: bulk }, () => generatePassphrase(options));
}
