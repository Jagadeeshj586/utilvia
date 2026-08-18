import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import {
  RENT_RECEIPT_RULES,
  buildReceipts,
  formatRentPdf,
  type RentReceiptInput,
  type RentReceiptView,
} from "./generate";

const INK = rgb(0.08, 0.08, 0.07);
const BODY = rgb(0.24, 0.24, 0.23);
const MUTED = rgb(0.63, 0.62, 0.59);
const LINE = rgb(0.85, 0.82, 0.78);
const CORAL = rgb(0.8, 0.47, 0.36);
const CREAM = rgb(0.98, 0.98, 0.96);
const WHITE = rgb(1, 1, 1);

export async function buildRentReceiptPdf(input: RentReceiptInput) {
  const receipts = buildReceipts(input);
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  for (const receipt of receipts) {
    drawReceiptPage(doc.addPage([595, 842]), receipt, font, bold, italic);
  }

  return doc.save();
}

function drawReceiptPage(
  page: PDFPage,
  receipt: RentReceiptView,
  font: PDFFont,
  bold: PDFFont,
  italic: PDFFont,
) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: 0, width, height, color: CREAM });
  page.drawRectangle({ x: 36, y: height - 36, width: width - 72, height: 4, color: CORAL });

  const cardX = 48;
  const cardY = 110;
  const cardW = width - 96;
  const cardH = height - 180;
  page.drawRectangle({
    x: cardX,
    y: cardY,
    width: cardW,
    height: cardH,
    color: WHITE,
    borderColor: LINE,
    borderWidth: 1,
  });

  const title = "RENT RECEIPT";
  const titleSize = 22;
  page.drawText(title, {
    x: (width - bold.widthOfTextAtSize(title, titleSize)) / 2,
    y: height - 108,
    size: titleSize,
    font: bold,
    color: INK,
  });
  page.drawRectangle({
    x: width / 2 - 48,
    y: height - 118,
    width: 96,
    height: 2,
    color: CORAL,
  });

  page.drawText(`Receipt No: ${sanitize(receipt.receiptNo)}`, {
    x: cardX + 28,
    y: height - 150,
    size: 10,
    font,
    color: BODY,
  });
  const dateText = sanitize(receipt.date);
  page.drawText(dateText, {
    x: cardX + cardW - 28 - font.widthOfTextAtSize(dateText, 10),
    y: height - 150,
    size: 10,
    font,
    color: BODY,
  });

  const rows: [string, string][] = [
    ["Received From", sanitize(receipt.tenant)],
    ["Landlord", sanitize(receipt.landlord)],
    ["Amount", sanitize(formatRentPdf(receipt.amount))],
    ["Period", sanitize(receipt.period)],
    ["Payment Mode", sanitize(receipt.payMode)],
    ["Property Address", sanitize(receipt.address)],
  ];
  if (receipt.pan) rows.push(["Landlord PAN", sanitize(receipt.pan)]);

  let y = height - 186;
  for (const [label, value] of rows) {
    page.drawLine({
      start: { x: cardX + 24, y: y + 18 },
      end: { x: cardX + cardW - 24, y: y + 18 },
      thickness: 0.5,
      color: LINE,
    });
    page.drawText(`${label}:`, { x: cardX + 28, y, size: 10, font, color: MUTED });
    const valueLines = wrapText(value, font, 11, cardW - 220);
    valueLines.forEach((line, index) => {
      page.drawText(line, {
        x: cardX + 170,
        y: y - index * 14,
        size: 11,
        font: bold,
        color: INK,
      });
    });
    y -= 22 + Math.max(0, valueLines.length - 1) * 14;
  }

  y -= 12;
  const cert = wrapText(RENT_RECEIPT_RULES.certification, italic, 10, cardW - 56);
  cert.forEach((line, index) => {
    page.drawText(line, {
      x: cardX + 28,
      y: y - index * 14,
      size: 10,
      font: italic,
      color: BODY,
    });
  });

  const stampY = cardY + 78;
  page.drawCircle({
    x: cardX + 72,
    y: stampY,
    size: 36,
    borderColor: CORAL,
    borderWidth: 1.4,
    color: WHITE,
  });
  const stamp = "STAMP / SEAL";
  page.drawText(stamp, {
    x: cardX + 72 - font.widthOfTextAtSize(stamp, 7) / 2,
    y: stampY - 3,
    size: 7,
    font,
    color: CORAL,
  });

  page.drawLine({
    start: { x: cardX + cardW - 200, y: stampY },
    end: { x: cardX + cardW - 36, y: stampY },
    thickness: 0.8,
    color: LINE,
  });
  const sign = "Landlord Signature";
  page.drawText(sign, {
    x: cardX + cardW - 36 - font.widthOfTextAtSize(sign, 9),
    y: stampY - 16,
    size: 9,
    font,
    color: MUTED,
  });

  const footer = RENT_RECEIPT_RULES.footer;
  page.drawText(footer, {
    x: (width - font.widthOfTextAtSize(footer, 8)) / 2,
    y: 64,
    size: 8,
    font,
    color: MUTED,
  });
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function sanitize(value: string) {
  return value.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
}
