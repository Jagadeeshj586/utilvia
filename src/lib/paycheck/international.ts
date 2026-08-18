import { calculateIndiaTax } from "@/lib/calculators/india-tax";
import type { PaycheckInput, PaycheckResult, RegionOption, TaxBracket } from "./types";
import { applyBrackets, finishResult, resolveGrossAnnual } from "./helpers";

const IN_PT_STATES: RegionOption[] = [
  { code: "NONE", name: "No professional tax / other", rate: 0 },
  { code: "KA", name: "Karnataka", rate: 2_400 },
  { code: "MH", name: "Maharashtra", rate: 2_500 },
  { code: "TN", name: "Tamil Nadu", rate: 2_500 },
  { code: "WB", name: "West Bengal", rate: 2_500 },
  { code: "TS", name: "Telangana", rate: 2_400 },
  { code: "AP", name: "Andhra Pradesh", rate: 2_400 },
  { code: "GJ", name: "Gujarat", rate: 2_400 },
  { code: "MP", name: "Madhya Pradesh", rate: 2_500 },
  { code: "KL", name: "Kerala", rate: 2_500 },
];

const CA_PROVINCES: RegionOption[] = [
  { code: "ON", name: "Ontario", rate: 0.09 },
  { code: "BC", name: "British Columbia", rate: 0.08 },
  { code: "AB", name: "Alberta", rate: 0.08 },
  { code: "QC", name: "Quebec", rate: 0.14 },
  { code: "MB", name: "Manitoba", rate: 0.11 },
  { code: "SK", name: "Saskatchewan", rate: 0.105 },
  { code: "NS", name: "Nova Scotia", rate: 0.12 },
  { code: "NB", name: "New Brunswick", rate: 0.11 },
  { code: "NL", name: "Newfoundland and Labrador", rate: 0.11 },
  { code: "PE", name: "Prince Edward Island", rate: 0.12 },
  { code: "NT", name: "Northwest Territories", rate: 0.07 },
  { code: "NU", name: "Nunavut", rate: 0.06 },
  { code: "YT", name: "Yukon", rate: 0.07 },
];

const GB_NATIONS: RegionOption[] = [
  { code: "ENG", name: "England, Wales & Northern Ireland" },
  { code: "SCT", name: "Scotland" },
];

const UK_ENGLAND_BRACKETS: TaxBracket[] = [
  { upTo: 37_700, rate: 0.2 },
  { upTo: 125_140, rate: 0.4 },
  { upTo: Infinity, rate: 0.45 },
];

const UK_SCOTLAND_BRACKETS: TaxBracket[] = [
  { upTo: 2_827, rate: 0.19 },
  { upTo: 14_921, rate: 0.2 },
  { upTo: 31_092, rate: 0.21 },
  { upTo: 62_430, rate: 0.42 },
  { upTo: 112_570, rate: 0.45 },
  { upTo: Infinity, rate: 0.48 },
];

const CA_FEDERAL_BRACKETS: TaxBracket[] = [
  { upTo: 57_375, rate: 0.15 },
  { upTo: 114_750, rate: 0.205 },
  { upTo: 177_882, rate: 0.26 },
  { upTo: 253_414, rate: 0.29 },
  { upTo: Infinity, rate: 0.33 },
];

const AU_BRACKETS: TaxBracket[] = [
  { upTo: 18_200, rate: 0 },
  { upTo: 45_000, rate: 0.16 },
  { upTo: 135_000, rate: 0.3 },
  { upTo: 190_000, rate: 0.37 },
  { upTo: Infinity, rate: 0.45 },
];

export { IN_PT_STATES, CA_PROVINCES, GB_NATIONS, UK_ENGLAND_BRACKETS, UK_SCOTLAND_BRACKETS, CA_FEDERAL_BRACKETS, AU_BRACKETS };

export function ukPersonalAllowance(gross: number) {
  const base = 12_570;
  if (gross <= 100_000) return base;
  return Math.max(0, base - (gross - 100_000) / 2);
}

export function ukNationalInsurance(gross: number) {
  const pt = 12_570;
  const uel = 50_270;
  const band = Math.max(0, Math.min(gross, uel) - pt);
  const above = Math.max(0, gross - uel);
  return band * 0.08 + above * 0.02;
}

export function calculateIndiaPaycheck(input: PaycheckInput): PaycheckResult {
  const grossAnnual = resolveGrossAnnual(input);
  const basic = grossAnnual * 0.5;
  const epfAnnual = basic * (Math.max(0, input.contribution401kPercent) / 100);
  const healthAnnual = Math.max(0, input.healthInsuranceMonthly) * 12;
  const npsAnnual = Math.max(0, input.hsaMonthly) * 12;
  const pretaxAnnual = healthAnnual + npsAnnual;

  const tax = calculateIndiaTax({
    ctc: grossAnnual,
    regime: "new",
    fy: "2025-26",
    includeEpf: false,
  });

  const monthlyGross = grossAnnual / 12;
  const esiAnnual = monthlyGross <= 21_000 ? grossAnnual * 0.0075 : 0;
  const ptAnnual = IN_PT_STATES.find((state) => state.code === input.stateCode)?.rate ?? 0;

  const socialLines = [
    { label: "EPF (employee, 50% basic)", amount: epfAnnual },
    ...(esiAnnual > 0 ? [{ label: "ESI (0.75%)", amount: esiAnnual }] : []),
  ];
  const socialTotal = epfAnnual + esiAnnual;
  const incomeTax = tax.annualTax;
  const netAnnual = Math.max(
    0,
    grossAnnual - pretaxAnnual - incomeTax - socialTotal - ptAnnual,
  );

  return finishResult(input, {
    country: "IN",
    currency: "INR",
    flag: "🇮🇳",
    ruleNote: "Based on India FY 2025-26 new tax regime (Budget 2025) plus EPF, ESI, and professional tax",
    grossAnnual,
    pretaxAnnual,
    taxableIncome: tax.taxable,
    incomeTax,
    incomeTaxLabel: "Income Tax + 4% cess",
    regionalTax: ptAnnual,
    regionalLabel: ptAnnual === 0 ? "Professional Tax (none)" : "Professional Tax",
    socialLines,
    socialTotal,
    socialSummaryLabel: "EPF / ESI",
    netAnnual,
    marginalRate: tax.taxable > 2_400_000 ? 0.3 : tax.taxable > 2_000_000 ? 0.25 : tax.taxable > 1_600_000 ? 0.2 : tax.taxable > 1_200_000 ? 0.15 : tax.taxable > 800_000 ? 0.1 : tax.taxable > 400_000 ? 0.05 : 0,
    taxableNote: `Taxable after ₹75,000 standard deduction: ₹${Math.round(tax.taxable).toLocaleString("en-IN")}${tax.rebateApplied ? " · Section 87A rebate applied" : ""}`,
    lines: [
      { label: "Gross CTC", amount: grossAnnual },
      { label: "Health / NPS", amount: pretaxAnnual },
      { label: "Income Tax + cess", amount: incomeTax },
      ...socialLines,
      { label: ptAnnual === 0 ? "Professional Tax (none)" : "Professional Tax", amount: ptAnnual },
    ],
    summary: [
      { label: "Take-home", amount: netAnnual },
      { label: "Income tax", amount: incomeTax },
      { label: "EPF / ESI", amount: socialTotal },
    ],
    standardDeduction: tax.standardDeduction,
  });
}

export function calculateUkPaycheck(input: PaycheckInput): PaycheckResult {
  const grossAnnual = resolveGrossAnnual(input);
  const pension = grossAnnual * (Math.max(0, input.contribution401kPercent) / 100);
  const extra = (Math.max(0, input.healthInsuranceMonthly) + Math.max(0, input.hsaMonthly)) * 12;
  const pretaxAnnual = pension + extra;
  const allowance = ukPersonalAllowance(Math.max(0, grossAnnual - pretaxAnnual));
  const taxableIncome = Math.max(0, grossAnnual - pretaxAnnual - allowance);
  const scotland = input.stateCode === "SCT";
  const { tax: incomeTax, marginalRate } = applyBrackets(
    taxableIncome,
    scotland ? UK_SCOTLAND_BRACKETS : UK_ENGLAND_BRACKETS,
  );
  const ni = ukNationalInsurance(Math.max(0, grossAnnual - pension));
  const netAnnual = Math.max(0, grossAnnual - pretaxAnnual - incomeTax - ni);

  return finishResult(input, {
    country: "GB",
    currency: "GBP",
    flag: "🇬🇧",
    ruleNote: scotland
      ? "Based on UK 2025/26 Scottish Income Tax bands and Class 1 National Insurance"
      : "Based on UK 2025/26 PAYE (England/Wales/NI) and Class 1 National Insurance",
    grossAnnual,
    pretaxAnnual,
    taxableIncome,
    incomeTax,
    incomeTaxLabel: scotland ? "Scottish Income Tax" : "Income Tax (PAYE)",
    regionalTax: 0,
    regionalLabel: "Local tax (none)",
    socialLines: [{ label: "National Insurance (Class 1)", amount: ni }],
    socialTotal: ni,
    socialSummaryLabel: "NI",
    netAnnual,
    marginalRate,
    taxableNote: `Personal allowance: £${Math.round(allowance).toLocaleString("en-GB")} · Marginal rate: ${(marginalRate * 100).toFixed(0)}%`,
    lines: [
      { label: "Gross Pay", amount: grossAnnual },
      { label: "Pension / salary sacrifice", amount: pretaxAnnual },
      { label: scotland ? "Scottish Income Tax" : "Income Tax (PAYE)", amount: incomeTax },
      { label: "National Insurance (Class 1)", amount: ni },
    ],
    summary: [
      { label: "Take-home", amount: netAnnual },
      { label: "Income tax", amount: incomeTax },
      { label: "NI", amount: ni },
    ],
    standardDeduction: allowance,
  });
}

export function calculateCanadaPaycheck(input: PaycheckInput): PaycheckResult {
  const grossAnnual = resolveGrossAnnual(input);
  const rrsp = grossAnnual * (Math.max(0, input.contribution401kPercent) / 100);
  const extra = (Math.max(0, input.healthInsuranceMonthly) + Math.max(0, input.hsaMonthly)) * 12;
  const pretaxAnnual = rrsp + extra;
  const taxableIncome = Math.max(0, grossAnnual - pretaxAnnual);
  const { tax: federalBeforeCredit, marginalRate } = applyBrackets(taxableIncome, CA_FEDERAL_BRACKETS);
  const bpaCredit = 16_129 * 0.15;
  const incomeTax = Math.max(0, federalBeforeCredit - bpaCredit);

  const ympe = 71_300;
  const ybe = 3_500;
  const yampe = 81_200;
  const cpp = Math.min(Math.max(0, grossAnnual - ybe), ympe - ybe) * 0.0595;
  const cpp2 = Math.min(Math.max(0, grossAnnual - ympe), yampe - ympe) * 0.04;
  const ei = Math.min(grossAnnual, 65_700) * 0.0164;

  const province = CA_PROVINCES.find((item) => item.code === input.stateCode) ?? CA_PROVINCES[0];
  const regionalTax = taxableIncome * (province.rate ?? 0);
  const socialTotal = cpp + cpp2 + ei;
  const netAnnual = Math.max(0, grossAnnual - pretaxAnnual - incomeTax - regionalTax - socialTotal);

  const socialLines = [
    { label: "CPP (5.95%)", amount: cpp },
    ...(cpp2 > 0 ? [{ label: "CPP2 (4%)", amount: cpp2 }] : []),
    { label: "EI (1.64%)", amount: ei },
  ];

  return finishResult(input, {
    country: "CA",
    currency: "CAD",
    flag: "🇨🇦",
    ruleNote: "Based on 2025 Canadian federal tax, CPP/EI, and a simplified provincial estimate",
    grossAnnual,
    pretaxAnnual,
    taxableIncome,
    incomeTax,
    incomeTaxLabel: "Federal Income Tax",
    regionalTax,
    regionalLabel: `Provincial Tax (${province.name})`,
    socialLines,
    socialTotal,
    socialSummaryLabel: "CPP / EI",
    netAnnual,
    marginalRate,
    taxableNote: `Federal taxable after RRSP: ${Math.round(taxableIncome).toLocaleString("en-CA")} · Marginal federal bracket: ${(marginalRate * 100).toFixed(1)}%`,
    lines: [
      { label: "Gross Pay", amount: grossAnnual },
      { label: "RRSP / benefits", amount: pretaxAnnual },
      { label: "Federal Income Tax", amount: incomeTax },
      ...socialLines,
      { label: `Provincial Tax (${province.name})`, amount: regionalTax },
    ],
    summary: [
      { label: "Take-home", amount: netAnnual },
      { label: "Federal tax", amount: incomeTax },
      { label: "CPP / EI", amount: socialTotal },
    ],
    standardDeduction: 16_129,
  });
}

export function calculateAustraliaPaycheck(input: PaycheckInput): PaycheckResult {
  const grossAnnual = resolveGrossAnnual(input);
  const sacrificedSuper = grossAnnual * (Math.max(0, input.contribution401kPercent) / 100);
  const extra = (Math.max(0, input.healthInsuranceMonthly) + Math.max(0, input.hsaMonthly)) * 12;
  const pretaxAnnual = sacrificedSuper + extra;
  const taxableIncome = Math.max(0, grossAnnual - pretaxAnnual);
  const { tax: incomeTax, marginalRate } = applyBrackets(taxableIncome, AU_BRACKETS);
  const medicare = taxableIncome >= 26_000 ? taxableIncome * 0.02 : 0;
  const netAnnual = Math.max(0, grossAnnual - pretaxAnnual - incomeTax - medicare);

  return finishResult(input, {
    country: "AU",
    currency: "AUD",
    flag: "🇦🇺",
    ruleNote: "Based on Australia 2025–26 resident PAYG brackets and 2% Medicare levy (employer Super is on top of salary)",
    grossAnnual,
    pretaxAnnual,
    taxableIncome,
    incomeTax,
    incomeTaxLabel: "Income Tax (PAYG)",
    regionalTax: 0,
    regionalLabel: "State tax (none)",
    socialLines: [{ label: "Medicare levy (2%)", amount: medicare }],
    socialTotal: medicare,
    socialSummaryLabel: "Medicare",
    netAnnual,
    marginalRate,
    taxableNote: `Taxable income: ${Math.round(taxableIncome).toLocaleString("en-AU")} · Marginal bracket: ${(marginalRate * 100).toFixed(0)}%`,
    lines: [
      { label: "Gross Pay", amount: grossAnnual },
      { label: "Salary-sacrificed super / extras", amount: pretaxAnnual },
      { label: "Income Tax (PAYG)", amount: incomeTax },
      { label: "Medicare levy (2%)", amount: medicare },
    ],
    summary: [
      { label: "Take-home", amount: netAnnual },
      { label: "Income tax", amount: incomeTax },
      { label: "Medicare", amount: medicare },
    ],
    standardDeduction: 18_200,
  });
}

export function calculateUaePaycheck(input: PaycheckInput): PaycheckResult {
  const grossAnnual = resolveGrossAnnual(input);
  const pension = grossAnnual * (Math.max(0, input.contribution401kPercent) / 100);
  const extra = (Math.max(0, input.healthInsuranceMonthly) + Math.max(0, input.hsaMonthly)) * 12;
  const pretaxAnnual = pension + extra;
  const netAnnual = Math.max(0, grossAnnual - pretaxAnnual);

  return finishResult(input, {
    country: "AE",
    currency: "AED",
    flag: "🇦🇪",
    ruleNote: "UAE has no federal personal income tax on salary — net equals gross minus optional deductions",
    grossAnnual,
    pretaxAnnual,
    taxableIncome: 0,
    incomeTax: 0,
    incomeTaxLabel: "Income Tax (none)",
    regionalTax: 0,
    regionalLabel: "Emirate tax (none)",
    socialLines: [],
    socialTotal: 0,
    socialSummaryLabel: "Social",
    netAnnual,
    marginalRate: 0,
    taxableNote: "No personal income tax or mandatory salary social contributions in this estimate.",
    lines: [
      { label: "Gross Pay", amount: grossAnnual },
      { label: "Optional deductions", amount: pretaxAnnual },
      { label: "Income Tax", amount: 0 },
    ],
    summary: [
      { label: "Take-home", amount: netAnnual },
      { label: "Income tax", amount: 0 },
      { label: "Social", amount: 0 },
    ],
    standardDeduction: 0,
  });
}
