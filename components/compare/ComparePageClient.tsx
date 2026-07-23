"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  FundSearchField,
  type SearchableFund,
} from "@/components/compare/FundSearchField";
import { ComparisonResults } from "@/components/compare/ComparisonResults";
import { getComparableFunds } from "@/app/compare/actions";
import type { ComparableFund } from "@/lib/compareTypes";
import styles from "./ComparePageClient.module.css";

type CompareState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; funds: ComparableFund[] };

// PRD US-1 / User Flows Stage 1: two fund-select fields by default, an
// optional third, a "Compare" button that activates once >= 2 funds are
// selected, and clicking it (not live-updating, unlike the Calculator)
// renders the results. Empty-state copy is LOCKED verbatim, Design System
// Section 10.
//
// `funds` here is the slim search index only (ticker/name/isin/ocf) —
// full comparison data for the selected funds is fetched on demand via
// getComparableFunds() when Compare is clicked, not held for every
// curated fund up front. See app/compare/page.tsx and actions.ts.
export function ComparePageClient({ funds }: { funds: SearchableFund[] }) {
  const [slots, setSlots] = useState<
    [SearchableFund | null, SearchableFund | null, SearchableFund | null]
  >([null, null, null]);
  const [showThirdSlot, setShowThirdSlot] = useState(false);
  const [compareState, setCompareState] = useState<CompareState>({
    status: "idle",
  });
  // Fee-cap filter, Milestone 6 — narrows the fund picker's own result
  // list only, not a separate browse/screener surface (the PRD explicitly
  // cuts a standalone ETF database page from MVP scope; this stays inside
  // the existing Comparison Tool search). A fund already selected in a
  // slot stays selected even if a filter set afterwards would exclude it
  // — the filter narrows what you can pick next, it never un-picks
  // something you already chose.
  const [maxFeeInput, setMaxFeeInput] = useState("");

  const selected = slots.filter((f): f is SearchableFund => f !== null);
  const canCompare = selected.length >= 2;

  const maxFee = Number(maxFeeInput);
  const feeFilterActive = maxFeeInput.trim() !== "" && Number.isFinite(maxFee);
  const filteredFunds = useMemo(
    () => (feeFilterActive ? funds.filter((f) => f.ocf <= maxFee) : funds),
    [funds, feeFilterActive, maxFee],
  );

  function setSlot(index: 0 | 1 | 2, fund: SearchableFund | null) {
    setSlots((prev) => {
      const next: typeof prev = [...prev];
      next[index] = fund;
      return next;
    });
    // A changed selection invalidates whatever's currently shown — the
    // user must click Compare again to see updated results, matching the
    // User Flows doc's discrete "click Compare -> results render" step
    // rather than live-updating (that distinction is deliberate; see the
    // Calculator's live-updating behaviour for the contrast once it
    // exists).
    setCompareState({ status: "idle" });
  }

  const excludeFor = (index: number) =>
    slots
      .filter((_, i) => i !== index)
      .filter((f): f is SearchableFund => f !== null)
      .map((f) => f.ticker);

  async function handleCompare() {
    setCompareState({ status: "loading" });
    try {
      const result = await getComparableFunds(selected.map((f) => f.ticker));
      setCompareState({ status: "success", funds: result });
    } catch {
      setCompareState({ status: "error" });
    }
  }

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

      <Input
        label="Max fee (OCF %) — optional"
        type="number"
        inputMode="decimal"
        step={0.01}
        min={0}
        placeholder="No limit"
        value={maxFeeInput}
        onChange={(e) => setMaxFeeInput(e.target.value)}
        className={styles.feeFilter}
      />

      <div className={styles.fields}>
        <FundSearchField
          label="Fund 1"
          funds={filteredFunds}
          excludeTickers={excludeFor(0)}
          selected={slots[0]}
          onSelect={(f) => setSlot(0, f)}
          onClear={() => setSlot(0, null)}
          emptyMessage={
            feeFilterActive ? "No funds at or under this fee limit" : undefined
          }
        />
        <FundSearchField
          label="Fund 2"
          funds={filteredFunds}
          excludeTickers={excludeFor(1)}
          selected={slots[1]}
          onSelect={(f) => setSlot(1, f)}
          onClear={() => setSlot(1, null)}
          emptyMessage={
            feeFilterActive ? "No funds at or under this fee limit" : undefined
          }
        />
        {(showThirdSlot || slots[2]) && (
          <FundSearchField
            label="Fund 3 (optional)"
            funds={filteredFunds}
            excludeTickers={excludeFor(2)}
            selected={slots[2]}
            onSelect={(f) => setSlot(2, f)}
            onClear={() => setSlot(2, null)}
            emptyMessage={
              feeFilterActive
                ? "No funds at or under this fee limit"
                : undefined
            }
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
        disabled={!canCompare || compareState.status === "loading"}
        onClick={handleCompare}
        className={styles.compareButton}
      >
        {compareState.status === "loading" ? "Comparing…" : "Compare"}
      </Button>

      {compareState.status === "error" && (
        <p role="alert" className={styles.errorText}>
          Something went wrong comparing these funds — please try again.
        </p>
      )}

      {compareState.status === "success" && (
        <ComparisonResults funds={compareState.funds} />
      )}
    </Container>
  );
}
