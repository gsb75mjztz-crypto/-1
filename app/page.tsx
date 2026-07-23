import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";
import styles from "./page.module.css";

// Homepage / landing page, per Product Brief Sections 1-2, PRD Section 2
// (page #1) and User Flows Stage 1: one-sentence value proposition, a
// visual example, a primary CTA into Compare, a secondary link into the
// Calculator. No ETF functionality — the "visual example" the User Flows
// doc describes is a static illustrative mockup below, not a live
// comparison. It deliberately has no confidence Badge and no "Source"
// line, and is explicitly labelled "Example" everywhere it appears —
// those specific UI signals mean "this is real, sourced data" elsewhere in
// the product, and reusing them here for fabricated numbers would say the
// opposite of what's true. Real ticker names (VUAG/VWRP) appear only in
// prose, as the Brief's own illustrative pain-point question — never
// attached to a number, per the Legal Principles doc's content rules.
//
// Milestone 2 audit fix: the example numbers are a deliberate trade-off
// (Fund A cheaper, Fund B a higher return) rather than one fund winning on
// every displayed metric. An earlier version had Fund A dominate both
// figures — even fictional and clearly labelled, an example that always
// pairs "cheaper" with "better returns" teaches an implicit pattern in a
// product whose whole trust position rests on never implying a verdict,
// including by accident, including in throwaway marketing copy.
export default function Home() {
  return (
    <>
      <Container>
        <section className={styles.hero}>
          <h1>Know exactly why — before you invest another pound.</h1>
          <p className={styles.heroSub}>
            InvestorHub explains real ETF data in plain language, right at the
            moment you&apos;re deciding. The goal isn&apos;t becoming a
            financial expert — it&apos;s making this one decision well.
          </p>
          <p className={styles.heroContext}>
            It&apos;s the kind of question you&apos;re probably already asking —
            &ldquo;is VUAG or VWRP better for me&rdquo; — and it deserves a
            specific answer, not a generic guide.
          </p>
          <div className={styles.ctaRow}>
            <Button href="/compare">Compare two ETFs</Button>
            <Button href="/calculator" variant="secondary">
              Try the fee-drag calculator
            </Button>
          </div>
        </section>
      </Container>

      <div className={styles.section}>
        <Container>
          <div className={styles.sectionHeading}>
            <h2>Two funds, one clear answer</h2>
            <p>
              Every comparison shows the fee, the historical return, and how
              much the funds overlap — each explained inline, in plain language,
              as you read it.
            </p>
          </div>

          <div className={styles.exampleGrid}>
            <Card className={styles.exampleCard}>
              <span className={styles.exampleTag}>Example</span>
              <h3>Fund A</h3>
              <div className={styles.exampleRow}>
                <span>Ongoing charge</span>
                <strong>0.22%</strong>
              </div>
              <div className={styles.exampleRow}>
                <span>5-year return</span>
                <strong>+38.4%</strong>
              </div>
            </Card>
            <Card className={styles.exampleCard}>
              <span className={styles.exampleTag}>Example</span>
              <h3>Fund B</h3>
              <div className={styles.exampleRow}>
                <span>Ongoing charge</span>
                <strong>0.90%</strong>
              </div>
              <div className={styles.exampleRow}>
                <span>5-year return</span>
                <strong>+41.1%</strong>
              </div>
            </Card>
          </div>
          <p className={styles.exampleFeeDrag}>
            Illustrative only — not real fund data. A real comparison also shows
            what a fee difference like this actually costs over time, using the
            calculator.
          </p>
        </Container>
      </div>

      <div className={styles.section}>
        <Container>
          <div className={styles.sectionHeading}>
            <h2>Built to be trusted, not to impress</h2>
          </div>
          <div className={styles.valueGrid}>
            <Card className={styles.valueCard}>
              <h3>Plain language, not jargon</h3>
              <p>
                Every metric has a &ldquo;what this means&rdquo; explanation
                attached inline — no separate glossary to look up.
              </p>
            </Card>
            <Card className={styles.valueCard}>
              <h3>No verdicts, just the numbers</h3>
              <p>
                We show the data, explained. We never tell you which fund to
                pick — that decision stays yours.
              </p>
            </Card>
            <Card className={styles.valueCard}>
              <h3>Every figure sourced and dated</h3>
              <p>
                Fees and holdings come from official issuer documents; nothing
                is shown without its source and date attached.
              </p>
            </Card>
          </div>
        </Container>
      </div>

      <div className={styles.section}>
        <Container>
          <NewsletterSignup />
        </Container>
      </div>
    </>
  );
}
