// Shared between app/calculator/page.tsx (parsing shareable-link URL
// params server-side) and the client form (validating live input) so the
// two can't silently drift apart.

export const CALCULATOR_DEFAULTS = {
  startingAmount: 1000,
  monthlyContribution: 200, // Product Brief's active-beginner persona: "typically £20-£300/month"
  years: 20, // the exact horizon used in the Brief's own worked example
  annualGrowthRatePercent: 5, // an illustrative moderate-growth assumption, editable — never a promise (Legal Principles Section 2)
  feeRateAPercent: 0.19, // matches VWRP's real OCF elsewhere in the product, used here as a plausible default only — not a claim this scenario IS VWRP, since the standalone calculator isn't tied to any specific fund without the Comparison pre-fill bridge
  feeRateBPercent: 0.07, // matches VUAG's real OCF, same caveat
} as const;

export const CALCULATOR_BOUNDS = {
  startingAmount: { min: 0, max: 10_000_000 },
  monthlyContribution: { min: 0, max: 100_000 },
  years: { min: 1, max: 50 },
  annualGrowthRatePercent: { min: 0, max: 20 },
  feeRatePercent: { min: 0, max: 5 }, // matches lib/fundSchema.ts's existing OCF sanity ceiling
};

export interface CalculatorInputs {
  startingAmount: number;
  monthlyContribution: number;
  years: number;
  annualGrowthRatePercent: number;
  feeRateAPercent: number;
  feeRateBPercent: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Parses and sanitizes a set of query-string values (from a shared link)
// into safe calculator inputs. Any missing or invalid value falls back to
// its default rather than producing NaN or an out-of-range figure — a
// malformed or tampered-with share link should degrade to sensible
// defaults, not a broken page.
export function parseCalculatorParams(
  params: Record<string, string | string[] | undefined>,
): CalculatorInputs {
  function num(
    key: string,
    fallback: number,
    min: number,
    max: number,
  ): number {
    const raw = params[key];
    const value = typeof raw === "string" ? Number(raw) : NaN;
    if (!Number.isFinite(value)) return fallback;
    return clamp(value, min, max);
  }

  return {
    startingAmount: num(
      "start",
      CALCULATOR_DEFAULTS.startingAmount,
      CALCULATOR_BOUNDS.startingAmount.min,
      CALCULATOR_BOUNDS.startingAmount.max,
    ),
    monthlyContribution: num(
      "monthly",
      CALCULATOR_DEFAULTS.monthlyContribution,
      CALCULATOR_BOUNDS.monthlyContribution.min,
      CALCULATOR_BOUNDS.monthlyContribution.max,
    ),
    years: num(
      "years",
      CALCULATOR_DEFAULTS.years,
      CALCULATOR_BOUNDS.years.min,
      CALCULATOR_BOUNDS.years.max,
    ),
    annualGrowthRatePercent: num(
      "rate",
      CALCULATOR_DEFAULTS.annualGrowthRatePercent,
      CALCULATOR_BOUNDS.annualGrowthRatePercent.min,
      CALCULATOR_BOUNDS.annualGrowthRatePercent.max,
    ),
    feeRateAPercent: num(
      "feeA",
      CALCULATOR_DEFAULTS.feeRateAPercent,
      CALCULATOR_BOUNDS.feeRatePercent.min,
      CALCULATOR_BOUNDS.feeRatePercent.max,
    ),
    feeRateBPercent: num(
      "feeB",
      CALCULATOR_DEFAULTS.feeRateBPercent,
      CALCULATOR_BOUNDS.feeRatePercent.min,
      CALCULATOR_BOUNDS.feeRatePercent.max,
    ),
  };
}

// Inverse of parseCalculatorParams — builds the query string for a
// shareable link from the current inputs.
export function buildCalculatorShareParams(
  inputs: CalculatorInputs,
): URLSearchParams {
  return new URLSearchParams({
    start: String(inputs.startingAmount),
    monthly: String(inputs.monthlyContribution),
    years: String(inputs.years),
    rate: String(inputs.annualGrowthRatePercent),
    feeA: String(inputs.feeRateAPercent),
    feeB: String(inputs.feeRateBPercent),
  });
}
