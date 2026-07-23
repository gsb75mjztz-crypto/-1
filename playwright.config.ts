import { defineConfig, devices } from "@playwright/test";

// Milestone 7 — the committed integration/E2E suite (technical debt
// register entry #3: every browser check across Milestones 4-6 was a
// real Playwright run, but a throwaway script, not a repeatable suite CI
// re-runs on the next change). This config is what makes that repeatable.
//
// `executablePath` is only set when PLAYWRIGHT_EXECUTABLE_PATH is
// present — this dev container has a pre-installed Chromium at a fixed
// path and the environment's own instructions say to use it rather than
// letting Playwright download its own. CI has no such variable, so it
// falls through to Playwright's normal managed-browser behaviour (after
// `npx playwright install --with-deps chromium` in the CI workflow).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // In CI: GitHub Actions annotations inline on the PR, plus an HTML
  // report the workflow uploads as an artifact on failure (see
  // .github/workflows/ci.yml) — "github" alone annotates but doesn't
  // write a report to disk.
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // In CI, `npm run build` already ran as its own step (so `npm run
  // start` has something to serve) — Playwright then starts the server
  // itself here and waits for it to actually respond before running any
  // test, rather than a hand-rolled sleep/curl loop in the workflow file.
  // Locally, `reuseExistingServer` means the manual build-then-start
  // workflow already used throughout this project's verification passes
  // just works unchanged — Playwright detects the running server on
  // baseURL and doesn't spawn a second one.
  webServer: {
    command: "npm run start",
    url: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
