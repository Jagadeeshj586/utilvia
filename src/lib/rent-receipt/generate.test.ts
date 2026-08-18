import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PLACEHOLDERS,
  annualRent,
  buildReceipts,
  currentMonthName,
  defaultReceiptNumber,
  ensureMonthSelected,
  panRequired,
  pdfFilename,
  previewReceipt,
  receiptNumberForIndex,
  selectedMonths,
  toggleMonth,
  validateRentReceipt,
} from "./generate";

const base = {
  tenant: "Arjun Mehta",
  landlord: "Priya Sharma",
  amount: 15_000,
  month: "August" as const,
  year: 2026,
  payMode: "UPI" as const,
  address: "12 MG Road, Bengaluru, Karnataka 560001",
  pan: "",
  receiptNo: "RR-20260816-001",
  months: ["August"],
};

describe("rent receipt generator", () => {
  it("uses WorkUtilities receipt number format RR-YYYYMMDD-001", () => {
    assert.equal(defaultReceiptNumber(new Date(2026, 7, 16)), "RR-20260816-001");
    assert.equal(currentMonthName(new Date(2026, 7, 16)), "August");
  });

  it("increments receipt numbers across selected months", () => {
    assert.equal(receiptNumberForIndex("RR-20260816-001", 0, 3), "RR-20260816-001");
    assert.equal(receiptNumberForIndex("RR-20260816-001", 1, 3), "RR-20260816-002");
    assert.equal(receiptNumberForIndex("RR-20260816-001", 2, 3), "RR-20260816-003");
    assert.equal(receiptNumberForIndex("CUSTOM", 1, 2), "CUSTOM-2");
  });

  it("keeps months in calendar order and dates receipts on the 1st", () => {
    const receipts = buildReceipts({ ...base, months: ["August", "January", "March"] });
    assert.deepEqual(
      receipts.map((item) => item.month),
      ["January", "March", "August"],
    );
    assert.equal(receipts[0].date, "1 January 2026");
    assert.equal(receipts[0].receiptNo, "RR-20260816-001");
    assert.equal(receipts[1].receiptNo, "RR-20260816-002");
    assert.equal(receipts[2].period, "August 2026");
  });

  it("shows placeholders when tenant, landlord, or address are empty", () => {
    const preview = previewReceipt({ ...base, tenant: "", landlord: "  ", address: "" });
    assert.equal(preview.tenant, PLACEHOLDERS.tenant);
    assert.equal(preview.landlord, PLACEHOLDERS.landlord);
    assert.equal(preview.address, PLACEHOLDERS.address);
    assert.equal(preview.amountLabel, "₹15,000");
  });

  it("flags landlord PAN when annual rent exceeds ₹1 lakh", () => {
    assert.equal(annualRent(15_000), 1_80_000);
    assert.equal(panRequired(15_000), true);
    assert.equal(panRequired(8_000), false);
  });

  it("validates amount, year, months, and PAN", () => {
    assert.equal(validateRentReceipt({ ...base, amount: 0 }).amount, "Enter a rental amount in rupees.");
    assert.ok(validateRentReceipt({ ...base, year: 1999 }).year);
    assert.ok(validateRentReceipt({ ...base, months: [] }).months);
    assert.ok(validateRentReceipt({ ...base, pan: "ABCDE1234" }).pan);
    assert.deepEqual(validateRentReceipt({ ...base, pan: "ABCDE1234F" }), {});
    assert.ok(validateRentReceipt({ ...base, receiptNo: "  " }).receiptNo);
  });

  it("toggles months and always includes the dropdown month when ensured", () => {
    assert.deepEqual(selectedMonths(["March", "January"]), ["January", "March"]);
    assert.deepEqual(toggleMonth(["August"], "January"), ["January", "August"]);
    assert.deepEqual(toggleMonth(["January", "August"], "August"), ["January"]);
    assert.deepEqual(ensureMonthSelected(["January"], "August"), ["January", "August"]);
  });

  it("names the PDF after a single month or the year for bulk", () => {
    assert.equal(pdfFilename(2026, ["August"]), "rent-receipt-august-2026.pdf");
    assert.equal(pdfFilename(2026, ["January", "August"]), "rent-receipts-2026.pdf");
  });
});
