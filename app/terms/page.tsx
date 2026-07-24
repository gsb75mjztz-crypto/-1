import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { DraftNotice } from "@/components/ui/DraftNotice";

// DRAFT content — grounded in what's actually built/planned (this repo's
// docs and schema), not generic boilerplate, but explicitly not final: the
// Legal Principles doc (Section 8) gates real Terms/Privacy content on
// solicitor sign-off, which hasn't happened. See DraftNotice.tsx for why
// this ships as a visible draft rather than either a placeholder or a
// silent "final" page.
//
// noindex (Milestone 6): a search engine treating draft, unconfirmed
// legal terms as the real, current Terms of Use is exactly the kind of
// risk this page's own visible draft banner exists to prevent for human
// readers — the same caution extends to crawlers. Remove once solicitor
// sign-off lands and this page ships as final content.
//
// Post-M8 launch-prep pass: added the sections Section 8's solicitor
// checklist will otherwise flag as structurally missing (operator
// identity, an explicit FCA-authorisation statement, an IP-ownership
// clause) plus a standard UK consumer-law liability carve-out, so the
// review pass is spent on legal judgment calls, not on filling gaps that
// don't need a solicitor to notice. Operator legal identity is left as an
// open placeholder, same reasoning as app/privacy/page.tsx — no entity has
// been formed/named anywhere in this codebase, and inventing one here
// would be a worse accuracy problem than an honest gap.
export const metadata: Metadata = {
  title: "Terms of Use",
  robots: { index: false, follow: true },
};
export default function TermsPage() {
  return (
    <Container>
      <h1>Terms of use</h1>
      <div className="prose">
        <DraftNotice>
          <strong>Draft — pending solicitor review.</strong> This page reflects
          how InvestorHub actually works today, but has not yet been reviewed by
          a solicitor for legal accuracy or completeness. Do not treat it as
          final or legally binding.
        </DraftNotice>

        <section>
          <h2>Who operates InvestorHub</h2>
          <p>
            <em>
              Operator legal name, registered address, and company number: to be
              added here once the operating entity is formed. This is a required
              field for the final terms, not an oversight in this draft.
            </em>
          </p>
        </section>

        <section>
          <h2>What InvestorHub is</h2>
          <p>
            InvestorHub is a research tool that shows factual information about
            exchange-traded funds (ETFs) — fees, holdings, and historical
            performance — explained in plain language, alongside a calculator
            for the compounding cost of fee differences.
          </p>
          <p>
            <strong>
              InvestorHub provides factual information only. It does not
              constitute financial advice or a recommendation to buy, sell or
              hold any investment.
            </strong>{" "}
            See our full <a href="/disclaimer">Disclaimer</a>.
          </p>
          <p>
            InvestorHub is not authorised or regulated by the Financial Conduct
            Authority (FCA), does not hold itself out as such, and does not
            provide regulated financial advice or personal recommendations of
            any kind.
          </p>
        </section>

        <section>
          <h2>Who can use it</h2>
          <p>
            InvestorHub is intended for users aged 18 and over, consistent with
            the minimum age for opening a UK investment account.
          </p>
        </section>

        <section>
          <h2>Accounts</h2>
          <p>
            An account is optional and only needed to save comparisons. Sign-in
            uses a passwordless magic link sent to your email — we don&apos;t
            store passwords. You&apos;re responsible for keeping access to the
            email address you sign in with.
          </p>
        </section>

        <section>
          <h2>Data accuracy</h2>
          <p>
            Fee and holdings data is sourced from official fund issuer documents
            and reviewed monthly; performance data refreshes automatically. We
            work to keep this accurate, but we don&apos;t guarantee it, and
            errors can occur between reviews — see{" "}
            <a href="/methodology">Methodology</a> for our sourcing process and
            its limitations. If you find an error, please{" "}
            <a href="/contact">tell us</a>.
          </p>
        </section>

        <section>
          <h2>No liability for investment decisions</h2>
          <p>
            Any decision you make using information from this site is your own.
            InvestorHub is not liable for investment losses arising from use of
            the site, to the fullest extent permitted by law. Nothing in these
            terms excludes or limits liability where it would be unlawful to do
            so — including for death or personal injury caused by negligence, or
            for fraud — or affects your statutory rights as a consumer.
          </p>
        </section>

        <section>
          <h2>Intellectual property</h2>
          <p>
            The compiled fund comparisons, calculator, and site content are
            InvestorHub&apos;s own work and may not be reproduced or
            redistributed as your own compiled dataset (see Acceptable use,
            below). The underlying factual data — fees, holdings, performance —
            remains sourced from and attributed to the official issuer
            disclosures cited on each page; InvestorHub doesn&apos;t claim
            ownership of those underlying facts, only of how they&apos;re
            compiled and presented here.
          </p>
        </section>

        <section>
          <h2>Acceptable use</h2>
          <p>
            Don&apos;t scrape, automatically harvest, or republish the
            site&apos;s data as your own compiled dataset. Don&apos;t attempt to
            disrupt or misuse the comparison tool, calculator, or any account
            functionality.
          </p>
        </section>

        <section>
          <h2>Changes to these terms</h2>
          <p>
            We may update these terms as the product changes. Material changes
            will be reflected with an updated date on this page.
          </p>
        </section>

        <section>
          <h2>Governing law</h2>
          <p>These terms are governed by the law of England and Wales.</p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms — use the <a href="/contact">Contact</a>{" "}
            page.
          </p>
        </section>
      </div>
    </Container>
  );
}
