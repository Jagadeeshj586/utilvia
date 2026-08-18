import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_PT_INPUT,
  PT_NO_STATE_KEY,
  calculateProfessionalTax,
  parsePtSalary,
} from "./calculate";

describe("parsePtSalary", () => {
  it("parses Indian grouping and currency symbols", () => {
    assert.equal(parsePtSalary("50,000"), 50_000);
    assert.equal(parsePtSalary("₹1,00,000"), 1_00_000);
    assert.equal(parsePtSalary(""), 0);
  });
});

describe("calculateProfessionalTax", () => {
  it("matches WorkUtilities Maharashtra default ₹50,000 male", () => {
    const result = calculateProfessionalTax(DEFAULT_PT_INPUT);
    assert.ok(result);
    assert.equal(result.monthlyPT, 200);
    assert.equal(result.februaryPT, 300);
    assert.equal(result.annualPT, 2_500);
    assert.equal(result.incomeTaxSaving, 780);
    assert.ok(result.februaryNote);
  });

  it("uses the ₹175 Maharashtra slab without hitting ₹2,500", () => {
    const result = calculateProfessionalTax({
      stateKey: "maharashtra",
      monthlySalary: 8_000,
      gender: "male",
    });
    assert.equal(result?.monthlyPT, 175);
    assert.equal(result?.februaryPT, 275);
    assert.equal(result?.annualPT, 2_200);
  });

  it("exempts Maharashtra women at or below ₹25,000", () => {
    const exempt = calculateProfessionalTax({
      stateKey: "maharashtra",
      monthlySalary: 25_000,
      gender: "female",
    });
    assert.equal(exempt?.exempt, true);
    assert.equal(exempt?.monthlyPT, 0);
    assert.equal(exempt?.annualPT, 0);

    const taxed = calculateProfessionalTax({
      stateKey: "maharashtra",
      monthlySalary: 25_001,
      gender: "female",
    });
    assert.equal(taxed?.exempt, false);
    assert.equal(taxed?.monthlyPT, 200);
    assert.equal(taxed?.annualPT, 2_500);
  });

  it("uses Karnataka slabs from WorkUtilities", () => {
    assert.equal(
      calculateProfessionalTax({ stateKey: "karnataka", monthlySalary: 14_999, gender: "male" })?.monthlyPT,
      0,
    );
    assert.equal(
      calculateProfessionalTax({ stateKey: "karnataka", monthlySalary: 15_000, gender: "male" })?.monthlyPT,
      150,
    );
    const top = calculateProfessionalTax({ stateKey: "karnataka", monthlySalary: 50_000, gender: "male" });
    assert.equal(top?.monthlyPT, 200);
    assert.equal(top?.februaryPT, null);
    assert.equal(top?.annualPT, 2_400);
  });

  it("handles Tamil Nadu half-yearly display and no-PT states", () => {
    const tn = calculateProfessionalTax({ stateKey: "tamil_nadu", monthlySalary: 50_000, gender: "male" });
    assert.equal(tn?.monthlyPT, 208);
    assert.equal(tn?.annualPT, 2_496);
    assert.ok(tn?.halfYearlyNote);

    const none = calculateProfessionalTax({
      stateKey: PT_NO_STATE_KEY,
      monthlySalary: 50_000,
      gender: "male",
    });
    assert.equal(none?.noPtState, true);
    assert.equal(none?.annualPT, 0);
    assert.equal(none?.incomeTaxSaving, 0);
  });

  it("applies West Bengal and Gujarat slabs", () => {
    assert.equal(
      calculateProfessionalTax({ stateKey: "west_bengal", monthlySalary: 12_000, gender: "male" })?.monthlyPT,
      110,
    );
    assert.equal(
      calculateProfessionalTax({ stateKey: "gujarat", monthlySalary: 12_000, gender: "male" })?.monthlyPT,
      200,
    );
  });
});
