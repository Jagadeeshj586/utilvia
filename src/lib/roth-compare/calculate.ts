export const ROTH_COMPARE_RULES = {
  rulesLabel: "Based on 2026 IRS rules — Traditional vs Roth comparison",
  taxYear: 2026,
  k401LimitUnder50: 24_500,
  iraLimitUnder50: 7_500,
  iraCatchUp: 1_100,
  iraCatchUpAge: 50,
  rothIraSingleUpper: 168_000,
  rothIraMfjUpper: 252_000,
  rmdAge: 73,
  federalBrackets: [10, 12, 22, 24, 32, 35, 37] as const,
  defaultCurrentAge: 30,
  defaultRetirementAge: 65,
  defaultContribution: 10_000,
  defaultFederalNow: 22,
  defaultFederalLater: 22,
  defaultStateTax: 5,
  defaultReturn: 7,
  minCurrentAge: 18,
  maxCurrentAge: 70,
  minRetirementAge: 40,
  maxRetirementAge: 80,
  minContribution: 0,
  maxContribution: 100_000,
  minStateTax: 0,
  maxStateTax: 20,
  minReturn: 0,
  maxReturn: 15,
} as const;

export type RothCompareAccountId = "traditional" | "roth401k" | "rothIra";
export type RothCompareVerdict = "traditional" | "roth" | "equal";

export type RothCompareInput = {
  currentAge: number;
  retirementAge: number;
  contribution: number;
  federalNow: number;
  federalLater: number;
  stateTax: number;
  returnPercent: number;
};

export type RothCompareAccount = {
  id: RothCompareAccountId;
  label: string;
  annualContribution: number;
  taxSavingToday: number;
  netAnnualCost: number;
  futureBalance: number;
  taxOnWithdrawal: number;
  netRetirement: number;
  rmdsRequired: boolean;
};

export type RothCompareResult = {
  years: number;
  combinedNow: number;
  combinedLater: number;
  iraLimit: number;
  iraCapped: boolean;
  verdict: RothCompareVerdict;
  verdictTitle: string;
  verdictBody: string;
  copyLabel: string;
  copyValue: number;
  winnerNetId: RothCompareAccountId;
  accounts: RothCompareAccount[];
};

export type RothCompareErrors = Partial<
  Record<"currentAge" | "retirementAge" | "contribution" | "stateTax" | "returnPercent", string>
>;

export const DEFAULT_ROTH_COMPARE_INPUT: RothCompareInput = {
  currentAge: ROTH_COMPARE_RULES.defaultCurrentAge,
  retirementAge: ROTH_COMPARE_RULES.defaultRetirementAge,
  contribution: ROTH_COMPARE_RULES.defaultContribution,
  federalNow: ROTH_COMPARE_RULES.defaultFederalNow,
  federalLater: ROTH_COMPARE_RULES.defaultFederalLater,
  stateTax: ROTH_COMPARE_RULES.defaultStateTax,
  returnPercent: ROTH_COMPARE_RULES.defaultReturn,
};

export function iraContributionLimit(age: number) {
  if (age >= ROTH_COMPARE_RULES.iraCatchUpAge) {
    return ROTH_COMPARE_RULES.iraLimitUnder50 + ROTH_COMPARE_RULES.iraCatchUp;
  }
  return ROTH_COMPARE_RULES.iraLimitUnder50;
}

export function combinedRate(federal: number, state: number) {
  return Math.min(100, Math.max(0, federal + state));
}

export function futureValueAnnuity(payment: number, ratePercent: number, years: number) {
  if (!(payment > 0) || years <= 0) return 0;
  const rate = ratePercent / 100;
  if (rate === 0) return Math.round(payment * years);
  return Math.round(payment * ((Math.pow(1 + rate, years) - 1) / rate));
}

function dollars(value: number) {
  return Math.round(value);
}

export function validateRothCompare(input: RothCompareInput): RothCompareErrors {
  const errors: RothCompareErrors = {};
  if (!Number.isFinite(input.currentAge) || input.currentAge < ROTH_COMPARE_RULES.minCurrentAge || input.currentAge > ROTH_COMPARE_RULES.maxCurrentAge) {
    errors.currentAge = `Enter an age from ${ROTH_COMPARE_RULES.minCurrentAge} to ${ROTH_COMPARE_RULES.maxCurrentAge}.`;
  }
  if (
    !Number.isFinite(input.retirementAge) ||
    input.retirementAge < ROTH_COMPARE_RULES.minRetirementAge ||
    input.retirementAge > ROTH_COMPARE_RULES.maxRetirementAge
  ) {
    errors.retirementAge = `Enter a retirement age from ${ROTH_COMPARE_RULES.minRetirementAge} to ${ROTH_COMPARE_RULES.maxRetirementAge}.`;
  } else if (Number.isFinite(input.currentAge) && input.retirementAge <= input.currentAge) {
    errors.retirementAge = "Retirement age must be greater than current age.";
  }
  if (
    !Number.isFinite(input.contribution) ||
    input.contribution < ROTH_COMPARE_RULES.minContribution ||
    input.contribution > ROTH_COMPARE_RULES.maxContribution
  ) {
    errors.contribution = `Enter a contribution from $0 to $${ROTH_COMPARE_RULES.maxContribution.toLocaleString("en-US")}.`;
  }
  if (!Number.isFinite(input.stateTax) || input.stateTax < ROTH_COMPARE_RULES.minStateTax || input.stateTax > ROTH_COMPARE_RULES.maxStateTax) {
    errors.stateTax = `Enter a state tax rate from ${ROTH_COMPARE_RULES.minStateTax} to ${ROTH_COMPARE_RULES.maxStateTax}%.`;
  }
  if (
    !Number.isFinite(input.returnPercent) ||
    input.returnPercent < ROTH_COMPARE_RULES.minReturn ||
    input.returnPercent > ROTH_COMPARE_RULES.maxReturn
  ) {
    errors.returnPercent = `Enter an annual return from ${ROTH_COMPARE_RULES.minReturn} to ${ROTH_COMPARE_RULES.maxReturn}%.`;
  }
  return errors;
}

export function hasRothCompareErrors(errors: RothCompareErrors) {
  return Object.keys(errors).length > 0;
}

function account(
  id: RothCompareAccountId,
  label: string,
  annualContribution: number,
  pretax: boolean,
  combinedNow: number,
  combinedLater: number,
  years: number,
  returnPercent: number,
): RothCompareAccount {
  const taxSavingToday = pretax ? dollars((combinedNow / 100) * annualContribution) : 0;
  const futureBalance = futureValueAnnuity(annualContribution, returnPercent, years);
  const taxOnWithdrawal = pretax ? dollars((combinedLater / 100) * futureBalance) : 0;
  return {
    id,
    label,
    annualContribution,
    taxSavingToday,
    netAnnualCost: annualContribution - taxSavingToday,
    futureBalance,
    taxOnWithdrawal,
    netRetirement: futureBalance - taxOnWithdrawal,
    rmdsRequired: pretax,
  };
}

export function calculateRothCompare(input: RothCompareInput): RothCompareResult | null {
  if (hasRothCompareErrors(validateRothCompare(input))) return null;

  const years = input.retirementAge - input.currentAge;
  const combinedNow = combinedRate(input.federalNow, input.stateTax);
  const combinedLater = combinedRate(input.federalLater, input.stateTax);
  const iraLimit = iraContributionLimit(input.currentAge);
  const iraContribution = Math.min(input.contribution, iraLimit);
  const iraCapped = input.contribution > iraLimit;

  const traditional = account(
    "traditional",
    "Traditional 401k",
    input.contribution,
    true,
    combinedNow,
    combinedLater,
    years,
    input.returnPercent,
  );
  const roth401k = account(
    "roth401k",
    "Roth 401k",
    input.contribution,
    false,
    combinedNow,
    combinedLater,
    years,
    input.returnPercent,
  );
  const rothIra = account("rothIra", "Roth IRA", iraContribution, false, combinedNow, combinedLater, years, input.returnPercent);
  const accounts = [traditional, roth401k, rothIra];

  let verdict: RothCompareVerdict = "equal";
  if (combinedNow > combinedLater) verdict = "traditional";
  else if (combinedNow < combinedLater) verdict = "roth";

  const winnerNet = accounts.reduce((best, item) => (item.netRetirement > best.netRetirement ? item : best));

  const copyAccount = verdict === "traditional" ? traditional : verdict === "roth" ? roth401k : traditional;

  return {
    years,
    combinedNow,
    combinedLater,
    iraLimit,
    iraCapped,
    verdict,
    verdictTitle:
      verdict === "equal"
        ? "Both are roughly equal."
        : verdict === "traditional"
          ? "Traditional 401k wins."
          : "Roth wins.",
    verdictBody:
      verdict === "equal"
        ? "Consider Roth for tax flexibility and no RMDs."
        : verdict === "traditional"
          ? "Your expected retirement tax rate is lower, so the deduction today is worth more than tax-free withdrawals."
          : "Paying tax now at a lower rate beats deferring into a higher retirement bracket. Roth 401k and Roth IRA withdrawals are tax-free.",
    copyLabel: `Copy ${copyAccount.id === "traditional" ? "Traditional" : copyAccount.label} net`,
    copyValue: copyAccount.netRetirement,
    winnerNetId: winnerNet.id,
    accounts,
  };
}

export const ROTH_COMPARE_FAQS = [
  {
    question: "Should I choose a Traditional 401k or Roth 401k?",
    answer:
      "Choose Traditional if you expect a lower tax rate in retirement — the deduction today is more valuable. Choose Roth if you expect a higher rate later, want tax-free withdrawals, or want to avoid RMDs. If the rates are similar, many people split contributions for tax diversification.",
  },
  {
    question: `What is the 401k contribution limit for ${ROTH_COMPARE_RULES.taxYear}?`,
    answer: `The ${ROTH_COMPARE_RULES.taxYear} employee elective deferral limit is $${ROTH_COMPARE_RULES.k401LimitUnder50.toLocaleString("en-US")} if you are under 50. Age 50+ catch-up and the SECURE 2.0 super catch-up for ages 60–63 are extra. This comparison does not cap the 401k amount so you can model any contribution.`,
  },
  {
    question: "Does Roth 401k have Required Minimum Distributions?",
    answer: `No. SECURE 2.0 eliminated RMDs for designated Roth 401k accounts starting in 2024. Traditional 401k accounts still require RMDs beginning at age ${ROTH_COMPARE_RULES.rmdAge}. Roth IRAs have never had RMDs for the original owner.`,
  },
  {
    question: `What is the Roth IRA income limit for ${ROTH_COMPARE_RULES.taxYear}?`,
    answer: `For ${ROTH_COMPARE_RULES.taxYear}, direct Roth IRA contributions phase out and end at $${ROTH_COMPARE_RULES.rothIraSingleUpper.toLocaleString("en-US")} MAGI (single / head of household) and $${ROTH_COMPARE_RULES.rothIraMfjUpper.toLocaleString("en-US")} (married filing jointly). Above those amounts you may need a Backdoor Roth. The annual IRA contribution limit is $${ROTH_COMPARE_RULES.iraLimitUnder50.toLocaleString("en-US")} under 50, or $${(ROTH_COMPARE_RULES.iraLimitUnder50 + ROTH_COMPARE_RULES.iraCatchUp).toLocaleString("en-US")} at age 50+.`,
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Your numbers stay on your device.",
  },
];
