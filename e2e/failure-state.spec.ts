import { execSync } from "node:child_process";
import { test, expect } from "@playwright/test";

// Development Roadmap Testing section: "Failure-state testing:
// deliberately simulate the FMP API failing or timing out, and confirm
// the product degrades per NFR-7 ... rather than breaking."
//
// What this test can and can't verify, honestly: fund pages are fully
// static (generateStaticParams + `revalidate: 86400`, Technical
// Architecture Section 8) — once built, a live database outage doesn't
// make an already-generated page re-run its Prisma query, so it can't
// break for a visitor mid-outage. That's the real, load-bearing
// protection NFR-7's "never a broken UI" describes for this route, and
// it's what this test verifies directly: stop the database out from
// under an already-running, already-built server and confirm the page
// is completely unaffected.
//
// What this deliberately does NOT attempt: forcing app/fund/[ticker]/
// error.tsx itself to render. That boundary is defense-in-depth for a
// different failure mode (an on-demand generation attempt for a ticker
// not yet in the static cache) that isn't deterministically triggerable
// here without either fabricating an untested ticker outside the real
// curated dataset or invasively editing .next's build cache — both worse
// than being honest that this specific path remains unverified (see
// handover/technical-debt-register.md).
//
// Skipped in CI: this controls the *local* postgresql service directly
// (`sudo service postgresql stop/start`), which only exists in this kind
// of dev/audit container. CI's Postgres is a services: container the
// workflow doesn't expose a portable way to stop from inside a test step
// without adding CI-specific plumbing that would itself be untested.
test.describe("failure state — database outage after a successful build", () => {
  test.skip(
    !!process.env.CI,
    "controls the local postgresql service directly; not portable to CI's Postgres services: container",
  );

  test("an already-built fund page keeps rendering correctly while the database is unreachable", async ({
    page,
  }) => {
    // Baseline — confirm the page is genuinely working before breaking
    // anything, so a failure below can't be misread as "was already
    // broken."
    await page.goto("/fund/vwrp", { waitUntil: "load" });
    const baseline = await page.locator("h1").innerText();
    expect(baseline).toContain("Vanguard");

    execSync("sudo service postgresql stop", { stdio: "pipe" });
    try {
      await page.goto("/fund/vwrp", { waitUntil: "load" });
      await expect(page.locator("h1")).toHaveText(baseline);
      // The disclaimer and confidence badges are the specific things
      // "never a broken UI" is protecting — not just that *a* page
      // rendered, but that the actual trust-critical content still did.
      await expect(
        page.getByText(/does not constitute financial advice/i),
      ).toBeVisible();
    } finally {
      // Unconditional — this must never leave Postgres down for every
      // other test/tool in the environment, pass or fail.
      execSync("sudo service postgresql start", { stdio: "pipe" });
      let ready = false;
      for (let attempt = 0; attempt < 20 && !ready; attempt += 1) {
        try {
          execSync("pg_isready -h 127.0.0.1 -p 5432", { stdio: "pipe" });
          ready = true;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }
      if (!ready) {
        throw new Error(
          "postgresql did not come back up after this test stopped it",
        );
      }
    }
  });
});
