"use server";

import { getFundByTicker } from "@/lib/funds";
import { prisma } from "@/lib/prisma";
import type { ComparableFund } from "@/lib/compareTypes";

// Fetches full comparison data (holdings, allocations, performance) for a
// small, explicit set of tickers — invoked once, when the user clicks
// "Compare", not on every /compare page load.
//
// Why this exists: app/compare/page.tsx used to fetch and serialize every
// curated fund's complete dataset into the page on every load, so the
// client would have it available the instant 2-3 funds were picked. That
// was fine at 3 funds and would not have stayed fine at the 30-50 funds
// the PRD actually specifies — the comparison page would ship the entire
// curated dataset to every visitor regardless of what they end up
// selecting. This server action fetches full data only for the funds
// actually chosen, on demand.
//
// Still consistent with Technical Architecture Section 9's "no /api/funds
// endpoint, no server round-trip per keystroke": this isn't a REST
// endpoint and it isn't called per keystroke — it's a single, deliberate
// round trip triggered by the explicit "Compare" action, the same kind of
// on-demand fetch the fund detail pages already do for performance data.
export async function getComparableFunds(
  tickers: string[],
): Promise<ComparableFund[]> {
  const performanceRows = await prisma.fundPerformance.findMany({
    where: { ticker: { in: tickers } },
  });
  const performanceByTicker = new Map(
    performanceRows.map((row) => [row.ticker, row]),
  );

  const results: ComparableFund[] = [];
  for (const ticker of tickers) {
    const fund = getFundByTicker(ticker);
    // Shouldn't happen in practice — tickers passed in come from the
    // already-validated search list — but a fund disappearing between
    // page load and the Compare click (a data change mid-session) is
    // possible in principle, so skip it rather than throw.
    if (!fund) continue;

    const performance = performanceByTicker.get(fund.ticker);
    results.push({
      ticker: fund.ticker,
      name: fund.name,
      isin: fund.isin,
      ocf: fund.ocf,
      feesSource: fund.feesSource,
      feesPublished: fund.feesPublished,
      holdingsSource: fund.holdingsSource,
      holdingsPublished: fund.holdingsPublished,
      topHoldings: fund.topHoldings,
      sectorAllocation: fund.sectorAllocation,
      regionAllocation: fund.regionAllocation,
      performance: performance
        ? {
            return1y: performance.return1y
              ? Number(performance.return1y)
              : null,
            return3y: performance.return3y
              ? Number(performance.return3y)
              : null,
            return5y: performance.return5y
              ? Number(performance.return5y)
              : null,
            source: performance.source,
            marketDataUpdatedIso: performance.marketDataUpdatedAt
              .toISOString()
              .slice(0, 10),
          }
        : null,
    });
  }
  return results;
}
