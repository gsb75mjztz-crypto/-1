import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "InvestorHub provides factual information only — not financial advice or a recommendation to buy, sell or hold any investment.",
  alternates: { canonical: "/disclaimer" },
};

// New route beyond the PRD's literal 13-page sitemap — the PRD (page #9)
// says the disclaimer language belongs inside Terms of Use, and it does
// (see app/terms/page.tsx). This standalone page exists in addition,
// because Milestone 2 was asked for a dedicated Disclaimer page and a
// short, directly-linkable page is genuinely useful (e.g. as the
// destination for the confidence badge's "not a rating of the fund" note,
// or any fund page's disclaimer line, once those exist). Flagged as a
// deliberate, additive deviation from the PRD sitemap, not a silent one.
export default function DisclaimerPage() {
  return (
    <Container>
      <h1>Disclaimer</h1>
      <div className="prose">
        <section>
          {/* LOCKED copy, Design System Section 7 — do not paraphrase. */}
          <p>
            <strong>
              This page provides factual information only and does not
              constitute financial advice or a recommendation to buy, sell or
              hold any investment.
            </strong>
          </p>
        </section>

        <section>
          <h2>What that means in practice</h2>
          <p>
            Everything InvestorHub shows — fund fees, holdings, performance
            figures, and the calculator&apos;s maths — is the same for every
            visitor and is never tailored to your personal circumstances. We
            don&apos;t know your income, your risk tolerance, or your goals, and
            we don&apos;t ask, because a recommendation based on those things
            would be regulated financial advice — which InvestorHub does not
            provide.
          </p>
          <p>
            Nothing on this site tells you which fund is &ldquo;better&rdquo; or
            ranks funds against each other. Where a data point&apos;s freshness
            is shown (a confidence indicator), that reflects how recent and how
            directly sourced the data is — it is never a rating of the fund
            itself, its quality, or its risk. See the{" "}
            <a href="/methodology">Methodology</a> page for how the underlying
            data is sourced and kept up to date.
          </p>
        </section>

        <section>
          <h2>Past performance</h2>
          <p>
            Historical returns shown anywhere on this site do not predict future
            performance. The value of investments can fall as well as rise.
          </p>
        </section>

        <section>
          <h2>If you need advice</h2>
          <p>
            If you want a recommendation tailored to your personal
            circumstances, speak to an FCA-authorised financial adviser.
            InvestorHub is a research tool, not a substitute for regulated
            advice.
          </p>
        </section>
      </div>
    </Container>
  );
}
