export function formatCryptoPrice(value: number | null, currency: string) {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const digits = abs >= 1000 ? 2 : abs >= 1 ? 4 : abs >= 0.01 ? 6 : 8;
  const code = currency.toUpperCase();
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      minimumFractionDigits: Math.min(2, digits),
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${value.toLocaleString("en", { maximumFractionDigits: digits })} ${code}`;
  }
}

export function formatCompactFiat(value: number | null, currency: string) {
  if (value == null || !Number.isFinite(value)) return "—";
  const code = currency.toUpperCase();
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T ${code}`;
    if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B ${code}`;
    if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M ${code}`;
    return `${value.toLocaleString("en", { maximumFractionDigits: 0 })} ${code}`;
  }
}

export function formatPercentChange(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function changeDirection(value: number | null): "up" | "down" | "flat" {
  if (value == null || !Number.isFinite(value) || Math.abs(value) < 0.005) return "flat";
  return value > 0 ? "up" : "down";
}

export function formatUpdatedAt(date: Date | null) {
  if (!date || Number.isNaN(date.getTime())) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date);
  } catch {
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" }).format(date);
    } catch {
      return date.toLocaleString();
    }
  }
}

export function sparklineToSeries(prices: number[], maxPoints = 48) {
  if (!prices.length) return [];
  const step = Math.max(1, Math.ceil(prices.length / maxPoints));
  const sampled: number[] = [];
  for (let i = 0; i < prices.length; i += step) sampled.push(prices[i]!);
  if (sampled[sampled.length - 1] !== prices[prices.length - 1]) sampled.push(prices[prices.length - 1]!);
  return sampled.map((price, index) => ({ i: index, price }));
}

export function filterCoins<T extends { id: string; name: string; symbol: string }>(coins: T[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return coins;
  return coins.filter((coin) => {
    const hay = `${coin.id} ${coin.name} ${coin.symbol}`.toLowerCase();
    return hay.includes(needle);
  });
}
