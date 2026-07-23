import { Card } from "@/components/ui/Card";
import { GrowthChart } from "@/components/calculator/GrowthChart";
import type { FeeDragResult, GrowthResult } from "@/lib/growthCalculator";
import type { CalculatorInputs } from "@/lib/calculatorDefaults";
import styles from "./CalculatorResults.module.css";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function BreakdownCard({
  label,
  result,
  colorVar,
}: {
  label: string;
  result: GrowthResult;
  colorVar: "--color-accent" | "--color-accent-secondary";
}) {
  return (
    <Card className={styles.breakdownCard}>
      {/* A swatch carries the series identity, not the heading text colour
          — --color-accent-secondary as literal text on --color-surface
          measures 3.87:1, below the 4.5:1 WCAG AA normal-text threshold
          (it was previously verified only as a border, a 3:1 graphical
          use). Both headings use the same neutral text colour + swatch
          treatment for visual consistency between Fee A and Fee B. */}
      <h3 className={styles.breakdownHeading}>
        <span
          className={styles.breakdownSwatch}
          style={{ background: `var(${colorVar})` }}
          aria-hidden="true"
        />
        {label}
      </h3>
      <dl className={styles.breakdownList}>
        <div className={styles.breakdownRow}>
          <dt className="text-secondary">Final value</dt>
          <dd className="tabular-nums">{formatCurrency(result.finalValue)}</dd>
        </div>
        <div className={styles.breakdownRow}>
          <dt className="text-secondary">Total contributed</dt>
          <dd className="tabular-nums">
            {formatCurrency(result.totalContributed)}
          </dd>
        </div>
        <div className={styles.breakdownRow}>
          <dt className="text-secondary">Total growth</dt>
          <dd className="tabular-nums">{formatCurrency(result.totalGrowth)}</dd>
        </div>
      </dl>
    </Card>
  );
}

// Growth & Fee-Drag Calculator results — PRD US-4: "a clear visual growth
// comparison and a plain-language summary sentence stating the pound-
// figure difference." No verdict/ranking language anywhere in this
// output (Legal Principles Section 3) — the summary states the cost of
// the fee difference as a fact, never which fee is "the smarter pick."
export function CalculatorResults({
  inputs,
  result,
}: {
  inputs: CalculatorInputs;
  result: FeeDragResult;
}) {
  const { scenarioA, scenarioB, costDifference } = result;
  const feeALabel = `Fee A (${inputs.feeRateAPercent.toFixed(2)}%)`;
  const feeBLabel = `Fee B (${inputs.feeRateBPercent.toFixed(2)}%)`;

  return (
    <section className={styles.wrapper}>
      <h2>Result</h2>

      <p className={styles.summary}>
        On {formatCurrency(inputs.startingAmount)} to start plus{" "}
        {formatCurrency(inputs.monthlyContribution)} a month for {inputs.years}{" "}
        {inputs.years === 1 ? "year" : "years"}, at an assumed{" "}
        {inputs.annualGrowthRatePercent}% annual growth, the difference between
        a {inputs.feeRateAPercent.toFixed(2)}% and a{" "}
        {inputs.feeRateBPercent.toFixed(2)}% fee costs an estimated{" "}
        <strong className="tabular-nums">
          {formatCurrency(costDifference)}
        </strong>{" "}
        by year {inputs.years}.
      </p>

      <GrowthChart
        seriesA={{
          label: feeALabel,
          colorVar: "--color-accent",
          points: scenarioA.series,
        }}
        seriesB={{
          label: feeBLabel,
          colorVar: "--color-accent-secondary",
          points: scenarioB.series,
        }}
      />

      <div className={styles.breakdownGrid}>
        <BreakdownCard
          label={feeALabel}
          result={scenarioA}
          colorVar="--color-accent"
        />
        <BreakdownCard
          label={feeBLabel}
          result={scenarioB}
          colorVar="--color-accent-secondary"
        />
      </div>

      <details className={styles.methodology}>
        <summary>How this is calculated</summary>
        <div className={styles.methodologyBody}>
          <p className="text-secondary">
            Every figure above comes directly from the formula below, with no
            adjustment or rounding beyond display formatting.
          </p>
          <p>
            <strong>Compound growth:</strong> your starting amount and each
            month&apos;s contribution grow at the assumed annual rate,
            compounded monthly. A contribution added in month 18 has had less
            time to grow than one added in month 1 — later contributions
            compound for less time, which is real, not a rounding effect.
          </p>
          <p>
            <strong>Fee drag:</strong> the fee (OCF) is subtracted from the
            assumed growth rate before compounding. An assumed 5% growth with a
            0.19% fee compounds at an effective 4.81% a year — the gap between
            that and a lower fee&apos;s effective rate is what shows up as a
            pound figure by the end of the time horizon.
          </p>
          <p>
            <strong>Contributions:</strong> &ldquo;Total contributed&rdquo;
            above is the starting amount plus every monthly contribution, added
            up with no growth included — it&apos;s what you actually paid in.
            &ldquo;Total growth&rdquo; is everything above that.
          </p>
          <p>
            This is arithmetic on the numbers you entered, not a forecast.
            Change any input and the result changes with it — nothing here is
            fixed or guaranteed.
          </p>
        </div>
      </details>

      {/* LOCKED copy, Design System Section 7 — every page whose output
          concerns investment growth renders this, without exception,
          matching how the fund pages and comparison results already do. */}
      <p className={styles.disclaimer}>
        This page provides factual information only and does not constitute
        financial advice or a recommendation to buy, sell or hold any
        investment.
      </p>
    </section>
  );
}
