# Milestone 4 — Comparison Tool (kickoff brief)

**Status:** Complete — approved, pending `v4.0` tag. Originally written as a forward-looking brief before work began; the plan below is kept as-written for the record, with the actual outcome summarized here.

## Outcome

Built as planned: `lib/overlap.ts`, fund search/typeahead (Fuse.js), the real Comparison page and results UI, links from results into the fund detail pages (finally giving Milestone 3's work a reachable entry point), a CI workflow (`.github/workflows/ci.yml`), and unit tests for `lib/overlap.ts`, `lib/confidence.ts`, and `lib/fundSchema.ts` (29 tests total). Audited twice: the first completion audit found one Medium-severity bug (a keyboard-navigation ArrowDown handler that skipped past the pre-selected top search result) plus three Low-severity items — that Medium finding was fixed and re-verified with a full regression pass showing no side effects; of the three Low items, one (missing auto-focus when the optional third comparison field is revealed) was implemented, one (project-wide Markdown formatting debt in this very folder) was fixed, and one (duplicated disclosure-toggle logic between `Badge.tsx` and `MetricExplain.tsx`) was deliberately deferred — see `technical-debt-register.md` entry #1 for the reasoning and the condition that would trigger revisiting it.

## Why this, and why now

`docs/InvestorHub-project-health-review.md` (performed after Milestone 3) found that after three milestones, the product's actual core loop — Product Brief v2's "single MVP loop": Comparison → Calculator → Save → Newsletter — was 0% functional. Worse, the Individual ETF Page built in Milestone 3 has no discoverable entry point in the shipped navigation, because the Information Architecture spec requires it to be reached _only_ from a comparison result, and Comparison doesn't exist. This milestone is not "the next item on a list" — it's the specific, health-review-recommended correction: build the one thing that (a) is the actual product per the Product Brief, (b) matches Development Roadmap Week 3, and (c) makes Milestone 3's work reachable and useful for the first time.

**Do not treat this as "pick the next convenient doc-scoped slice."** That pattern is what produced the current state. This milestone is anchored to the roadmap's own sequence deliberately.

## Objective, per the docs

Per PRD US-1 and the Development Roadmap's Week 3 milestone: _"a user can search, select two real funds, and see a correct, fully-explained, verdict-free comparison."_

Acceptance criteria (PRD Section 4, US-1):

- User can select 2–3 funds from the curated list — search-by-name/ticker within the tool itself (Fuse.js, client-side, per Technical Architecture Section 9 — no `/api/funds` endpoint, no server round-trip per keystroke).
- Comparison displays: OCF, 1Y/3Y/5Y performance, top-level sector/region split, and a holdings-overlap percentage between the selected funds (FR-7).
- Every metric has an inline "what this means" explanation accessible without leaving the page (tooltip/expandable — the pattern already exists in `components/ui/Badge.tsx`'s disclosure approach, reuse it rather than inventing a second one).
- **No verdict, ranking, or "better choice" language anywhere in the output** — data only. This is the single most important compliance rule in the entire product (Legal Principles Section 3, restated in Monetisation Principles and the Design System's Compliance-Driven UI Rules). Grep the diff for "best/recommend/top pick/should choose" before calling this done, the way prior milestones did.
- Comparison result renders in under 2 seconds on a throttled mobile connection (NFR-1) — measure this for real, the way Milestone 2 did (Playwright, Fast 3G), don't assume it.

## What already exists to build on

- `data/funds/*.json` + `lib/funds.ts` (`getAllFunds`, `getFundByTicker`) — the fund list this tool searches against is already loaded and validated.
- `lib/confidence.ts` — reuse directly for any confidence indicator shown in comparison view (per FR-4: "applied consistently across comparison view, fund page, and any future list/search context. Page-level status takes the worst of its section statuses, never an average" — the `worstConfidence()` function already implements exactly this).
- `components/ui/Badge.tsx`, `Button.tsx`, `Card.tsx`, `Input.tsx` — the whole design-system component set this tool will be built from.
- `/fund/[ticker]` pages — the detour destination. IA: "Comparison → Fund Page: Parent-to-detail... a fund page is a zoom-in on one element of a comparison." Clicking a fund's name/ticker in comparison results should link here.
- `app/compare/page.tsx` currently a `PagePlaceholder` — replace its contents, don't create a new route.

## What doesn't exist yet and needs to be built

- **`lib/overlap.ts`** — pure function computing holdings-overlap percentage between two funds' `topHoldings` arrays (Technical Architecture Section 4 names this file explicitly; Development Roadmap calls it out as one of the two functions, alongside `lib/confidence.ts`, that must be unit-tested "written alongside the feature, not after"). **Write the test file in the same commit as the function, not after** — this is the specific mistake flagged in the Project Health Review (`lib/confidence.ts` still has zero tests three milestones in).
- Fund search/typeahead (Fuse.js, client-side against the already-loaded fund list).
- Comparison results UI — per Design System Section 4.2, the primary comparison output is **card-based side-by-side layout, not a table** (tables are reserved for structured breakdowns like holdings lists).
- The empty state ("Pick two funds to compare / Search by name or ticker below") is LOCKED copy — Design System Section 10, don't paraphrase.
- Wire the homepage's "Compare two ETFs" CTA and the header/mobile nav's "Compare" link to something real for the first time.

## Before writing feature code (per the Project Health Review's explicit recommendation)

1. **Stand up CI** — lint + typecheck + build on every PR (`.github/workflows`). Technical Architecture Section 6 has specified this since Milestone 1; it still doesn't exist. A few hours of work, should happen before or alongside this milestone, not after a fourth round of manual-audit-catches-everything.
2. **Write the first real tests** — `lib/confidence.ts` and `lib/fundSchema.ts` have no coverage despite being exactly the "consequential pure functions" the roadmap calls out. Backfill these before or alongside writing `lib/overlap.ts`, so the new function doesn't repeat the same untested pattern a third time.
3. **Fix the two dead-end homepage CTAs and the newsletter's misleading error state** — flagged as Critical/High in the health review specifically because they'd mislead anyone outside the build team who looks at the live site right now. Cheap to fix (point at the real Compare page once it exists; change the newsletter error copy or gate the form behind the real endpoint being live) — worth doing as part of this milestone's cleanup, not deferred again.

## Explicit non-goals for this milestone

Per the Product Brief and PRD's own non-goals sections, restated here since they're what "don't build comparison functionality" (Milestone 3's constraint) was protecting against building too early: no Calculator (that's the next milestone, Week 4 — but its pre-fill bridge _from_ Comparison should be left as a stubbed link/route, not built out), no Save/Account wiring beyond what already exists, no personalised recommendation of any kind, no ranking/sorting that could read as an endorsement (Legal Principles Section 3 — even a "most popular first" default sort needs a second look).

## When this milestone completes

Follow the established pattern: formal 6-section completion audit (requirement checklist against docs, quality verification with real tool runs, severity-classified review, self-challenge, blocking-issues list, binary verdict), resolve findings, re-audit, tag `v4.0` once approved, write `handover/Milestone-5.md` as the next kickoff brief before starting whatever comes after (Calculator, per the roadmap).
