import type { Metadata } from "next";
import { parseCalculatorParams } from "@/lib/calculatorDefaults";
import { CalculatorPageClient } from "@/components/calculator/CalculatorPageClient";

export const metadata: Metadata = {
  title: "Growth & Fee-Drag Calculator",
  description:
    "See what a fee difference actually costs over time. Model compound growth, contributions and fee drag on your own numbers.",
  // Canonicalises to the bare path, not whichever ?feeA=&feeB=... share
  // link variant a visitor arrived on — those are the same page with
  // different inputs, not distinct content.
  alternates: { canonical: "/calculator" },
};

// Growth & Fee-Drag Calculator — Milestone 5, PRD US-4 / Development
// Roadmap Week 4. No live data dependency (Prisma, fund JSON) — every
// figure here is maths over user-entered, hypothetical scenario inputs
// (Legal Principles Section 2), so this page needs no server fetch of its
// own beyond reading a shared link's query params, if present.
export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialInputs = parseCalculatorParams(params);

  return <CalculatorPageClient initialInputs={initialInputs} />;
}
