// Holdings-overlap calculation for the Comparison Tool (PRD FR-7,
// Technical Architecture Section 4: "lib/overlap.ts -> pure function, runs
// client-side"). Given two funds' holdings, computes the shared underlying
// weight between them — e.g. two funds both holding Apple at 4% and 6%
// respectively contribute 4 percentage points of "overlapping exposure."
//
// Data-model constraint, not a shortcut taken here: /data/funds only
// records each fund's top 10 holdings (see lib/fundSchema.ts), not its
// full underlying portfolio. So this necessarily computes overlap across
// published top-10 lists only, not total fund overlap — the UI layer must
// say so (see components/compare/OverlapSummary.tsx), the same way
// AllocationTable already discloses when a table doesn't sum to 100%
// rather than implying more completeness than the source data has.
//
// Matching is by holding name (exact string match) since that's the only
// per-holding identifier the data carries — no ISIN/ticker per constituent.
// Fine at this dataset's scale (large, well-known constituents named
// consistently across issuers' factsheets); a future improvement could key
// on a per-holding identifier if one becomes available.
export interface OverlapHolding {
  name: string;
  weight: number;
}

/**
 * Returns the total overlapping weight (percentage points) between two
 * funds' holdings lists — the sum of min(weightA, weightB) for every
 * holding name present in both lists.
 */
export function calculateOverlap(
  holdingsA: OverlapHolding[],
  holdingsB: OverlapHolding[],
): number {
  const weightsB = new Map(holdingsB.map((h) => [h.name, h.weight]));

  let overlap = 0;
  for (const a of holdingsA) {
    const bWeight = weightsB.get(a.name);
    if (bWeight !== undefined) {
      overlap += Math.min(a.weight, bWeight);
    }
  }
  return overlap;
}
