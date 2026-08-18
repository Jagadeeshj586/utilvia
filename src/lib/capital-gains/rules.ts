/**
 * Indian capital-gains planning defaults for AY 2026-27 (FY 2025-26).
 * Update this file when the Finance Act, CBDT CII notification, or 112A exemption changes.
 * Sources: Finance (No. 2) Act 2024 (from 23 Jul 2024); CBDT CII Notification 70/2025 (CII 376).
 */
export const CAPITAL_GAINS_RULES = {
  assessmentYear: "AY 2026–27",
  financialYear: "FY 2025–26",
  sourceLabel: "Income Tax Department materials for AY 2026–27 (Finance (No. 2) Act 2024 rates)",
  /** Transfers on or after this date use the rewritten rates. */
  rateRewriteFrom: "2024-07-23",
  cessRate: 0.04,
  equityLtcgExemption: 1_25_000,
  equityStcgRate: 0.2,
  equityLtcgRate: 0.125,
  otherLtcgRate: 0.125,
  indexedLtcgRate: 0.2,
  propertyIndexationCutoff: "2024-07-23",
  ciiBaseYear: "2001-02",
} as const;

export type AssetTypeId = "listed-equity" | "equity-mf" | "other-securities" | "property" | "gold-other";

export type StcgMethod = "section-111a" | "slab";
export type LtcgMethod = "section-112a" | "section-112" | "section-112-indexation-choice";

export type AssetRule = {
  id: AssetTypeId;
  label: string;
  hint: string;
  holdingMonthsForLtcg: number;
  stcgMethod: StcgMethod;
  ltcgMethod: LtcgMethod;
  allowsImprovement: boolean;
  allowsSection54Exemption: boolean;
  uses112AExemption: boolean;
  sectionLabel: string;
};

export const ASSET_TYPES: AssetRule[] = [
  {
    id: "listed-equity",
    label: "Listed equity shares",
    hint: "STT-paid shares on a recognised Indian exchange",
    holdingMonthsForLtcg: 12,
    stcgMethod: "section-111a",
    ltcgMethod: "section-112a",
    allowsImprovement: false,
    allowsSection54Exemption: false,
    uses112AExemption: true,
    sectionLabel: "Sections 111A / 112A",
  },
  {
    id: "equity-mf",
    label: "Equity mutual funds",
    hint: "Equity-oriented mutual fund units with STT",
    holdingMonthsForLtcg: 12,
    stcgMethod: "section-111a",
    ltcgMethod: "section-112a",
    allowsImprovement: false,
    allowsSection54Exemption: false,
    uses112AExemption: true,
    sectionLabel: "Sections 111A / 112A",
  },
  {
    id: "other-securities",
    label: "Other securities",
    hint: "Listed bonds, debentures, and similar listed securities",
    holdingMonthsForLtcg: 12,
    stcgMethod: "slab",
    ltcgMethod: "section-112",
    allowsImprovement: false,
    allowsSection54Exemption: false,
    uses112AExemption: false,
    sectionLabel: "Section 112 (listed securities)",
  },
  {
    id: "property",
    label: "Property / real estate",
    hint: "Land, building, or both",
    holdingMonthsForLtcg: 24,
    stcgMethod: "slab",
    ltcgMethod: "section-112-indexation-choice",
    allowsImprovement: true,
    allowsSection54Exemption: true,
    uses112AExemption: false,
    sectionLabel: "Section 112",
  },
  {
    id: "gold-other",
    label: "Gold and other assets",
    hint: "Physical gold, jewellery, and other capital assets",
    holdingMonthsForLtcg: 24,
    stcgMethod: "slab",
    ltcgMethod: "section-112",
    allowsImprovement: true,
    allowsSection54Exemption: true,
    uses112AExemption: false,
    sectionLabel: "Section 112",
  },
];

/** CBDT Cost Inflation Index. Base year FY 2001–02 = 100. */
export const CII_BY_FY: Record<string, number> = {
  "2001-02": 100,
  "2002-03": 105,
  "2003-04": 109,
  "2004-05": 113,
  "2005-06": 117,
  "2006-07": 122,
  "2007-08": 129,
  "2008-09": 137,
  "2009-10": 148,
  "2010-11": 167,
  "2011-12": 184,
  "2012-13": 200,
  "2013-14": 220,
  "2014-15": 240,
  "2015-16": 254,
  "2016-17": 264,
  "2017-18": 272,
  "2018-19": 280,
  "2019-20": 289,
  "2020-21": 301,
  "2021-22": 317,
  "2022-23": 331,
  "2023-24": 348,
  "2024-25": 363,
  "2025-26": 376,
};

export const SLAB_RATE_OPTIONS = [
  { value: 5, label: "5%" },
  { value: 10, label: "10%" },
  { value: 15, label: "15%" },
  { value: 20, label: "20%" },
  { value: 25, label: "25%" },
  { value: 30, label: "30%" },
] as const;

export function getAssetRule(id: AssetTypeId): AssetRule {
  return ASSET_TYPES.find((item) => item.id === id) ?? ASSET_TYPES[0]!;
}

export function financialYearKey(isoDate: string): string | null {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return null;
  const start = parsed.month >= 4 ? parsed.year : parsed.year - 1;
  return `${start}-${String(start + 1).slice(-2)}`;
}

export function ciiForDate(isoDate: string): { fy: string; cii: number } | null {
  const fy = financialYearKey(isoDate);
  if (!fy) return null;
  const years = Object.keys(CII_BY_FY).sort();
  if (CII_BY_FY[fy] != null) return { fy, cii: CII_BY_FY[fy]! };
  if (fy < years[0]!) return { fy: years[0]!, cii: CII_BY_FY[years[0]!]! };
  const last = years[years.length - 1]!;
  if (fy > last) return { fy: last, cii: CII_BY_FY[last]! };
  return null;
}

export function parseIsoDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const utc = Date.UTC(year, month - 1, day);
  const check = new Date(utc);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return { year, month, day };
}

export function isoToUtc(isoDate: string): Date | null {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return null;
  return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
}

export function addCalendarMonths(isoDate: string, months: number): Date | null {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return null;
  const targetMonthIndex = parsed.month - 1 + months;
  const year = parsed.year + Math.floor(targetMonthIndex / 12);
  const month = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(parsed.day, lastDay);
  return new Date(Date.UTC(year, month, day));
}

export function daysBetween(fromIso: string, toIso: string): number | null {
  const from = isoToUtc(fromIso);
  const to = isoToUtc(toIso);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export function formatHoldingPeriod(fromIso: string, toIso: string): string | null {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  if (!from || !to) return null;
  let years = to.year - from.year;
  let months = to.month - from.month;
  let days = to.day - from.day;
  if (days < 0) {
    const previousMonth = new Date(Date.UTC(to.year, to.month - 1, 0)).getUTCDate();
    days += previousMonth;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  if (years < 0) return null;
  const parts: string[] = [];
  if (years) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (months) parts.push(`${months} month${months === 1 ? "" : "s"}`);
  if (days || !parts.length) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  return parts.join(", ");
}
