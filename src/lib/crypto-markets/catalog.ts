export type FiatCurrency = {
  code: string;
  label: string;
};

export type RefreshInterval = {
  seconds: number;
  label: string;
};

/** Fiat quotes CoinGecko (and similar feeds) accept as `vs_currency`. */
export const FIAT_CURRENCIES: FiatCurrency[] = [
  { code: "usd", label: "USD" },
  { code: "eur", label: "EUR" },
  { code: "gbp", label: "GBP" },
  { code: "inr", label: "INR" },
  { code: "aed", label: "AED" },
];

export const REFRESH_INTERVALS: RefreshInterval[] = [
  { seconds: 15, label: "15s" },
  { seconds: 30, label: "30s" },
  { seconds: 60, label: "60s" },
];

export const DEFAULT_VS = "usd";
export const DEFAULT_REFRESH_SECONDS = 30;
export const DEFAULT_SELECTED_ID = "bitcoin";

export const FEATURED_COIN_IDS = ["bitcoin", "ethereum", "solana", "ripple", "binancecoin", "dogecoin"] as const;

export const FIAT_CODES = new Set(FIAT_CURRENCIES.map((item) => item.code));

export function isFiatCode(value: string): value is FiatCurrency["code"] {
  return FIAT_CODES.has(value.toLowerCase());
}
