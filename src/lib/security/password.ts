import { isWebCryptoAvailable, secureRandomCharacter, secureRandomInt, secureShuffle } from "./random";

export const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
export const NUMBER_CHARS = "0123456789";
/** WorkUtilities symbol set */
export const SYMBOL_CHARS = "!@#$%^&*";
/** Ambiguous characters excluded by WorkUtilities: 0 O o l 1 I | */
export const AMBIGUOUS_CHARS = "0Oo1lI|";

export const PASSWORD_LIMITS = {
  minLength: 8,
  maxLength: 128,
  defaultLength: 16,
  minRequired: 0,
  maxRequired: 5,
  defaultMinNumbers: 1,
  defaultMinSymbols: 1,
  maxBulk: 20,
} as const;

export type PasswordOptions = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  minNumbers: number;
  minSymbols: number;
};

export type PasswordValidation = { ok: true } | { ok: false; message: string };

export type GeneratePasswordResult =
  | { ok: true; password: string; poolSize: number }
  | { ok: false; message: string };

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: PASSWORD_LIMITS.defaultLength,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
  minNumbers: PASSWORD_LIMITS.defaultMinNumbers,
  minSymbols: PASSWORD_LIMITS.defaultMinSymbols,
};

const AMBIGUOUS_SET = new Set([...AMBIGUOUS_CHARS]);

export function clampPasswordLength(value: number): number {
  if (!Number.isFinite(value)) return PASSWORD_LIMITS.defaultLength;
  return Math.min(PASSWORD_LIMITS.maxLength, Math.max(PASSWORD_LIMITS.minLength, Math.round(value)));
}

export function clampRequiredCount(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(PASSWORD_LIMITS.maxRequired, Math.max(PASSWORD_LIMITS.minRequired, Math.round(value)));
}

export function clampBulkCount(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(PASSWORD_LIMITS.maxBulk, Math.max(1, Math.round(value)));
}

function applyAmbiguousFilter(value: string, excludeAmbiguous: boolean): string {
  if (!excludeAmbiguous) return value;
  return [...value].filter((ch) => !AMBIGUOUS_SET.has(ch)).join("");
}

export function buildCharacterPool(options: PasswordOptions): {
  combined: string;
  uppercase: string;
  lowercase: string;
  numbers: string;
  symbols: string;
} {
  const uppercase = options.uppercase ? applyAmbiguousFilter(UPPERCASE_CHARS, options.excludeAmbiguous) : "";
  const lowercase = options.lowercase ? applyAmbiguousFilter(LOWERCASE_CHARS, options.excludeAmbiguous) : "";
  const numbers = options.numbers ? applyAmbiguousFilter(NUMBER_CHARS, options.excludeAmbiguous) : "";
  const symbols = options.symbols ? SYMBOL_CHARS : "";
  return {
    uppercase,
    lowercase,
    numbers,
    symbols,
    combined: `${uppercase}${lowercase}${numbers}${symbols}`,
  };
}

export function validatePasswordOptions(options: PasswordOptions): PasswordValidation {
  if (!Number.isInteger(options.length) || options.length < PASSWORD_LIMITS.minLength || options.length > PASSWORD_LIMITS.maxLength) {
    return { ok: false, message: `Choose a length between ${PASSWORD_LIMITS.minLength} and ${PASSWORD_LIMITS.maxLength}.` };
  }

  const pools = buildCharacterPool(options);
  if (!pools.combined) {
    return { ok: false, message: "Select at least one character type." };
  }

  if (options.uppercase && !pools.uppercase) {
    return { ok: false, message: "Character set is empty after excluding ambiguous characters." };
  }
  if (options.lowercase && !pools.lowercase) {
    return { ok: false, message: "Character set is empty after excluding ambiguous characters." };
  }
  if (options.numbers && !pools.numbers) {
    return { ok: false, message: "Character set is empty after excluding ambiguous characters." };
  }

  const minNumbers = options.numbers ? clampRequiredCount(options.minNumbers) : 0;
  const minSymbols = options.symbols ? clampRequiredCount(options.minSymbols) : 0;
  const requiredSlots =
    (options.uppercase ? 1 : 0) + (options.lowercase ? 1 : 0) + (options.numbers ? Math.max(1, minNumbers) : 0) + (options.symbols ? Math.max(1, minSymbols) : 0);

  if (requiredSlots > options.length) {
    return { ok: false, message: "Password length is too short for the minimum character requirements." };
  }

  return { ok: true };
}

export function generatePassword(options: PasswordOptions): GeneratePasswordResult {
  if (!isWebCryptoAvailable()) {
    return {
      ok: false,
      message: "Secure randomness is unavailable in this browser. Update your browser or open this page over HTTPS.",
    };
  }

  const length = clampPasswordLength(options.length);
  const minNumbers = options.numbers ? clampRequiredCount(options.minNumbers) : 0;
  const minSymbols = options.symbols ? clampRequiredCount(options.minSymbols) : 0;
  const normalized: PasswordOptions = {
    ...options,
    length,
    minNumbers,
    minSymbols,
  };

  const validation = validatePasswordOptions(normalized);
  if (!validation.ok) return validation;

  const pools = buildCharacterPool(normalized);
  const chars: string[] = [];

  if (normalized.uppercase) chars.push(secureRandomCharacter(pools.uppercase));
  if (normalized.lowercase) chars.push(secureRandomCharacter(pools.lowercase));
  if (normalized.numbers) {
    const count = Math.max(1, minNumbers);
    for (let i = 0; i < count; i += 1) chars.push(secureRandomCharacter(pools.numbers));
  }
  if (normalized.symbols) {
    const count = Math.max(1, minSymbols);
    for (let i = 0; i < count; i += 1) chars.push(secureRandomCharacter(pools.symbols));
  }

  while (chars.length < length) {
    chars.push(secureRandomCharacter(pools.combined));
  }

  return {
    ok: true,
    password: secureShuffle(chars).join(""),
    poolSize: pools.combined.length,
  };
}

export function generatePasswords(options: PasswordOptions, count: number): GeneratePasswordResult & { passwords?: string[] } {
  const bulk = clampBulkCount(count);
  const passwords: string[] = [];
  for (let i = 0; i < bulk; i += 1) {
    const result = generatePassword(options);
    if (!result.ok) return result;
    passwords.push(result.password);
  }
  return { ok: true, password: passwords[0], passwords, poolSize: buildCharacterPool(options).combined.length };
}

/** Used only for non-sensitive ids. Prefer crypto when available. */
export function sessionId(): string {
  if (isWebCryptoAvailable()) {
    const bytes = new Uint32Array(2);
    globalThis.crypto.getRandomValues(bytes);
    return `${Date.now()}-${bytes[0].toString(36)}${bytes[1].toString(36)}`;
  }
  return `${Date.now()}-${secureRandomInt(1_000_000)}`;
}

export const PASSWORD_FAQS = [
  {
    question: "Is this password generator secure?",
    answer:
      "Yes. Passwords and passphrases are created locally with the Web Crypto API. Nothing is sent to Utilvia servers.",
  },
  {
    question: "Are my passwords stored?",
    answer:
      "No. Optional session history stays in memory only and clears when you close or refresh the page. Passwords are not written to browser storage or a database.",
  },
  {
    question: "What is the difference between a password and a passphrase?",
    answer:
      "A password is a random string of characters. A passphrase is several random dictionary words joined with a separator, which can be easier to type while still being strong.",
  },
  {
    question: "Should I use a password manager?",
    answer:
      "Yes. Use a unique password for every account and store it in a trusted password manager.",
  },
  {
    question: "How long should a password be?",
    answer:
      "16 or more characters with mixed types is a solid baseline for most accounts. This tool supports 8 to 128 characters.",
  },
  {
    question: "Does the generator work offline?",
    answer:
      "Generation runs in your browser. After the page loads, creating a new password does not require a network request.",
  },
] as const;
