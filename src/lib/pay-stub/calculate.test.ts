import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculatePayStub,
  earningAmount,
  earningsFromProfile,
  formatPayStubDate,
  formatPayStubMoney,
  periodIndexFor,
} from "./calculate";
import type { PayStubEarning, PayStubInput } from "./types";

function hours(id: string, label: string, h: number, rate: number): PayStubEarning {
  return { id, label, mode: "hours", hours: h, rate, amount: 0 };
}

function amount(id: string, label: string, value: number): PayStubEarning {
  return { id, label, mode: "amount", hours: 0, rate: 0, amount: value };
}

function stub(partial: Partial<PayStubInput> & Pick<PayStubInput, "country" | "earnings">): PayStubInput {
  return {
    frequency: "monthly",
    regionCode: "NONE",
    payPeriodStart: "2026-08-01",
    payPeriodEnd: "2026-08-31",
    retirementPercent: 0,
    statutoryOverrides: {},
    otherDeductions: [],
    ...partial,
  };
}

describe("earning amount", () => {
  it("multiplies hours and rate, or uses a fixed amount", () => {
    assert.equal(earningAmount(hours("1", "Regular", 80, 37.5)), 3_000);
    assert.equal(earningAmount(amount("2", "Bonus", 500)), 500);
  });
});

describe("United States", () => {
  it("applies FICA on biweekly Regular Pay 80 × $37.50", () => {
    const result = calculatePayStub(
      stub({
        country: "US",
        frequency: "biweekly",
        regionCode: "FL",
        payPeriodStart: "2026-08-03",
        payPeriodEnd: "2026-08-16",
        earnings: [hours("1", "Regular Pay", 80, 37.5)],
      }),
    );
    assert.equal(result.grossPay, 3_000);
    assert.equal(result.currency, "USD");
    const ss = result.statutory.find((line) => /social security/i.test(line.label));
    const medicare = result.statutory.find((line) => /^medicare/i.test(line.label));
    const federal = result.statutory.find((line) => /federal/i.test(line.label));
    assert.ok(ss && medicare && federal);
    assert.equal(Number(ss.amount.toFixed(2)), 186);
    assert.equal(Number(medicare.amount.toFixed(2)), 43.5);
    assert.ok(federal.amount > 0);
    assert.ok(result.netPay < result.grossPay);
  });
});

describe("India", () => {
  it("takes EPF as 12% of Basic, not of CTC", () => {
    const result = calculatePayStub(
      stub({
        country: "IN",
        regionCode: "KA",
        retirementPercent: 12,
        earnings: [
          amount("1", "Basic", 25_000),
          amount("2", "HRA", 10_000),
          amount("3", "Special Allowance", 15_000),
        ],
      }),
    );
    assert.equal(result.grossPay, 50_000);
    assert.equal(result.currency, "INR");
    const epf = result.statutory.find((line) => line.key === "epf");
    const pt = result.statutory.find((line) => /professional/i.test(line.label));
    assert.ok(epf);
    assert.equal(Number(epf.amount.toFixed(2)), 3_000);
    assert.ok(pt);
    assert.equal(Number(pt.amount.toFixed(2)), 200);
    assert.equal(result.statutory.some((line) => line.key === "esi"), false);
  });
});

describe("United Kingdom", () => {
  it("estimates PAYE, NI, and pension on a monthly salary", () => {
    const result = calculatePayStub(
      stub({
        country: "GB",
        regionCode: "ENG",
        retirementPercent: 5,
        earnings: [amount("1", "Basic Salary", 3_750)],
      }),
    );
    assert.equal(result.grossPay, 3_750);
    assert.equal(result.currency, "GBP");
    assert.ok(result.statutory.some((line) => /income tax|paye/i.test(line.label) && line.amount > 0));
    assert.ok(result.statutory.some((line) => /national insurance/i.test(line.label) && line.amount > 0));
    assert.ok(result.statutory.some((line) => /pension/i.test(line.label)));
    assert.ok(result.netPay < 3_750);
  });
});

describe("Canada, Australia, and UAE", () => {
  it("estimates Canadian CPP/EI and federal tax", () => {
    const result = calculatePayStub(
      stub({
        country: "CA",
        frequency: "biweekly",
        regionCode: "ON",
        earnings: [hours("1", "Regular Pay", 80, 40.87)],
      }),
    );
    assert.equal(result.currency, "CAD");
    assert.ok(result.statutory.some((line) => /cpp/i.test(line.label)));
    assert.ok(result.statutory.some((line) => /ei/i.test(line.label)));
    assert.ok(result.netPay < result.grossPay);
  });

  it("estimates Australian PAYG and Medicare levy", () => {
    const result = calculatePayStub(
      stub({
        country: "AU",
        earnings: [amount("1", "Base Salary", 7_917)],
      }),
    );
    assert.equal(result.currency, "AUD");
    assert.ok(result.statutory.some((line) => /payg|income tax/i.test(line.label) && line.amount > 0));
    assert.ok(result.netPay < result.grossPay);
  });

  it("does not withhold income tax in the UAE", () => {
    const result = calculatePayStub(
      stub({
        country: "AE",
        earnings: [
          amount("1", "Basic Salary", 10_000),
          amount("2", "Housing Allowance", 6_000),
          amount("3", "Transport Allowance", 4_000),
        ],
      }),
    );
    assert.equal(result.grossPay, 20_000);
    assert.equal(result.currency, "AED");
    assert.equal(result.statutory.filter((line) => line.category === "tax").length, 0);
    assert.equal(result.netPay, 20_000);
  });
});

describe("overrides, YTD, and formatting", () => {
  it("honors extra deductions and a federal tax override", () => {
    const result = calculatePayStub(
      stub({
        country: "US",
        frequency: "biweekly",
        regionCode: "FL",
        earnings: [hours("1", "Regular Pay", 80, 37.5)],
        statutoryOverrides: { income_tax: 100 },
        otherDeductions: [{ id: "d", label: "Health Insurance", amount: 200 }],
      }),
    );
    const federal = result.statutory.find((line) => line.key === "income_tax");
    assert.ok(federal);
    assert.equal(federal.amount, 100);
    assert.equal(federal.estimated, false);
    assert.equal(result.otherDeductionsTotal, 200);
  });

  it("counts August as the 8th monthly period for YTD", () => {
    assert.equal(periodIndexFor("monthly", "2026-08-31"), 8);
    const result = calculatePayStub(
      stub({
        country: "AE",
        earnings: [amount("1", "Basic Salary", 1_000)],
      }),
    );
    assert.equal(result.ytdGross, 8_000);
  });

  it("loads country default earnings and formats money/dates", () => {
    assert.equal(earningsFromProfile("IN")[0].label, "Basic");
    assert.equal(formatPayStubMoney(2590.77, "USD"), "$2,590.77");
    assert.equal(formatPayStubDate("2026-07-31", "en-US"), "Jul 31, 2026");
  });
});
