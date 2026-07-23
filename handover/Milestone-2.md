# Milestone 2 — Homepage, trust pages, newsletter signup UI

**Status:** Complete, approved, tagged `v2.0`.

## Objective

Homepage (marketing/landing content only, no live ETF functionality), the trust/legal page shells (Terms, Privacy, Disclaimer), and the newsletter signup component — matching Development Roadmap Week 6-ish content, built ahead of its literal week number.

## What was built

- Homepage (`app/page.tsx`): hero, an illustrative (clearly-labelled, non-real) fee/return example, a value-proposition section, and the newsletter signup block. No live comparison — the "visual example" is a static mockup, deliberately not styled with the confidence-badge/source-attribution treatment reserved for real data, so it can't be mistaken for one.
- `components/marketing/NewsletterSignup.tsx` — a fully real, working form component (validation, submit states, error handling) that POSTs to `/api/newsletter`, which is a `501` stub. The component itself is complete; it just has nothing real to talk to yet.
- Terms, Privacy, Disclaimer pages — real, substantive draft content (not boilerplate placeholder text), each visibly marked with a `DraftNotice` banner: "Draft — pending solicitor review." This is the correct posture per Legal Principles Section 8, which explicitly requires this content to be solicitor-reviewed before it's final — shipping it silently as if final, or not shipping real content at all, were both considered and rejected in favor of an honest visible draft.
- Footer/Header nav locked to the PRD's exact spec.

## Audit history

**First audit — NOT APPROVED.** Findings:

- Button-as-`<Link>` showed a browser-default underline (missing `text-decoration: none`).
- `--color-text-muted` failed WCAG AA contrast when actually computed via the relative-luminance formula — 2.78:1 on `--color-bg`, 2.95:1 on `--color-surface`, both below even the 3:1 large-text floor.
- Footer had 5 links; PRD Section 3 specifies exactly 4 (`Methodology | Terms | Privacy | Contact`) — an unrequested deviation, not an extension of an under-specified area.
- Fraunces (the display typeface) wasn't actually applied to homepage section headings.
- Hero used undocumented arbitrary font sizes instead of the design-token scale.
- The homepage's illustrative fee/return example had one fund win on _both_ metrics (lower fee AND higher return) — even fictional and clearly labelled "Example," an example that always pairs "cheaper" with "better" teaches an implicit pattern in a product whose entire trust position rests on never implying a verdict, including by accident, including in throwaway marketing copy.
- `className` merge logic (`[...].filter(Boolean).join(" ")`) was hand-duplicated identically in three separate components.
- NFR-1 (2-second load target) had never actually been measured.

**Resolution:**

- Added `text-decoration: none` to the Button-as-Link case.
- Corrected `--color-text-muted` to `#716D63` (4.86:1 / 5.16:1) — fixed in both `globals.css` _and_ the Design System doc itself, so the doc doesn't silently drift from what's shipped.
- Reverted footer to the exact 4 PRD links (Disclaimer page still exists and is reachable via contextual links from Terms/Methodology body content — just not in global nav).
- Applied Fraunces via `.sectionHeading h2`.
- Replaced arbitrary hero font sizes with `var(--text-h1)`.
- Rewrote the illustrative example as a genuine trade-off (cheaper fund has the lower return).
- Extracted the duplicated className logic into `lib/cn.ts`.
- Measured NFR-1 via Playwright with "Fast 3G" throttling: 504ms FCP, 1.6s full load — passes.

**Second audit — APPROVED.** Tagged `v2.0`.

## Key decisions worth knowing

- The Disclaimer page exists _in addition to_ the PRD's literal 13-page sitemap (which folds disclaimer language into Terms of Use). This was flagged in code comments as a deliberate, additive deviation, not a silent one — worth knowing if a future audit re-checks "does the site match the PRD sitemap exactly."
- `--color-text-muted`'s corrected value was propagated into the Design System doc itself (Section 8), not just the CSS — a pattern worth continuing: when an audit finds the doc's own stated value is wrong, fix the doc too, or the next person trusts a value that's already known to fail.

## Open items carried forward

- Newsletter form is fully built on the frontend but structurally cannot succeed (`501` backend) — this became a real user-facing problem once the site was reviewed end-to-end in the Project Health Review (the error message shown, "Something went wrong on our end — please try again shortly," is misleading about the actual cause).
- Homepage's two primary CTAs ("Compare two ETFs," "Try the fee-drag calculator") route to pages that were still placeholders as of this milestone, and remained so through Milestone 3.
