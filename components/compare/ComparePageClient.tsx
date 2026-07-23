"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import {
  FundSearchField,
  type SearchableFund,
} from "@/components/compare/FundSearchField";
import { ComparisonResults } from "@/components/compare/ComparisonResults";
import styles from "./ComparePageClient.module.css";

export interface ComparableFund extends SearchableFund {
  ocf: number;
  feesSource: string;
  feesPublished: string;
  holdingsSource: string;
  holdingsPublished: string;
  topHoldings: { name: string; weight: number }[];
  sectorAllocation: Record<string, number>;
  regionAllocation: Record<string, number>;
  performance: {
    return1y: number | null;
    return3y: number | null;
    return5y: number | null;
    source: string;
    marketDataUpdatedIso: string;
  } | null;
}

// PRD US-1 / User Flows Stage 1: two fund-select fields by default, an
// optional third, a "Compare" button that activates once >= 2 funds are
// selected, and clicking it (not live-updating, unlike the Calculator)
// renders the results. Empty-state copy is LOCKED verbatim, Design System
// Section 10.
export function ComparePageClient({ funds }: { funds: ComparableFund[] }) {
  const [slots, setSlots] = useState<
    [ComparableFund | null, ComparableFund | null, ComparableFund | null]
  >([null, null, null]);
  const [showThirdSlot, setShowThirdSlot] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const selected = slots.filter((f): f is ComparableFund => f !== null);
  const canCompare = selected.length >= 2;

  function setSlot(index: 0 | 1 | 2, fund: ComparableFund | null) {
    setSlots((prev) => {
      const next: typeof prev = [...prev];
      next[index] = fund;
      return next;
    });
    setShowResults(false);
  }

  function selectableFund(fund: {
    ticker: string;
    name: string;
    isin: string;
  }): SearchableFund {
    return { ticker: fund.ticker, name: fund.name, isin: fund.isin };
  }

  const excludeFor = (index: number) =>
    slots
      .filter((_, i) => i !== index)
      .filter((f): f is ComparableFund => f !== null)
      .map((f) => f.ticker);

  return (
    <Container>
      <header className={styles.header}>
        <h1>Compare</h1>
      </header>

      {selected.length === 0 && (
        <div className={styles.emptyState}>
          {/* LOCKED copy, Design System Section 10. */}
          <h2>Pick two funds to compare</h2>
          <p className="text-secondary">Search by name or ticker below.</p>
        </div>
      )}

      <div className={styles.fields}>
        <FundSearchField
          label="Fund 1"
          funds={funds.map(selectableFund)}
          excludeTickers={excludeFor(0)}
          selected={slots[0] ? selectableFund(slots[0]) : null}
          onSelect={(f) =>
            setSlot(0, funds.find((full) => full.ticker === f.ticker) ?? null)
          }
          onClear={() => setSlot(0, null)}
        />
        <FundSearchField
          label="Fund 2"
          funds={funds.map(selectableFund)}
          excludeTickers={excludeFor(1)}
          selected={slots[1] ? selectableFund(slots[1]) : null}
          onSelect={(f) =>
            setSlot(1, funds.find((full) => full.ticker === f.ticker) ?? null)
          }
          onClear={() => setSlot(1, null)}
        />
        {(showThirdSlot || slots[2]) && (
          <FundSearchField
            label="Fund 3 (optional)"
            funds={funds.map(selectableFund)}
            excludeTickers={excludeFor(2)}
            selected={slots[2] ? selectableFund(slots[2]) : null}
            onSelect={(f) =>
              setSlot(2, funds.find((full) => full.ticker === f.ticker) ?? null)
            }
            onClear={() => setSlot(2, null)}
            // This field only ever mounts once, the moment it's first
            // revealed (via the button below) — autoFocus is a native
            // HTML behavior that fires exactly once at that point, not on
            // every re-render, so a keyboard user who activates "Add a
            // third fund" lands directly in the new field instead of
            // having to Tab to it manually.
            autoFocus
          />
        )}
      </div>

      {!showThirdSlot && !slots[2] && (
        <Button
          type="button"
          variant="ghost"
          className={styles.addThird}
          onClick={() => setShowThirdSlot(true)}
        >
          Add a third fund (optional)
        </Button>
      )}

      <Button
        type="button"
        disabled={!canCompare}
        onClick={() => setShowResults(true)}
        className={styles.compareButton}
      >
        Compare
      </Button>

      {showResults && canCompare && <ComparisonResults funds={selected} />}
    </Container>
  );
}
