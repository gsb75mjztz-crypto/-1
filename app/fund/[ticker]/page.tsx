import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SourceAttribution } from "@/components/etf/SourceAttribution";
import { AllocationTable } from "@/components/etf/AllocationTable";
import { PerformanceGrid } from "@/components/etf/PerformanceGrid";
import { EtfPageTabs } from "@/components/etf/EtfPageTabs";
import { FundHistoryPanel } from "@/components/etf/FundHistoryPanel";
import { DataQuality } from "@/components/etf/DataQuality";
import { Button } from "@/components/ui/Button";
import { getAllFundTickers, getFundByTicker } from "@/lib/funds";
import {
  feesHoldingsConfidence,
  performanceConfidence,
} from "@/lib/confidence";
import { buildProvenanceLog } from "@/lib/provenance";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

// ETF detail page — Milestone 3. Renders the exact template from
// docs/InvestorHub-etf-page-build-spec.md Section 1: Fund Name/Ticker/ISIN,
// Fees, Holdings, Performance (each with Source/date/Confidence badge),
// Overview/History tabs, Data Quality block, and the LOCKED disclaimer.
// Static params from the curated /data/funds JSON files, per Technical
// Architecture Section 2 ("SSG for fund/comparison pages built from static
// data"). Revalidates daily, matching the performance-refresh cron
// cadence built in Milestone 1 (Technical Architecture Section 8).
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllFundTickers().map((ticker) => ({
    ticker: ticker.toLowerCase(),
  }));
}

// Lowercase is the canonical URL casing (matches generateStaticParams).
// Fund tickers are case-insensitive lookups by design (getFundByTicker),
// so /fund/VWRP and /fund/VwRp must not become separate, independently
// cached pages with duplicate content — they redirect to the one
// canonical URL instead.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}): Promise<Metadata> {
  const { ticker } = await params;
  const fund = getFundByTicker(ticker);

  if (!fund) {
    return {};
  }

  return {
    title: `${fund.name} (${fund.ticker}) | InvestorHub`,
    description: `Fees, holdings and performance for ${fund.name} (${fund.ticker}, ${fund.isin}) — sourced from official issuer documentation, with confidence badges showing how fresh the data is.`,
  };
}

export default async function FundPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;

  if (ticker !== ticker.toLowerCase()) {
    redirect(`/fund/${ticker.toLowerCase()}`);
  }

  const fund = getFundByTicker(ticker);

  if (!fund) {
    notFound();
  }

  const performance = await prisma.fundPerformance.findUnique({
    where: { ticker: fund.ticker },
  });

  const marketDataUpdatedIso = performance
    ? performance.marketDataUpdatedAt.toISOString().slice(0, 10)
    : null;

  const feesStatus = feesHoldingsConfidence(fund.feesPublished);
  const holdingsStatus = feesHoldingsConfidence(fund.holdingsPublished);
  const performanceStatus = marketDataUpdatedIso
    ? performanceConfidence(marketDataUpdatedIso)
    : "low";

  const overview = (
    <div className={styles.sections}>
      <section className={styles.section}>
        <div className={styles.sectionHeadingRow}>
          <h2>Fees</h2>
          <a href="/methodology#ocf" className={styles.sectionLink}>
            What does this mean? →
          </a>
        </div>
        <p className={styles.metric}>
          <span className="text-secondary">Ongoing Charge (OCF)</span>
          <span className={`${styles.metricValue} tabular-nums`}>
            {fund.ocf.toFixed(2)}%
          </span>
        </p>
        <SourceAttribution
          source={fund.feesSource}
          dateLabel="Data published"
          dateIso={fund.feesPublished}
          status={feesStatus}
        />
        {/* PRD Section 3 / User Flows Stage 1 detour, step 9: "See fee
            impact over time" on the Fees section, carrying this fund's
            OCF as one Calculator input via the same query-param bridge
            the shareable-link feature already uses — no new plumbing. */}
        <Button
          href={`/calculator?feeA=${fund.ocf}`}
          variant="secondary"
          className={styles.feeImpactLink}
        >
          See fee impact over time
        </Button>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeadingRow}>
          <h2>Holdings</h2>
          <a href="/methodology#holdings" className={styles.sectionLink}>
            What does this mean? →
          </a>
        </div>
        <div className={styles.holdingsGrid}>
          <AllocationTable
            caption="Top 10 holdings"
            rows={fund.topHoldings.map((h) => ({
              label: h.name,
              weight: h.weight,
            }))}
            expectFullCoverage={false}
          />
          <AllocationTable
            caption="Sector allocation"
            rows={Object.entries(fund.sectorAllocation).map(
              ([label, weight]) => ({
                label,
                weight,
              }),
            )}
          />
          <AllocationTable
            caption="Country allocation"
            rows={Object.entries(fund.regionAllocation).map(
              ([label, weight]) => ({
                label,
                weight,
              }),
            )}
          />
        </div>
        <SourceAttribution
          source={fund.holdingsSource}
          dateLabel="Data published"
          dateIso={fund.holdingsPublished}
          status={holdingsStatus}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeadingRow}>
          <h2>Performance</h2>
          <a href="/methodology#performance" className={styles.sectionLink}>
            What does this mean? →
          </a>
        </div>
        {performance && marketDataUpdatedIso ? (
          <>
            <PerformanceGrid
              oneMonth={
                performance.return1m ? Number(performance.return1m) : null
              }
              ytd={performance.returnYtd ? Number(performance.returnYtd) : null}
              oneYear={
                performance.return1y ? Number(performance.return1y) : null
              }
              threeYear={
                performance.return3y ? Number(performance.return3y) : null
              }
              fiveYear={
                performance.return5y ? Number(performance.return5y) : null
              }
              sinceLaunch={
                performance.returnSinceLaunch
                  ? Number(performance.returnSinceLaunch)
                  : null
              }
            />
            <SourceAttribution
              source={performance.source}
              dateLabel="Market data last updated"
              dateIso={marketDataUpdatedIso}
              status={performanceStatus}
            />
          </>
        ) : (
          <p className="text-secondary">
            Performance data for this fund hasn&apos;t been loaded yet.
          </p>
        )}
      </section>
    </div>
  );

  const provenance =
    performance && marketDataUpdatedIso
      ? buildProvenanceLog(fund, performance.source, marketDataUpdatedIso)
      : [];

  return (
    <Container>
      <header className={styles.header}>
        <h1>{fund.name}</h1>
        <p className="text-secondary">
          Ticker: {fund.ticker} &middot; ISIN: {fund.isin}
        </p>
      </header>

      <EtfPageTabs
        overview={overview}
        history={
          <FundHistoryPanel
            provenance={provenance}
            trackingStartIso={fund.feesPublished}
          />
        }
      />

      <DataQuality lastReviewedIso={fund.lastReviewed} />

      {/* LOCKED copy, Design System Section 7 / PRD FR-10 — non-optional
          template element, must render on every fund page without
          exception. Not conditional on anything above. */}
      <p className={styles.disclaimer}>
        This page provides factual information only and does not constitute
        financial advice or a recommendation to buy, sell or hold any
        investment.
      </p>
    </Container>
  );
}
