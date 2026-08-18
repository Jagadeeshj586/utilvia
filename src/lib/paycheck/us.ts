import type { FilingStatus, PaycheckInput, PaycheckResult, TaxBracket } from "./types";
import { applyBrackets, finishResult, formatMoney, resolveGrossAnnual } from "./helpers";

/** Tax year 2026 standard deductions (Rev. Proc. 2025-32). */
export const STANDARD_DEDUCTION_2026: Record<FilingStatus, number> = {
  single: 16_100,
  "married-joint": 32_200,
  "head-of-household": 24_150,
};

/** Tax year 2026 ordinary income brackets (Tax Foundation / Rev. Proc. 2025-32). */
export const FEDERAL_BRACKETS_2026: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { upTo: 12_400, rate: 0.1 },
    { upTo: 50_400, rate: 0.12 },
    { upTo: 105_700, rate: 0.22 },
    { upTo: 201_775, rate: 0.24 },
    { upTo: 256_225, rate: 0.32 },
    { upTo: 640_600, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  "married-joint": [
    { upTo: 24_800, rate: 0.1 },
    { upTo: 100_800, rate: 0.12 },
    { upTo: 211_400, rate: 0.22 },
    { upTo: 403_550, rate: 0.24 },
    { upTo: 512_450, rate: 0.32 },
    { upTo: 768_700, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  "head-of-household": [
    { upTo: 17_700, rate: 0.1 },
    { upTo: 67_450, rate: 0.12 },
    { upTo: 105_700, rate: 0.22 },
    { upTo: 201_775, rate: 0.24 },
    { upTo: 256_200, rate: 0.32 },
    { upTo: 640_600, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
};

export const FICA_2026 = {
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 184_500,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: {
    single: 200_000,
    "married-joint": 250_000,
    "head-of-household": 200_000,
  } as Record<FilingStatus, number>,
};

/** Simplified flat effective state income-tax rates for estimate-only use. */
export const STATE_TAX_RATES: Array<{ code: string; name: string; rate: number }> = [
  { code: "AL", name: "Alabama", rate: 0.04 },
  { code: "AK", name: "Alaska", rate: 0 },
  { code: "AZ", name: "Arizona", rate: 0.025 },
  { code: "AR", name: "Arkansas", rate: 0.039 },
  { code: "CA", name: "California", rate: 0.06 },
  { code: "CO", name: "Colorado", rate: 0.044 },
  { code: "CT", name: "Connecticut", rate: 0.05 },
  { code: "DE", name: "Delaware", rate: 0.055 },
  { code: "DC", name: "District of Columbia", rate: 0.06 },
  { code: "FL", name: "Florida", rate: 0 },
  { code: "GA", name: "Georgia", rate: 0.0539 },
  { code: "HI", name: "Hawaii", rate: 0.07 },
  { code: "ID", name: "Idaho", rate: 0.058 },
  { code: "IL", name: "Illinois", rate: 0.0495 },
  { code: "IN", name: "Indiana", rate: 0.0305 },
  { code: "IA", name: "Iowa", rate: 0.038 },
  { code: "KS", name: "Kansas", rate: 0.052 },
  { code: "KY", name: "Kentucky", rate: 0.04 },
  { code: "LA", name: "Louisiana", rate: 0.03 },
  { code: "ME", name: "Maine", rate: 0.058 },
  { code: "MD", name: "Maryland", rate: 0.05 },
  { code: "MA", name: "Massachusetts", rate: 0.05 },
  { code: "MI", name: "Michigan", rate: 0.0425 },
  { code: "MN", name: "Minnesota", rate: 0.07 },
  { code: "MS", name: "Mississippi", rate: 0.04 },
  { code: "MO", name: "Missouri", rate: 0.04 },
  { code: "MT", name: "Montana", rate: 0.047 },
  { code: "NE", name: "Nebraska", rate: 0.05 },
  { code: "NV", name: "Nevada", rate: 0 },
  { code: "NH", name: "New Hampshire", rate: 0 },
  { code: "NJ", name: "New Jersey", rate: 0.055 },
  { code: "NM", name: "New Mexico", rate: 0.045 },
  { code: "NY", name: "New York", rate: 0.06 },
  { code: "NC", name: "North Carolina", rate: 0.0425 },
  { code: "ND", name: "North Dakota", rate: 0.02 },
  { code: "OH", name: "Ohio", rate: 0.03 },
  { code: "OK", name: "Oklahoma", rate: 0.045 },
  { code: "OR", name: "Oregon", rate: 0.08 },
  { code: "PA", name: "Pennsylvania", rate: 0.0307 },
  { code: "RI", name: "Rhode Island", rate: 0.05 },
  { code: "SC", name: "South Carolina", rate: 0.05 },
  { code: "SD", name: "South Dakota", rate: 0 },
  { code: "TN", name: "Tennessee", rate: 0 },
  { code: "TX", name: "Texas", rate: 0 },
  { code: "UT", name: "Utah", rate: 0.0465 },
  { code: "VT", name: "Vermont", rate: 0.06 },
  { code: "VA", name: "Virginia", rate: 0.05 },
  { code: "WA", name: "Washington", rate: 0 },
  { code: "WV", name: "West Virginia", rate: 0.05 },
  { code: "WI", name: "Wisconsin", rate: 0.055 },
  { code: "WY", name: "Wyoming", rate: 0 },
];

export function calculateFederalTax(taxableIncome: number, filingStatus: FilingStatus) {
  return applyBrackets(taxableIncome, FEDERAL_BRACKETS_2026[filingStatus]);
}

export function calculateFica(grossAnnual: number, filingStatus: FilingStatus) {
  const wages = Math.max(0, grossAnnual);
  const socialSecurity = Math.min(wages, FICA_2026.socialSecurityWageBase) * FICA_2026.socialSecurityRate;
  const medicare = wages * FICA_2026.medicareRate;
  const threshold = FICA_2026.additionalMedicareThreshold[filingStatus];
  const additionalMedicare = Math.max(0, wages - threshold) * FICA_2026.additionalMedicareRate;
  return {
    socialSecurity,
    medicare,
    additionalMedicare,
    fica: socialSecurity + medicare + additionalMedicare,
  };
}

export function getStateTaxInfo(stateCode: string) {
  return STATE_TAX_RATES.find((state) => state.code === stateCode) ?? STATE_TAX_RATES.find((state) => state.code === "FL")!;
}

export function calculateStateTax(grossAfterPretax: number, stateCode: string) {
  const state = getStateTaxInfo(stateCode);
  const taxable = Math.max(0, grossAfterPretax);
  return {
    stateTax: taxable * state.rate,
    stateLabel: state.rate === 0 ? "State Tax (no income tax)" : `State Tax (${state.name})`,
    rate: state.rate,
  };
}

export function calculateUsPaycheck(input: PaycheckInput): PaycheckResult {
  const grossAnnual = resolveGrossAnnual(input);
  const contribution401k = grossAnnual * (Math.max(0, input.contribution401kPercent) / 100);
  const healthAnnual = Math.max(0, input.healthInsuranceMonthly) * 12;
  const hsaAnnual = Math.max(0, input.hsaMonthly) * 12;
  const pretaxAnnual = contribution401k + healthAnnual + hsaAnnual;

  const standardDeduction = STANDARD_DEDUCTION_2026[input.filingStatus];
  const taxableIncome = Math.max(0, grossAnnual - pretaxAnnual - standardDeduction);
  const { tax: incomeTax, marginalRate } = calculateFederalTax(taxableIncome, input.filingStatus);
  const fica = calculateFica(grossAnnual, input.filingStatus);
  const state = calculateStateTax(grossAnnual - pretaxAnnual, input.stateCode);

  const netAnnual = Math.max(0, grossAnnual - pretaxAnnual - incomeTax - fica.fica - state.stateTax);
  const socialLines = [
    { label: "Social Security (6.2%)", amount: fica.socialSecurity },
    { label: "Medicare (1.45%)", amount: fica.medicare },
    ...(fica.additionalMedicare > 0
      ? [{ label: "Additional Medicare (0.9%)", amount: fica.additionalMedicare }]
      : []),
  ];

  return finishResult(input, {
    country: "US",
    currency: "USD",
    flag: "🇺🇸",
    ruleNote: "Based on 2026 US Federal tax rules (IRS Rev. Proc. 2025-32)",
    grossAnnual,
    pretaxAnnual,
    taxableIncome,
    incomeTax,
    incomeTaxLabel: "Federal Income Tax",
    regionalTax: state.stateTax,
    regionalLabel: state.stateLabel,
    socialLines,
    socialTotal: fica.fica,
    socialSummaryLabel: "FICA",
    netAnnual,
    marginalRate,
    taxableNote: `Federal taxable income after standard deduction: ${formatMoney(taxableIncome, "USD", 0)} · Marginal federal bracket: ${(marginalRate * 100).toFixed(0)}%`,
    lines: [
      { label: "Gross Pay", amount: grossAnnual },
      { label: "Pre-tax Deductions", amount: pretaxAnnual },
      { label: "Federal Income Tax", amount: incomeTax },
      ...socialLines,
      { label: state.stateLabel, amount: state.stateTax },
    ],
    summary: [
      { label: "Take-home", amount: netAnnual },
      { label: "Federal tax", amount: incomeTax },
      { label: "FICA", amount: fica.fica },
    ],
    socialSecurity: fica.socialSecurity,
    medicare: fica.medicare,
    additionalMedicare: fica.additionalMedicare,
    fica: fica.fica,
    stateTax: state.stateTax,
    stateLabel: state.stateLabel,
    standardDeduction,
  });
}
