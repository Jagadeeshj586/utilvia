/**
 * Cryptographically secure randomness. Never fall back to an insecure PRNG.
 */

export function isWebCryptoAvailable(): boolean {
  return typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.getRandomValues === "function";
}

function assertCrypto() {
  if (!isWebCryptoAvailable()) {
    throw new Error("Secure randomness is unavailable in this browser.");
  }
}

/**
 * Uniform integer in [0, maxExclusive). Uses rejection sampling to avoid modulo bias.
 */
export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error("secureRandomInt requires a positive integer upper bound.");
  }
  if (maxExclusive === 1) return 0;
  assertCrypto();

  const limit = 0x100000000;
  if (maxExclusive > limit) {
    throw new Error("secureRandomInt supports bounds up to 2^32.");
  }

  const maxUnbiased = Math.floor(limit / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);
  let value = 0;
  do {
    globalThis.crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= maxUnbiased);

  return value % maxExclusive;
}

export function secureRandomCharacter(alphabet: string): string {
  if (!alphabet) {
    throw new Error("secureRandomCharacter requires a non-empty alphabet.");
  }
  return alphabet[secureRandomInt(alphabet.length)];
}

export function secureShuffle<T>(items: readonly T[]): T[] {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1);
    const current = next[i];
    next[i] = next[j];
    next[j] = current;
  }
  return next;
}
