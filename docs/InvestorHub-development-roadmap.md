# Engineering Plan — Development Roadmap

Built directly on the PRD, the simplified architecture (v2), the design system, and the user flows — this document sequences those into weeks. 7 build weeks + 1 launch week, inside the original 6–8 week MVP window. Every week has one milestone that's either true or not true — no "mostly done."

## Week 0 (pre-work, runs before Week 1 starts, not part of the 7-week clock)

Two things gate the whole project and both have external turnaround time, so they start immediately, in parallel with nothing else:

- **Legal review** of the comparison tool's language and disclaimers against UK financial promotion / advice-boundary rules (per the earlier regulatory discussion) — sent to a solicitor now, because this has the longest, least controllable turnaround time of anything in the project and cannot be compressed by working harder in Week 6.
- **FMP licensing confirmation in writing** — explicit confirmation that the paid tier covers end-user display in a commercial product (per the data-sourcing decision) — a blocking dependency for Week 2's performance-data integration.

Also starts now, as a parallel content track, not an engineering task: **fund data curation begins** — sourcing fees/holdings from official factsheets for the first batch of funds. This has no code dependency and should never be the reason engineering is blocked, but engineering has nothing real to test against until it exists, so it needs a head start.

## Week 1 — Foundation

Build: repo scaffold (Next.js, Prisma, Postgres via Supabase/Neon), CI/CD pipeline (GitHub Actions + Vercel preview deployments), the three-table schema from the architecture doc, magic-link auth wired end-to-end, core design system components (Button, Card, Input, Badge) built to the Design System doc's spec.

Dependency note: every page built from Week 2 onward depends on these components existing first — this week is the one place in the plan where slipping the schedule has knock-on cost for everything after it, so it's worth protecting even if it means trimming scope elsewhere later.

**Milestone (must be true, not aspirational):** an empty deployed app where a real user can sign up via magic link, land in a signed-in state, and see the design system's base components rendered correctly in both light and dark mode.

## Week 2 — The trust chain, proven once, for real

Build: `/data/funds` JSON schema + `update-fund.ts` script, `lib/confidence.ts` (pure function, unit-tested), the Individual ETF Page (Fees/Holdings/Performance sections, Data Quality block, disclaimer line), FMP cron job wired for a first small batch of funds (blocked on Week 0's licensing confirmation landing in time).

Dependency note: this is deliberately the first real feature built, before Comparison or Calculator, because it's the smallest complete slice of the entire trust proposition — a real fund, real sourced data, a correct confidence badge, a correct disclaimer. Everything else in the product is a way of getting a user to this page or to the calculator; proving this one page is right, early, de-risks the whole plan more than building breadth would.

**Milestone:** one real, fully sourced fund renders correctly end-to-end — data file → page → confidence badge (with correct threshold logic) → disclaimer — checked by hand against the actual Vanguard/iShares factsheet it came from.

## Week 3 — Comparison Tool

Build: fund search/typeahead (Fuse.js, client-side), 2–3 fund selection UI, comparison results (metrics, inline explanations, client-side holdings-overlap calculation), explicit QA pass confirming no verdict/ranking language anywhere in the output.

Parallel track: fund data curation continues — target 20–25 funds sourced and reviewed by end of this week, since the comparison tool is only meaningfully testable once there's more than one or two funds to compare.

**Milestone:** a user can search, select two real funds, and see a correct, fully-explained, verdict-free comparison.

## Week 4 — Calculator

Build: standalone entry point, pre-filled entry from Comparison and from a Fund Page's "see fee impact" link, growth visualization, plain-language result sentence, share function. Also starts (not finishes) the History tab's provenance log, since it's required for launch per the PRD but is low-complexity relative to Comparison/Calculator.

Dependency note: the pre-fill bridges (Comparison → Calculator, Fund Page → Calculator) depend on both source pages already existing, which is why Calculator sits after both in the sequence rather than being built as a fully isolated feature first.

**Milestone:** all three entry points into the calculator work correctly, the shareable output renders and generates a real link/image, and the History tab shows a real provenance log for at least the Week 2 pilot fund.

## Week 5 — Save, Account, Newsletter

Build: wire the "Save this" action to the auth flow built in Week 1, `saved_comparisons` + `saved_comparison_funds` CRUD, the Saved Comparisons page (including the "data has changed since you saved this" notice), newsletter capture with double opt-in and the confirmation page.

Parallel track: fund data curation completes to the full 30–50 target this week.

**Milestone:** the entire loop from the User Flows document works end-to-end, in one sitting, without a developer intervening — Comparison or Calculator → Save → Sign up → Saved Comparisons page → close the browser → return later → the saved item is still there and reflects current data.

## Week 6 — Trust/legal surface, polish, empty states

Build: Methodology page (full content per the earlier spec), Terms, Privacy, Contact (wired to the staleness-digest script rather than a stored review-queue table, per the simplified architecture), 404 and data-outage states, every empty state from the Design System doc, full mobile pass across every page, accessibility pass (WCAG AA, confirming colour is never the sole carrier of meaning on the confidence badges specifically).

Dependency note: legal review from Week 0 should be landing back around now — this week explicitly includes time to incorporate any required copy changes, rather than assuming the first draft of the disclaimer language is final.

**Milestone:** every page in the PRD's sitemap exists and is reachable; every acceptance criterion under US-1 through US-7 has been checked off against the built product, not just against the spec.

## Week 7 — Testing, hardening, private soft launch

Build: none — this week is testing and fixing only, no new features. See Testing section below for what gets run. Ends with a private soft launch (password-gated or unlisted URL) to the 20 people interviewed during the validation sprint, plus close network — real users, not synthetic QA, seeing the product before the public does.

**Milestone:** the product has been used by at least 10 real people outside the build team, and every bug or data issue they surface has been triaged (not necessarily fixed — triaged, so nothing is unknown going into launch week).

## Week 8 — Launch

Build: fixes for anything surfaced in the soft launch, nothing net-new. Public launch, timed to coincide with the first wave of founder-led distribution content (per the go-to-market strategy) and the newsletter's first real send. Close monitoring for the first 48–72 hours specifically — this is when a data error or broken flow is most likely to be seen by the most new people at once, and the fastest window to catch and fix it.

---

## Feature Order — Why This Sequence, Not Another

The build order deliberately does not follow the PRD's page-numbering — it follows dependency and risk:

1. **Foundation before anything visible (Week 1)** — unavoidable, everything else sits on it.
2. **One fund page, done right, before any breadth (Week 2)** — proves the hardest, most trust-critical part of the system (accurate sourcing, correct confidence logic) on the smallest possible surface, before that logic gets reused across Comparison, Calculator, and Saved views. A mistake here caught in Week 2 is cheap; the same mistake caught in Week 7 has propagated into three other features.
3. **Comparison before Calculator (Weeks 3–4)** — Calculator's most valuable entry point is from a comparison, so building Comparison first means Calculator can be built against a real bridge instead of a stubbed one.
4. **Save/Account last among core features (Week 5)** — per the "soft prompt, not a wall" principle, Account was never meant to be a gate a user hits early; building it last in the sequence mirrors where it sits in the actual user journey.
5. **Trust/legal pages before testing, not after (Week 6 before Week 7)** — Methodology and the disclaimers need to exist and be correct before the testing pass, since part of what Week 7 tests is whether the legal review's requirements actually made it into the shipped product.

## Testing

- **Unit tests, written alongside each feature, not after:** `lib/confidence.ts`, `lib/overlap.ts`, and the calculator's growth math are pure functions — cheap to test thoroughly and the most consequential code in the product to get numerically right.
- **Integration/E2E tests (Playwright)**, covering the three critical loops: Compare → Calculator → Save; magic-link sign-up; newsletter double opt-in. These map directly to the User Flows document — a broken bridge between two pages is a worse failure than a broken individual page, and E2E tests are what catch that class of bug.
- **Manual QA checklist mapped 1:1 to acceptance criteria:** every US-1 through US-7 acceptance criterion from the PRD gets an explicit pass/fail check before its corresponding week is signed off — not a general "looks good" review.
- **Data accuracy audit** — the single most important test in this entire plan: every one of the 30–50 funds' fee and holdings figures manually cross-checked against its actual source factsheet before Week 7's soft launch, by someone other than whoever entered the data originally. Given the repeatedly-flagged risk that one wrong number, screenshotted, can cost a day of trust — this is not optional QA, it's the test the whole product's credibility rests on.
- **Accessibility spot checks weekly, not just once at the end** — cheaper to catch a contrast or labelling issue in the week a component is built than to re-audit everything in Week 6.
- **Failure-state testing:** deliberately simulate the FMP API failing or timing out, and confirm the product degrades per NFR-7 (shows last known-good data with an honest 🔴 badge) rather than breaking.

## Deployment

Per the simplified architecture: every change, whether code or fund data, goes through the same pipeline — PR → automatic preview deployment → review → merge to `main` → automatic production deploy. No separate persistent staging environment, no separate path for data changes versus code changes.

- **Rollback:** Vercel's instant-rollback-to-previous-deploy is the safety net if a bad push (code or data) reaches production — worth explicitly confirming this works before launch week, not discovering it under pressure during an actual incident.
- **Lightweight error monitoring** (e.g. Sentry's free tier) added in Week 6 — not in the original architecture document, worth adding now as a standard, cheap safety net rather than relying on users to report breakage first.
- **Soft launch gate (Week 7):** a password-protected or unlisted deployment, not a feature flag inside the main app — simpler to build, and cleanly separates "private testing" from "public" with no risk of the gate leaking into the public experience by accident.

## Launch

Launch is not a single event at the end of Week 8 — it's staged, deliberately:

1. **Week 7 soft launch** to the validation sprint's 20 interviewees plus close network — real users, small enough blast radius that a bug or data error costs embarrassment, not reputation.
2. **Distribution content starts in Week 7, not Week 8** — per the go-to-market strategy, founder-led content should already be building toward an audience before the public launch moment, so Week 8's launch has somewhere to land rather than starting from zero.
3. **Week 8 public launch**, coordinated with the first real newsletter send and the content push, with close monitoring for 48–72 hours specifically.
4. **Post-launch, first two weeks:** daily review of the data-confidence digest (the staleness-report script from the simplified architecture) and the error monitor, treated as seriously as any bug report — this is the period where undetected issues are most damaging, since it's also when the product is making its first impression on the widest new audience it will see for a while.

**What "launched" does not mean:** every deferred feature from the PRD (History tab's fee-chart/holdings-drift views, portfolio builder, everything in the long-term roadmap) arriving at once. Per the PRD's Section 7, launch is the one-loop MVP, fully working and fully trustworthy — breadth comes after, earned by usage data, not bundled into this timeline.
