import { test, expect } from "@playwright/test";
import { INDEXABLE_PAGES } from "./pages";

// PRD NFR-1: "Core pages ... render primary content in under 2 seconds on
// a standard mobile connection." This does NOT test that claim — there's
// no network throttling here, no real mobile CPU, no Lighthouse score.
// What it does test, honestly: on an unthrottled local server, a page
// should still render close to instantly and shouldn't regress into
// seconds-long load times, which would be a real signal something has
// gone wrong (a blocking synchronous call, an unbounded data fetch, a
// missing await). A real NFR-1 measurement needs an actual throttled
// device/network audit (e.g. Lighthouse against a deployed URL) — that
// remains unverified, and the testing report says so plainly rather than
// implying this substitutes for it.
test.describe("performance — gross-regression timing sanity check", () => {
  for (const path of INDEXABLE_PAGES) {
    test(`${path} renders and completes load quickly on an unthrottled local server`, async ({
      page,
    }) => {
      const start = Date.now();
      await page.goto(path, { waitUntil: "load" });
      const wallClockMs = Date.now() - start;

      const timing = await page.evaluate(() => {
        const [nav] = performance.getEntriesByType(
          "navigation",
        ) as PerformanceNavigationTiming[];
        return nav
          ? {
              domContentLoaded: nav.domContentLoadedEventEnd,
              loadEvent: nav.loadEventEnd,
            }
          : null;
      });

      // A generous ceiling for "something is badly broken," not a
      // real-world budget — see the module comment above.
      expect(wallClockMs).toBeLessThan(5000);
      if (timing) {
        expect(timing.loadEvent).toBeLessThan(5000);
      }
    });
  }
});
