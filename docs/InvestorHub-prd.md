# Product Requirements Document (PRD)

### [Working Title] — ETF Comparison Platform for Active Beginner Investors

**Scope:** MVP only, per the finalized brief (v2) and all subsequent design/monetisation/validation decisions. Anything outside this scope is explicitly marked postponed or removed, consistent with prior documents — this PRD does not re-open those decisions.

---

## 1. Product Summary

A tool that lets an active beginner investor compare ETFs side by side, understand the numbers via plain-language explanation, see the compounding cost/benefit of the differences, and save the result — without ever crossing into personalised financial advice. Every page in this document exists to serve that one loop; nothing is included "because it's a good idea in the abstract."

---

## 2. Full Sitemap (every page in MVP)

| # | Page | Purpose |
|---|---|---|
| 1 | **Home** | Entry point; explains the product in one screen, routes to Compare and Calculator |
| 2 | **ETF Comparison Tool** | Core loop: select 2–3 funds, see side-by-side data |
| 3 | **Individual ETF Page** | Fees / Holdings / Performance / History tab / Data Quality block |
| 4 | **Growth & Fee-Drag Calculator** | Standalone and pre-filled-from-comparison entry points |
| 5 | **Saved Comparisons** (account area) | List of a signed-in user's saved comparisons |
| 6 | **Sign Up / Sign In** | Lightweight auth |
| 7 | **Newsletter Confirmation** | Post-signup confirmation screen |
| 8 | **Methodology** | Footer-linked; sourcing, update cadence, metric definitions, calculations, limitations |
| 9 | **Legal: Terms of Use** | Standard terms, includes the "factual information only, not advice" language |
| 10 | **Legal: Privacy Policy** | UK GDPR-compliant data handling disclosure |
| 11 | **Contact / Report an Issue** | Primarily for reporting data errors — feeds the internal re-verification queue |
| 12 | **404 / Not Found** | Standard error page |
| 13 | **Data Error / Outage state** (not a distinct URL, a state) | Shown inline when a data source fails — see NFR-7 |

Explicitly **not** in this sitemap, per prior scope decisions: Learning Centre, standalone ETF Database/browse page, site-wide Search, Portfolio Builder, Overlap Checker, Watchlists, News section, Community/Forum, Screener. If any of these resurface in a future PRD, they require a new scoping decision referencing the original MVP-cut rationale, not silent re-addition.

---

## 3. Navigation

**Header (all pages):**
`Logo | Compare | Calculator | [Sign in / Saved]`

Deliberately minimal — four items. No mega-menu, no dropdown of sections that don't exist yet. Logo links home.

**Footer (all pages):**
`Methodology | Terms | Privacy | Contact | © [Year]`

**In-page navigation:**
- Comparison tool → each fund's data links through to its Individual ETF Page.
- Individual ETF Page → "See fee impact over time" links into the Calculator, pre-filled.
- Calculator result → "Save this" prompts sign-in if not authenticated (soft prompt, not a wall — see US-5).
- Individual ETF Page → Overview / History tab toggle (Section 2, item 3).

**Mobile:** header collapses to logo + hamburger (Compare, Calculator, Sign in/Saved) + footer links accessible via the menu, not just page-bottom scroll, since mobile is the primary expected device for this audience.

---

## 4. User Stories & Acceptance Criteria

### US-1: Compare two ETFs
**As** an active beginner investor, **I want to** compare two ETFs side by side **so that** I can decide between them using real data instead of guessing.

**Acceptance criteria:**
- User can select 2–3 funds from the curated list (search-by-name/ticker within the tool itself; no site-wide search needed for this).
- Comparison displays: OCF, 1Y/3Y/5Y performance, top-level sector/region split, and a holdings-overlap percentage between the selected funds.
- Every metric has an inline "what this means" explanation accessible without leaving the page (tooltip/expandable, not a separate page).
- No verdict, ranking, or "better choice" language appears anywhere on the comparison output — data only, per the monetisation/regulatory principles established earlier.
- Page loads comparison result in under 2 seconds on a typical mobile connection (see NFR-1).

### US-2: Understand what a fund actually is
**As** a user who clicked through from a comparison, **I want to** see a full fund page **so that** I can check the details behind a summary number.

**Acceptance criteria:**
- Page renders the full template from the ETF Page Build Spec: Fees / Holdings / Performance sections, each with Source, Data published/updated date, and a Confidence badge.
- Confidence badge colour follows the defined thresholds (Fees/Holdings: 🟢 ≤45 days, 🟡 45–90 days, 🔴 >90 days since verification; Performance: 🟢 ≤7 days, 🟡 7–30 days, 🔴 >30 days).
- Tapping the `ⓘ` next to any badge shows the standard confidence-system explanation text, including the "not a rating of the fund" line, verbatim as specified in the Build Spec.
- "Last verified" / "Last reviewed" terminology used consistently; "checked by us" phrasing does not appear anywhere in the shipped product.
- Disclaimer line ("This page provides factual information only...") renders on every fund page without exception.
- Overview/History tab toggle is present and functional (History tab content per US-3).

### US-3: See how a fund has changed over time
**As** a user considering a fund, **I want to** see its fee and holdings history **so that** I can judge stability, not just a snapshot.

**Acceptance criteria:**
- History tab shows, at minimum, the data provenance log (every recorded refresh/verification event with date and source) — required for MVP launch.
- Fee-change chart and holdings-drift snapshot view are acceptable to ship in a fast-follow release (2–4 weeks post-launch) rather than blocking initial launch, per the Build Spec's phased scope note — but the tab itself, and the provenance log, must exist at launch, not be added later.
- If insufficient history exists for a fund (e.g. newly added to the platform), the tab states this plainly rather than showing an empty or broken-looking view.

### US-4: Understand the real cost of a fee difference
**As** a user comparing two funds, **I want to** see what a fee difference actually costs over time **so that** an abstract percentage becomes a concrete, felt number.

**Acceptance criteria:**
- Calculator accepts starting amount, monthly contribution, time horizon, and (when entered via a comparison) auto-fills the two funds' actual OCFs.
- Output shows a clear visual growth comparison and a plain-language summary sentence stating the pound-figure difference at the chosen horizon.
- Calculator is also accessible standalone (not only via a comparison), with sensible defaults pre-filled.
- No output language implies a recommendation ("so you should choose Fund B") — states the maths only, consistent with the regulatory-boundary decisions made earlier.
- Result is easily shareable (a generated shareable summary/image or link) — this is the product's primary intended organic-sharing asset per the go-to-market strategy.

### US-5: Save a comparison for later
**As** a returning user, **I want to** save a comparison or calculation **so that** I don't lose it and have a reason to come back.

**Acceptance criteria:**
- Save action prompts sign-up/sign-in only at the point of saving — not before the user has already seen the value of the comparison or calculation (soft prompt, not a wall, per the core product philosophy).
- Signed-in users can view a list of saved items on the Saved Comparisons page, each linking back to the live, current version of that comparison (not a frozen snapshot — data should reflect current confidence/values).
- Account creation requires only email (+ password or magic link) — no unnecessary fields at MVP.

### US-6: Subscribe to the newsletter
**As** a visitor who found one piece of value, **I want to** sign up for ongoing updates **so that** I keep learning without needing to remember to come back.

**Acceptance criteria:**
- Newsletter capture is offered contextually at natural points (post-calculator-result, post-save) — not as an immediate pop-up on arrival.
- Confirmation page/email follows standard double opt-in practice (UK GDPR-appropriate).
- Newsletter capture never gates any other feature — it is always optional.

### US-7: Trust the data I'm looking at
**As** any user, **I want to** understand where the data comes from and its limitations **so that** I know how much to rely on it.

**Acceptance criteria:**
- Methodology page live at launch, containing all five required sections (source, update frequency, metric definitions, calculation method, limitations) per the Build Spec content.
- Methodology link present in the footer of every page, not just fund pages.
- Any user-reported data issue via the Contact page creates a trackable item feeding the internal re-verification queue (see FR-6).

---

## 5. Functional Requirements

**FR-1 — Curated fund dataset.** System supports a curated list of 30–50 ETFs at launch. Each fund record includes: name, ticker, ISIN, OCF, top-10 holdings, sector/region allocation, historical performance (1M/YTD/1Y/3Y/5Y/Since Launch), source and date metadata per section (fees/holdings vs. performance tracked independently, per the two-cadence model established earlier).

**FR-2 — Manual data ingestion (fees & holdings).** Admin-side workflow (does not need to be user-facing UI at MVP — a structured internal spreadsheet/CMS entry process is acceptable) for monthly manual update of fee and holdings data from issuer factsheets/KIDs, recording source document and date on entry.

**FR-3 — Automated data ingestion (performance).** Scheduled integration with Financial Modeling Prep (or confirmed equivalent, pending the licensing confirmation flagged in the earlier data-sourcing discussion) to refresh price/performance data on a defined schedule (minimum weekly; daily preferred if within API budget).

**FR-4 — Confidence badge engine.** Shared logic computing badge colour from the "Data published"/"Market data last updated" timestamp against the defined thresholds (Section 4, US-2), applied consistently across comparison view, fund page, and any future list/search context. Page-level status (where shown) takes the worst of its section statuses, never an average.

**FR-5 — Data provenance log.** Every ingestion or manual-verification event (FR-2, FR-3) writes a timestamped log entry (event type, source, date) that feeds both the confidence badges and the History tab's provenance list — one underlying data structure, two presentation surfaces, per the Build Spec's implementation note.

**FR-6 — Re-verification queue.** Any section reaching 🔴 status, or any user-submitted data-issue report (US-7), creates an internally visible task. Red is a temporary, resolving state, not a decorative label — this requirement exists specifically to prevent it becoming one.

**FR-7 — Holdings overlap calculation.** Given two funds' holdings data, system computes an overlap percentage (shared underlying weight) for display in the comparison tool. Presented descriptively (e.g. "38% overlapping exposure") — never with concentration-risk advisory language.

**FR-8 — Account & save.** Email-based authentication; saved comparisons/calculations associated with user account; saved items reference live fund IDs (not frozen data snapshots).

**FR-9 — Newsletter integration.** Connects to a standard ESP (e.g. Mailchimp/ConvertKit-class tool); contextual capture points per US-6; double opt-in.

**FR-10 — Disclaimer and neutrality enforcement.** The "factual information only, not a recommendation" disclaimer and the "not a rating of the fund" confidence-system explanation are treated as required, non-optional template elements — any new page template touching fund data must include them by default, not by developer discretion.

---

## 6. Non-Functional Requirements

**NFR-1 — Performance.** Core pages (Home, Comparison, Fund Page, Calculator) render primary content in under 2 seconds on a standard mobile connection (targeting median mobile-first usage for this audience, per the design philosophy established earlier).

**NFR-2 — Accessibility.** WCAG 2.1 AA as a baseline target — colour is never the sole carrier of meaning (relevant directly to the confidence badges: colour + explicit text label "High/Medium/Needs review" together, not colour alone, for colour-blind and screen-reader users).

**NFR-3 — Data protection / UK GDPR.** Account and newsletter data handled per UK GDPR requirements; Privacy Policy page reflects actual data practices; no third-party sale of user data (per monetisation principles, Section 1, "never use user portfolio or watchlist data commercially").

**NFR-4 — Regulatory boundary enforcement (design-level, not just content-level).** No input field anywhere in the MVP collects personal financial circumstances (age, income, risk tolerance, existing full portfolio) in a way that would shape a tailored suitability-style output — consistent with the advice-boundary analysis earlier in this project. This is a structural constraint on what features can be built, not just a copywriting rule.

**NFR-5 — Data licensing compliance.** Any third-party data integration (FR-3) operates under a confirmed licence tier explicitly permitting display to end users in a commercial product — verified in writing before integration, not assumed from a pricing page.

**NFR-6 — Browser/device support.** Modern evergreen browsers (Chrome, Safari, Firefox, Edge, latest two major versions), fully responsive from ~360px mobile width upward; mobile-first design given the target audience's primary device usage.

**NFR-7 — Graceful degradation on data failure.** If the performance-data API fails or is delayed beyond its refresh window, the affected section displays its most recent known-good data with an honest 🔴 badge and visible "last successfully updated" date — never a broken UI, never silently stale data presented as current.

**NFR-8 — Auditability.** The provenance log (FR-5) is retained and queryable indefinitely, not just surfaced in the UI — needed both for the History tab's long-term usefulness and as a defensible record if a data-accuracy question is ever raised (regulatory or reputational).

**NFR-9 — Uptime.** Target 99.5%+ availability for MVP scale — appropriate for a bootstrap-stage product; does not require enterprise-grade infrastructure investment at this stage, but outages should be visible and honestly communicated (NFR-7) rather than presented as normal operation.

**NFR-10 — Cost ceiling.** Total monthly infrastructure + data cost at MVP scale should remain compatible with the bootstrap budget established in the data-sourcing discussion — no architectural decision at this stage should assume future funding that doesn't yet exist.

---

## 7. Explicit Non-Goals (restated for this document)

To prevent scope creep during build: this PRD does not include personalised recommendations, a portfolio builder, a full screener, site-wide search, a learning curriculum, community features, or affiliate/sponsored content of any kind. These are documented and intentionally deferred elsewhere (product brief, monetisation principles) — this PRD is not the place to reconsider them, and any engineer or stakeholder proposing to add one mid-build should be pointed back to the relevant earlier decision rather than making a new one ad hoc.
