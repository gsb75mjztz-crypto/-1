import { test, expect } from "@playwright/test";
import { getFundByTicker } from "../lib/funds";

// The critical loops named in the Development Roadmap's Testing section:
// "Compare -> Calculator -> Save; magic-link sign-up; newsletter double
// opt-in." Sign-up and newsletter opt-in have no real backend yet (Week
// 5, correctly out of scope) — Compare -> Calculator is the one loop
// that's actually buildable today, committed as a real suite instead of
// the ad hoc scripts every milestone re-wrote from scratch
// (technical-debt-register.md entry #3).
test.describe("Comparison Tool — critical flow", () => {
  test("search, select two funds, compare, and see a verdict-free result", async ({
    page,
  }) => {
    await page.goto("/compare", { waitUntil: "load" });

    const firstCombo = page.locator('[role="combobox"]').first();
    await firstCombo.fill("Vanguard");
    await expect(page.locator('[role="option"]').first()).toBeVisible();
    await page.locator('[role="option"]').first().click();

    const secondCombo = page.locator('[role="combobox"]').first();
    await secondCombo.fill("HSBC");
    await expect(page.locator('[role="option"]').first()).toBeVisible();
    await page.locator('[role="option"]').first().click();

    await page.getByRole("button", { name: /^Compare$/i }).click();

    await expect(page.getByText(/overlapping exposure/i).first()).toBeVisible();
    // Legal Principles Section 3 — no verdict/ranking language anywhere.
    const bodyText = (await page.locator("body").innerText()).toLowerCase();
    for (const banned of [
      "best fund",
      "we recommend",
      "top pick",
      "smarter choice",
    ]) {
      expect(bodyText).not.toContain(banned);
    }
  });
});

test.describe("Comparison Tool -> Calculator — critical bridge", () => {
  test("the 'See what this fee difference costs over time' CTA carries both funds' real OCFs into the Calculator", async ({
    page,
  }) => {
    const vwrp = getFundByTicker("vwrp");
    const hmwo = getFundByTicker("hmwo");
    if (!vwrp || !hmwo) {
      throw new Error("expected VWRP and HMWO to exist in /data/funds");
    }

    await page.goto("/compare", { waitUntil: "load" });

    const firstCombo = page.locator('[role="combobox"]').first();
    await firstCombo.fill("Vanguard FTSE All-World");
    await page.locator('[role="option"]').first().click();

    const secondCombo = page.locator('[role="combobox"]').first();
    await secondCombo.fill("HSBC");
    await page.locator('[role="option"]').first().click();

    await page.getByRole("button", { name: /^Compare$/i }).click();

    const bridge = page.getByRole("link", {
      name: /See what this fee difference costs over time/i,
    });
    await expect(bridge).toBeVisible();
    await bridge.click();

    await page.waitForURL(/\/calculator\?feeA=/);

    const feeAInput = page.locator('input[type="number"]').nth(4);
    const feeBInput = page.locator('input[type="number"]').nth(5);
    await expect(feeAInput).toHaveValue(String(vwrp.ocf));
    await expect(feeBInput).toHaveValue(String(hmwo.ocf));
  });
});

test.describe("Calculator — critical flow", () => {
  test("loads with defaults, live-updates on input change, and shares a working link", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/calculator", { waitUntil: "load" });

    const summary = page.locator("p", { hasText: "costs an estimated" });
    await expect(summary).toBeVisible();
    const before = await summary.textContent();

    const yearsInput = page.locator('input[type="number"]').nth(2);
    await yearsInput.fill("5");
    await yearsInput.dispatchEvent("input");
    await expect(summary).not.toHaveText(before ?? "");

    await page.getByRole("button", { name: /Share this result/i }).click();
    await expect(
      page.getByRole("button", { name: /Link copied/i }),
    ).toBeVisible();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain("/calculator?");

    // The copied link must actually work as a pre-fill mechanism.
    const url = new URL(clipboard);
    await page.goto(url.pathname + url.search, { waitUntil: "load" });
    await expect(summary).toBeVisible();
  });
});

// Launch-prep pass: the fund page's own "See fee impact over time" link
// (app/fund/[ticker]/page.tsx) carries a single fund's real OCF into the
// Calculator via the same query-param bridge as the Compare -> Calculator
// flow above, but was previously only proven indirectly (through that
// other entry point) rather than tested from the fund page itself.
test.describe("Fund page -> Calculator — critical bridge", () => {
  test("'See fee impact over time' carries this fund's real OCF into the Calculator", async ({
    page,
  }) => {
    const vwrp = getFundByTicker("vwrp");
    if (!vwrp) {
      throw new Error("expected VWRP to exist in /data/funds");
    }

    await page.goto("/fund/vwrp", { waitUntil: "load" });

    const bridge = page.getByRole("link", {
      name: /See fee impact over time/i,
    });
    await expect(bridge).toBeVisible();
    await bridge.click();

    await page.waitForURL(/\/calculator\?feeA=/);

    const feeAInput = page.locator('input[type="number"]').nth(4);
    await expect(feeAInput).toHaveValue(String(vwrp.ocf));
  });
});
