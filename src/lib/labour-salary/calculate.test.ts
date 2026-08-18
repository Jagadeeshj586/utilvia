import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateSalary,
  defaultsFromCountry,
  getSalaryCountry,
  hasSalaryErrors,
  splitFromGross,
  statutoryWagesAnnual,
  validateSalary,
} from "./calculate";
import { INDIA_LABOUR_CODE_2026 } from "./india-rules";

function indiaInput(overrides: Partial<ReturnType<typeof defaultsFromCountry>> = {}) {
  const country = getSalaryCountry("IN");
  return { ...defaultsFromCountry(country), ...overrides };
}

describe("statutory wages (Labour Code 50% floor)", () => {
  it("adds excess allowances back when basic is under 50%", () => {
    const country = getSalaryCountry("IN");
    const gross = 300_000;
    const parts = splitFromGross({ ...country, defaultBasicPercent: 40, defaultHousingPercent: 20, defaultBonusPercent: 0 }, gross);
    const result = statutoryWagesAnnual({ ...parts, pfMode: "ceiling" }, true);
    assert.ok(result.statutory > result.contractual);
    assert.ok(result.excessAdded > 0);
    assert.ok(result.statutory >= result.remuneration * INDIA_LABOUR_CODE_2026.wageFloorPercent - 1);
  });

  it("does not add back when contractual wages already meet the floor excluding employer PF", () => {
    const wages = statutoryWagesAnnual(
      { basic: 200_000, housing: 0, other: 0, bonus: 0, pfMode: "ceiling" },
      true,
    );
    assert.equal(wages.contractual, 200_000);
    assert.ok(wages.excessAdded >= 0);
    assert.ok(wages.statutory >= 200_000);
  });

  it("keeps annual performance bonus out of contractual wages", () => {
    const withBonus = statutoryWagesAnnual(
      { basic: 120_000, housing: 60_000, other: 60_000, bonus: 80_000, pfMode: "ceiling" },
      true,
    );
    const without = statutoryWagesAnnual(
      { basic: 120_000, housing: 60_000, other: 60_000, bonus: 0, pfMode: "ceiling" },
      true,
    );
    assert.equal(withBonus.contractual, without.contractual);
    assert.ok(Math.abs(withBonus.statutory - without.statutory) < 1);
  });
});

describe("calculateSalary India", () => {
  it("raises PF after the wage floor on a low CTC when contributing on full wages", () => {
    const input = indiaInput({
      gross: 300_000,
      basic: 120_000,
      housing: 60_000,
      other: 120_000,
      bonus: 0,
      pfMode: "full-wages",
    });
    const result = calculateSalary(input);
    assert.ok(result.comparison);
    assert.ok(result.comparison!.after.applicableWage > result.comparison!.before.applicableWage);
    assert.ok(result.comparison!.after.employeeContributions > result.comparison!.before.employeeContributions);
    assert.ok(result.netMonthly > 0);
    assert.ok(result.employerCost > result.gross);
  });

  it("applies ESI when monthly statutory wages are at or below ₹21,000", () => {
    const input = indiaInput({
      gross: 300_000,
      basic: 120_000,
      housing: 60_000,
      other: 120_000,
      bonus: 0,
      pfMode: "full-wages",
    });
    const result = calculateSalary(input);
    assert.ok(result.employeeLines.some((line) => /ESI/.test(line.label)));
    assert.ok(result.employerLines.some((line) => /ESI/.test(line.label)));
  });

  it("caps mandatory PF at ₹15,000 a month", () => {
    const input = indiaInput({ pfMode: "ceiling" });
    const result = calculateSalary(input);
    const employeePf = result.employeeLines.find((line) => /EPF \(employee/.test(line.label))?.amount ?? 0;
    assert.equal(employeePf, 15_000 * 12 * 0.12);
  });
});

describe("calculateSalary other countries", () => {
  it("adds employer FICA on a US salary", () => {
    const country = getSalaryCountry("US");
    const result = calculateSalary(defaultsFromCountry(country));
    assert.equal(result.comparison, null);
    assert.ok(result.employerLines.some((line) => /Social Security/.test(line.label)));
    assert.ok(result.employerCost > result.gross);
    assert.ok(result.netAnnual < result.gross);
  });

  it("adds Super Guarantee in Australia", () => {
    const country = getSalaryCountry("AU");
    const result = calculateSalary(defaultsFromCountry(country));
    assert.ok(result.employerLines.some((line) => /Super Guarantee/.test(line.label)));
  });
});

describe("validateSalary", () => {
  it("rejects components that do not add up to gross", () => {
    const input = indiaInput({ basic: 100, housing: 0, other: 0, bonus: 0, gross: 1_200_000 });
    const errors = validateSalary(input);
    assert.equal(hasSalaryErrors(errors), true);
    assert.match(errors.other ?? "", /add up/i);
  });
});
