# InvestorHub — End of Phase Report (Milestones 1–3)

Date: 2026-07-23 · Branch: `claude/information-review-gp1z17` · Latest commit: `d949b76` · Milestone branches: `v1.0`, `v2.0`, `v3.0`

Concise handover summary. For full detail see `handover/Milestone-{1,2,3,4}.md` and `docs/InvestorHub-project-health-review.md`.

---

## 1. What has been completed

- **Foundation** (`v1.0`): Next.js/Prisma/Postgres scaffold, database schema (users, saved comparisons, Auth.js adapter tables), magic-link auth wiring (API route + adapter, not the sign-in UI), base design-system components (Button, Card, Input, Badge).
- **Homepage, trust pages, newsletter UI** (`v2.0`): marketing homepage (no live ETF functionality), Terms/Privacy/Disclaimer pages (real draft content, visibly marked pending solicitor review), a fully-built newsletter signup form component.
- **ETF database and detail pages** (`v3.0`): 3 real, sourced funds (VWRP, VUAG, HMWO) as validated JSON, `fund_performance` table + seed data, source-attribution + confidence-badge system, full ETF detail pages (Fees/Holdings/Performance, Overview/History tabs, Data Quality block, LOCKED disclaimer), the `update-fund.ts` data-entry CLI.
- **Documentation**: a full cross-milestone Project Health Review, and per-milestone handover notes (`handover/`).

Each milestone went through a formal completion audit (findings → resolved → re-audited → approved) before being tagged.

## 2. What remains incomplete

- **Comparison Tool, Calculator, Save/Saved-Comparisons UI, Sign-in UI, Contact page, Newsletter double-opt-in confirmation** — all still placeholder pages ("Coming soon") or `501` API stubs.
- **`lib/overlap.ts`** (holdings-overlap calculation) — not started, blocked on Comparison.
- **FMP performance-data integration** — blocked on a written licence confirmation that hasn't been obtained; current performance figures are manually sourced from the same factsheets as fees/holdings, correctly labelled as such.
- **CI/CD pipeline** — specified in Technical Architecture Section 6, never built.
- **Automated test suite** — zero test files in the repo, despite the Development Roadmap explicitly requiring unit tests on `lib/confidence.ts` "written alongside the feature, not after."

## 3. Temporary workarounds and technical debt

- `PagePlaceholder` / `DraftNotice` components mark unbuilt or unreviewed pages honestly rather than shipping fake-final content — intentional, not debt, but worth knowing they exist.
- Nodemailer's SMTP config silently falls back to an inert local placeholder if `EMAIL_SERVER` is unset, so builds never fail on missing mail config — but this means a misconfigured production deploy would ship successfully while silently never sending a magic link, with no runtime warning.
- No CI and no automated tests (see above) — every regression caught so far (contrast failures, a heading-hierarchy skip, a cache-bypass bug) was caught by manual, one-off audit scripts, not anything repeatable.
- VWRP/VUAG's holdings data source (a factsheet marked "for professional investors only") is flagged, not resolved — an explicit open item in `docs/InvestorHub-legal-principles.md` Section 8, same tier as the FMP licence gate.
- VWRP's pending OCF change (0.19% → 0.14%, effective 2026-07-28) is tracked via a manual README note with the exact command to run — will go stale if not actioned on that date.
- `app/fund/[ticker]/page.tsx` is approaching 240 lines and mixes data-fetching, confidence computation, and a large inline JSX tree — fine at 3 funds, worth splitting before it grows.
- No security headers (CSP etc.) configured; no CSRF strategy decided yet for the future `/api/saved` mutation; cron-secret comparison isn't constant-time (low practical risk, noted for completeness).

## 4. Architectural decisions future work must respect

- **Fund static data (fees, holdings, allocations) lives as version-controlled JSON under `/data/funds`, never a database table.** Updates go through `scripts/update-fund.ts` and a normal PR review — there is no live write path into fund data, by design (this is the strongest security posture available for the trust-critical part of the product: nonexistent attack surface, not "well-guarded").
- **Postgres holds only genuinely dynamic data**: `fund_performance`, `users`, `saved_comparisons`, `saved_comparison_funds`, plus Auth.js's required adapter tables. Do not add a `funds` table.
- **One auth system**: magic-link only, JWT sessions, no passwords, no second (admin) auth system.
- **Confidence badge status is always computed at render time from source dates — never stored.** It can never drift out of sync with the data it describes. Any new surface showing fund data confidence must call `lib/confidence.ts`, not reimplement threshold logic.
- **No caching layer beyond Next.js ISR.** Don't add Redis or similar without a real, measured bottleneck driving it.
- **Fund search/comparison is client-side (Fuse.js) against build-time static data** — no `/api/funds` endpoint, no server round-trip per keystroke.
- **Structural compliance constraints, not just copywriting rules**: no input field anywhere may collect age/income/risk-tolerance/full-portfolio data; no verdict/ranking/"better choice" language anywhere in comparison or fund output; the confidence badge tooltip's "not a rating of the fund" clause and the fund-page disclaimer are non-optional template elements.

## 5. Known risks and items to watch during Milestones 4–6

- **The ETF detail pages built in Milestone 3 have no discoverable entry point in the live navigation** — per the Information Architecture, they're only meant to be reached from a Comparison result. Milestone 4 (Comparison Tool) must link to them; until then they're only reachable by typing the exact URL.
- **The homepage's two primary CTAs currently dead-end**, and the newsletter form fails with a misleading "try again shortly" message. Fix before showing this environment to anyone outside the build team.
- Solicitor review (Legal Principles Section 8 checklist) is still fully outstanding: Terms/Privacy content, the confidence-badge tooltip framing, comparison-tool copy (once built), the FMP licence, and founder-led content guidelines all need real legal sign-off before public launch — nothing in this repo substitutes for that.
- FMP data licence still unconfirmed in writing — do not wire the cron job to a live FMP call until that confirmation exists.
- No CI means regressions will only be caught if the same manual audit rigor is repeated every milestone — this is fragile under time pressure and doesn't scale; stand it up before Milestone 4's feature work if at all possible.
- Postgres connection pooling under serverless fan-out (Vercel + Prisma) is a known future bottleneck at higher user counts — not urgent now, worth addressing before real traffic.
- `SavedComparison.calculatorState` (JSONB) has no shape validation yet — add a Zod schema for it once Calculator actually starts writing to it.

## 6. Repository state

**Clean.** `git status` shows no uncommitted or untracked changes on `claude/information-review-gp1z17` as of this report.

## 7. Commit / tag confirmation

- All work is committed. Latest commit on `claude/information-review-gp1z17` is `d949b76`, pushed to `origin/claude/information-review-gp1z17` (branch is up to date with remote, nothing ahead or behind).
- This environment cannot push git tags (proxy restriction — only `refs/heads/*` branch updates are permitted), so milestone versions are saved as **branches** instead: `v1.0` (→ `7cc7f42`), `v2.0` (→ `bccc256`), `v3.0` (→ `67049a2`), each pushed to and verified present on `origin`.
