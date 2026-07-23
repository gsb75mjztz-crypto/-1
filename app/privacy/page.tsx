import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { DraftNotice } from "@/components/ui/DraftNotice";

// DRAFT content — grounded directly in the actual schema (prisma/schema.prisma)
// and Legal Principles Section 4, not generic boilerplate, but explicitly
// not final. See DraftNotice.tsx and app/terms/page.tsx for why.
//
// noindex (Milestone 6): same reasoning as app/terms/page.tsx — draft,
// unconfirmed privacy terms shouldn't be indexed as the real policy.
export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false, follow: true },
};
export default function PrivacyPage() {
  return (
    <Container>
      <h1>Privacy policy</h1>
      <div className="prose">
        <DraftNotice>
          <strong>Draft — pending solicitor review.</strong> This page describes
          InvestorHub&apos;s actual data practices today, but has not yet been
          reviewed by a solicitor for UK GDPR accuracy or completeness. Do not
          treat it as final.
        </DraftNotice>

        <section>
          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Email address</strong> — only if you create an account (to
              sign in via magic link) or subscribe to the newsletter.
            </li>
            <li>
              <strong>Saved comparisons</strong> — the fund tickers and
              calculator inputs you choose to save, if you have an account.
            </li>
            <li>
              <strong>Newsletter subscription status</strong> — whether
              you&apos;ve subscribed, and confirmed via double opt-in.
            </li>
            <li>
              <strong>Sign-in session data</strong> — technical data needed to
              keep you signed in between visits.
            </li>
          </ul>
        </section>

        <section>
          <h2>What we deliberately don&apos;t collect</h2>
          <p>
            No field anywhere on InvestorHub collects your age, income,
            employment status, existing portfolio, risk tolerance, or investment
            goals. This isn&apos;t an oversight — collecting that information
            would let the site tailor results to your personal circumstances,
            which would cross from factual information into regulated financial
            advice. See our <a href="/disclaimer">Disclaimer</a>.
          </p>
        </section>

        <section>
          <h2>How we use it</h2>
          <p>
            To operate the account and save-comparison features, to send the
            newsletter if you&apos;ve subscribed and confirmed, and to keep you
            signed in. We do not use your data to build an advertising profile,
            and InvestorHub does not run advertising.
          </p>
        </section>

        <section>
          <h2>Who we share it with</h2>
          <p>
            Our hosting provider, database provider, and email-delivery provider
            (to send magic links and newsletter emails) process data on our
            behalf to run the service. We do not sell your data, and we do not
            share it with advertisers or marketing platforms. Performance data
            providers (e.g. our market-data feed) never receive any of your
            personal data — that relationship only flows in the other direction,
            into the product.
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            We use a session cookie to keep you signed in if you have an
            account. We don&apos;t use advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            You can request a copy of your data or ask us to delete it at any
            time via the <a href="/contact">Contact</a> page. At our current
            scale this is handled manually rather than through a self-service
            tool, but the request path doesn&apos;t require you to know any
            GDPR-specific terminology to use it.
          </p>
        </section>

        <section>
          <h2>How long we keep it</h2>
          <p>
            We keep account data for as long as your account is active, and
            delete it on request. Newsletter subscriber data is kept until you
            unsubscribe or ask us to remove it.
          </p>
        </section>

        <section>
          <h2>Changes to this policy</h2>
          <p>
            If what we collect or how we use it changes, this page is updated to
            match — it&apos;s written to describe actual practice, not a
            template we stop maintaining.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about this policy, or a data access/deletion request — use
            the <a href="/contact">Contact</a> page.
          </p>
        </section>
      </div>
    </Container>
  );
}
