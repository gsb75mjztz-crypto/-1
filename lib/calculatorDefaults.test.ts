import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  CALCULATOR_DEFAULTS,
  parseCalculatorParams,
  buildCalculatorShareParams,
} from "./calculatorDefaults";

describe("parseCalculatorParams", () => {
  test("empty params fall back to every default", () => {
    const result = parseCalculatorParams({});
    assert.deepEqual(result, {
      startingAmount: CALCULATOR_DEFAULTS.startingAmount,
      monthlyContribution: CALCULATOR_DEFAULTS.monthlyContribution,
      years: CALCULATOR_DEFAULTS.years,
      annualGrowthRatePercent: CALCULATOR_DEFAULTS.annualGrowthRatePercent,
      feeRateAPercent: CALCULATOR_DEFAULTS.feeRateAPercent,
      feeRateBPercent: CALCULATOR_DEFAULTS.feeRateBPercent,
    });
  });

  test("valid params are parsed correctly", () => {
    const result = parseCalculatorParams({
      start: "5000",
      monthly: "300",
      years: "10",
      rate: "6",
      feeA: "0.5",
      feeB: "0.1",
    });
    assert.equal(result.startingAmount, 5000);
    assert.equal(result.monthlyContribution, 300);
    assert.equal(result.years, 10);
    assert.equal(result.annualGrowthRatePercent, 6);
    assert.equal(result.feeRateAPercent, 0.5);
    assert.equal(result.feeRateBPercent, 0.1);
  });

  test("non-numeric values fall back to the default rather than NaN", () => {
    const result = parseCalculatorParams({ start: "not-a-number" });
    assert.equal(result.startingAmount, CALCULATOR_DEFAULTS.startingAmount);
    assert.ok(!Number.isNaN(result.startingAmount));
  });

  test("out-of-range values are clamped, not rejected outright", () => {
    const result = parseCalculatorParams({
      years: "999", // above the 50-year ceiling
      feeA: "-5", // below the 0% floor
    });
    assert.equal(result.years, 50);
    assert.equal(result.feeRateAPercent, 0);
  });

  test("an array value (malformed query string) falls back to the default", () => {
    const result = parseCalculatorParams({ start: ["1", "2"] });
    assert.equal(result.startingAmount, CALCULATOR_DEFAULTS.startingAmount);
  });
});

describe("buildCalculatorShareParams", () => {
  test("round-trips through parseCalculatorParams", () => {
    const inputs = {
      startingAmount: 2500,
      monthlyContribution: 150,
      years: 15,
      annualGrowthRatePercent: 4.5,
      feeRateAPercent: 0.22,
      feeRateBPercent: 0.08,
    };
    const params = buildCalculatorShareParams(inputs);
    const parsed = parseCalculatorParams(Object.fromEntries(params));
    assert.deepEqual(parsed, inputs);
  });
});
