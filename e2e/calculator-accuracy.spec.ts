import { test, expect } from "@playwright/test";
import { calculateFeeDrag } from "../lib/growthCalculator";

function parseCurrency(text: string): number {
  return Number(text.replace(/[£,]/g, ""));
}

// "Test calculator accuracy" — cross-checks the live-rendered page against
// lib/growthCalculator.ts computed directly in this same test process
// (not a second, independent re-implementation — lib/growthCalculator.test.ts
// already does independent hand/Python verification of the function
// itself). What this adds: proof the UI actually renders what the
// function returns, correctly parsed and rounded, not a stale or
// mistransformed value.
test.describe("Calculator — live UI matches the underlying calculation exactly", () => {
  test("default scenario", async ({ page }) => {
    await page.goto("/calculator", { waitUntil: "load" });

    const expected = calculateFeeDrag({
      startingAmount: 1000,
      monthlyContribution: 200,
      years: 20,
      annualGrowthRate: 0.05,
      feeRateA: 0.0019,
      feeRateB: 0.0007,
    });

    // The cost-difference figure specifically — not just the first "£..."
    // in the sentence, which is the *starting amount* (£1,000) and
    // produced a false failure here until this was scoped down to the
    // <strong> element CalculatorResults.tsx wraps only the cost
    // difference in.
    const strongText = await page
      .locator("p", { hasText: "costs an estimated" })
      .locator("strong")
      .innerText();
    const shownCostDifference = parseCurrency(strongText);
    // Rendered with maximumFractionDigits: 0 — allow +/-1 for rounding.
    expect(
      Math.abs(shownCostDifference - expected.costDifference),
    ).toBeLessThanOrEqual(1);
  });

  test("a custom scenario via the share-link query params", async ({
    page,
  }) => {
    const params = new URLSearchParams({
      start: "5000",
      monthly: "150",
      years: "10",
      rate: "7",
      feeA: "0.5",
      feeB: "0.1",
    });
    await page.goto(`/calculator?${params.toString()}`, {
      waitUntil: "load",
    });

    const expected = calculateFeeDrag({
      startingAmount: 5000,
      monthlyContribution: 150,
      years: 10,
      annualGrowthRate: 0.07,
      feeRateA: 0.005,
      feeRateB: 0.001,
    });

    const cardTexts = await page
      .locator('[class*="breakdownCard"]')
      .allInnerTexts();
    const finalValues = cardTexts.map((text) => {
      const match = text.match(/Final value\s*£([\d,]+)/);
      const digits = match?.[1];
      return digits ? Number(digits.replace(/,/g, "")) : NaN;
    });

    expect(finalValues).toHaveLength(2);
    const shownA = finalValues[0];
    const shownB = finalValues[1];
    expect(shownA).not.toBeNaN();
    expect(shownB).not.toBeNaN();
    expect(
      Math.abs((shownA ?? NaN) - expected.scenarioA.finalValue),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs((shownB ?? NaN) - expected.scenarioB.finalValue),
    ).toBeLessThanOrEqual(1);
  });
});
