export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type MonthName = (typeof MONTHS)[number];

export const PAY_MODES = ["Cash", "Bank Transfer", "UPI", "Cheque"] as const;
export type PayMode = (typeof PAY_MODES)[number];

export const RENT_RECEIPT_RULES = {
  rulesLabel: "Built for Indian HRA claims under Section 10(13A)",
  panThresholdAnnual: 100_000,
  defaultAmount: 15_000,
  defaultPayMode: "UPI" as PayMode,
  minYear: 2000,
  maxYear: 2100,
  minAmount: 1,
  maxAmount: 10_00_00_000,
  certification: "This is to certify that the above rent has been received for the stated period.",
  footer: "Generated with Utilvia Rent Receipt Generator",
} as const;

export const PLACEHOLDERS = {
  tenantInput: "Tenant full name",
  landlordInput: "Landlord full name",
  addressInput: "Flat/House number, street, city, state, PIN",
  panInput: "ABCDE1234F",
  tenant: "Tenant Name",
  landlord: "Landlord Name",
  address: "Property address will appear here",
} as const;

export const RENT_RECEIPT_STEPS = [
  { title: "Fill Details", body: "Enter tenant, landlord, rent amount, and property address." },
  { title: "Preview Receipt", body: "Check the live receipt on the right before you download." },
  { title: "Download PDF", body: "Save one month or every selected month instantly." },
] as const;

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;

export type RentReceiptInput = {
  tenant: string;
  landlord: string;
  amount: number;
  month: MonthName;
  year: number;
  payMode: PayMode;
  address: string;
  pan: string;
  receiptNo: string;
  months: readonly string[];
};

export type RentReceiptView = {
  month: MonthName;
  year: number;
  period: string;
  date: string;
  receiptNo: string;
  tenant: string;
  landlord: string;
  address: string;
  amount: number;
  amountLabel: string;
  payMode: PayMode;
  pan: string;
};

export type RentReceiptErrors = Partial<Record<"amount" | "year" | "months" | "pan" | "receiptNo", string>>;

export function currentMonthName(now = new Date()): MonthName {
  return MONTHS[now.getMonth()];
}

export function defaultReceiptNumber(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `RR-${year}${month}${day}-001`;
}

export function selectedMonths(months: readonly string[]): MonthName[] {
  return MONTHS.filter((month) => months.includes(month));
}

export function ensureMonthSelected(months: readonly string[], month: MonthName): MonthName[] {
  if (months.includes(month)) return selectedMonths(months);
  return selectedMonths([...months, month]);
}

export function toggleMonth(months: readonly string[], month: MonthName): MonthName[] {
  if (months.includes(month)) return selectedMonths(months.filter((item) => item !== month));
  return selectedMonths([...months, month]);
}

export function receiptDateLabel(month: MonthName, year: number) {
  return `1 ${month} ${year}`;
}

export function periodLabel(month: MonthName, year: number) {
  return `${month} ${year}`;
}

export function displayValue(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed || fallback;
}

export function formatRentInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRentPdf(amount: number) {
  return formatRentInr(amount).replace("₹", "Rs. ");
}

export function receiptNumberForIndex(base: string, index: number, total: number) {
  const trimmed = base.trim() || defaultReceiptNumber();
  if (total <= 1) return trimmed;
  const match = trimmed.match(/^(.*-)(\d+)$/);
  if (match) {
    const width = match[2].length;
    return `${match[1]}${String(Number(match[2]) + index).padStart(width, "0")}`;
  }
  return `${trimmed}-${index + 1}`;
}

export function annualRent(amount: number) {
  return amount * 12;
}

export function panRequired(amount: number) {
  return Number.isFinite(amount) && annualRent(amount) > RENT_RECEIPT_RULES.panThresholdAnnual;
}

export function isValidPan(pan: string) {
  const trimmed = pan.trim();
  if (!trimmed) return true;
  return PAN_PATTERN.test(trimmed);
}

export function normalizePan(pan: string) {
  return pan.trim().toUpperCase();
}

export function validateRentReceipt(
  input: Pick<RentReceiptInput, "amount" | "year" | "months" | "pan" | "receiptNo">,
): RentReceiptErrors {
  const errors: RentReceiptErrors = {};
  if (
    !Number.isFinite(input.amount) ||
    input.amount < RENT_RECEIPT_RULES.minAmount ||
    input.amount > RENT_RECEIPT_RULES.maxAmount
  ) {
    errors.amount = "Enter a rental amount in rupees.";
  }
  if (
    !Number.isFinite(input.year) ||
    input.year < RENT_RECEIPT_RULES.minYear ||
    input.year > RENT_RECEIPT_RULES.maxYear
  ) {
    errors.year = `Enter a year between ${RENT_RECEIPT_RULES.minYear} and ${RENT_RECEIPT_RULES.maxYear}.`;
  }
  if (selectedMonths(input.months).length === 0) {
    errors.months = "Select at least one month.";
  }
  if (!isValidPan(input.pan)) {
    errors.pan = "Enter a valid PAN (ABCDE1234F) or leave it blank.";
  }
  if (!input.receiptNo.trim()) {
    errors.receiptNo = "Enter a receipt number.";
  }
  return errors;
}

export function hasRentReceiptErrors(errors: RentReceiptErrors) {
  return Object.keys(errors).length > 0;
}

export function pdfFilename(year: number, months: readonly string[]) {
  const selected = selectedMonths(months);
  if (selected.length === 1) {
    return `rent-receipt-${selected[0].toLowerCase()}-${year}.pdf`;
  }
  return `rent-receipts-${year}.pdf`;
}

export function buildReceipts(input: RentReceiptInput): RentReceiptView[] {
  const months = selectedMonths(input.months);
  return months.map((month, index) => ({
    month,
    year: input.year,
    period: periodLabel(month, input.year),
    date: receiptDateLabel(month, input.year),
    receiptNo: receiptNumberForIndex(input.receiptNo, index, months.length),
    tenant: displayValue(input.tenant, PLACEHOLDERS.tenant),
    landlord: displayValue(input.landlord, PLACEHOLDERS.landlord),
    address: displayValue(input.address, PLACEHOLDERS.address),
    amount: input.amount,
    amountLabel: formatRentInr(input.amount),
    payMode: input.payMode,
    pan: normalizePan(input.pan),
  }));
}

export function previewReceipt(input: RentReceiptInput): RentReceiptView {
  const months = selectedMonths(input.months);
  const month = months.includes(input.month) ? input.month : months[0] ?? input.month;
  const index = Math.max(0, months.indexOf(month));
  return {
    month,
    year: input.year,
    period: periodLabel(month, input.year),
    date: receiptDateLabel(month, input.year),
    receiptNo: receiptNumberForIndex(input.receiptNo, index, Math.max(months.length, 1)),
    tenant: displayValue(input.tenant, PLACEHOLDERS.tenant),
    landlord: displayValue(input.landlord, PLACEHOLDERS.landlord),
    address: displayValue(input.address, PLACEHOLDERS.address),
    amount: input.amount,
    amountLabel: Number.isFinite(input.amount) ? formatRentInr(input.amount) : "₹0",
    payMode: input.payMode,
    pan: normalizePan(input.pan),
  };
}

export const RENT_RECEIPT_FAQS = [
  {
    question: "How to make rent receipt for HRA exemption?",
    answer:
      "Enter tenant and landlord details, rent amount, month, and address. Download the PDF receipt and submit to your employer with your HRA declaration form.",
  },
  {
    question: "Is rent receipt mandatory for HRA claim?",
    answer:
      "Yes for rent above ₹3,000/month. Employers and tax authorities require rent receipts as proof of payment for HRA exemption.",
  },
  {
    question: "What details should be in rent receipt India?",
    answer:
      "Tenant name, landlord name, property address, rent amount, month/year, payment mode, receipt number, and landlord signature. PAN is required if annual rent exceeds ₹1 lakh.",
  },
  {
    question: "Do I need landlord PAN for rent receipt?",
    answer:
      "Yes if annual rent paid exceeds ₹1,00,000. Include landlord PAN on the receipt for employer records and tax compliance.",
  },
  {
    question: "How to download rent receipt as PDF?",
    answer:
      "Fill the form, select months, and click Download PDF. Our tool generates a print-ready PDF instantly in your browser.",
  },
];
