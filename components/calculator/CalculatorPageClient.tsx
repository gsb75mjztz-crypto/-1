"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { calculateFeeDrag } from "@/lib/growthCalculator";
import {
  CALCULATOR_BOUNDS,
  buildCalculatorShareParams,
  clamp,
  type CalculatorInputs,
} from "@/lib/calculatorDefaults";
import { CalculatorResults } from "@/components/calculator/CalculatorResults";
import styles from "./CalculatorPageClient.module.css";

// Parses a raw input string into a bounded number, falling back to the
// given default on anything non-finite (an empty field while the user is
// mid-edit, "-", "1.", etc.) — the *stored* form state stays the raw
// string (so the field doesn't fight the user's typing), only the
// *derived* calculation input is clamped.
function toBoundedNumber(
  raw: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return clamp(value, min, max);
}

// Growth & Fee-Drag Calculator — User Flows Stage 3: unlike the
// Comparison Tool's discrete "click Compare" step, this is explicitly
// live-updating ("no separate submit click required for a good mobile
// experience") — every input recomputes the result on each change, no
// button, no async round trip (there's no server data involved at all,
// only maths over what the user typed).
export function CalculatorPageClient({
  initialInputs,
}: {
  initialInputs: CalculatorInputs;
}) {
  const [startingAmount, setStartingAmount] = useState(
    String(initialInputs.startingAmount),
  );
  const [monthlyContribution, setMonthlyContribution] = useState(
    String(initialInputs.monthlyContribution),
  );
  const [years, setYears] = useState(String(initialInputs.years));
  const [growthRate, setGrowthRate] = useState(
    String(initialInputs.annualGrowthRatePercent),
  );
  const [feeA, setFeeA] = useState(String(initialInputs.feeRateAPercent));
  const [feeB, setFeeB] = useState(String(initialInputs.feeRateBPercent));
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const inputs: CalculatorInputs = useMemo(
    () => ({
      startingAmount: toBoundedNumber(
        startingAmount,
        initialInputs.startingAmount,
        CALCULATOR_BOUNDS.startingAmount.min,
        CALCULATOR_BOUNDS.startingAmount.max,
      ),
      monthlyContribution: toBoundedNumber(
        monthlyContribution,
        initialInputs.monthlyContribution,
        CALCULATOR_BOUNDS.monthlyContribution.min,
        CALCULATOR_BOUNDS.monthlyContribution.max,
      ),
      years: toBoundedNumber(
        years,
        initialInputs.years,
        CALCULATOR_BOUNDS.years.min,
        CALCULATOR_BOUNDS.years.max,
      ),
      annualGrowthRatePercent: toBoundedNumber(
        growthRate,
        initialInputs.annualGrowthRatePercent,
        CALCULATOR_BOUNDS.annualGrowthRatePercent.min,
        CALCULATOR_BOUNDS.annualGrowthRatePercent.max,
      ),
      feeRateAPercent: toBoundedNumber(
        feeA,
        initialInputs.feeRateAPercent,
        CALCULATOR_BOUNDS.feeRatePercent.min,
        CALCULATOR_BOUNDS.feeRatePercent.max,
      ),
      feeRateBPercent: toBoundedNumber(
        feeB,
        initialInputs.feeRateBPercent,
        CALCULATOR_BOUNDS.feeRatePercent.min,
        CALCULATOR_BOUNDS.feeRatePercent.max,
      ),
    }),
    [
      startingAmount,
      monthlyContribution,
      years,
      growthRate,
      feeA,
      feeB,
      initialInputs,
    ],
  );

  const result = useMemo(
    () =>
      calculateFeeDrag({
        startingAmount: inputs.startingAmount,
        monthlyContribution: inputs.monthlyContribution,
        years: inputs.years,
        annualGrowthRate: inputs.annualGrowthRatePercent / 100,
        feeRateA: inputs.feeRateAPercent / 100,
        feeRateB: inputs.feeRateBPercent / 100,
      }),
    [inputs],
  );

  async function handleShare() {
    try {
      const params = buildCalculatorShareParams(inputs);
      const url = `${window.location.origin}/calculator?${params.toString()}`;
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2500);
    } catch {
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 2500);
    }
  }

  return (
    <Container>
      <header className={styles.header}>
        <h1>Calculator</h1>
        <p className="text-secondary">
          See what a fee difference actually costs over time. Change any number
          below — every figure updates immediately, using the maths explained
          under the result.
        </p>
      </header>

      <div className={styles.layout}>
        <section>
          <h2>Your numbers</h2>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <Input
              label="Starting amount (£)"
              type="number"
              inputMode="decimal"
              min={CALCULATOR_BOUNDS.startingAmount.min}
              max={CALCULATOR_BOUNDS.startingAmount.max}
              value={startingAmount}
              onChange={(e) => setStartingAmount(e.target.value)}
            />
            <Input
              label="Monthly contribution (£)"
              type="number"
              inputMode="decimal"
              min={CALCULATOR_BOUNDS.monthlyContribution.min}
              max={CALCULATOR_BOUNDS.monthlyContribution.max}
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
            />
            <Input
              label="Time horizon (years)"
              type="number"
              inputMode="numeric"
              min={CALCULATOR_BOUNDS.years.min}
              max={CALCULATOR_BOUNDS.years.max}
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
            <Input
              label="Assumed annual growth (%)"
              type="number"
              inputMode="decimal"
              step={0.1}
              min={CALCULATOR_BOUNDS.annualGrowthRatePercent.min}
              max={CALCULATOR_BOUNDS.annualGrowthRatePercent.max}
              value={growthRate}
              onChange={(e) => setGrowthRate(e.target.value)}
            />
            <p className={styles.growthRateHint}>
              An assumption you can change, not a prediction — actual investment
              returns vary and are never guaranteed.
            </p>
            <Input
              label="Fee A — OCF (%)"
              type="number"
              inputMode="decimal"
              step={0.01}
              min={CALCULATOR_BOUNDS.feeRatePercent.min}
              max={CALCULATOR_BOUNDS.feeRatePercent.max}
              value={feeA}
              onChange={(e) => setFeeA(e.target.value)}
            />
            <Input
              label="Fee B — OCF (%)"
              type="number"
              inputMode="decimal"
              step={0.01}
              min={CALCULATOR_BOUNDS.feeRatePercent.min}
              max={CALCULATOR_BOUNDS.feeRatePercent.max}
              value={feeB}
              onChange={(e) => setFeeB(e.target.value)}
            />
          </form>
        </section>

        <CalculatorResults inputs={inputs} result={result} />
      </div>

      <div className={styles.shareBar}>
        <Button type="button" variant="secondary" onClick={handleShare}>
          {shareStatus === "copied"
            ? "Link copied!"
            : shareStatus === "error"
              ? "Couldn't copy — try again"
              : "Share this result"}
        </Button>
      </div>
    </Container>
  );
}
