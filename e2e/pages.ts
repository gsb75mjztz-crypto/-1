import { getAllFundTickers } from "../lib/funds";

// Shared page list for the responsive and accessibility sweeps — one
// place to add a route so both suites pick it up, rather than maintaining
// two separate lists that can silently drift apart.
//
// Milestone 7 completion audit: fund page paths used to be hardcoded here
// as three string literals, independently of app/sitemap.ts's own fund
// list (which correctly derives from getAllFunds()). A fourth curated
// fund would have been added to the sitemap automatically but silently
// skipped by this suite forever — the exact kind of coverage gap a
// testing milestone exists to prevent, not introduce. Deriving from the
// same lib/funds.ts source both files already share closes that gap.
export const INDEXABLE_PAGES = [
  "/",
  "/compare",
  "/calculator",
  "/methodology",
  "/disclaimer",
  ...getAllFundTickers().map((ticker) => `/fund/${ticker.toLowerCase()}`),
];

// Draft/stub pages — still real routes that must render correctly and
// stay accessible, just not part of the indexable-page SEO surface (see
// each page's own `robots: { index: false }` metadata).
export const STUB_PAGES = [
  "/terms",
  "/privacy",
  "/contact",
  "/newsletter/confirm",
  "/auth/sign-in",
  "/saved",
];

export const ALL_PAGES = [...INDEXABLE_PAGES, ...STUB_PAGES];
