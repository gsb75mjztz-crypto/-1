// Compound growth, contribution, and fee-drag maths for the Growth &
// Fee-Drag Calculator (PRD US-4, Development Roadmap Week 4). Pure
// functions, deliberately — this is explicitly the most consequential
// numeric code in the product to get right ("the calculator's growth
// math" is named directly alongside lib/confidence.ts in the roadmap's
// testing requirements), so every function here has a hand-verified test
// in growthCalculator.test.ts, not just an assertion that it "looks
// right."
//
// Legal Principles Section 2 is explicit that these inputs are
// hypothetical "what if" scenario inputs, not a suitability assessment —
// the assumed annual growth rate in particular is a user-editable
// illustration, never presented as a forecast or promise. That framing is
// enforced in the UI copy (components/calculator), not here — this module
// only computes what the numbers actually are, given the assumptions
// entered.

export interface GrowthScenarioInput {
  startingAmount: number; // lump sum invested at year 0, in pounds
  monthlyContribution: number; // added at the end of each month, in pounds
  years: number; // time horizon
  annualGrowthRate: number; // assumed gross annual return, as a decimal (0.05 = 5%)
  annualFeeRate: number; // OCF, as a decimal (0.0019 = 0.19%)
}

export interface GrowthYearPoint {
  year: number; // 0..years inclusive
  totalContributed: number; // principal only — starting amount + contributions to date, no growth
  value: number; // total portfolio value at this point
}

export interface GrowthResult {
  finalValue: number;
  totalContributed: number;
  totalGrowth: number; // finalValue - totalContributed; can be negative only if annualFeeRate exceeds annualGrowthRate
  series: GrowthYearPoint[];
}

export interface FeeDragInput {
  startingAmount: number;
  monthlyContribution: number;
  years: number;
  annualGrowthRate: number;
  feeRateA: number;
  feeRateB: number;
}

export interface FeeDragResult {
  scenarioA: GrowthResult;
  scenarioB: GrowthResult;
  // Always >= 0 — the absolute pound cost of the higher-fee scenario
  // relative to the lower-fee one, at the chosen horizon. Which of A/B is
  // "higher fee" is for the caller to know from the inputs; this module
  // doesn't attach a verdict to either side (Legal Principles Section 3 —
  // no "Fund A is the smarter pick" framing, ever).
  costDifference: number;
}

// Converts an assumed *annual* growth rate into the *monthly* rate that,
// compounded 12 times, reproduces it exactly — i.e. (1+monthly)^12 =
// (1+annual). This is more precise than the common annualRate/12
// shortcut, and it's what growthCalculator.test.ts's "1 year, no
// contributions" case checks directly: compounding this monthly rate 12
// times must equal the annual rate to floating-point precision.
export function monthlyRateFromAnnual(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

// Future value of a starting lump sum plus a monthly contribution added
// at the *end* of each month (the standard "ordinary annuity"
// convention), compounded monthly at monthlyRate for the given number of
// months. See growthCalculator.test.ts for a hand-computed 3-month
// reference case verifying this against a manual month-by-month
// simulation, not just re-deriving the same formula twice.
export function futureValueWithContributions(
  startingAmount: number,
  monthlyContribution: number,
  monthlyRate: number,
  months: number,
): number {
  const lumpSumValue = startingAmount * Math.pow(1 + monthlyRate, months);
  const contributionsValue =
    monthlyRate === 0
      ? monthlyContribution * months
      : monthlyContribution *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  return lumpSumValue + contributionsValue;
}

// Builds the full year-by-year series (for charting) and the summary
// figures (for the headline numbers) for a single fee scenario.
export function calculateGrowth(input: GrowthScenarioInput): GrowthResult {
  const netAnnualRate = input.annualGrowthRate - input.annualFeeRate;
  const monthlyRate = monthlyRateFromAnnual(netAnnualRate);

  const series: GrowthYearPoint[] = [];
  // Tracked alongside the loop (rather than read back via
  // series[series.length - 1] afterwards) so TypeScript's strict array
  // indexing doesn't need convincing the series is never empty — it
  // always has at least the year-0 point, since the loop runs for
  // year = 0..years inclusive, but that invariant isn't visible to the
  // type checker from an index expression alone.
  let final: GrowthYearPoint = {
    year: 0,
    totalContributed: input.startingAmount,
    value: input.startingAmount,
  };
  for (let year = 0; year <= input.years; year += 1) {
    const months = year * 12;
    const totalContributed =
      input.startingAmount + input.monthlyContribution * months;
    const value = futureValueWithContributions(
      input.startingAmount,
      input.monthlyContribution,
      monthlyRate,
      months,
    );
    final = { year, totalContributed, value };
    series.push(final);
  }

  return {
    finalValue: final.value,
    totalContributed: final.totalContributed,
    totalGrowth: final.value - final.totalContributed,
    series,
  };
}

// Runs the same starting amount/contribution/horizon/growth-rate
// assumptions through two different fee rates, so the *only* variable
// between scenario A and B is the fee — isolating fee drag as a concrete
// pound figure, per the Product Brief's own worked example ("this 0.7%
// difference costs you £X over 20 years").
export function calculateFeeDrag(input: FeeDragInput): FeeDragResult {
  const shared = {
    startingAmount: input.startingAmount,
    monthlyContribution: input.monthlyContribution,
    years: input.years,
    annualGrowthRate: input.annualGrowthRate,
  };
  const scenarioA = calculateGrowth({
    ...shared,
    annualFeeRate: input.feeRateA,
  });
  const scenarioB = calculateGrowth({
    ...shared,
    annualFeeRate: input.feeRateB,
  });
  return {
    scenarioA,
    scenarioB,
    costDifference: Math.abs(scenarioA.finalValue - scenarioB.finalValue),
  };
}
