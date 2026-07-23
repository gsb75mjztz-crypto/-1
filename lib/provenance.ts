import type { FundData } from "@/lib/fundSchema";

export interface ProvenanceEntry {
  date: string;
  description: string;
}

// Derives the History tab's provenance log (ETF Page Build Spec Section
// 3c) from the fund's own dated fields, rather than solely from its
// `history` array. `history` tracks specific field value-changes over
// time (currently just OCF, since that's the only field
// scripts/update-fund.ts updates); the provenance log is the broader
// "when was any part of this page's data last touched" summary the spec's
// example shows, combining Fees+Holdings into one line when they came
// from the same document on the same date (as they do for every fund
// imported this milestone), same as the spec's own example line.
export function buildProvenanceLog(
  fund: FundData,
  performanceSource: string,
  performanceDateIso: string,
): ProvenanceEntry[] {
  const entries: ProvenanceEntry[] = [];

  if (
    fund.feesPublished === fund.holdingsPublished &&
    fund.feesSource === fund.holdingsSource
  ) {
    entries.push({
      date: fund.feesPublished,
      description: `Fees & Holdings refreshed (${fund.feesSource})`,
    });
  } else {
    entries.push({
      date: fund.feesPublished,
      description: `Fees refreshed (${fund.feesSource})`,
    });
    entries.push({
      date: fund.holdingsPublished,
      description: `Holdings refreshed (${fund.holdingsSource})`,
    });
  }

  entries.push({
    date: performanceDateIso,
    description: `Performance data refreshed (${performanceSource})`,
  });

  entries.push({
    date: fund.lastReviewed,
    description: "Page manually reviewed",
  });

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}
