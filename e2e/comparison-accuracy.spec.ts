import { test, expect } from "@playwright/test";
import { calculateOverlap } from "../lib/overlap";
import { getFundByTicker } from "../lib/funds";

// "Test comparison accuracy" — same principle as calculator-accuracy.spec.ts:
// lib/overlap.test.ts already independently verifies calculateOverlap()
// itself against hand-computed real-data figures. This proves the live
// page renders that exact number, not a stale or mistransformed one.
test.describe("Comparison Tool — live UI overlap % matches calculateOverlap() exactly", () => {
  test("VWRP vs HSBC MSCI World (HMWO)", async ({ page }) => {
    const vwrp = getFundByTicker("vwrp");
    const hmwo = getFundByTicker("hmwo");
    if (!vwrp || !hmwo) {
      throw new Error("expected VWRP and HMWO to exist in /data/funds");
    }
    const expected = calculateOverlap(vwrp.topHoldings, hmwo.topHoldings);

    await page.goto("/compare", { waitUntil: "load" });

    const firstCombo = page.locator('[role="combobox"]').first();
    await firstCombo.fill("Vanguard FTSE All-World");
    await page.locator('[role="option"]').first().click();

    const secondCombo = page.locator('[role="combobox"]').first();
    await secondCombo.fill("HSBC");
    await page.locator('[role="option"]').first().click();

    await page.getByRole("button", { name: /^Compare$/i }).click();

    const overlapText = await page
      .getByText(/overlapping exposure/i)
      .first()
      .innerText();
    const shownPercent = Number(overlapText.match(/([\d.]+)%/)?.[1]);

    expect(shownPercent).toBeCloseTo(expected, 1);
  });
});
