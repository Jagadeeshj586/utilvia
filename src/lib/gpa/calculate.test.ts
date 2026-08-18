import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateWeightedGpa, gradePointFor, parseCreditHours } from "./calculate";

describe("gradePointFor", () => {
  it("maps standard letter grades", () => {
    assert.equal(gradePointFor("A"), 4);
    assert.equal(gradePointFor("B+"), 3.3);
    assert.equal(gradePointFor("D-"), 0.7);
    assert.equal(gradePointFor("F"), 0);
  });
});

describe("parseCreditHours", () => {
  it("accepts positive numbers", () => {
    assert.equal(parseCreditHours("3"), 3);
    assert.equal(parseCreditHours(4.5), 4.5);
  });

  it("rejects invalid values", () => {
    assert.equal(parseCreditHours("0"), null);
    assert.equal(parseCreditHours("-2"), null);
    assert.equal(parseCreditHours(""), null);
  });
});

describe("calculateWeightedGpa", () => {
  it("matches WorkUtilities default example (3×3 credits, all B)", () => {
    const result = calculateWeightedGpa([
      { credits: 3, grade: "B" },
      { credits: 3, grade: "B" },
      { credits: 3, grade: "B" },
    ]);
    assert.equal(result.weightedGpa, 3);
    assert.equal(result.totalCredits, 9);
    assert.equal(result.totalGradePoints, 27);
    assert.equal(result.courseCount, 3);
  });

  it("weights courses by credit hours", () => {
    const result = calculateWeightedGpa([
      { credits: 4, grade: "A" },
      { credits: 2, grade: "C" },
    ]);
    assert.equal(result.totalGradePoints, 20);
    assert.equal(result.totalCredits, 6);
    assert.ok(Math.abs(result.weightedGpa - 20 / 6) < 0.0001);
  });

  it("ignores rows with invalid credits", () => {
    const result = calculateWeightedGpa([{ credits: 0, grade: "A" }, { credits: 3, grade: "A" }]);
    assert.equal(result.totalCredits, 3);
    assert.equal(result.weightedGpa, 4);
    assert.equal(result.courseCount, 1);
  });
});
