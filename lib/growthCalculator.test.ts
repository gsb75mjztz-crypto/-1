import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  monthlyRateFromAnnual,
  futureValueWithContributions,
  calculateGrowth,
  calculateFeeDrag,
} from "./growthCalculator";

function closeTo(actual: number, expected: number, tolerance = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

describe("monthlyRateFromAnnual", () => {
  test("compounding the monthly rate 12 times reproduces the annual rate exactly", () => {
    // This is the definition monthlyRateFromAnnual is built on, checked
    // independently rather than re-deriving the same formula twice.
    const annualRate = 0.05;
    const monthlyRate = monthlyRateFromAnnual(annualRate);
    const reconstructedAnnual = Math.pow(1 + monthlyRate, 12) - 1;
    closeTo(reconstructedAnnual, annualRate, 1e-9);
  });

  test("0% annual rate gives 0% monthly rate", () => {
    assert.equal(monthlyRateFromAnnual(0), 0);
  });
});

describe("futureValueWithContributions", () => {
  test("hand-computed reference: £1000 start, £100/month, 1%/month, 3 months", () => {
    // Manual month-by-month simulation (contribution added at the END of
    // each month, after that month's growth is applied):
    //   end of month 1: 1000 * 1.01 = 1010, + 100 = 1110
    //   end of month 2: 1110 * 1.01 = 1121.1, + 100 = 1221.1
    //   end of month 3: 1221.1 * 1.01 = 1233.311, + 100 = 1333.311
    const result = futureValueWithContributions(1000, 100, 0.01, 3);
    closeTo(result, 1333.311, 1e-6);
  });

  test("zero contribution reduces to simple lump-sum compounding", () => {
    const result = futureValueWithContributions(1000, 0, 0.01, 3);
    closeTo(result, 1000 * Math.pow(1.01, 3), 1e-9);
  });

  test("zero rate reduces to a simple linear sum, no compounding", () => {
    const result = futureValueWithContributions(1000, 100, 0, 12);
    assert.equal(result, 1000 + 100 * 12);
  });

  test("zero months returns exactly the starting amount", () => {
    assert.equal(futureValueWithContributions(1000, 100, 0.05, 0), 1000);
  });
});

describe("calculateGrowth", () => {
  test("£1000 lump sum, no contributions, 5% for exactly 1 year equals £1050", () => {
    // Relies on monthlyRateFromAnnual's round-trip property: 12 months
    // at the derived monthly rate must reproduce the annual rate exactly.
    const result = calculateGrowth({
      startingAmount: 1000,
      monthlyContribution: 0,
      years: 1,
      annualGrowthRate: 0.05,
      annualFeeRate: 0,
    });
    closeTo(result.finalValue, 1050, 1e-6);
  });

  test("totalContributed tracks principal only, never includes growth", () => {
    const result = calculateGrowth({
      startingAmount: 500,
      monthlyContribution: 50,
      years: 2,
      annualGrowthRate: 0.07,
      annualFeeRate: 0,
    });
    assert.equal(result.totalContributed, 500 + 50 * 24);
    // With a positive net rate, growth must be positive.
    assert.ok(result.totalGrowth > 0);
  });

  test("totalGrowth is exactly finalValue minus totalContributed", () => {
    const result = calculateGrowth({
      startingAmount: 1000,
      monthlyContribution: 100,
      years: 10,
      annualGrowthRate: 0.06,
      annualFeeRate: 0.005,
    });
    closeTo(
      result.totalGrowth,
      result.finalValue - result.totalContributed,
      1e-9,
    );
  });

  test("series has exactly years+1 points, starting at year 0 with no growth yet", () => {
    const result = calculateGrowth({
      startingAmount: 1000,
      monthlyContribution: 100,
      years: 5,
      annualGrowthRate: 0.05,
      annualFeeRate: 0,
    });
    assert.equal(result.series.length, 6);
    const [first] = result.series;
    const last = result.series.at(-1);
    assert.ok(first && last);
    assert.equal(first.year, 0);
    assert.equal(first.value, 1000);
    assert.equal(last.year, 5);
  });

  test("higher fee rate produces a lower final value, all else equal", () => {
    const lowFee = calculateGrowth({
      startingAmount: 1000,
      monthlyContribution: 100,
      years: 20,
      annualGrowthRate: 0.05,
      annualFeeRate: 0.001,
    });
    const highFee = calculateGrowth({
      startingAmount: 1000,
      monthlyContribution: 100,
      years: 20,
      annualGrowthRate: 0.05,
      annualFeeRate: 0.01,
    });
    assert.ok(lowFee.finalValue > highFee.finalValue);
    // Both scenarios contribute the same principal — only the fee differs.
    assert.equal(lowFee.totalContributed, highFee.totalContributed);
  });

  test("zero years returns a single point equal to the starting amount", () => {
    const result = calculateGrowth({
      startingAmount: 2000,
      monthlyContribution: 100,
      years: 0,
      annualGrowthRate: 0.05,
      annualFeeRate: 0,
    });
    assert.equal(result.series.length, 1);
    assert.equal(result.finalValue, 2000);
    assert.equal(result.totalContributed, 2000);
  });
});

describe("calculateFeeDrag", () => {
  test("costDifference matches the two scenarios' final-value difference", () => {
    const result = calculateFeeDrag({
      startingAmount: 5000,
      monthlyContribution: 200,
      years: 20,
      annualGrowthRate: 0.05,
      feeRateA: 0.0019, // e.g. VWRP
      feeRateB: 0.0007, // e.g. VUAG
    });
    closeTo(
      result.costDifference,
      Math.abs(result.scenarioA.finalValue - result.scenarioB.finalValue),
      1e-9,
    );
  });

  test("costDifference is always non-negative regardless of A/B order", () => {
    const aFirst = calculateFeeDrag({
      startingAmount: 1000,
      monthlyContribution: 50,
      years: 15,
      annualGrowthRate: 0.05,
      feeRateA: 0.02,
      feeRateB: 0.001,
    });
    const bFirst = calculateFeeDrag({
      startingAmount: 1000,
      monthlyContribution: 50,
      years: 15,
      annualGrowthRate: 0.05,
      feeRateA: 0.001,
      feeRateB: 0.02,
    });
    assert.ok(aFirst.costDifference >= 0);
    closeTo(aFirst.costDifference, bFirst.costDifference, 1e-9);
  });

  test("identical fee rates produce zero cost difference", () => {
    const result = calculateFeeDrag({
      startingAmount: 1000,
      monthlyContribution: 100,
      years: 10,
      annualGrowthRate: 0.05,
      feeRateA: 0.0015,
      feeRateB: 0.0015,
    });
    closeTo(result.costDifference, 0, 1e-9);
  });

  test("realistic 20-year VWRP-vs-VUAG scenario produces a plausible, sanity-checked figure", () => {
    // Not a hand-derived exact reference (the compounding makes that
    // impractical by hand at this horizon) — a sanity bound instead:
    // the cost of a 0.12-point fee difference on ~£53,000 contributed
    // over 20 years at 5% growth should be a real but modest fraction of
    // the final value, not something wildly implausible.
    const result = calculateFeeDrag({
      startingAmount: 1000,
      monthlyContribution: 200,
      years: 20,
      annualGrowthRate: 0.05,
      feeRateA: 0.19 / 100,
      feeRateB: 0.07 / 100,
    });
    assert.ok(result.costDifference > 0);
    assert.ok(result.costDifference < result.scenarioA.finalValue * 0.1);
  });
});

// Milestone 7 — edge cases beyond the happy path, per the milestone's
// explicit "test calculator accuracy" objective.
describe("calculateGrowth — edge cases", () => {
  test("fee exceeding growth rate produces negative total growth, not a crash or a floor at zero", () => {
    // GrowthResult's own type comment says totalGrowth "can be negative
    // only if annualFeeRate exceeds annualGrowthRate" — that branch had
    // no direct test until now.
    const result = calculateGrowth({
      startingAmount: 1000,
      monthlyContribution: 0,
      years: 5,
      annualGrowthRate: 0.01,
      annualFeeRate: 0.03,
    });
    assert.ok(result.totalGrowth < 0);
    assert.ok(result.finalValue < result.totalContributed);
    // Still arithmetically consistent even in the loss case.
    closeTo(
      result.totalGrowth,
      result.finalValue - result.totalContributed,
      1e-9,
    );
  });

  test("zero starting amount with contributions still grows correctly (contribution-only scenario)", () => {
    const result = calculateGrowth({
      startingAmount: 0,
      monthlyContribution: 100,
      years: 1,
      annualGrowthRate: 0.06,
      annualFeeRate: 0,
    });
    assert.equal(result.totalContributed, 100 * 12);
    assert.ok(result.finalValue > result.totalContributed);
  });

  test("zero starting amount and zero contribution stays flat at zero for the whole horizon", () => {
    const result = calculateGrowth({
      startingAmount: 0,
      monthlyContribution: 0,
      years: 10,
      annualGrowthRate: 0.07,
      annualFeeRate: 0.01,
    });
    assert.equal(result.finalValue, 0);
    assert.equal(result.totalContributed, 0);
    assert.equal(result.totalGrowth, 0);
    assert.ok(result.series.every((point) => point.value === 0));
  });

  test("a long horizon (50 years, the Calculator's upper bound) produces a finite, sane result", () => {
    const result = calculateGrowth({
      startingAmount: 10_000_000, // CALCULATOR_BOUNDS.startingAmount.max
      monthlyContribution: 100_000, // CALCULATOR_BOUNDS.monthlyContribution.max
      years: 50, // CALCULATOR_BOUNDS.years.max
      annualGrowthRate: 0.2, // CALCULATOR_BOUNDS.annualGrowthRatePercent.max
      annualFeeRate: 0,
    });
    assert.ok(Number.isFinite(result.finalValue));
    assert.ok(result.finalValue > 0);
    assert.equal(result.series.length, 51);
  });
});

describe("calculateFeeDrag — edge cases", () => {
  test("zero monthly contribution (lump sum only) still isolates fee drag correctly", () => {
    const result = calculateFeeDrag({
      startingAmount: 10000,
      monthlyContribution: 0,
      years: 20,
      annualGrowthRate: 0.05,
      feeRateA: 0.02,
      feeRateB: 0.001,
    });
    assert.equal(result.scenarioA.totalContributed, 10000);
    assert.equal(result.scenarioB.totalContributed, 10000);
    assert.ok(result.costDifference > 0);
  });

  test("both fees exceeding the growth rate still produces a correctly-signed, finite cost difference", () => {
    const result = calculateFeeDrag({
      startingAmount: 1000,
      monthlyContribution: 50,
      years: 10,
      annualGrowthRate: 0.01,
      feeRateA: 0.05,
      feeRateB: 0.03,
    });
    assert.ok(result.scenarioA.totalGrowth < 0);
    assert.ok(result.scenarioB.totalGrowth < 0);
    assert.ok(Number.isFinite(result.costDifference));
    assert.ok(result.costDifference > 0);
  });
});
