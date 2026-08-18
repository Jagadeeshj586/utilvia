"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const sip_1 = require("./sip");
const approx = (actual, expected, tolerance = 2) => {
    strict_1.default.ok(Number.isFinite(actual), `expected finite number, got ${actual}`);
    strict_1.default.ok(Math.abs(actual - expected) <= tolerance, `expected ~${expected}, got ${actual}`);
};
(0, node_test_1.describe)("sipFutureValue", () => {
    (0, node_test_1.it)("matches the standard 10k / 12% / 10y example", () => {
        const fv = (0, sip_1.sipFutureValue)(10000, 0.01, 120);
        approx(fv, 2323391, 2);
    });
    (0, node_test_1.it)("returns P × n when monthly rate is 0", () => {
        strict_1.default.equal((0, sip_1.sipFutureValue)(10000, 0, 120), 1200000);
    });
});
(0, node_test_1.describe)("calculateStandardSIP", () => {
    (0, node_test_1.it)("1. standard SIP: ₹10,000, 12%, 10 years", () => {
        const result = (0, sip_1.calculateStandardSIP)({ monthlyInvestment: 10000, annualReturn: 12, years: 10 });
        strict_1.default.equal(result.totalInvested, 1200000);
        approx(result.futureValue, 2323391, 2);
        approx(result.estimatedReturns, 1123391, 2);
        strict_1.default.equal(result.months, 120);
        strict_1.default.equal(result.yearlyBreakdown.length, 10);
        strict_1.default.equal(result.yearlyBreakdown[0].invested, 120000);
        approx(result.yearlyBreakdown[0].totalValue, 128093, 2);
    });
    (0, node_test_1.it)("2. zero return", () => {
        const result = (0, sip_1.calculateSIP)({ monthlyInvestment: 8000, annualReturn: 0, years: 5 });
        strict_1.default.equal(result.futureValue, 8000 * 60);
        strict_1.default.equal(result.estimatedReturns, 0);
        strict_1.default.equal(result.totalInvested, 480000);
    });
    (0, node_test_1.it)("3. very low return", () => {
        const result = (0, sip_1.calculateSIP)({ monthlyInvestment: 10000, annualReturn: 0.1, years: 5 });
        strict_1.default.ok(result.futureValue > result.totalInvested);
        strict_1.default.ok(result.futureValue < 10000 * 60 * 1.02);
    });
    (0, node_test_1.it)("4. high return", () => {
        const result = (0, sip_1.calculateSIP)({ monthlyInvestment: 10000, annualReturn: 30, years: 10 });
        strict_1.default.ok(result.futureValue > 5000000);
        strict_1.default.equal(result.totalInvested, 1200000);
    });
    (0, node_test_1.it)("5. one-year duration", () => {
        const result = (0, sip_1.calculateSIP)({ monthlyInvestment: 10000, annualReturn: 12, years: 1 });
        strict_1.default.equal(result.totalInvested, 120000);
        strict_1.default.equal(result.yearlyBreakdown.length, 1);
        approx(result.futureValue, (0, sip_1.sipFutureValue)(10000, 0.01, 12), 0.01);
    });
    (0, node_test_1.it)("6. long duration", () => {
        const result = (0, sip_1.calculateSIP)({ monthlyInvestment: 10000, annualReturn: 12, years: 40 });
        strict_1.default.equal(result.totalInvested, 4800000);
        strict_1.default.equal(result.yearlyBreakdown.length, 40);
        strict_1.default.ok(result.futureValue > result.totalInvested);
    });
    (0, node_test_1.it)("7. minimum investment", () => {
        const result = (0, sip_1.calculateSIP)({ monthlyInvestment: sip_1.SIP_LIMITS.monthlyInvestment.min, annualReturn: 12, years: 10 });
        strict_1.default.equal(result.totalInvested, 500 * 120);
        strict_1.default.ok(result.futureValue > 0);
    });
    (0, node_test_1.it)("8. maximum investment", () => {
        const result = (0, sip_1.calculateSIP)({ monthlyInvestment: sip_1.SIP_LIMITS.monthlyInvestment.max, annualReturn: 12, years: 10 });
        strict_1.default.equal(result.totalInvested, 1000000 * 120);
    });
    (0, node_test_1.it)("9. decimal return", () => {
        const result = (0, sip_1.calculateSIP)({ monthlyInvestment: 10000, annualReturn: 12.5, years: 8 });
        strict_1.default.ok(Number.isFinite(result.futureValue));
        strict_1.default.ok(result.futureValue > result.totalInvested);
    });
});
(0, node_test_1.describe)("calculateStepUpSIP", () => {
    (0, node_test_1.it)("10. step-up SIP grows contributions each year", () => {
        const result = (0, sip_1.calculateStepUpSIP)({
            monthlyInvestment: 10000,
            annualReturn: 12,
            years: 3,
            stepUpEnabled: true,
            stepUpPercent: 10,
        });
        approx(result.yearlyBreakdown[0].monthlySip, 10000, 0.01);
        approx(result.yearlyBreakdown[1].monthlySip, 11000, 0.01);
        approx(result.yearlyBreakdown[2].monthlySip, 12100, 0.01);
        strict_1.default.ok(result.totalInvested > 10000 * 36);
        strict_1.default.ok(result.futureValue > result.totalInvested);
    });
    (0, node_test_1.it)("step-up at 0% matches standard SIP", () => {
        const standard = (0, sip_1.calculateStandardSIP)({ monthlyInvestment: 10000, annualReturn: 12, years: 10 });
        const step = (0, sip_1.calculateStepUpSIP)({
            monthlyInvestment: 10000,
            annualReturn: 12,
            years: 10,
            stepUpEnabled: true,
            stepUpPercent: 0,
        });
        approx(step.futureValue, standard.futureValue, 1);
        approx(step.totalInvested, standard.totalInvested, 0.01);
    });
    (0, node_test_1.it)("calculateSIP uses standard formula when step-up is off", () => {
        const result = (0, sip_1.calculateSIP)({ monthlyInvestment: 10000, annualReturn: 12, years: 10, stepUpEnabled: false });
        strict_1.default.equal(result.mode, "standard");
        approx(result.futureValue, 2323391, 2);
    });
});
(0, node_test_1.describe)("validation and bounds", () => {
    (0, node_test_1.it)("11. invalid input", () => {
        const errors = (0, sip_1.validateSipInput)({ monthlyInvestment: 100, annualReturn: -1, years: 0 });
        strict_1.default.ok(errors.monthlyInvestment);
        strict_1.default.ok(errors.annualReturn);
        strict_1.default.ok(errors.years);
    });
    (0, node_test_1.it)("12. boundary values", () => {
        const minOk = (0, sip_1.validateSipInput)({ monthlyInvestment: 500, annualReturn: 0, years: 1 });
        const maxOk = (0, sip_1.validateSipInput)({ monthlyInvestment: 1000000, annualReturn: 30, years: 40 });
        strict_1.default.deepEqual(minOk, {});
        strict_1.default.deepEqual(maxOk, {});
        const clamped = (0, sip_1.clampSipInput)({ monthlyInvestment: -50, annualReturn: 99, years: 100 });
        strict_1.default.equal(clamped.monthlyInvestment, 500);
        strict_1.default.equal(clamped.annualReturn, 30);
        strict_1.default.equal(clamped.years, 40);
    });
    (0, node_test_1.it)("never returns NaN or Infinity", () => {
        const samples = [
            (0, sip_1.calculateSIP)({ monthlyInvestment: 10000, annualReturn: 0, years: 1 }),
            (0, sip_1.calculateSIP)({ monthlyInvestment: 1000000, annualReturn: 30, years: 40 }),
            (0, sip_1.calculateStepUpSIP)({ monthlyInvestment: 500, annualReturn: 0, years: 2, stepUpPercent: 15 }),
        ];
        for (const result of samples) {
            strict_1.default.ok(Number.isFinite(result.futureValue));
            strict_1.default.ok(Number.isFinite(result.totalInvested));
            strict_1.default.ok(Number.isFinite(result.estimatedReturns));
            strict_1.default.ok(result.futureValue >= 0);
        }
    });
});
