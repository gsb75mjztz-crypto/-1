import { test, expect } from "@playwright/test";
import { ALL_PAGES } from "./pages";

// PRD NFR-6: "fully responsive from ~360px mobile width upward." 360px is
// the narrowest viewport this product commits to supporting, and the one
// every prior milestone's manual, throwaway scripts checked by hand —
// this is that check made permanent.
test.describe("responsive layout — no horizontal overflow at 360px", () => {
  for (const path of ALL_PAGES) {
    test(`${path} has no horizontal scroll at 360px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(path, { waitUntil: "load" });

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }
});
