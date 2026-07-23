import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AllocationTable } from "@/components/etf/AllocationTable";
import { SourceAttribution } from "@/components/etf/SourceAttribution";
import { MetricExplain } from "@/components/compare/MetricExplain";
import { calculateOverlap } from "@/lib/overlap";
import {
  feesHoldingsConfidence,
  performanceConfidence,
} from "@/lib/confidence";
import type { ComparableFund } from "@/lib/compareTypes";
import styles from "./ComparisonResults.module.css";

// Comparison results — PRD US-1 acceptance criteria: OCF, 1Y/3Y/5Y
// performance, top-level sector/region split, holdings-overlap %, each
// with an inline "what this means" explanation, no verdict/ranking
// language anywhere. Design System Section 4.2: card-based side-by-side
// layout is the primary comparison output — never a table (tables are
// reused here only for the structured breakdowns nested inside each
// fund's card, same component and rule the fund detail page already
// follows).
export function ComparisonResults({ funds }: { funds: ComparableFund[] }) {
  const pairs: [ComparableFund, ComparableFund][] = funds.flatMap((fundA, i) =>
    funds
      .slice(i + 1)
      .map((fundB): [ComparableFund, ComparableFund] => [fundA, fundB]),
  );
  const [bridgeFundA, bridgeFundB] = funds;

  return (
    <div className={styles.wrapper}>
      <section className={styles.overlapSection}>
        <h2>
          Holdings overlap
          <MetricExplain>
            The percentage of each fund&apos;s published top 10 holdings that
            overlap with the other fund&apos;s — the same underlying companies,
            weighted by the smaller of the two holdings. A higher number means
            more shared exposure between the funds; it is not a judgement on
            whether that&apos;s good or bad for you. Calculated from each
            fund&apos;s published top 10 holdings only, not its full portfolio.
          </MetricExplain>
        </h2>
        <ul className={styles.overlapList}>
          {pairs.map(([a, b]) => (
            <li key={`${a.ticker}-${b.ticker}`}>
              <span>
                {a.ticker} × {b.ticker}
              </span>
              <span className="tabular-nums">
                {calculateOverlap(a.topHoldings, b.topHoldings).toFixed(1)}%
                overlapping exposure
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.grid}>
        {funds.map((fund) => (
          <Card key={fund.ticker} className={styles.fundCard}>
            <h2>
              <Link href={`/fund/${fund.ticker.toLowerCase()}`}>
                {fund.name}
              </Link>
            </h2>
            <p className="text-secondary">
              Ticker: {fund.ticker} &middot; ISIN: {fund.isin}
            </p>

            <div className={styles.metricRow}>
              <span className="text-secondary">
                Ongoing Charge (OCF)
                <MetricExplain>
                  The fund&apos;s annual running cost as a percentage of your
                  investment, charged by the fund provider — not a trading fee
                  or platform charge.
                </MetricExplain>
              </span>
              <span className={`${styles.metricValue} tabular-nums`}>
                {fund.ocf.toFixed(2)}%
              </span>
            </div>
            <SourceAttribution
              source={fund.feesSource}
              dateLabel="Data published"
              dateIso={fund.feesPublished}
              status={feesHoldingsConfidence(fund.feesPublished)}
            />

            <h3>
              Performance
              <MetricExplain>
                Historical price return over each period. Past performance does
                not predict future returns.
              </MetricExplain>
            </h3>
            {fund.performance ? (
              <>
                <div className={styles.performanceGrid}>
                  <div className={styles.metricRow}>
                    <span className="text-secondary">1 Year</span>
                    <span className="tabular-nums">
                      {fund.performance.return1y !== null
                        ? `${fund.performance.return1y >= 0 ? "+" : ""}${fund.performance.return1y.toFixed(2)}%`
                        : "Not available"}
                    </span>
                  </div>
                  <div className={styles.metricRow}>
                    <span className="text-secondary">3 Year</span>
                    <span className="tabular-nums">
                      {fund.performance.return3y !== null
                        ? `${fund.performance.return3y >= 0 ? "+" : ""}${fund.performance.return3y.toFixed(2)}%`
                        : "Not available"}
                    </span>
                  </div>
                  <div className={styles.metricRow}>
                    <span className="text-secondary">5 Year</span>
                    <span className="tabular-nums">
                      {fund.performance.return5y !== null
                        ? `${fund.performance.return5y >= 0 ? "+" : ""}${fund.performance.return5y.toFixed(2)}%`
                        : "Not available"}
                    </span>
                  </div>
                </div>
                <SourceAttribution
                  source={fund.performance.source}
                  dateLabel="Market data last updated"
                  dateIso={fund.performance.marketDataUpdatedIso}
                  status={performanceConfidence(
                    fund.performance.marketDataUpdatedIso,
                  )}
                />
              </>
            ) : (
              <p className="text-secondary">
                Performance data for this fund hasn&apos;t been loaded yet.
              </p>
            )}

            <h3>
              Holdings
              <MetricExplain>
                The fund&apos;s underlying investments by weight, as reported in
                the issuer&apos;s most recent holdings disclosure.
              </MetricExplain>
            </h3>
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
                  ([label, weight]) => ({ label, weight }),
                )}
              />
              <AllocationTable
                caption="Country allocation"
                rows={Object.entries(fund.regionAllocation).map(
                  ([label, weight]) => ({ label, weight }),
                )}
              />
            </div>
            <SourceAttribution
              source={fund.holdingsSource}
              dateLabel="Data published"
              dateIso={fund.holdingsPublished}
              status={feesHoldingsConfidence(fund.holdingsPublished)}
            />
          </Card>
        ))}
      </div>

      {/* User Flows Stage 2, step 10 — the primary bridge CTA into the
          Calculator, pre-filling *both* selected funds' actual OCFs (per
          PRD US-4 AC1), distinct from the per-fund "See fee impact" link
          on the Individual ETF Page. The Calculator itself only models
          two fee scenarios (A vs B), so when three funds are selected
          this carries the first two — consistent with there being no
          three-way fee-drag concept anywhere else in the product. */}
      {bridgeFundA && bridgeFundB && (
        <div className={styles.calculatorBridge}>
          <Button
            href={`/calculator?feeA=${bridgeFundA.ocf}&feeB=${bridgeFundB.ocf}`}
            variant="secondary"
          >
            See what this fee difference costs over time
          </Button>
        </div>
      )}

      {/* LOCKED copy, Design System Section 7 — must render on every page
          displaying fund data, comparison results included, without
          exception. */}
      <p className={styles.disclaimer}>
        This page provides factual information only and does not constitute
        financial advice or a recommendation to buy, sell or hold any
        investment.
      </p>
    </div>
  );
}
