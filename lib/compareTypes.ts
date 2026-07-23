// Shared between the Comparison Tool's client components and its server
// action (app/compare/actions.ts) — moved out of ComparePageClient.tsx so a
// server-only file doesn't need to import from a "use client" module just
// for a type.
export interface ComparableFund {
  ticker: string;
  name: string;
  isin: string;
  ocf: number;
  feesSource: string;
  feesPublished: string;
  holdingsSource: string;
  holdingsPublished: string;
  topHoldings: { name: string; weight: number }[];
  sectorAllocation: Record<string, number>;
  regionAllocation: Record<string, number>;
  performance: {
    return1y: number | null;
    return3y: number | null;
    return5y: number | null;
    source: string;
    marketDataUpdatedIso: string;
  } | null;
}
