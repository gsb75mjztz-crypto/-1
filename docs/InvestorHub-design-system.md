# Design System — Implementation Specification

### Canonical reference. Supersedes all earlier design discussion in this project.

**Read this in full before implementing any UI.** Anything marked **LOCKED** is exact — copy verbatim, do not paraphrase, do not "improve." Anything marked **VERIFY** is a value that must be checked with an automated tool during implementation, not assumed correct from this document alone. This document consolidates and finalizes decisions from: the original product brief's design philosophy, the standalone design system draft, the ETF Page Build Spec, the PRD's non-functional requirements (NFR-1, NFR-2, NFR-6), and the Information Architecture's labeling rules. Where earlier documents left an open choice (marked "e.g." or "or equivalent"), this document makes the final call — treat this as the tie-breaker if anything upstream conflicts with it.

---

## 1. Design Philosophy

Calm confidence, not institutional authority. One primary number or insight per screen. Generous whitespace around anything the user needs to read and understand. Motion communicates change only, never decoration. The reference feel is a well-made reading or weather app — not a bank dashboard, not a trading terminal.

---

## 2. Design Tokens (implement as CSS custom properties, exactly as below)

```css
:root {
  /* Colour — base */
  --color-bg: #FAF8F4;
  --color-surface: #FFFFFF;
  --color-text-primary: #211F1C;
  --color-text-secondary: #6B6862;
  --color-text-muted: #9A968D;
  --color-border: #E4E0D8;

  /* Colour — accent */
  --color-accent: #0F6E56;
  --color-accent-tint: #E1F5EE;
  --color-accent-secondary: #D85A30; /* sparing use only — never a primary CTA fill */

  /* Colour — data states */
  --color-positive: #3B6D11;
  --color-negative: #A32D2D;

  /* Colour — confidence badge system (Section 6) */
  --color-confidence-high-text: #3B6D11;
  --color-confidence-high-bg: #EAF3DE;
  --color-confidence-medium-text: #854F0B;
  --color-confidence-medium-bg: #FAEEDA;
  --color-confidence-low-text: #791F1F;
  --color-confidence-low-bg: #FCEBEB;

  /* Typography */
  --font-ui: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Fraunces', Georgia, serif;
  --text-h1: 1.75rem;        /* 28px */
  --text-h2: 1.375rem;       /* 22px */
  --text-h3: 1.125rem;       /* 18px */
  --text-body: 1rem;         /* 16px */
  --text-caption: 0.8125rem; /* 13px */
  --line-height-body: 1.6;
  --line-height-heading: 1.25;
  --weight-regular: 400;
  --weight-medium: 500;
  /* No other weights exist in this system. Do not introduce 600/700. */

  /* Radius */
  --radius-card: 12px;
  --radius-control: 8px;
  --radius-pill: 999px; /* reserved for the confidence badge only — see Section 6 */

  /* Spacing — 4px base scale, use these tokens only, no arbitrary values */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* Sizing */
  --control-height-min: 40px;  /* inputs, buttons */
  --tap-target-min: 44px;      /* table rows, list items — mobile touch target floor */
}
```

**Font decision, finalized here:** Inter (UI) paired with Fraunces (display/editorial headlines only). Both are freely licensed and available via Google Fonts — no licensing cost, consistent with the bootstrap cost ceiling (NFR-10). Fraunces is used only for Homepage hero and section-intro moments; never for data, numbers, or UI chrome.

---

## 3. Typography Rules

- Sentence case everywhere — headings, buttons, labels, badges, nav items. No Title Case. No ALL CAPS anywhere in the product.
- Two weights only: 400 and 500. No bold (700).
- `font-variant-numeric: tabular-nums` on every numeric value that appears in a column, comparison, or table — required, not optional, for scanability on the Comparison and Calculator screens specifically.
- Display typeface (Fraunces) is decorative and additive only — the product must remain fully legible and functional with Inter alone if the display font fails to load. Do not block render on the display font.

---

## 4. Components

### 4.1 Cards
`background: var(--color-surface); border: 0.5px solid var(--color-border); border-radius: var(--radius-card); padding: var(--space-4) var(--space-5);` No box-shadow anywhere in the system — depth comes from the border and the surface/background contrast only.

### 4.2 Tables
Used only for structured breakdowns (holdings lists, sector/region tables) — **never** for the primary comparison output, which is card-based side-by-side layout (Section 4.1), not a table. Hairline row dividers only, no vertical borders. Row height ≥ `var(--tap-target-min)`. Tabular-nums on all numeric columns. Sticky header row on scroll for holdings lists longer than one screen.

### 4.3 Forms
- Input height ≥ `var(--control-height-min)`, radius `var(--radius-control)`, hairline border.
- Focus state: 2px accent-coloured ring around the field — **not** a border-colour-only change (colour-alone focus states fail the accessibility requirement in Section 8).
- Labels always visible above the field. Never placeholder-as-label.
- Error state: message text below the field in `var(--color-negative)`, plus a left-border accent on the field in the same colour — colour is never the only error signal.

### 4.4 Buttons
- **Primary:** `background: var(--color-accent); color: var(--color-surface);` Exactly one primary button visible per screen — no exceptions, no "two equally important actions" edge case. If a screen seems to need two, one must become secondary.
- **Secondary:** outline, `border-color: var(--color-accent); color: var(--color-accent);`
- **Ghost:** text only, no border, `color: var(--color-accent)`.
- All buttons: `border-radius: var(--radius-control)`, sentence case, verb-first labels ("Save this comparison" — not "Submit").

### 4.5 Confidence Badge
Pill shape — `border-radius: var(--radius-pill)`. This is the **only** pill-shaped element in the system; reserved exclusively for this component so it reads as a distinct status signal, not a button or tag. Always renders colour fill **and** an explicit text label together (see Section 8 — colour is never the sole carrier of meaning). Includes an inline `ⓘ` that opens the tooltip text specified verbatim in Section 6.

---

## 5. Mobile Layouts

- Single-column stack throughout. Mobile is the primary designed layout, not a responsive collapse of desktop.
- Header collapses to logo + hamburger. Footer links (Methodology, Terms, Privacy, Contact) are reachable via the hamburger menu, not only by scrolling to page-bottom.
- Long scrolling pages (Calculator) get a bottom-anchored primary action button, fixed in the viewport — the user should never need to scroll back up to act.
- The Overview/History tab toggle renders as a full-width segmented control on mobile, not small text links — comfortable thumb target, per `--tap-target-min`.
- Minimum supported viewport: 360px width (per PRD NFR-6). Test at 360px explicitly, not just at common device breakpoints.

---

## 6. Confidence Badge System — exact copy and logic (LOCKED)

**Display logic (implementation, not shown to user as raw numbers):**

| Section | 🟢 High | 🟡 Medium | 🔴 Needs review |
|---|---|---|---|
| Fees & Holdings | ≤ 45 days since verification | 45–90 days | > 90 days |
| Performance | ≤ 7 days since market data update | 7–30 days | > 30 days |

Page-level badge (if shown in a list/comparison view) = the **worst** of the section statuses. Never an average, never rounded up.

**Tooltip copy — LOCKED, verbatim, identical everywhere it appears:**

> **What this colour means**
> This shows how recent and how directly sourced this data is — it is **not** a rating of the fund, its quality, or its risk.
>
> 🟢 **High** — sourced directly from the fund issuer or a licensed data provider, and refreshed within our target window.
> 🟡 **Medium** — from a reliable source, but approaching its refresh window, or from a secondary provider.
> 🔴 **Needs review** — past our refresh window and pending an update. If this decision is time-sensitive, check the issuer's own site.
>
> [Full methodology →]

The bolded "not a rating of the fund" clause is non-negotiable and must render bolded, not as plain text — it is the sentence preventing the colour system from being misread as a risk or quality signal.

---

## 7. Required Disclaimer Copy — exact, LOCKED

Every page displaying fund data (fund pages, comparison results) must render this line, unmodified, without exception:

> This page provides factual information only and does not constitute financial advice or a recommendation to buy, sell or hold any investment.

This is a non-optional template element (per PRD FR-10) — it must be part of the base page template, not something a developer can omit on a case-by-case basis.

---

## 8. Accessibility Requirements

- WCAG 2.1 AA baseline (PRD NFR-2).
- **Colour is never the sole carrier of meaning**, anywhere in the product — applies to confidence badges (colour + text label, always), form errors (colour + message text), and data states (gain/loss shown with colour + a +/− sign or arrow, not colour alone).
- **VERIFY:** every text/background colour pairing in Section 2 against WCAG AA contrast thresholds (4.5:1 normal text, 3:1 large text/UI components) using an automated tool (e.g. axe-core, Stark) before merge. The palette in this document is designed with AA compliance as the intent, but exact contrast ratios have not been computationally verified in this document and must not be assumed correct without that check — this is the one place in this spec where "designed to pass" and "confirmed to pass" are different claims, and only the second one clears the bar.
- Focus states must be visible via a non-colour cue (2px ring, per Section 4.3) for keyboard navigation throughout.

---

## 9. Locked Terminology (use exactly these labels, everywhere)

| Concept | Locked label | Never use |
|---|---|---|
| Primary nav item → Comparison Tool | **Compare** | "Comparison," "Comparison Tool" (in nav) |
| Calculator | **Calculator** | "Fee Calculator," "Growth Calculator" |
| Nav item → Saved Comparisons | **Saved** | "My Account," "Portfolio" |
| Auth state (new/anon user) | **Sign up** | — |
| Auth state (existing session) | **Sign in** | "Account" (ambiguous, doesn't state current state) |
| Static data freshness | **Last verified** | "Checked by us," "Confirmed," "Reviewed" |
| Whole-page freshness | **Last reviewed** | "Checked by us" |

---

## 10. Empty States — exact copy (LOCKED)

| Context | Headline | Subtext | Action |
|---|---|---|---|
| Comparison tool, nothing selected | Pick two funds to compare | Search by name or ticker below. | — (search field is the action) |
| Saved Comparisons, nothing saved | Nothing saved yet | Run a comparison or calculation and save it to see it here. | "Compare two ETFs →" |
| History tab, insufficient data | Not enough history yet for this fund | We started tracking this fund on [date] — check back as more data accumulates. | — |
| Data outage (NFR-7) | This section's data is delayed | Shows last known-good figure, its date, and a 🔴 badge — never a blank state. | — |

---

## 11. Compliance-Driven UI Rules (non-negotiable, cross-referenced from the PRD and monetisation principles)

- No verdict, ranking, or "better choice" language anywhere in comparison output — data display only.
- No input field anywhere collects age, income, risk tolerance, or full portfolio holdings (PRD NFR-4) — this is a UI-level constraint, not just a backend one; do not add such a field even for a "helpful context" feature without a full re-review.
- No fact (a fee number, a comparison result) may ever be hidden behind a premium paywall — premium may add depth, never withhold a basic fact (Monetisation Principles, Section 5).
- No dark patterns: no pre-selected "recommended" plan that's the most expensive by default, no fake urgency/scarcity language, one-click cancellation with no retention maze.

---

## 12. Pre-Implementation Checklist

Before this system is considered correctly implemented:

- [ ] All token values in Section 2 implemented exactly as specified — no substituted or "close enough" hex values.
- [ ] Contrast-checked (Section 8) with an automated tool — results attached to the PR, not asserted from memory.
- [ ] Confidence badge, disclaimer, and tooltip copy checked character-for-character against Sections 6–7 — these are the highest-consequence strings in the product from a regulatory-framing standpoint and must not be paraphrased.
- [ ] Terminology audit (Section 9) run across all copy — search the codebase for the "never use" column's terms and confirm zero matches.
- [ ] Mobile tested at 360px width explicitly, not only at standard device presets.
