export const DIVIDEND_RULES = {
  rulesLabel: "Based on Indian dividend tax rules — TDS @ 10% above ₹5,000/company",
  tdsRatePercent: 10,
  tdsThreshold: 5_000,
  nriTdsPercent: 20,
  fdRatePercent: 7,
  maxStocks: 5,
  defaultDps: 25,
  defaultPrice: 400,
  defaultPurchase: 300,
  defaultShares: 100,
  minAmount: 0.01,
  maxDps: 10_000,
  maxPrice: 1_00_000,
  maxShares: 1_00_00_000,
} as const;

export type DividendMode = "single" | "portfolio";
export type DividendFrequency = "annual" | "semi-annual" | "quarterly";

export const FREQUENCY_OPTIONS: { id: DividendFrequency; label: string; payouts: number }[] = [
  { id: "annual", label: "Annual", payouts: 1 },
  { id: "semi-annual", label: "Semi-Annual", payouts: 2 },
  { id: "quarterly", label: "Quarterly", payouts: 4 },
];

export type DividendHolding = {
  name: string;
  dps: number;
  price: number;
  shares: number;
};

export type DividendInput = {
  mode: DividendMode;
  dps: number;
  price: number;
  purchase: number;
  shares: number;
  frequency: DividendFrequency;
  holdings: DividendHolding[];
};

export type DividendTds = {
  applies: boolean;
  tds: number;
  net: number;
};

export type DividendHoldingRow = DividendHolding & {
  income: number;
  yieldPercent: number;
  tds: DividendTds;
};

export type DividendSingleResult = {
  mode: "single";
  currentYield: number;
  yieldOnCost: number;
  annualIncome: number;
  monthlyIncome: number;
  payouts: number;
  perPayoutDps: number;
  investment: number;
  fdIncome: number;
  fdHigher: boolean;
  tds: DividendTds;
};

export type DividendPortfolioResult = {
  mode: "portfolio";
  weightedYield: number;
  annualIncome: number;
  monthlyIncome: number;
  marketValue: number;
  tds: DividendTds;
  rows: DividendHoldingRow[];
};

export type DividendResult = DividendSingleResult | DividendPortfolioResult;

export type DividendErrors = Partial<
  Record<"dps" | "price" | "purchase" | "shares" | "holdings", string>
>;

export const DEFAULT_HOLDING: DividendHolding = {
  name: "Stock 1",
  dps: DIVIDEND_RULES.defaultDps,
  price: DIVIDEND_RULES.defaultPrice,
  shares: DIVIDEND_RULES.defaultShares,
};

export const DEFAULT_DIVIDEND_INPUT: DividendInput = {
  mode: "single",
  dps: DIVIDEND_RULES.defaultDps,
  price: DIVIDEND_RULES.defaultPrice,
  purchase: DIVIDEND_RULES.defaultPurchase,
  shares: DIVIDEND_RULES.defaultShares,
  frequency: "annual",
  holdings: [{ ...DEFAULT_HOLDING }],
};

function rupees(value: number) {
  return Math.round(value);
}

export function payoutsFor(frequency: DividendFrequency) {
  return FREQUENCY_OPTIONS.find((item) => item.id === frequency)?.payouts ?? 1;
}

export function yieldPercent(dps: number, price: number) {
  if (!Number.isFinite(dps) || !Number.isFinite(price) || price <= 0) return 0;
  return (dps / price) * 100;
}

export function formatYield(value: number) {
  return `${value.toFixed(2)}%`;
}

export function tdsOnCompany(annualIncome: number): DividendTds {
  const income = Math.max(0, annualIncome);
  if (income <= DIVIDEND_RULES.tdsThreshold) {
    return { applies: false, tds: 0, net: rupees(income) };
  }
  const tds = rupees((income * DIVIDEND_RULES.tdsRatePercent) / 100);
  return { applies: true, tds, net: rupees(income) - tds };
}

function inRange(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

export function validateDividend(input: DividendInput): DividendErrors {
  const errors: DividendErrors = {};
  if (input.mode === "single") {
    if (!inRange(input.dps, DIVIDEND_RULES.minAmount, DIVIDEND_RULES.maxDps)) {
      errors.dps = "Enter annual dividend per share.";
    }
    if (!inRange(input.price, DIVIDEND_RULES.minAmount, DIVIDEND_RULES.maxPrice)) {
      errors.price = "Enter the current market price.";
    }
    if (!inRange(input.purchase, DIVIDEND_RULES.minAmount, DIVIDEND_RULES.maxPrice)) {
      errors.purchase = "Enter your purchase price.";
    }
    if (!inRange(input.shares, 1, DIVIDEND_RULES.maxShares)) {
      errors.shares = "Enter the number of shares held.";
    }
    return errors;
  }

  const usable = input.holdings.filter(
    (row) =>
      inRange(row.dps, DIVIDEND_RULES.minAmount, DIVIDEND_RULES.maxDps) &&
      inRange(row.price, DIVIDEND_RULES.minAmount, DIVIDEND_RULES.maxPrice) &&
      inRange(row.shares, 1, DIVIDEND_RULES.maxShares),
  );
  if (usable.length === 0) {
    errors.holdings = "Add at least one stock with dividend, price, and shares.";
  }
  return errors;
}

export function hasDividendErrors(errors: DividendErrors) {
  return Object.keys(errors).length > 0;
}

export function calculateDividend(input: DividendInput): DividendResult | null {
  if (hasDividendErrors(validateDividend(input))) return null;

  if (input.mode === "portfolio") {
    const rows: DividendHoldingRow[] = input.holdings.map((holding) => {
      const income = rupees(holding.dps * holding.shares);
      return {
        ...holding,
        income,
        yieldPercent: yieldPercent(holding.dps, holding.price),
        tds: tdsOnCompany(income),
      };
    });
    const usable = rows.filter((row) => row.price > 0 && row.shares > 0 && row.dps > 0);
    const annualIncome = usable.reduce((sum, row) => sum + row.income, 0);
    const marketValue = usable.reduce((sum, row) => sum + row.price * row.shares, 0);
    const tdsTotal = usable.reduce((sum, row) => sum + row.tds.tds, 0);
    return {
      mode: "portfolio",
      weightedYield: marketValue > 0 ? (annualIncome / marketValue) * 100 : 0,
      annualIncome,
      monthlyIncome: rupees(annualIncome / 12),
      marketValue: rupees(marketValue),
      tds: {
        applies: tdsTotal > 0,
        tds: tdsTotal,
        net: annualIncome - tdsTotal,
      },
      rows: usable,
    };
  }

  const annualIncome = rupees(input.dps * input.shares);
  const investment = rupees(input.purchase * input.shares);
  const fdIncome = rupees((investment * DIVIDEND_RULES.fdRatePercent) / 100);
  const payouts = payoutsFor(input.frequency);
  return {
    mode: "single",
    currentYield: yieldPercent(input.dps, input.price),
    yieldOnCost: yieldPercent(input.dps, input.purchase),
    annualIncome,
    monthlyIncome: rupees(annualIncome / 12),
    payouts,
    perPayoutDps: input.dps / payouts,
    investment,
    fdIncome,
    fdHigher: annualIncome > fdIncome,
    tds: tdsOnCompany(annualIncome),
  };
}

export function dividendCopyText(result: DividendResult) {
  if (result.mode === "portfolio") {
    return `Portfolio yield: ${formatYield(result.weightedYield)}`;
  }
  return `Current yield: ${formatYield(result.currentYield)}`;
}

export const DIVIDEND_FAQS = [
  {
    question: "How is dividend yield calculated?",
    answer:
      "Dividend Yield = (Annual Dividend Per Share ÷ Current Market Price) × 100. For example, if a stock pays ₹20 annual dividend and trades at ₹400, the yield is 5%. Yield on Cost uses your purchase price instead of the current market price.",
  },
  {
    question: "Is dividend income taxable in India?",
    answer:
      "Yes — dividend income is fully taxable as Income from Other Sources at your applicable income tax slab rate. Companies deduct 10% TDS if the total dividend paid to you from a single company exceeds ₹5,000. NRIs are taxed at 20% TDS.",
  },
  {
    question: "What is a good dividend yield for Indian stocks?",
    answer:
      "A yield of 2–4% is considered healthy for Indian blue-chip stocks. PSU companies often offer 5–8%. Above 8% may be a warning sign — a very high yield can mean the stock price has fallen due to business trouble.",
  },
  {
    question: "What is the difference between dividend yield and dividend payout ratio?",
    answer:
      "Dividend yield compares the dividend to the stock price — useful for investors evaluating income return. Dividend payout ratio compares dividends to the company's earnings — useful for assessing whether the payout is sustainable.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Your numbers stay on your device.",
  },
];
