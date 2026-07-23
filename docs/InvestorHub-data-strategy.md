# Data Strategy — Engineering Handoff

## Status of this document

This consolidates every data-sourcing decision made across this project into one implementation reference. It aligns strictly with the simplified architecture (v2) — fund static data as version-controlled files, not a database table — and with the Legal Principles document's data-licensing rules (Section 5 there). Where this document and any earlier draft conflict, this document wins; it is the most recent and most complete version. The one thing this document does not replace: written confirmation from Financial Modeling Prep (or whichever provider is finally used) that the licence tier in use explicitly covers commercial end-user display. That confirmation must exist as an email or contract on file before the performance-data integration is enabled in production — not assumed, not inferred from a pricing page.

---

## 1. Data Domains and Sources

Two domains, two different sources, two different legal bases, two different refresh cadences. Do not blend them into a single pipeline or a single mental model — the architecture deliberately keeps them separate (Section 2 of the Technical Architecture) because they behave differently, and collapsing them is how confidence-badge logic quietly breaks.

| Domain | Source | Legal basis | Refresh cadence |
|---|---|---|---|
| Fees (OCF) | Official issuer factsheets / KIDs (Vanguard, iShares, HSBC, etc.) | Regulated public disclosure documents — citing facts from them is low legal risk | Monthly, manual |
| Holdings (top 10, sector/region split) | Official issuer holdings reports | Same as above | Monthly, manual |
| Performance (1M/YTD/1Y/3Y/5Y/Since Launch) | Financial Modeling Prep (or confirmed equivalent) | Licensed commercial data feed — requires written confirmation the licence covers this use (Section 5) | Weekly minimum, daily preferred |

**Why fees/holdings are manual and performance is automated:** fees and holdings change rarely (issuers update factsheets infrequently) and carry the highest trust stakes if wrong, so they go through human review on every change. Performance changes constantly and carries lower per-error stakes (a stale return figure is a freshness problem, not a misleading-fact problem in the same way a wrong fee would be), so it's the one domain worth automating.

---

## 2. What Is Explicitly Prohibited

Stated directly because these are the mistakes most likely to happen under time pressure, not because anyone is likely to attempt them deliberately:

- **No scraping of any compiled third-party dataset** — JustETF, Morningstar, LSE, or any aggregator's tables — regardless of whether the underlying facts are individually public. A compiled database can carry its own UK database right, separate from the facts inside it, and this product does not need to cut this corner given the legitimate alternatives below.
- **No use of a free or low-tier API key for data displayed to end users in production** unless that specific tier's licence explicitly permits it. Free/personal tiers on data APIs routinely restrict use to internal or non-commercial analysis — read the licence tier, not the price, before wiring anything into a page real users will see.
- **No blending of sources for the same figure without disclosure.** If a fee figure ever needs a fallback source, the fund page's "Source" label must reflect whichever source that specific figure actually came from — never a generic "our data" label papering over mixed provenance.
- **No real-time or intraday pricing.** This product is decision-support, not a trading terminal — daily or weekly performance refresh is sufficient and cheaper; do not scope-creep toward live ticks.

---

## 3. Data Model

Per the Technical Architecture (v2), fund static data is **not** a database table. It is version-controlled JSON, one file per fund, living in the application repository:

```
/data/funds/VWRP.json
```

```json
{
  "ticker": "VWRP",
  "isin": "IE00BK5BQT80",
  "name": "Vanguard FTSE All-World UCITS ETF",
  "ocf": 0.22,
  "fees_source": "Vanguard Official Factsheet",
  "holdings_source": "Vanguard Holdings Report",
  "top_holdings": [{"name": "Apple Inc", "weight": 3.8}],
  "region_allocation": {"US": 62.3, "UK": 4.1},
  "sector_allocation": {"Technology": 24.1},
  "history": [
    {"date": "2026-07-01", "field": "ocf", "value": 0.22, "source": "Vanguard Official Factsheet"}
  ]
}
```

Performance data is the one piece that lives in Postgres, since it changes without a deploy:

```sql
CREATE TABLE fund_performance (
  ticker TEXT PRIMARY KEY,
  return_1m NUMERIC(6,3), return_ytd NUMERIC(6,3), return_1y NUMERIC(6,3),
  return_3y NUMERIC(6,3), return_5y NUMERIC(6,3), return_since_launch NUMERIC(6,3),
  source TEXT NOT NULL DEFAULT 'Financial Modeling Prep',
  market_data_updated_at TIMESTAMPTZ NOT NULL
);
```

**No `data_events` or `review_queue` table exists in this architecture, and none should be added.** Freshness and confidence status are computed at read time from the dates already present (`fees_source`/`holdings_source` change dates inside the JSON's `history` array, and `market_data_updated_at` in Postgres) — never stored as a separate derived value. This is deliberate: a stored "confidence status" field can drift out of sync with the dates it's supposed to reflect; a computed one cannot.

---

## 4. Ingestion Workflows

### Fees & Holdings (manual, monthly)

1. Source the current factsheet/KID from the issuer's own site for each fund due for review.
2. Run `scripts/update-fund.ts --ticker VWRP --field ocf --value 0.22 --source "Vanguard Official Factsheet"` — this script updates the current value **and** appends to the `history` array automatically. Never hand-edit the JSON's current values without going through the script, since the append-to-history step is exactly the part a manual edit is most likely to forget.
3. Open a pull request. The diff shows exactly what changed, by whom, when — this is the provenance log; no separate system records this information.
4. PR gets reviewed and merged through the same CI pipeline as any code change (per the Deployment section of the Technical Architecture) — a fund-data change goes live the same way a feature does, with the same review gate.

### Performance (automated, scheduled)

1. `/api/cron/refresh-performance` runs on schedule (Vercel Cron), calls the FMP API for each fund in the curated list.
2. Writes the latest return figures and `market_data_updated_at` to `fund_performance`, keyed by ticker.
3. No PR, no human review step for this path — this is the one intentionally fully automated pipeline in the system, appropriate given performance data's lower per-error stakes and higher refresh frequency.
4. If the API call fails for a given fund, that fund's existing row is left untouched (last known-good data persists) — see Section 6 for how this surfaces to users.

---

## 5. Freshness & Confidence Logic

Computed, not stored, everywhere it's shown (comparison view, fund page, any future list view) — a single shared function, not reimplemented per screen.

| Section | 🟢 High | 🟡 Medium | 🔴 Needs review |
|---|---|---|---|
| Fees & Holdings | ≤ 45 days since the relevant `history` entry's date | 45–90 days | > 90 days |
| Performance | ≤ 7 days since `market_data_updated_at` | 7–30 days | > 30 days |

- **Page-level badge** (where a whole page/row needs one status, e.g. a comparison table) = the **worst** of the section statuses. Never averaged, never rounded favourably.
- **A fund going red is not a passive label.** Since there's no stored queue table, staleness is surfaced via a scheduled report script — run on the same cadence as the performance cron, querying every fund's current computed status and sending a digest (email or Slack) of anything amber or red. This replaces what earlier drafts modelled as a database-backed queue: the same operational outcome (nothing red goes unnoticed) with less to build and nothing that can drift out of sync with the underlying dates.

---

## 6. Failure & Degradation Handling

Per NFR-7 in the PRD — this is a hard requirement, not a nice-to-have:

- If the FMP API call fails or times out, the affected fund's page shows its **last known-good performance figures**, clearly dated, with an honest 🔴 badge.
- Never a blank section, never a broken layout, never stale data presented as if it were current.
- This should be deliberately tested (simulate the API failing) before launch, per the Engineering Roadmap's Week 7 testing pass — a failure mode that's only ever been imagined and never actually triggered in a test environment is not a verified failure mode.

---

## 7. Data Quality Assurance

- **Before launch:** every one of the 30–50 curated funds' fee and holdings figures manually cross-checked against its actual source factsheet, by someone other than whoever originally entered the data — this is the single most important test in the Engineering Roadmap's testing plan, not a routine QA formality.
- **Ongoing:** the monthly fees/holdings review cadence (Section 4) is the primary quality mechanism. The staleness digest (Section 5) is the backstop that catches anything that slips past that cadence.
- **User-reported errors:** the Contact page's data-issue report path feeds directly into the next manual review cycle for the affected fund — there's no separate ticketing system to build; a reported issue is simply prioritised in the next PR touching that fund's data.

---

## 8. Coverage & Limitations (for the Methodology page, and to keep expectations honest internally)

- The product covers a **curated list of 30–50 major, well-known funds** — not the full market. This is a scope decision, not a data-access limitation, and should be described that way rather than apologetically.
- Historical fee/holdings tracking (the `history` array) begins from whenever tracking started for each fund, not from that fund's actual launch date — the History tab must state this plainly rather than implying complete lifetime coverage.
- If FMP's coverage of a specific UK-listed (LSE) fund proves incomplete or requires a separate commercial tier, that's a real constraint to resolve **before** committing to the full curated list, not something to discover mid-build — verify UK/LSE ticker coverage against the actual fund list during the licensing confirmation step (Section 0), not after integration work has started.
- **VWRP/VUAG holdings source, flagged for solicitor review.** The only public document found with fund-level top-holdings/sector/region granularity for these two funds is Vanguard's monthly fund factsheet, which states it is "directed at professional investors" and "should not be distributed to ... retail investors." The retail-facing KIID (used for `feesSource` on these two funds specifically because of this) does not contain holdings data at all — no retail-tier document with that granularity was found. Milestone 3 ships citing the factsheet for holdings only, as the only accurate source of that data, with the source labelled plainly ("Vanguard Fund Factsheet", not "Official") rather than hidden. This is a real open question, not a resolved one: does citing *factual holdings data* extracted from a professional-tier document, on a retail-facing product, conflict with that document's stated distribution restriction? Legal Principles Section 8 tracks this as a pre-launch solicitor question — do not treat this bullet as having resolved it.

---

## 9. Pre-Integration Checklist (blocking, before performance data goes live)

- [ ] Written confirmation from Financial Modeling Prep (or equivalent) that the specific paid tier in use covers display to end users in a commercial product.
- [ ] Confirmation that the plan's UK/LSE ticker coverage matches the actual curated 30–50 fund list — checked fund-by-fund, not assumed from general marketing coverage claims.
- [ ] `scripts/update-fund.ts` tested to confirm it correctly appends to `history` rather than overwriting it.
- [ ] Confidence-logic function (`lib/confidence.ts`) unit-tested against the exact thresholds in Section 5, including boundary cases (exactly 45 days, exactly 90 days).
- [ ] Staleness digest script running on a real schedule and confirmed to actually send/deliver, not just log locally.
- [ ] Failure-mode test performed: FMP API call deliberately failed in a test environment, confirmed the last-known-good + 🔴 badge behaviour renders correctly (Section 6).
