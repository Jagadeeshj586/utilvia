export type DiscountMode = "percent-off" | "find-percent" | "find-original";

export const DISCOUNT_PRESETS = [5, 10, 20, 25, 30, 50, 70] as const;

export type DiscountInput = {
  mode: DiscountMode;
  originalPrice?: number;
  finalPrice?: number;
  discountPercent?: number;
};

export type DiscountResult = {
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercent: number;
  error: string | null;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculateDiscount(input: DiscountInput): DiscountResult {
  const empty: DiscountResult = {
    originalPrice: 0,
    finalPrice: 0,
    discountAmount: 0,
    discountPercent: 0,
    error: null,
  };

  if (input.mode === "percent-off") {
    const original = input.originalPrice ?? 0;
    const percent = input.discountPercent ?? 0;
    if (!Number.isFinite(original) || original < 0) {
      return { ...empty, error: "Enter a valid original price." };
    }
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return { ...empty, error: "Enter a discount between 0 and 100." };
    }
    const discountAmount = roundMoney(original * (percent / 100));
    const finalPrice = roundMoney(original - discountAmount);
    return {
      originalPrice: roundMoney(original),
      finalPrice,
      discountAmount,
      discountPercent: roundPercent(percent),
      error: null,
    };
  }

  if (input.mode === "find-percent") {
    const original = input.originalPrice ?? 0;
    const final = input.finalPrice ?? 0;
    if (!Number.isFinite(original) || original <= 0) {
      return { ...empty, error: "Enter an original price greater than 0." };
    }
    if (!Number.isFinite(final) || final < 0) {
      return { ...empty, error: "Enter a valid final price." };
    }
    if (final > original) {
      return { ...empty, error: "Final price cannot be higher than the original price." };
    }
    const discountAmount = roundMoney(original - final);
    const discountPercent = roundPercent((discountAmount / original) * 100);
    return {
      originalPrice: roundMoney(original),
      finalPrice: roundMoney(final),
      discountAmount,
      discountPercent,
      error: null,
    };
  }

  const final = input.finalPrice ?? 0;
  const percent = input.discountPercent ?? 0;
  if (!Number.isFinite(final) || final < 0) {
    return { ...empty, error: "Enter a valid final price." };
  }
  if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
    return { ...empty, error: "Enter a discount between 0 and 100." };
  }
  const originalPrice = roundMoney(final / (1 - percent / 100));
  const discountAmount = roundMoney(originalPrice - final);
  return {
    originalPrice,
    finalPrice: roundMoney(final),
    discountAmount,
    discountPercent: roundPercent(percent),
    error: null,
  };
}

export const DISCOUNT_FAQS = [
  {
    question: "How to calculate discount percentage?",
    answer: "Use Find % mode. Enter the original price and final sale price to see the discount percentage and amount saved.",
  },
  {
    question: "How to find sale price after discount?",
    answer: "Use % Off mode. Enter the original price and discount percentage to get the final sale price and savings.",
  },
  {
    question: "How to find original price from sale price?",
    answer: "Use Original Price mode. Enter the final sale price and discount percentage to reverse-calculate the original price.",
  },
  {
    question: "What quick discount presets are available?",
    answer: "Quick preset buttons include 5%, 10%, 20%, 25%, 30%, 50%, and 70% for fast shopping calculations.",
  },
  {
    question: "Is the discount calculator free?",
    answer: "Yes. This discount calculator is free to use and runs entirely in your browser with no sign-up required.",
  },
] as const;
