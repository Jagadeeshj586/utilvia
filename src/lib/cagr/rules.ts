/** Indian CAGR planning defaults. Update inflation and benchmark bands when they change. */
export const CAGR_RULES = {
  rulesLabel: "Based on Indian investment return benchmarks — FY 2026-27",
  inflationPercent: 6,
  niftyMinPercent: 12,
  niftyMaxPercent: 15,
  defaultMode: "find-cagr" as const,
  defaultInitial: 1_00_000,
  defaultFinal: 1_76_234,
  defaultTarget: 5_00_000,
  defaultCagrPercent: 12,
  defaultYears: 5,
  minValue: 1,
  maxValue: 1_00_00_00_000,
  minYears: 0.1,
  maxYears: 50,
  minCagrPercent: 0,
  maxCagrPercent: 50,
  minInflationPercent: 0,
  maxInflationPercent: 20,
  benchmarks: [
    { name: "Savings Account", range: "3–4%" },
    { name: "FD (1–3 yr)", range: "6.5–7.5%" },
    { name: "PPF", range: "7.1%" },
    { name: "Nifty 50 (10yr avg)", range: "12–15%" },
    { name: "Mid Cap MF (10yr)", range: "14–17%" },
  ],
} as const;

export type CagrMode = "find-cagr" | "find-fv" | "find-required";
export type NiftyComparison = "below" | "within" | "above";
