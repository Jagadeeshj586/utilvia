import assert from "node:assert/strict";
import test from "node:test";
import { calculatePpf, formatIndianFy, formatPpfMaturityLakh } from "./calculate";

const WU_DEFAULT = {
  annualInvestment: 150_000,
  tenureYears: 15,
  interestRatePercent: 7.1,
  accountStartYear: 2026,
};

const WU_YEARLY_BALANCES = [
  160_650, 332_706, 516_978, 714_334, 925_701, 1_152_076, 1_394_524, 1_654_185, 1_932_282, 2_230_124,
  2_549_113, 2_890_750, 3_256_643, 3_648_515, 4_068_209,
];

test("matches WorkUtilities default summary", () => {
  const result = calculatePpf(WU_DEFAULT);
  assert.ok(result);
  assert.equal(result.totalInvested, 2_250_000);
  assert.equal(result.totalInterest, 1_818_209);
  assert.equal(result.maturityValue, 4_068_209);
  assert.equal(result.estimatedTaxSaved, 675_000);
});

test("matches WorkUtilities year-by-year table", () => {
  const result = calculatePpf(WU_DEFAULT);
  assert.ok(result);
  assert.equal(result.yearRows.length, 15);
  result.yearRows.forEach((row, index) => {
    assert.equal(row.balance, WU_YEARLY_BALANCES[index], `year ${row.year} balance`);
    assert.equal(row.investment, 150_000);
  });
  assert.equal(result.yearRows[0]?.interest, 10_650);
  assert.equal(result.yearRows[14]?.interest, 269_695);
});

test("formats maturity in lakh like WorkUtilities", () => {
  assert.equal(formatPpfMaturityLakh(4_068_209), "₹40.7 lakh");
});

test("computes extension blocks for tenure beyond 15 years", () => {
  const result20 = calculatePpf({ ...WU_DEFAULT, tenureYears: 20 });
  assert.ok(result20);
  assert.equal(result20.extensionBlocks, 1);

  const result30 = calculatePpf({ ...WU_DEFAULT, tenureYears: 30 });
  assert.ok(result30);
  assert.equal(result30.extensionBlocks, 3);
});

test("returns null for out-of-range inputs", () => {
  assert.equal(calculatePpf({ ...WU_DEFAULT, annualInvestment: 400 }), null);
  assert.equal(calculatePpf({ ...WU_DEFAULT, annualInvestment: 200_000 }), null);
  assert.equal(calculatePpf({ ...WU_DEFAULT, tenureYears: 10 }), null);
  assert.equal(calculatePpf({ ...WU_DEFAULT, tenureYears: 55 }), null);
});

test("formats Indian financial year labels", () => {
  assert.equal(formatIndianFy(2032), "FY 2032-33");
  assert.equal(formatIndianFy(2028), "FY 2028-29");
});
