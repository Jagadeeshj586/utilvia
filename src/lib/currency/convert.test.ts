import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseRatesResponse, quoteFromPayload } from "./api";
import { CURRENCIES, POPULAR_PAIRS, filterCurrencies, getCurrency } from "./currencies";
import {
  convertAmount,
  currencyFractionDigits,
  formatMoney,
  formatRate,
  formatUpdatedAt,
  inverseRate,
  lookupRate,
  parseAmount,
  validateAmount,
} from "./convert";

describe("parseAmount / validateAmount", () => {
  it("parses grouped and decimal amounts", () => {
    assert.equal(parseAmount("1,250.50"), 1250.5);
    assert.equal(parseAmount("100"), 100);
  });

  it("rejects empty and huge values", () => {
    assert.equal(validateAmount(""), "Enter an amount.");
    assert.equal(validateAmount("abc"), "Enter a valid number.");
    assert.equal(validateAmount("10000000000000"), "Enter a smaller amount.");
  });
});

describe("conversion math", () => {
  it("multiplies by the quote rate", () => {
    assert.equal(convertAmount(100, 83.5), 8350);
  });

  it("returns the inverse rate", () => {
    assert.equal(inverseRate(2), 0.5);
  });

  it("treats the same currency as rate 1", () => {
    assert.equal(lookupRate({ INR: 83 }, "USD", "USD"), 1);
    assert.equal(lookupRate({ INR: 83 }, "USD", "INR"), 83);
    assert.equal(lookupRate({ INR: 83 }, "USD", "XYZ"), null);
  });

  it("ignores a quote whose base does not match the from currency", () => {
    assert.equal(lookupRate({ USD: 1, INR: 83 }, "INR", "USD", "USD"), null);
    assert.equal(lookupRate({ USD: 1, INR: 83 }, "USD", "INR", "USD"), 83);
  });
});

describe("formatting", () => {
  it("formats INR and JPY with typical fraction digits", () => {
    assert.equal(currencyFractionDigits("INR"), 2);
    assert.equal(currencyFractionDigits("JPY"), 0);
    assert.match(formatMoney(1234.5, "USD"), /1,234\.50/);
    assert.match(formatRate(0.012345), /0\.012/);
  });

  it("formats last-updated timestamps without throwing", () => {
    const text = formatUpdatedAt(new Date("2026-08-15T12:00:00Z"));
    assert.ok(text && text.length > 4);
    assert.equal(formatUpdatedAt(null), null);
  });
});

describe("catalog", () => {
  it("includes Utilvia-relevant currencies and popular pairs", () => {
    for (const code of ["USD", "INR", "EUR", "GBP", "AED", "AUD", "CAD"]) {
      assert.ok(getCurrency(code), code);
    }
    assert.ok(CURRENCIES.every((item) => item.flag));
    for (const pair of POPULAR_PAIRS) {
      assert.ok(getCurrency(pair.from));
      assert.ok(getCurrency(pair.to));
    }
  });

  it("filters by code, name, and alias", () => {
    assert.ok(filterCurrencies("rupee").some((item) => item.code === "INR"));
    assert.ok(filterCurrencies("AED").some((item) => item.code === "AED"));
  });
});

describe("parseRatesResponse", () => {
  it("parses ExchangeRate-API payloads", () => {
    const quote = parseRatesResponse(
      {
        result: "success",
        base_code: "USD",
        time_last_update_unix: 1_700_000_000,
        rates: { INR: 83.2, EUR: 0.92 },
      },
      "USD",
      "ExchangeRate-API",
    );
    assert.ok(quote);
    assert.equal(quote?.rates.USD, 1);
    assert.equal(quote?.rates.INR, 83.2);
    assert.equal(quote?.provider, "ExchangeRate-API");
  });

  it("parses Frankfurter payloads", () => {
    const quote = parseRatesResponse(
      { base: "EUR", date: "2026-08-15", rates: { USD: 1.1 } },
      "EUR",
      "Frankfurter",
    );
    assert.ok(quote);
    assert.equal(quote?.rates.EUR, 1);
    assert.equal(quote?.rates.USD, 1.1);
  });

  it("rejects error payloads", () => {
    assert.equal(parseRatesResponse({ result: "error", "error-type": "unsupported-code" }, "XXX", "test"), null);
  });

  it("parses the app proxy payload", () => {
    const quote = quoteFromPayload({
      base: "USD",
      rates: { INR: 83.2 },
      updatedAt: "2026-08-15T12:00:00.000Z",
      provider: "ExchangeRate-API",
    });
    assert.ok(quote);
    assert.equal(quote?.rates.INR, 83.2);
    assert.equal(quote?.updatedAt?.toISOString(), "2026-08-15T12:00:00.000Z");
  });
});
