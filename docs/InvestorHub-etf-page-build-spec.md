# InvestorHub — ETF Page Final Build Spec

Covers: page template, data confidence colour system (with on-site explanation), history tab, and the footer methodology page. **This supersedes all earlier inline versions of the template**, including `docs/InvestorHub-fund-page-spec.md`.

## 1. ETF Page Template

```
Fund Name
Ticker: VWRP
ISIN: IE00BK5BQT80
-----------------------------------------
Fees
Ongoing Charge (OCF): 0.22%
Source: Vanguard Official Factsheet
Data published: 1 July 2026
Confidence: 🟢 High  [ⓘ What does this mean?]
-----------------------------------------
Holdings
Top 10 Holdings
Sector Allocation
Country Allocation
Source: Vanguard Holdings Report
Data published: 1 July 2026
Confidence: 🟢 High  [ⓘ What does this mean?]
-----------------------------------------
Performance
1 Month | YTD | 1 Year | 3 Year | 5 Year | Since Launch
Source: Financial Modeling Prep
Market data last updated: 22 July 2026
Confidence: 🟢 High  [ⓘ What does this mean?]
-----------------------------------------
[TABS: Overview | History]
-----------------------------------------
Data Quality
✓ Last reviewed: 15 July 2026
✓ All static fund information verified against official issuer documentation

This page provides factual information only and does not constitute financial
advice or a recommendation to buy, sell or hold any investment.
```

**Terminology fix applied throughout the product, not just this page:** every instance of "checked by us" / "reviewed by InvestorHub" becomes **"Last verified"** (for static data — fees, holdings) or **"Last reviewed"** (for the page as a whole).

Reasoning: "verified/reviewed" reads as a defined process a user can trust and ask about; "checked by us" reads casual and implies an informal, undocumented action. Same underlying activity, more credible framing — and it's the term the Methodology page (Section 4) then defines precisely, so the label on the page and the explanation behind it use matching language.

## 2. Data Confidence Colour System — on-site explanation

Inline, next to every confidence badge: a small `ⓘ` that opens a short tooltip/popover on tap or hover — not a separate page navigation, since this needs to be understood in the moment, not looked up later.

Tooltip content (identical wording everywhere it appears, so it reads as one consistent system):

> **What this colour means**
> This shows how recent and how directly sourced this data is — **it is not a rating of the fund, its quality, or its risk.**
>
> 🟢 **High** — sourced directly from the fund issuer or a licensed data provider, and refreshed within our target window.
> 🟡 **Medium** — from a reliable source, but approaching its refresh window, or from a secondary provider.
> 🔴 **Needs review** — past our refresh window and pending an update. If this decision is time-sensitive, check the issuer's own site.
>
> [Full methodology →]

The bolded "not a rating of the fund" line is deliberate and non-negotiable — it's the sentence doing the work of keeping a red/amber/green system from being misread as a quality or risk signal, which is the one failure mode that would undermine the whole point of adding it.

**Page-level status logic:** the overall page badge (if shown anywhere in a list/search view, e.g. on a comparison table) always takes the **worst** of the three section statuses, never an average. A page with one red section is a red page — no quiet flattering roll-up.

**Operational rule (not user-facing, but load-bearing):** red is not allowed to be a static, ignored state. Any section going red triggers an internal task to re-verify it. A red badge that sits unresolved for weeks is worse than not having the system — it becomes a visible admission of neglect rather than a trust signal.

## 3. History Tab

Answers "how has this fund changed over time" — a distinct question from the Performance section above, which shows return figures, not what changed and when. Two different things people ask:

- "How has the price/return moved?" → Overview tab, Performance section (already covers this).
- "Has anything about this fund itself changed — fees, holdings, sourcing?" → History tab (new).

### Content of the History tab

**a) Fee history** — simple line/step chart of OCF over time (issuers do change fees, infrequently but not never), each change point labelled with date and old→new value.

**b) Holdings drift** — a lightweight view of top-10 holdings composition at each point a factsheet refresh recorded a change, so a user can see e.g. "Nvidia's weighting in this fund six months ago vs now" without needing to cross-reference old factsheets themselves. Doesn't need to be exhaustive at MVP — even quarter-over-quarter snapshots of the top 10 is a genuinely useful, differentiated view nobody else in this space shows this simply.

**c) Data provenance log** — a transparent, plain list of every time this page's data was updated or verified, e.g.:

```
1 Jul 2026 — Fees & Holdings refreshed (Vanguard Factsheet, Vanguard Holdings Report)
22 Jul 2026 — Performance data refreshed (Financial Modeling Prep)
15 Jul 2026 — Page manually reviewed
```

This log is a natural byproduct of the confidence-badge system already being built (Section 2) — it's the same underlying refresh events, just shown as a timeline instead of a current-state badge. Worth building as one shared data structure feeding both, rather than two separate systems.

**MVP scope note:** given the 6–8 week build window, (c) is cheap and should ship at launch since it's just a log of events you're already recording. (a) and (b) are genuinely valuable but depend on having accumulated at least one or two refresh cycles of historical snapshots first — they can reasonably launch a few weeks after the core page ships, once there's actual history to show. Don't let this delay the core MVP loop.

## 4. Footer — Methodology Page

Footer link: `Methodology` — present on every page, not just ETF pages, since it's the trust document for the whole product.

Full page content:

```markdown
# Methodology

## Where the data comes from
Fee and holdings data is sourced directly from official fund issuer
documentation — factsheets and Key Information Documents (KIDs) published
by the fund provider (e.g. Vanguard, iShares, HSBC). Price and performance
data is sourced from Financial Modeling Prep, a licensed financial data
provider. Every figure on the site is labelled with its specific source —
we never blend sources without saying so.

## How often it's updated
- **Fees and holdings**: reviewed monthly against the issuer's latest
  published factsheet.
- **Performance data**: refreshed automatically, typically within 7 days.
- Each section on a fund page shows its own "Data published" or
  "Market data last updated" date — check this rather than assuming the
  whole page is equally current, since different sections update on
  different schedules.

## What each metric means
- **Ongoing Charge (OCF)**: the fund's annual running cost as a
  percentage of your investment, charged by the fund provider — not a
  trading fee or platform charge.
- **Holdings breakdown**: the fund's underlying investments by weight, as
  reported in the issuer's most recent holdings disclosure.
- **Performance (1M / YTD / 1Y / 3Y / 5Y / Since Launch)**: historical
  price return over each period. Past performance does not predict future
  returns.
[Expand with a full glossary entry per metric as the site grows —
each term should link out from wherever it appears on a fund page, not
just live on this page.]

## How calculations are performed
Return figures are calculated from end-of-day price data as supplied by
our data provider; we do not independently recalculate returns from raw
constituent data. Where a figure is a provider calculation rather than a
raw data point (for example, annualised returns), this page will be
updated to state the calculation method used once that feature ships.

## What limitations exist
- We cover a curated list of major, well-known funds — not the full
  market. If a fund isn't listed, that's a coverage gap, not a signal
  about the fund itself.
- Data accuracy depends on our sources; while we verify static data
  monthly against official documents, errors can occur between reviews.
  If something looks wrong, please tell us — [contact link].
- This site provides factual information only. Nothing on this site is a
  personal recommendation or financial advice. See our full disclaimer.
- Historical fee/holdings tracking (see Fund History tabs) begins from
  the date we started tracking each fund, not from the fund's launch.
```

Note: the stray non-English character present in the original draft ("每 term") has been corrected to "each term" above — flagged in the source brief as a drafting artifact, not intended to ship.

The methodology page deliberately answers the "what limitations exist" question honestly, including the coverage gap and the fact that history tracking doesn't retroactively cover a fund's full life. That's not a weakness to hide — for this product, visibly admitting limitations is more trust-building than pretending the data is more complete than it is, and it's cheap insurance against anyone assuming the site claims more authority than it actually has.
