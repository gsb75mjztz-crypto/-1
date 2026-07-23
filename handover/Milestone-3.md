# Milestone 3 — ETF database and detail pages

**Status:** Complete, approved, tagged `v3.0`.

## Objective (verbatim)

"Create the ETF database. Import the curated ETF dataset. Implement data validation. Implement the source attribution system. Build ETF detail pages. Implement the confidence badge system. Display all data exactly as defined in the ETF Page Specification. Build the data quality section. Build the methodology links. Ensure accessibility." Explicit constraint: **do not build comparison functionality.**

## What was built

- `data/funds/{VWRP,VUAG,HMWO}.json` — real, sourced fund data (fees, holdings, sector/region allocation), validated by a Zod schema (`lib/fundSchema.ts`).
- `prisma/seed.ts` — real performance figures, sourced from the same official factsheets used for fees/holdings, explicitly _not_ attributed to Financial Modeling Prep (that integration is legally gated on a licence confirmation that doesn't exist yet).
- `lib/confidence.ts` — day-threshold confidence badge logic per Design System Section 6.
- `lib/provenance.ts` — combined/split source-attribution log.
- `app/fund/[ticker]/page.tsx` and the `components/etf/*` component set — full detail page with Overview/History tabs (real ARIA tabs pattern), confidence badges, allocation tables, data quality block, the LOCKED regulatory disclaimer.
- `scripts/update-fund.ts` — CLI for updating a fund field, appends to a `history` array, validated before write.

## Audit history

**First audit — NOT APPROVED (6 blocking + 4 non-blocking).**

Blocking:

1. VWRP/VUAG's `feesSource`/`holdingsSource` cited a Vanguard factsheet PDF stating "for professional investors only... not to be distributed to the public" — inappropriate to cite on a retail-facing product.
2. Heading hierarchy skip in `FundHistoryPanel.tsx` (`<h3>` with no `<h2>` in scope).
3. No `generateMetadata` — every fund page showed the generic root `<title>InvestorHub</title>`.
4. Ticker case-sensitivity bug — `/fund/VWRP` and `/fund/vwrp` were independently cached, duplicate content.
5. A real, discovered pending OCF change for VWRP (0.19% → 0.14%, effective 2026-07-28) wasn't recorded anywhere.
6. `scripts/update-fund.ts` built a filesystem path directly from an unvalidated `--ticker` argument — path traversal risk.

Non-blocking: `lib/funds.ts`'s `JSON.parse` didn't add file context to malformed-JSON errors; no rejection of future-dated `feesPublished`/`holdingsPublished`/`lastReviewed`; a date-formatting line was duplicated 3× in the fund page; the "What does this mean?" links had no visible focus ring.

**Research into issue #1:** fetched and read the actual PDFs. Confirmed the professional-tier factsheet's restriction language. Confirmed the retail-appropriate KIID exists, has no distribution restriction, and its OCF matches exactly — but it's published only annually and its true date (2026-02-17) is much older than the factsheet's. Confirmed via the actual PDF text that the KIID contains **no** holdings/sector/region data at all. Tried Vanguard's retail website as a fresher alternative — dead end, JS-rendered SPA, unreadable via fetch tooling.

**Resolution applied:**

- Fees for VWRP/VUAG switched to the KIID with its true date — this honestly flips the Fees badge to 🔴 for these two funds, which is correct given the KIID's real annual cadence, not a bug to "fix back."
- Holdings for VWRP/VUAG stayed on the factsheet (no retail-tier alternative exists with that data granularity), source label changed from "Vanguard Official Factsheet" to "Vanguard Fund Factsheet." The residual risk — citing factual holdings data from a professional-tier document on a retail product — was **not** presented as resolved; it's an explicit item in `docs/InvestorHub-legal-principles.md` Section 8 and `docs/InvestorHub-data-strategy.md` Section 8, same tier as the FMP licence gate.
- All 5 other blocking + 4 non-blocking items fixed directly (commit `67049a2`).

**Second audit — performed directly, not delegated to a subagent, after a background audit agent was cancelled mid-run.** Real production build, lint, format, type-check, a throwaway-Postgres migrate+seed+build+serve cycle, curl/Playwright checks against the live server. **APPROVED.** Tagged `v3.0`.

## Key decisions worth knowing

- The KIID/factsheet split (fees from one document, holdings from another, for the same two funds) is a genuine consequence of the two documents covering different data, not an inconsistency — but it means VWRP/VUAG display _different_ confidence badges for Fees (🔴) vs Holdings (🟢) while HMWO (single-source) shows 🟢 for both. If this looks like a bug on first glance, it isn't — check `data/funds/VWRP.json`'s `feesPublished` vs `holdingsPublished` before assuming so.
- `lib/fundSchema.ts`'s future-date rejection compares against UTC "now," computed wherever validation runs (build/dev machine) — not any particular user's timezone. Not wrong, just worth knowing it's a UTC boundary.

## Open items carried forward

- **The big one, surfaced by the subsequent Project Health Review, not by this milestone's own audit:** the Individual ETF Page is specced (per Information Architecture) to be reached _only_ from the Comparison Tool — "it never appears in global nav because it's not a destination on its own." Comparison doesn't exist yet. **These pages currently have no discoverable entry point in the shipped product.** This wasn't caught by either audit round because both audits (correctly, per their brief) evaluated the fund pages against their own spec in isolation, not against the site's actual navigable structure.
- VWRP/VUAG holdings-source question — flagged for solicitor review, not resolved. See `docs/InvestorHub-legal-principles.md` Section 8.
- VWRP pending OCF change (0.19% → 0.14%, effective 2026-07-28) — documented in `README.md` under "Known upcoming data changes," with the exact command to run on/after that date. This is a manual/process-dependent tracking mechanism and will go stale if nobody runs it.
- Still no CI pipeline, still no automated tests — three milestones deep with `lib/confidence.ts` (explicitly called out in the roadmap as needing unit tests "written alongside the feature, not after") having zero test coverage.

## See also

`docs/InvestorHub-project-health-review.md` — the full cross-milestone review performed immediately after this milestone, which is what surfaced the navigation/entry-point problem above. Read that before starting Milestone 4.
