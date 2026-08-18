import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_ESI_INPUT, calculateEsi, esiCopyText } from "./calculate";

describe("ESI calculator", () => {
  it("matches the WorkUtilities default of ₹18,000", () => {
    const result = calculateEsi(DEFAULT_ESI_INPUT);
    assert.ok(result);
    assert.equal(result.eligible, true);
    assert.equal(result.employeeMonthly, 135);
    assert.equal(result.employerMonthly, 585);
    assert.equal(result.totalMonthly, 720);
    assert.equal(result.employeeAnnual, 1_620);
    assert.equal(result.employerAnnual, 7_020);
    assert.equal(result.totalAnnual, 8_640);
    assert.equal(result.professionalTaxEst, 180);
    assert.equal(result.epfEmployeeEst, 1_800);
    assert.equal(result.netTakeHomeEst, 15_885);
  });

  it("estimates PT at 1% and EPF at 12% of wages up to ₹15,000", () => {
    const result = calculateEsi({ monthlyWages: 10_000, disabled: false });
    assert.ok(result);
    assert.equal(result.employeeMonthly, 75);
    assert.equal(result.professionalTaxEst, 100);
    assert.equal(result.epfEmployeeEst, 1_200);
    assert.equal(result.netTakeHomeEst, 8_625);
  });

  it("hides coverage above the standard ceiling", () => {
    const result = calculateEsi({ monthlyWages: 25_000, disabled: false });
    assert.ok(result);
    assert.equal(result.eligible, false);
    assert.equal(result.employeeMonthly, 0);
    assert.equal(result.employerMonthly, 0);
    assert.match(esiCopyText(25_000, result), /not applicable/);
  });

  it("uses the ₹25,000 ceiling for disabled employees", () => {
    const result = calculateEsi({ monthlyWages: 25_000, disabled: true });
    assert.ok(result);
    assert.equal(result.eligible, true);
    assert.equal(result.ceiling, 25_000);
    assert.equal(result.employeeMonthly, 188);
    assert.equal(result.employerMonthly, 813);
  });
});
