import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

// Params intentionally unused for now — no fund data or lookup logic exists
// yet (that's Week 2, gated on the fund data curation track finishing its
// first batch — see Development Roadmap and Data Strategy docs).
export default async function FundPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;

  return (
    <PagePlaceholder
      title={ticker.toUpperCase()}
      note="Individual ETF page — Development Roadmap Week 2."
    />
  );
}
