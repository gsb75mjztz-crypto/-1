"use client";

import { useId, useState } from "react";
import Link from "next/link";
import styles from "./Badge.module.css";

// The Design System's only "Badge" is the Confidence Badge (Section 4.5 +
// Section 6) — there is no generic tag/label component defined anywhere in
// the docs. This component is deliberately presentational only: it renders
// a status that has already been computed. Computing that status from raw
// dates against the Section 6 day thresholds is lib/confidence.ts, an
// explicit Week 2 deliverable (Development Roadmap) — not built here.
export type ConfidenceStatus = "high" | "medium" | "low";

const STATUS_COPY: Record<ConfidenceStatus, { emoji: string; label: string }> =
  {
    high: { emoji: "🟢", label: "High" },
    medium: { emoji: "🟡", label: "Medium" },
    low: { emoji: "🔴", label: "Needs review" },
  };

export function Badge({ status }: { status: ConfidenceStatus }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const { emoji, label } = STATUS_COPY[status];

  return (
    <span className={styles.wrapper}>
      <span className={`${styles.pill} ${styles[status]}`}>
        <span aria-hidden="true">{emoji}</span>
        {label}
        {/* Disclosure pattern, matching Header's mobile-menu toggle — not
            role="tooltip", since a true ARIA tooltip must not contain
            focusable content, and this panel contains a link. */}
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
      </span>

      {open && (
        <span id={panelId} className={styles.panel}>
          {/* Copy is LOCKED verbatim per Design System Section 6 — do not
              paraphrase, do not reword, do not drop the bolded clause. */}
          <strong>What this colour means</strong>
          <span>
            This shows how recent and how directly sourced this data is — it is{" "}
            <strong>not</strong> a rating of the fund, its quality, or its risk.
          </span>
          <span>
            🟢 <strong>High</strong> — sourced directly from the fund issuer or
            a licensed data provider, and refreshed within our target window.
          </span>
          <span>
            🟡 <strong>Medium</strong> — from a reliable source, but approaching
            its refresh window, or from a secondary provider.
          </span>
          <span>
            🔴 <strong>Needs review</strong> — past our refresh window and
            pending an update. If this decision is time-sensitive, check the
            issuer&apos;s own site.
          </span>
          <Link href="/methodology" className={styles.panelLink}>
            Full methodology →
          </Link>
        </span>
      )}
    </span>
  );
}
