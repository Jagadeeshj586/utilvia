import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatPayStubDate, formatPayStubMoneyPdf } from "./calculate";
import type { PayStubCountryProfile } from "./types";
import type { PayStubEarning, PayStubOtherDeduction, PayStubTotals } from "./types";
import { earningAmount } from "./calculate";

const INK = rgb(0.08, 0.08, 0.07);
const BODY = rgb(0.24, 0.24, 0.23);
const MUTED = rgb(0.42, 0.42, 0.39);
const LINE = rgb(0.85, 0.82, 0.78);
const CORAL = rgb(0.8, 0.47, 0.36);
const CREAM = rgb(0.98, 0.98, 0.96);

export type PayStubPdfInput = {
  profile: PayStubCountryProfile;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyLogo: string | null;
  employeeName: string;
  employeeId: string;
  employeeAddress: string;
  jobTitle: string;
  department: string;
  nationalId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  frequencyLabel: string;
  earnings: PayStubEarning[];
  otherDeductions: PayStubOtherDeduction[];
  totals: PayStubTotals;
};

export async function buildPayStubPdf(input: PayStubPdfInput) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  const money = (value: number) => formatPayStubMoneyPdf(value, input.totals.currency);
  const date = (iso: string) => formatPayStubDate(iso, input.profile.locale);

  page.drawRectangle({ x: 0, y: 0, width, height, color: CREAM });
  page.drawRectangle({ x: 36, y: height - 36, width: width - 72, height: 4, color: CORAL });

  let y = height - 58;
  if (input.companyLogo) {
    try {
      const image = await embedLogo(doc, input.companyLogo);
      if (image) {
        const scaled = image.scaleToFit(110, 36);
        page.drawImage(image, { x: 40, y: y - scaled.height + 18, width: scaled.width, height: scaled.height });
      }
    } catch {
      // Logo is optional; skip if the data URL is not a supported image.
    }
  }

  page.drawText(sanitize(input.companyName || input.profile.employerLabel), { x: 40, y, size: 16, font: bold, color: INK });
  y -= 14;
  if (input.companyAddress) {
    page.drawText(sanitize(input.companyAddress), { x: 40, y, size: 9, font, color: BODY });
    y -= 12;
  }
  if (input.companyPhone) {
    page.drawText(sanitize(input.companyPhone), { x: 40, y, size: 9, font, color: BODY });
    y -= 12;
  }

  page.drawText(input.profile.documentTitle, { x: 360, y: height - 58, size: 11, font: bold, color: INK });
  page.drawText(`Pay date: ${date(input.payDate)}`, { x: 360, y: height - 74, size: 9, font, color: BODY });
  page.drawText(`Period: ${date(input.payPeriodStart)} - ${date(input.payPeriodEnd)}`, { x: 360, y: height - 88, size: 9, font, color: BODY });
  page.drawText(`Frequency: ${input.frequencyLabel}`, { x: 360, y: height - 102, size: 9, font, color: BODY });

  y = Math.min(y, height - 120);
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.8, color: LINE });
  y -= 18;
  page.drawText("Employee", { x: 40, y, size: 10, font: bold, color: INK });
  y -= 14;
  page.drawText(sanitize(input.employeeName || "—"), { x: 40, y, size: 10, font, color: INK });
  y -= 12;
  const details = [
    input.employeeAddress,
    input.employeeId ? `${input.profile.employeeIdLabel}: ${input.employeeId}` : "",
    input.jobTitle ? `${input.profile.jobTitleLabel}: ${input.jobTitle}` : "",
    input.department ? `${input.profile.departmentLabel}: ${input.department}` : "",
    input.nationalId ? `${input.profile.nationalIdPrefix}${input.nationalId}` : "",
  ].filter(Boolean);
  details.forEach((line) => {
    page.drawText(sanitize(line), { x: 40, y, size: 9, font, color: BODY });
    y -= 12;
  });

  y -= 8;
  y = drawTable(
    page,
    font,
    bold,
    y,
    ["Earnings", "Hours", "Rate", "This period", "YTD"],
    [
      ...input.earnings.map((row) => [
        row.label || "—",
        row.mode === "hours" ? String(row.hours) : "—",
        row.mode === "hours" ? money(row.rate) : "—",
        money(earningAmount(row)),
        money(earningAmount(row) * input.totals.periodIndex),
      ]),
      ["Gross pay", "", "", money(input.totals.grossPay), money(input.totals.ytdGross)],
    ],
    [170, 50, 70, 90, 90],
    true,
  );

  y -= 16;
  const deductionRows = [
    ...input.totals.statutory.map((row) => [
      row.label + (row.estimated ? " (est.)" : ""),
      money(row.amount),
      money(row.amount * input.totals.periodIndex),
    ]),
    ...input.otherDeductions
      .filter((row) => row.amount > 0)
      .map((row) => [row.label || "Other", money(row.amount), money(row.amount * input.totals.periodIndex)]),
    ["Total deductions", money(input.totals.totalDeductions), money(input.totals.ytdDeductions)],
  ];
  y = drawTable(page, font, bold, y, ["Deductions", "This period", "YTD"], deductionRows, [250, 110, 110], true);

  y -= 20;
  page.drawRectangle({ x: 40, y: y - 28, width: width - 80, height: 40, color: rgb(0.96, 0.94, 0.91) });
  page.drawText("NET PAY", { x: 52, y: y - 8, size: 9, font, color: BODY });
  page.drawText(money(input.totals.netPay), { x: 52, y: y - 24, size: 16, font: bold, color: INK });
  page.drawText(`YTD ${money(input.totals.ytdNet)}`, { x: 360, y: y - 18, size: 10, font, color: BODY });

  page.drawText("SAMPLE / ESTIMATED PAYROLL DOCUMENT — not an official payslip or tax record.", {
    x: 40,
    y: 48,
    size: 8,
    font,
    color: MUTED,
  });
  page.drawText("Generated in your browser with Utilvia. Figures are estimates only.", {
    x: 40,
    y: 36,
    size: 8,
    font,
    color: MUTED,
  });

  return doc.save();
}

function drawTable(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  startY: number,
  headers: string[],
  rows: string[][],
  widths: number[],
  lastBold: boolean,
) {
  let y = startY;
  const x0 = 40;
  headers.forEach((header, index) => {
    const x = x0 + widths.slice(0, index).reduce((sum, value) => sum + value, 0);
    page.drawText(header, { x, y, size: 8, font: bold, color: INK });
  });
  y -= 6;
  page.drawLine({ start: { x: x0, y }, end: { x: 572, y }, thickness: 0.6, color: LINE });
  y -= 12;
  rows.forEach((row, rowIndex) => {
    const isLast = lastBold && rowIndex === rows.length - 1;
    row.forEach((cell, index) => {
      const x = x0 + widths.slice(0, index).reduce((sum, value) => sum + value, 0);
      page.drawText(sanitize(cell).slice(0, 42), {
        x,
        y,
        size: 8,
        font: isLast ? bold : font,
        color: INK,
      });
    });
    y -= 12;
  });
  return y;
}

async function embedLogo(doc: PDFDocument, dataUrl: string) {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return null;
  const header = dataUrl.slice(0, comma);
  const binary = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  if (header.includes("png")) return doc.embedPng(bytes);
  if (header.includes("jpeg") || header.includes("jpg")) return doc.embedJpg(bytes);
  return null;
}

function sanitize(value: string) {
  return value.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
}
