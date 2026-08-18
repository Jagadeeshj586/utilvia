export {
  DEFAULT_REFRESH_SECONDS,
  DEFAULT_SELECTED_ID,
  DEFAULT_VS,
  FEATURED_COIN_IDS,
  FIAT_CURRENCIES,
  REFRESH_INTERVALS,
  isFiatCode,
} from "./catalog";
export {
  CRYPTO_MARKET_API,
  fetchMarkets,
  marketLookupErrorMessage,
  parseMarketsResponse,
  snapshotFromPayload,
  serializeSnapshot,
} from "./api";
export type { CoinQuote, MarketSnapshot } from "./api";
export {
  changeDirection,
  filterCoins,
  formatCompactFiat,
  formatCryptoPrice,
  formatPercentChange,
  formatUpdatedAt,
  sparklineToSeries,
} from "./format";

export const CRYPTO_MARKET_FAQS = [
  {
    question: "Where do the crypto prices come from?",
    answer:
      "Near-real-time market data is fetched from CoinGecko (top 50 coins by market cap). Quotes are cached for about 20 seconds so refresh stays within free-tier rate limits. This is not a live exchange feed.",
  },
  {
    question: "How often does the tracker refresh?",
    answer:
      "Auto-refresh defaults to 30 seconds and can be set to 15 or 60. Refresh pauses when the tab is hidden, and a manual Refresh button is always available. If CoinGecko rate-limits the feed, the last snapshot is kept.",
  },
  {
    question: "Can I view prices in INR or AED?",
    answer:
      "Yes. Switch the quote currency between USD, EUR, GBP, INR, and AED. Search by coin name or ticker (BTC, ETH, SOL, XRP, and others in the top 50).",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. Prices, 24-hour ranges, and market caps are approximate and can differ from an exchange at trade time. Use them for a snapshot, not for placing orders.",
  },
  {
    question: "Does the tracker send my wallet or holdings?",
    answer:
      "No. Only the selected fiat code is requested from the market API. There is no account, wallet connection, or personal portfolio upload.",
  },
] as const;
