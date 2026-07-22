# InvestorHub — Fund Detail Page Spec (Final MVP Model)

> **Superseded by [`InvestorHub-etf-page-build-spec.md`](./InvestorHub-etf-page-build-spec.md).** Kept for history; do not build against this version.

Reference template for a single fund's data page within the ETF Comparison Tool. This is the final model for MVP.

## Example: VWRP

```
Fund Name
Ticker: VWRP
ISIN: IE00BK5BQT80
-----------------------------------------
Fees
Ongoing Charge (OCF): 0.22%
Source: Vanguard Official Factsheet
Data published: 1 July 2026
Confidence: 🟢 High — primary issuer source, within refresh window
-----------------------------------------
Holdings
Top 10 Holdings
Sector Allocation
Country Allocation
Source: Vanguard Holdings Report
Data published: 1 July 2026
Confidence: 🟢 High — primary issuer source, within refresh window
-----------------------------------------
Performance
1 Month | YTD | 1 Year | 3 Year | 5 Year | Since Launch
Source: Financial Modeling Prep
Market data last updated: 22 July 2026
Confidence: 🟢 High — licensed data provider, updated within 7 days
-----------------------------------------
Data Quality
✓ Page reviewed by InvestorHub — 15 July 2026
✓ All static fund information verified against official issuer documentation
```

## Data Confidence Guide

- 🟢 **High** — sourced directly from the fund issuer or a licensed data provider, and refreshed within our target window
- 🟡 **Medium** — source is reliable but data is approaching its refresh window, or sourced from a secondary provider
- 🔴 **Needs review** — data is past our refresh window and pending update; treat with extra caution and check the issuer's own site if this decision is time-sensitive

This colour system reflects how recent and how directly sourced this data is — it is not a rating of the fund itself.

## Required Disclaimer

This page provides factual information only and does not constitute financial advice or a recommendation to buy, sell or hold any investment.

## Structural Notes

- Per-fund sections: Fees, Holdings (top 10 / sector allocation / country allocation), Performance (1M / YTD / 1Y / 3Y / 5Y / since launch).
- Every data section carries its own source, publish/update date, and confidence indicator — confidence is per-section, not page-wide, since different data types refresh on different cycles (issuer factsheets vs. licensed market data).
- Two named source types so far: primary issuer documents (e.g. Vanguard factsheets/holdings reports) and a licensed market data provider (Financial Modeling Prep) for performance figures.
- A manual "page reviewed by InvestorHub" checkpoint sits alongside the automated source dates.
