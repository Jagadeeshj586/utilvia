import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseMarketsResponse, snapshotFromPayload } from "./api";
import { DEFAULT_VS, FEATURED_COIN_IDS, FIAT_CURRENCIES, isFiatCode } from "./catalog";
import {
  changeDirection,
  filterCoins,
  formatCompactFiat,
  formatCryptoPrice,
  formatPercentChange,
  formatUpdatedAt,
  sparklineToSeries,
} from "./format";

const geckoRow = {
  id: "bitcoin",
  symbol: "btc",
  name: "Bitcoin",
  image: "https://example.com/btc.png",
  current_price: 67000.12,
  market_cap: 1.32e12,
  market_cap_rank: 1,
  total_volume: 2.8e10,
  high_24h: 68100,
  low_24h: 65900,
  price_change_percentage_24h: 1.234,
  last_updated: "2026-08-15T12:00:00.000Z",
  sparkline_in_7d: { price: [1, 2, 3, 4] },
};

describe("catalog", () => {
  it("includes the requested fiat quotes and featured coins", () => {
    for (const code of ["usd", "eur", "gbp", "inr", "aed"]) assert.ok(isFiatCode(code), code);
    assert.equal(DEFAULT_VS, "usd");
    assert.ok(FEATURED_COIN_IDS.includes("bitcoin"));
    assert.ok(FEATURED_COIN_IDS.includes("ripple"));
    assert.equal(FIAT_CURRENCIES.length, 5);
  });
});

describe("parseMarketsResponse", () => {
  it("parses CoinGecko market rows", () => {
    const snapshot = parseMarketsResponse([geckoRow, { id: "skip-me" }], "USD", "CoinGecko");
    assert.ok(snapshot);
    assert.equal(snapshot?.vs, "usd");
    assert.equal(snapshot?.coins.length, 1);
    const btc = snapshot!.coins[0]!;
    assert.equal(btc.symbol, "BTC");
    assert.equal(btc.price, 67000.12);
    assert.equal(btc.rank, 1);
    assert.deepEqual(btc.sparkline, [1, 2, 3, 4]);
  });

  it("rejects empty payloads", () => {
    assert.equal(parseMarketsResponse([], "usd", "CoinGecko"), null);
    assert.equal(parseMarketsResponse({ coins: [] }, "usd", "CoinGecko"), null);
  });

  it("parses the app proxy payload", () => {
    const snapshot = snapshotFromPayload({
      vs: "inr",
      provider: "CoinGecko",
      fetchedAt: "2026-08-15T12:00:00.000Z",
      coins: [
        {
          id: "ethereum",
          symbol: "eth",
          name: "Ethereum",
          image: null,
          rank: 2,
          price: 280000,
          change24h: -1.5,
          high24h: 290000,
          low24h: 270000,
          marketCap: 1e12,
          volume24h: 2e10,
          sparkline: [1, 2],
          lastUpdated: "2026-08-15T12:00:00.000Z",
        },
      ],
    });
    assert.ok(snapshot);
    assert.equal(snapshot?.coins[0]?.symbol, "ETH");
    assert.equal(snapshot?.coins[0]?.change24h, -1.5);
  });
});

describe("formatting", () => {
  it("formats prices, compact caps, and percents", () => {
    assert.match(formatCryptoPrice(67000.12, "usd"), /67,000/);
    assert.match(formatCryptoPrice(0.00001234, "usd"), /0\.000012/);
    assert.match(formatCompactFiat(1.32e12, "usd"), /T/);
    assert.equal(formatPercentChange(1.234), "+1.23%");
    assert.equal(formatPercentChange(-0.8), "-0.80%");
    assert.equal(changeDirection(1.2), "up");
    assert.equal(changeDirection(-0.4), "down");
    assert.equal(changeDirection(0), "flat");
  });

  it("formats last-updated timestamps without throwing", () => {
    const text = formatUpdatedAt(new Date("2026-08-15T12:00:00Z"));
    assert.ok(text && text.length > 4);
    assert.equal(formatUpdatedAt(null), null);
  });
});

describe("lists", () => {
  it("filters by name, symbol, and id", () => {
    const coins = [
      { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
      { id: "ripple", name: "XRP", symbol: "XRP" },
    ];
    assert.equal(filterCoins(coins, "xrp")[0]?.id, "ripple");
    assert.equal(filterCoins(coins, "bit")[0]?.id, "bitcoin");
  });

  it("downsamples sparklines", () => {
    const series = sparklineToSeries(Array.from({ length: 168 }, (_, i) => i), 24);
    assert.ok(series.length <= 26);
    assert.equal(series[0]?.price, 0);
    assert.equal(series[series.length - 1]?.price, 167);
  });
});
