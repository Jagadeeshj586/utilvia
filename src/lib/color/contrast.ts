import { hexToRgb } from "./conversion";
import type { RGB } from "./types";

function relativeLuminanceChannel(channel: number) {
  const srgb = channel / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(rgb: RGB) {
  return (
    0.2126 * relativeLuminanceChannel(rgb.r) +
    0.7152 * relativeLuminanceChannel(rgb.g) +
    0.0722 * relativeLuminanceChannel(rgb.b)
  );
}

export function contrastRatio(foreground: string, background: string) {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!fg || !bg) return null;
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type WcagLevel = "pass" | "fail";

export type WcagResults = {
  normalAA: WcagLevel;
  normalAAA: WcagLevel;
  largeAA: WcagLevel;
  largeAAA: WcagLevel;
};

/** WCAG 2.1 thresholds used by WorkUtilities color contrast tool. */
export const WCAG_THRESHOLDS = {
  normalAA: 4.5,
  largeAA: 3,
  normalAAA: 7,
  largeAAA: 4.5,
} as const;

export function wcagResults(ratio: number): WcagResults {
  return {
    normalAA: ratio >= WCAG_THRESHOLDS.normalAA ? "pass" : "fail",
    normalAAA: ratio >= WCAG_THRESHOLDS.normalAAA ? "pass" : "fail",
    largeAA: ratio >= WCAG_THRESHOLDS.largeAA ? "pass" : "fail",
    largeAAA: ratio >= WCAG_THRESHOLDS.largeAAA ? "pass" : "fail",
  };
}

export type WcagBadge = {
  id: keyof WcagResults;
  label: string;
  threshold: number;
  level: WcagLevel;
};

export function wcagBadges(ratio: number): WcagBadge[] {
  const results = wcagResults(ratio);
  return [
    { id: "normalAA", label: "AA Normal", threshold: WCAG_THRESHOLDS.normalAA, level: results.normalAA },
    { id: "largeAA", label: "AA Large", threshold: WCAG_THRESHOLDS.largeAA, level: results.largeAA },
    { id: "normalAAA", label: "AAA Normal", threshold: WCAG_THRESHOLDS.normalAAA, level: results.normalAAA },
    { id: "largeAAA", label: "AAA Large", threshold: WCAG_THRESHOLDS.largeAAA, level: results.largeAAA },
  ];
}

export function formatContrastRatio(ratio: number) {
  return `${ratio.toFixed(2)}:1`;
}

export function contrastSummary(ratio: number) {
  const wcag = wcagResults(ratio);
  if (wcag.normalAAA === "pass") return "Excellent contrast. This combination meets WCAG AAA for normal text.";
  if (wcag.normalAA === "pass") return "Good contrast. This combination meets WCAG AA for normal text.";
  if (wcag.largeAA === "pass") return "Usable for large text only. Normal body text may be hard to read.";
  return "Poor contrast. Consider adjusting foreground or background colors.";
}

export const COLOR_CONTRAST_FAQS = [
  {
    question: "What is a good contrast ratio?",
    answer: "WCAG AA requires 4.5:1 for normal text and 3:1 for large text. AAA requires 7:1 and 4.5:1.",
  },
  {
    question: "What counts as large text?",
    answer: "18pt (24px) regular or 14pt (18.5px) bold text qualifies as large.",
  },
  {
    question: "Can I swap foreground and background?",
    answer: "Yes. Click Swap colors to reverse the two colors instantly.",
  },
  {
    question: "What color formats work?",
    answer: "Enter 6-digit hex values like #000000 and #FFFFFF. 3-digit shorthand such as #fff is also accepted.",
  },
  {
    question: "Is color contrast checker free?",
    answer: "Yes. The Utilvia Color Contrast Checker is free with no signup required.",
  },
] as const;
