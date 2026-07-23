import type { ConfidenceStatus } from "@/components/ui/Badge";

// Confidence-badge threshold logic, per Design System Section 6 / PRD
// US-2 / Data Strategy Section 5 — all three docs state the same table,
// reproduced here verbatim:
//
//   Section            | High     | Medium    | Needs review
//   Fees & Holdings    | ≤45 days | 45-90     | >90
//   Performance        | ≤7 days  | 7-30      | >30
//
// Pure functions, deliberately: components/ui/Badge.tsx renders a status
// that's already been computed — it was built presentational-only in
// Milestone 1 specifically so this logic could be added later without
// touching it. Deferred until now (Milestone 3), per the Development
// Roadmap's Week 2 scope.

function daysSince(dateIso: string, now: Date): number {
  const then = new Date(`${dateIso}T00:00:00Z`);
  const diffMs = now.getTime() - then.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function feesHoldingsConfidence(
  publishedDateIso: string,
  now: Date = new Date(),
): ConfidenceStatus {
  const days = daysSince(publishedDateIso, now);
  if (days <= 45) return "high";
  if (days <= 90) return "medium";
  return "low";
}

export function performanceConfidence(
  marketDataUpdatedIso: string,
  now: Date = new Date(),
): ConfidenceStatus {
  const days = daysSince(marketDataUpdatedIso, now);
  if (days <= 7) return "high";
  if (days <= 30) return "medium";
  return "low";
}

// FR-4: "Page-level status ... takes the worst of its section statuses,
// never an average." Not used by the fund page alone (which shows each
// section's own badge, per spec), but this is the shared function any
// future list/comparison view rolls a page-level badge up through, per
// FR-4's "applied consistently across comparison view, fund page, and any
// future list/search context."
const SEVERITY: Record<ConfidenceStatus, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export function worstConfidence(
  statuses: ConfidenceStatus[],
): ConfidenceStatus {
  return statuses.reduce<ConfidenceStatus>(
    (worst, s) => (SEVERITY[s] < SEVERITY[worst] ? s : worst),
    "high",
  );
}
