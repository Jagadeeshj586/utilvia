import { DEFAULT_AMOUNT, getCurrency } from "./currencies";

export { CURRENCIES, POPULAR_PAIRS, DEFAULT_FROM, DEFAULT_TO, DEFAULT_AMOUNT, getCurrency, currencyLabel, filterCurrencies } from "./currencies";
export { CURRENCY_RATE_API, fetchRates, parseRatesResponse, quoteFromPayload, rateLookupErrorMessage } from "./api";
export type { RateQuote } from "./api";

export const CURRENCY_FAQS = [
  {
    question: "Where do the exchange rates come from?",
    answer:
      "Mid-market rates are fetched from a public feed (ExchangeRate-API, with Frankfurter as fallback). Banks and card networks add their own spread, so the number you pay can differ.",
  },
  {
    question: "How often are rates updated?",
    answer:
      "The converter refreshes when you change the from-currency or tap Refresh. Quotes are cached for 15 minutes. The last update time from the provider is shown under the result.",
  },
  {
    question: "Can I convert Indian rupees and UAE dirhams?",
    answer:
      "Yes. The list includes INR, AED, and other widely used currencies. Search by country, currency name, or ISO code.",
  },
  {
    question: "Is this the rate my bank will use?",
    answer:
      "No. These are approximate mid-market rates. The rate on a card payment, wire, or cash exchange depends on the provider and the time of the transaction.",
  },
  {
    question: "Does the converter send my amount to a server?",
    answer:
      "No. Only the from-currency code is requested from the rate API. The amount is converted locally in your browser.",
  },
] as const;

export function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  const firstDot = cleaned.indexOf(".");
  const normalized =
    firstDot === -1 ? cleaned : `${cleaned.slice(0, firstDot + 1)}${cleaned.slice(firstDot + 1).replace(/\./g, "")}`;
  return Number(normalized);
}

export function validateAmount(raw: string) {
  if (!raw.trim()) return "Enter an amount.";
  const value = parseAmount(raw);
  if (!Number.isFinite(value)) return "Enter a valid number.";
  if (value < 0) return "Amount cannot be negative.";
  if (value > 1e12) return "Enter a smaller amount.";
  return null;
}

export function currencyFractionDigits(code: string) {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: code }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

export function formatMoney(amount: number, currency: string, locale = "en") {
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currencyFractionDigits(currency),
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale, { maximumFractionDigits: 2 })} ${currency}`;
  }
}

export function formatRate(rate: number) {
  if (!Number.isFinite(rate) || rate <= 0) return "—";
  if (rate >= 100) return rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (rate >= 1) return rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return rate.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

export function convertAmount(amount: number, rate: number) {
  if (!Number.isFinite(amount) || !Number.isFinite(rate)) return NaN;
  return amount * rate;
}

export function inverseRate(rate: number) {
  if (!Number.isFinite(rate) || rate === 0) return NaN;
  return 1 / rate;
}

export function lookupRate(rates: Record<string, number> | null, from: string, to: string, base?: string) {
  if (from === to) return 1;
  if (!rates) return null;
  if (base && base !== from) return null;
  const value = rates[to];
  return Number.isFinite(value) ? value : null;
}

export function formatUpdatedAt(date: Date | null) {
  if (!date || Number.isNaN(date.getTime())) return null;
  // Avoid dateStyle + timeZoneName together — Safari 15 throws RangeError.
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  } catch {
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
    } catch {
      return date.toLocaleString();
    }
  }
}

export function resultCopyText(amount: number, from: string, converted: number, to: string) {
  const fromLabel = getCurrency(from)?.code ?? from;
  const toLabel = getCurrency(to)?.code ?? to;
  return `${formatMoney(amount, fromLabel)} = ${formatMoney(converted, toLabel)}`;
}

export function defaultAmountDraft() {
  return DEFAULT_AMOUNT;
}
