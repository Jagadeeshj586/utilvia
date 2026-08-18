import { formatINR, formatNum } from "@/lib/utils";
import type { CalcConfig } from "@/components/tools/shared/formula-calculator";

const n = (values: Record<string, string | number>, id: string) => Number(values[id]) || 0;
const s = (values: Record<string, string | number>, id: string) => String(values[id] ?? "");

function indiaNewTax(taxable: number) {
  let tax = 0;
  const slabs: Array<[number, number]> = [
    [400000, 0],
    [800000, 0.05],
    [1200000, 0.1],
    [1600000, 0.15],
    [2000000, 0.2],
    [2400000, 0.25],
    [Infinity, 0.3],
  ];
  let prev = 0;
  for (const [limit, rate] of slabs) {
    if (taxable <= prev) break;
    tax += (Math.min(taxable, limit) - prev) * rate;
    prev = limit;
  }
  if (taxable <= 1200000) tax = 0;
  return tax * 1.04;
}

function indiaOldTax(taxable: number) {
  let tax = 0;
  const slabs: Array<[number, number]> = [
    [250000, 0],
    [500000, 0.05],
    [1000000, 0.2],
    [Infinity, 0.3],
  ];
  let prev = 0;
  for (const [limit, rate] of slabs) {
    if (taxable <= prev) break;
    tax += (Math.min(taxable, limit) - prev) * rate;
    prev = limit;
  }
  if (taxable <= 500000) tax = 0;
  return tax * 1.04;
}

export const FINANCE_CONFIGS: Record<string, CalcConfig> = {
  "salary-hike-calculator": {
    fields: [
      { id: "current", label: "Current CTC / salary", kind: "number", default: 1200000, prefix: "₹" },
      { id: "hike", label: "Hike", kind: "number", default: 12, suffix: "%" },
    ],
    compute: (v) => {
      const increment = n(v, "current") * (n(v, "hike") / 100);
      return [
        { label: "New salary", value: formatINR(n(v, "current") + increment), emphasize: true },
        { label: "Increment amount", value: formatINR(increment) },
      ];
    },
  },
  "fd-calculator": {
    fields: [
      { id: "principal", label: "Deposit amount", kind: "number", default: 100000, prefix: "₹" },
      { id: "rate", label: "Interest rate p.a.", kind: "number", default: 7.1, suffix: "%" },
      { id: "years", label: "Tenure (years)", kind: "number", default: 5 },
      { id: "freq", label: "Compounding", kind: "select", default: "4", options: [
        { label: "Yearly", value: "1" }, { label: "Half-yearly", value: "2" }, { label: "Quarterly", value: "4" }, { label: "Monthly", value: "12" },
      ] },
    ],
    compute: (v) => {
      const m = Number(s(v, "freq")) || 4;
      const maturity = n(v, "principal") * Math.pow(1 + n(v, "rate") / 100 / m, m * n(v, "years"));
      return [
        { label: "Maturity value", value: formatINR(maturity), emphasize: true },
        { label: "Interest earned", value: formatINR(maturity - n(v, "principal")) },
      ];
    },
  },
  "section-44ada-calculator": {
    fields: [
      { id: "receipts", label: "Gross receipts", kind: "number", default: 2000000, prefix: "₹" },
      { id: "regime", label: "Tax regime", kind: "select", default: "new", options: [
        { label: "New regime", value: "new" }, { label: "Old regime", value: "old" },
      ] },
    ],
    compute: (v) => {
      const deemed = n(v, "receipts") * 0.5;
      const tax = s(v, "regime") === "old" ? indiaOldTax(deemed) : indiaNewTax(deemed);
      return [
        { label: "Deemed income (50%)", value: formatINR(deemed), emphasize: true },
        { label: "Estimated tax + cess", value: formatINR(tax) },
        { label: "Effective rate on receipts", value: `${formatNum((tax / Math.max(n(v, "receipts"), 1)) * 100)}%` },
      ];
    },
    note: "44ADA deems 50% of receipts as income. Estimate only - not tax advice.",
  },
  "notice-period-calculator": {
    fields: [
      { id: "start", label: "Resignation / start date", kind: "date", default: new Date().toISOString().slice(0, 10) },
      { id: "days", label: "Notice period (days)", kind: "number", default: 30 },
    ],
    compute: (v) => {
      const start = new Date(s(v, "start"));
      if (Number.isNaN(start.getTime())) return [{ label: "Last working day", value: "Pick a valid date" }];
      const end = new Date(start);
      end.setDate(end.getDate() + Math.max(0, Math.round(n(v, "days"))) - 1);
      return [
        { label: "Last working day", value: end.toDateString(), emphasize: true },
        { label: "Notice days", value: String(Math.round(n(v, "days"))) },
      ];
    },
  },
  "income-tax-calculator": {
    fields: [
      { id: "income", label: "Taxable income", kind: "number", default: 1200000, prefix: "₹" },
      { id: "regime", label: "Regime", kind: "select", default: "new", options: [
        { label: "New regime", value: "new" }, { label: "Old regime", value: "old" },
      ] },
    ],
    compute: (v) => {
      const tax = s(v, "regime") === "old" ? indiaOldTax(n(v, "income")) : indiaNewTax(n(v, "income"));
      return [
        { label: "Estimated tax + cess", value: formatINR(tax), emphasize: true },
        { label: "Take-home after tax", value: formatINR(n(v, "income") - tax) },
        { label: "Effective rate", value: `${formatNum((tax / Math.max(n(v, "income"), 1)) * 100)}%` },
      ];
    },
    note: "FY 2025-26 slabs with 87A rebate and 4% cess. Not tax advice.",
  },
  "tip-calculator": {
    fields: [
      { id: "bill", label: "Bill amount", kind: "number", default: 2400 },
      { id: "tip", label: "Tip", kind: "number", default: 10, suffix: "%" },
      { id: "people", label: "People", kind: "number", default: 2, min: 1 },
    ],
    compute: (v) => {
      const tipAmt = n(v, "bill") * (n(v, "tip") / 100);
      const people = Math.max(1, n(v, "people"));
      return [
        { label: "Tip amount", value: formatNum(tipAmt) },
        { label: "Total bill", value: formatNum(n(v, "bill") + tipAmt), emphasize: true },
        { label: "Per person", value: formatNum((n(v, "bill") + tipAmt) / people) },
      ];
    },
  },
  "discount-calculator": {
    fields: [
      { id: "price", label: "Original price", kind: "number", default: 1999 },
      { id: "off", label: "Discount", kind: "number", default: 25, suffix: "%" },
    ],
    compute: (v) => {
      const save = n(v, "price") * (n(v, "off") / 100);
      return [
        { label: "Sale price", value: formatNum(n(v, "price") - save), emphasize: true },
        { label: "You save", value: formatNum(save) },
      ];
    },
  },
  "hra-calculator": {
    fields: [
      { id: "basic", label: "Annual basic salary", kind: "number", default: 480000, prefix: "₹" },
      { id: "hra", label: "HRA received (annual)", kind: "number", default: 240000, prefix: "₹" },
      { id: "rent", label: "Annual rent paid", kind: "number", default: 300000, prefix: "₹" },
      { id: "metro", label: "City", kind: "select", default: "metro", options: [
        { label: "Metro (50%)", value: "metro" }, { label: "Non-metro (40%)", value: "non" },
      ] },
    ],
    compute: (v) => {
      const pct = s(v, "metro") === "metro" ? 0.5 : 0.4;
      const exemption = Math.min(n(v, "hra"), n(v, "basic") * pct, Math.max(0, n(v, "rent") - n(v, "basic") * 0.1));
      return [
        { label: "HRA exemption", value: formatINR(exemption), emphasize: true },
        { label: "Taxable HRA", value: formatINR(Math.max(0, n(v, "hra") - exemption)) },
      ];
    },
  },
  "epf-calculator": {
    fields: [
      { id: "basic", label: "Monthly basic + DA", kind: "number", default: 25000, prefix: "₹" },
      { id: "years", label: "Years", kind: "number", default: 20 },
      { id: "rate", label: "EPF interest p.a.", kind: "number", default: 8.25, suffix: "%" },
    ],
    compute: (v) => {
      const monthly = n(v, "basic") * 0.12 * 2;
      const r = n(v, "rate") / 100 / 12;
      const months = n(v, "years") * 12;
      const fv = r === 0 ? monthly * months : monthly * ((Math.pow(1 + r, months) - 1) / r);
      return [
        { label: "Monthly EPF (12% + 12%)", value: formatINR(monthly) },
        { label: "Estimated corpus", value: formatINR(fv), emphasize: true },
      ];
    },
  },
  "ppf-calculator": {
    fields: [
      { id: "yearly", label: "Yearly contribution", kind: "number", default: 150000, prefix: "₹" },
      { id: "rate", label: "Interest p.a.", kind: "number", default: 7.1, suffix: "%" },
      { id: "years", label: "Years", kind: "number", default: 15 },
    ],
    compute: (v) => {
      let bal = 0;
      for (let i = 0; i < n(v, "years"); i += 1) bal = (bal + n(v, "yearly")) * (1 + n(v, "rate") / 100);
      return [
        { label: "Maturity value", value: formatINR(bal), emphasize: true },
        { label: "Invested", value: formatINR(n(v, "yearly") * n(v, "years")) },
      ];
    },
  },
  "gratuity-calculator": {
    fields: [
      { id: "salary", label: "Last drawn basic + DA (monthly)", kind: "number", default: 40000, prefix: "₹" },
      { id: "years", label: "Years of service", kind: "number", default: 10 },
    ],
    compute: (v) => {
      const years = Math.floor(n(v, "years"));
      const amount = years < 5 ? 0 : (n(v, "salary") * 15 * years) / 26;
      return [
        { label: "Estimated gratuity", value: formatINR(amount), emphasize: true },
        { label: "Eligibility", value: years < 5 ? "Usually needs 5+ years" : "Eligible (estimate)" },
      ];
    },
  },
  "lta-calculator": {
    fields: [
      { id: "lta", label: "LTA received", kind: "number", default: 50000, prefix: "₹" },
      { id: "fare", label: "Actual travel fare", kind: "number", default: 32000, prefix: "₹" },
    ],
    compute: (v) => {
      const exempt = Math.min(n(v, "lta"), n(v, "fare"));
      return [
        { label: "Exempt LTA", value: formatINR(exempt), emphasize: true },
        { label: "Taxable LTA", value: formatINR(Math.max(0, n(v, "lta") - exempt)) },
      ];
    },
  },
  "hourly-to-salary-calculator": {
    fields: [
      { id: "hourly", label: "Hourly rate", kind: "number", default: 800 },
      { id: "hours", label: "Hours / week", kind: "number", default: 40 },
      { id: "weeks", label: "Working weeks / year", kind: "number", default: 52 },
    ],
    compute: (v) => {
      const annual = n(v, "hourly") * n(v, "hours") * n(v, "weeks");
      return [
        { label: "Annual salary", value: formatNum(annual), emphasize: true },
        { label: "Monthly", value: formatNum(annual / 12) },
        { label: "Daily (5-day week)", value: formatNum(n(v, "hourly") * (n(v, "hours") / 5)) },
      ];
    },
  },
  "inflation-calculator": {
    fields: [
      { id: "amount", label: "Amount today", kind: "number", default: 100000 },
      { id: "rate", label: "Inflation p.a.", kind: "number", default: 6, suffix: "%" },
      { id: "years", label: "Years", kind: "number", default: 10 },
    ],
    compute: (v) => {
      const future = n(v, "amount") * Math.pow(1 + n(v, "rate") / 100, n(v, "years"));
      const real = n(v, "amount") / Math.pow(1 + n(v, "rate") / 100, n(v, "years"));
      return [
        { label: "Future cost of same basket", value: formatNum(future), emphasize: true },
        { label: "Today’s amount in future rupees", value: formatNum(real) },
      ];
    },
  },
  "ssy-calculator": {
    fields: [
      { id: "yearly", label: "Yearly deposit", kind: "number", default: 150000, prefix: "₹" },
      { id: "rate", label: "Interest p.a.", kind: "number", default: 8.2, suffix: "%" },
    ],
    compute: (v) => {
      let bal = 0;
      for (let i = 0; i < 15; i += 1) bal = (bal + n(v, "yearly")) * (1 + n(v, "rate") / 100);
      for (let i = 0; i < 6; i += 1) bal *= 1 + n(v, "rate") / 100;
      return [
        { label: "Maturity at 21 years", value: formatINR(bal), emphasize: true },
        { label: "Deposited (15 years)", value: formatINR(n(v, "yearly") * 15) },
      ];
    },
  },
};

export const FINANCE_NOTE_SLUGS = Object.keys(FINANCE_CONFIGS);
