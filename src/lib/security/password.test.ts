import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { generatePassphrase, generatePassphrases } from "./passphrase";
import { PASSPHRASE_WORDS } from "./passphrase-words";
import {
  AMBIGUOUS_CHARS,
  DEFAULT_PASSWORD_OPTIONS,
  PASSWORD_LIMITS,
  SYMBOL_CHARS,
  buildCharacterPool,
  generatePassword,
  generatePasswords,
  validatePasswordOptions,
  type PasswordOptions,
} from "./password";
import { secureRandomInt, secureShuffle } from "./random";
import { analyzeStrength } from "./strength";

const here = join(process.cwd(), "src/lib/security");

const allTypes: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
  minNumbers: 1,
  minSymbols: 1,
};

describe("secureRandomInt", () => {
  it("returns values in [0, max)", () => {
    for (let i = 0; i < 100; i += 1) {
      const value = secureRandomInt(10);
      assert.ok(value >= 0 && value < 10);
    }
  });
});

describe("secureShuffle", () => {
  it("preserves members", () => {
    const input = ["a", "b", "c", "1", "!"];
    assert.deepEqual([...secureShuffle(input)].sort(), [...input].sort());
  });
});

describe("buildCharacterPool", () => {
  it("uses the WorkUtilities symbol set", () => {
    assert.equal(SYMBOL_CHARS, "!@#$%^&*");
    const pools = buildCharacterPool(allTypes);
    assert.equal(pools.symbols, SYMBOL_CHARS);
  });

  it("excludes ambiguous characters when enabled", () => {
    const pools = buildCharacterPool({ ...allTypes, excludeAmbiguous: true });
    for (const ch of AMBIGUOUS_CHARS) {
      assert.equal(pools.combined.includes(ch), false);
    }
  });
});

describe("validatePasswordOptions", () => {
  it("rejects empty character sets", () => {
    const result = validatePasswordOptions({
      ...allTypes,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false,
    });
    assert.equal(result.ok, false);
  });

  it("rejects length too short for minimum requirements", () => {
    const result = validatePasswordOptions({
      ...allTypes,
      length: 8,
      minNumbers: 5,
      minSymbols: 5,
    });
    assert.equal(result.ok, false);
  });

  it("accepts default options", () => {
    assert.equal(validatePasswordOptions(DEFAULT_PASSWORD_OPTIONS).ok, true);
  });
});

describe("generatePassword", () => {
  it("matches length and required categories", () => {
    for (let i = 0; i < 20; i += 1) {
      const result = generatePassword(DEFAULT_PASSWORD_OPTIONS);
      assert.equal(result.ok, true);
      if (!result.ok) continue;
      assert.equal(result.password.length, 16);
      assert.match(result.password, /[A-Z]/);
      assert.match(result.password, /[a-z]/);
      assert.match(result.password, /[0-9]/);
      assert.ok([...result.password].some((ch) => SYMBOL_CHARS.includes(ch)));
      for (const ch of AMBIGUOUS_CHARS) {
        assert.equal(result.password.includes(ch), false);
      }
    }
  });

  it("honors higher minimum numbers and symbols", () => {
    const result = generatePassword({
      ...allTypes,
      length: 20,
      excludeAmbiguous: true,
      minNumbers: 4,
      minSymbols: 3,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok((result.password.match(/[0-9]/g) ?? []).length >= 4);
    assert.ok([...result.password].filter((ch) => SYMBOL_CHARS.includes(ch)).length >= 3);
  });

  it("bulk generates the requested count", () => {
    const result = generatePasswords(DEFAULT_PASSWORD_OPTIONS, 5);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.passwords?.length, 5);
  });
});

describe("generatePassphrase", () => {
  it("uses the shared word list", () => {
    assert.equal(PASSPHRASE_WORDS.length, 1000);
    const phrase = generatePassphrase({ wordCount: 4, separator: "-", capitalize: false, includeNumber: false });
    const parts = phrase.split("-");
    assert.equal(parts.length, 4);
    for (const part of parts) assert.ok((PASSPHRASE_WORDS as readonly string[]).includes(part));
  });

  it("can capitalize and append a number", () => {
    const phrase = generatePassphrase({ wordCount: 3, separator: "-", capitalize: true, includeNumber: true });
    assert.match(phrase, /^[A-Z][a-z]+-[A-Z][a-z]+-[A-Z][a-z]+-\d{2}$/);
  });

  it("bulk generates passphrases", () => {
    const values = generatePassphrases(
      { wordCount: 4, separator: "-", capitalize: false, includeNumber: false },
      3,
    );
    assert.equal(values.length, 3);
  });
});

describe("analyzeStrength", () => {
  it("scores weak and strong values differently", () => {
    const weak = analyzeStrength("password");
    const strong = analyzeStrength("xK9!mQ2@pL7#vR4$");
    assert.ok(weak.score <= 2);
    assert.ok(strong.score >= 3);
    assert.ok(strong.crackTime.length > 0);
  });
});

describe("security audit", () => {
  it("keeps password modules free of Math.random calls and persistence APIs", () => {
    for (const file of ["random.ts", "password.ts", "passphrase.ts", "clipboard.ts", "strength.ts"]) {
      const source = readFileSync(join(here, file), "utf8");
      assert.equal(/\bMath\.random\s*\(/.test(source), false, file);
      assert.equal(/\blocalStorage\.(get|set|remove)Item/.test(source), false, file);
      assert.equal(/\bsessionStorage\.(get|set|remove)Item/.test(source), false, file);
    }
  });

  it("keeps the UI free of password persistence and network calls", () => {
    const source = readFileSync(join(here, "../../components/tools/generators/password-generator.tsx"), "utf8");
    assert.equal(/\bMath\.random\s*\(/.test(source), false);
    assert.equal(/localStorage\.setItem/.test(source), false);
    assert.equal(/sessionStorage\.setItem/.test(source), false);
    assert.equal(/fetch\(/.test(source), false);
  });
});

describe("limits", () => {
  it("matches WorkUtilities length defaults", () => {
    assert.equal(PASSWORD_LIMITS.minLength, 8);
    assert.equal(PASSWORD_LIMITS.maxLength, 128);
    assert.equal(PASSWORD_LIMITS.defaultLength, 16);
  });
});
