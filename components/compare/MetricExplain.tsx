"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import styles from "./MetricExplain.module.css";

// Inline "what this means" explanation for a comparison metric — PRD US-1:
// "Every metric has an inline what this means explanation accessible
// without leaving the page (tooltip/expandable, not a separate page)."
// This is a different requirement from the fund detail page's "What does
// this mean? -> /methodology#anchor" link-out pattern, so it can't reuse
// that. It's also deliberately a new, self-contained component rather than
// an extraction from components/ui/Badge.tsx's similar disclosure
// interaction — Badge.tsx is existing, already-shipped, unrelated code,
// and refactoring it isn't required to implement the Comparison Tool.
export function MetricExplain({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <span className={styles.wrapper}>
      <button
        type="button"
        className={styles.infoButton}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label="What does this mean?"
        onClick={() => setOpen((o) => !o)}
      >
        ⓘ
      </button>
      {open && (
        <span id={panelId} role="note" className={styles.panel}>
          {children}
        </span>
      )}
    </span>
  );
}
