import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ALL_PAGES } from "./pages";

// Design System Section 8 is explicit that "designed to pass" and
// "confirmed to pass" are different claims, and names an automated tool
// (axe-core, Stark) as what closes that gap — every prior milestone's
// accessibility verification was a manual Playwright script checking
// specific things (heading order, landmarks, focus-visible, 360px
// overflow) by hand, never a real automated WCAG scan. This is that scan,
// made permanent and run against every real page.
test.describe("accessibility — automated WCAG 2.1 AA scan", () => {
  for (const path of ALL_PAGES) {
    test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: "load" });

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const violations = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.map((n) => n.target.join(" ")),
      }));

      expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    });
  }
});
