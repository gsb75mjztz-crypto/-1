import { Container } from "@/components/layout/Container";

// Content copied from docs/InvestorHub-etf-page-build-spec.md Section 4,
// verbatim. This page is real content, not a placeholder — unlike Terms
// and Privacy, Methodology isn't gated on solicitor review in the Legal
// Principles doc (Section 8's sign-off checklist covers Terms/Privacy/the
// comparison tool's copy, not this page), so it ships now rather than
// Week 6.
export default function MethodologyPage() {
  return (
    <Container>
      <h1>Methodology</h1>
      <div className="prose">
        <section>
          <h2>Where the data comes from</h2>
          <p>
            Fee and holdings data is sourced directly from official fund issuer
            documentation — factsheets and Key Information Documents (KIDs)
            published by the fund provider (e.g. Vanguard, iShares, HSBC). Price
            and performance data is sourced from Financial Modeling Prep, a
            licensed financial data provider. Every figure on the site is
            labelled with its specific source — we never blend sources without
            saying so.
          </p>
        </section>

        <section>
          <h2>How often it&apos;s updated</h2>
          <ul>
            <li>
              <strong>Fees and holdings</strong>: reviewed monthly against the
              issuer&apos;s latest published factsheet.
            </li>
            <li>
              <strong>Performance data</strong>: refreshed automatically,
              typically within 7 days.
            </li>
            <li>
              Each section on a fund page shows its own &ldquo;Data
              published&rdquo; or &ldquo;Market data last updated&rdquo; date —
              check this rather than assuming the whole page is equally current,
              since different sections update on different schedules.
            </li>
          </ul>
        </section>

        <section>
          <h2>What each metric means</h2>
          {/* Per this doc's own note: "each term should link out from
              wherever it appears on a fund page, not just live on this
              page." The ids below are what app/fund/[ticker]/page.tsx
              links its metric labels to. */}
          <ul>
            <li id="ocf">
              <strong>Ongoing Charge (OCF)</strong>: the fund&apos;s annual
              running cost as a percentage of your investment, charged by the
              fund provider — not a trading fee or platform charge.
            </li>
            <li id="holdings">
              <strong>Holdings breakdown</strong>: the fund&apos;s underlying
              investments by weight, as reported in the issuer&apos;s most
              recent holdings disclosure.
            </li>
            <li id="performance">
              <strong>
                Performance (1M / YTD / 1Y / 3Y / 5Y / Since Launch)
              </strong>
              : historical price return over each period. Past performance does
              not predict future returns.
            </li>
          </ul>
        </section>

        <section>
          <h2>How calculations are performed</h2>
          <p>
            Return figures are calculated from end-of-day price data as supplied
            by our data provider; we do not independently recalculate returns
            from raw constituent data. Where a figure is a provider calculation
            rather than a raw data point (for example, annualised returns), this
            page will be updated to state the calculation method used once that
            feature ships.
          </p>
        </section>

        <section>
          <h2>What limitations exist</h2>
          <ul>
            <li>
              We cover a curated list of major, well-known funds — not the full
              market. If a fund isn&apos;t listed, that&apos;s a coverage gap,
              not a signal about the fund itself.
            </li>
            <li>
              Data accuracy depends on our sources; while we verify static data
              monthly against official documents, errors can occur between
              reviews. If something looks wrong, please tell us — see the{" "}
              <a href="/contact">Contact</a> page.
            </li>
            <li>
              This site provides factual information only. Nothing on this site
              is a personal recommendation or financial advice. See our full{" "}
              <a href="/disclaimer">disclaimer</a>.
            </li>
            <li>
              Historical fee/holdings tracking begins from the date we started
              tracking each fund, not from the fund&apos;s launch.
            </li>
          </ul>
        </section>
      </div>
    </Container>
  );
}
