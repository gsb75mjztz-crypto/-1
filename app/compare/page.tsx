import { getAllFunds } from "@/lib/funds";
import { prisma } from "@/lib/prisma";
import {
  ComparePageClient,
  type ComparableFund,
} from "@/components/compare/ComparePageClient";

// Comparison Tool — Milestone 4. Per Technical Architecture Section 9, the
// fund list this page searches is already static build-time data, so it's
// fetched once here (server component) and handed to the client for
// Fuse.js search — no /api/funds round trip. Revalidates on the same
// cadence as the fund detail pages (Technical Architecture Section 8).
export const revalidate = 86400;

export default async function ComparePage() {
  const funds = getAllFunds();
  const performanceRows = await prisma.fundPerformance.findMany();
  const performanceByTicker = new Map(
    performanceRows.map((row) => [row.ticker, row]),
  );

  const comparableFunds: ComparableFund[] = funds.map((fund) => {
    const performance = performanceByTicker.get(fund.ticker);
    return {
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
    };
  });

  return <ComparePageClient funds={comparableFunds} />;
}
