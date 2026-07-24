import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { DraftNotice } from "@/components/ui/DraftNotice";

// DRAFT content — grounded directly in the actual schema (prisma/schema.prisma)
// and Legal Principles Section 4, not generic boilerplate, but explicitly
// not final. See DraftNotice.tsx and app/terms/page.tsx for why.
//
// noindex (Milestone 6): same reasoning as app/terms/page.tsx — draft,
// unconfirmed privacy terms shouldn't be indexed as the real policy.
//
// Post-M8 launch-prep pass: added the sections a UK GDPR policy needs that
// weren't here yet (data controller identity, lawful basis per purpose,
// international transfer/sub-processor disclosure, the full Article 15-21
// rights list including the ICO complaint right) so the solicitor pass
// (Legal Principles Section 8) reviews complete, accurate draft content
// instead of also having to spot what's structurally missing. Two items
// genuinely can't be filled in honestly from this repo — the operator's
// legal identity (no entity has been formed/named anywhere in this
// codebase or /docs) and the named sub-processors (DEPLOYMENT.md
// deliberately doesn't commit to a specific Postgres/SMTP provider) — both
// marked as open placeholders rather than invented, since a fabricated
// company name or provider list would be a real accuracy problem, not a
// harmless stand-in.
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
          <h2>Who we are</h2>
          <p>
            <em>
              Operator legal name, registered address, and company number: to be
              added here once the operating entity is formed — see{" "}
              <a href="/contact">Contact</a> in the meantime for any data
              protection query. This is a required field for the final policy,
              not an oversight in this draft.
            </em>
          </p>
        </section>

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
          <h2>Legal basis for processing</h2>
          <ul>
            <li>
              <strong>Account and sign-in data</strong> — necessary to perform
              our contract with you (providing the account/save feature you
              asked for).
            </li>
            <li>
              <strong>Newsletter subscription</strong> — your consent, given via
              double opt-in and withdrawable at any time.
            </li>
            <li>
              <strong>Sign-in session data</strong> — our legitimate interest in
              keeping the service secure and working as expected, which
              doesn&apos;t override your own rights given how limited this data
              is.
            </li>
          </ul>
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
          <p>
            <em>
              The specific providers (and whether any process data outside the
              UK/EEA, which would need a documented transfer safeguard such as
              the UK&apos;s International Data Transfer Addendum) will be named
              here once selected — see DEPLOYMENT.md, which deliberately
              doesn&apos;t commit this project to one provider in advance.
            </em>
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            We use a session cookie to keep you signed in if you have an
            account. We don&apos;t use advertising or tracking cookies.
          </p>
          <p>
            We use Vercel Web Analytics to see aggregate figures like how many
            people visit a page — it doesn&apos;t use cookies, doesn&apos;t
            track you individually across visits, and doesn&apos;t collect
            anything that identifies you personally.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            Under UK GDPR you have the right to: access the data we hold about
            you; have inaccurate data corrected; have your data deleted;
            restrict or object to certain processing; and receive your data in a
            portable format. You can exercise any of these via the{" "}
            <a href="/contact">Contact</a>
            {
              // A plain JSX text space here is not reliable: this exact
              // spot broke twice — once as literal text, once as {" "}
              // that Prettier re-collapsed into literal text on reformat
              // — because JSX strips the leading space of a multi-line
              // text node that immediately follows a closing tag,
              // regardless of how that space is written in source. A JS
              // string expression is the only form immune to that
              // trimming, since its whitespace is never JSX text at all.
              " page — at our current scale these requests are handled manually rather than through a self-service tool, but the request path doesn't require you to know any GDPR-specific terminology to use it."
            }
          </p>
          <p>
            If you&apos;re unhappy with how we&apos;ve handled your data, you
            also have the right to complain to the UK&apos;s data protection
            regulator, the{" "}
            <a
              href="https://ico.org.uk/make-a-complaint/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Information Commissioner&apos;s Office (ICO)
            </a>
            . We&apos;d appreciate the chance to put things right directly
            first, but you&apos;re not required to contact us before you contact
            the ICO.
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
