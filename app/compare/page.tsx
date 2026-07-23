import type { Metadata } from "next";
import { getAllFunds } from "@/lib/funds";
import { ComparePageClient } from "@/components/compare/ComparePageClient";
import type { SearchableFund } from "@/components/compare/FundSearchField";

export const metadata: Metadata = {
  title: "Compare ETFs",
  description:
    "Compare up to three ETFs side by side — fees, performance, holdings overlap and sector split, each explained in plain language.",
  alternates: { canonical: "/compare" },
};

// Comparison Tool — Milestone 4, revised. Per Technical Architecture
// Section 9, the fund list this page searches is already static
// build-time data, so it's fetched once here (server component) and
// handed to the client for Fuse.js search — no /api/funds round trip.
// Revalidates on the same cadence as the fund detail pages (Technical
// Architecture Section 8).
//
// Only the slim search fields (ticker/name/isin/ocf) are sent to the
// client from this page. Full comparison data (holdings, allocations,
// performance) is fetched on demand for just the selected funds via
// app/compare/actions.ts when "Compare" is clicked — see that file for
// why. Shipping every curated fund's full dataset unconditionally on
// every page load was fine at 3 funds and would not have stayed fine at
// the 30-50 funds the PRD specifies. `ocf` is the one addition beyond the
// original slim shape (Milestone 6) — a single number per fund, needed so
// the fee-cap filter can work before a fund is ever selected; nowhere
// near the weight of the holdings/allocation data this shape was built to
// keep out.
export const revalidate = 86400;

export default function ComparePage() {
  const searchableFunds: SearchableFund[] = getAllFunds().map((fund) => ({
    ticker: fund.ticker,
    name: fund.name,
    isin: fund.isin,
    ocf: fund.ocf,
  }));

  return <ComparePageClient funds={searchableFunds} />;
}
