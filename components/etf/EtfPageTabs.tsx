"use client";

import { useRef, useState, type ReactNode } from "react";
import styles from "./EtfPageTabs.module.css";

type TabKey = "overview" | "history";

// ETF Page Build Spec Section 1/3: "[TABS: Overview | History]" wraps the
// Fees/Holdings/Performance sections (Overview) and the provenance log
// (History). Implements the WCAG APG Tabs pattern with automatic
// activation (arrow keys move focus AND switch panels) — not just two
// buttons that look like tabs, since "Ensure accessibility" is explicit
// for this milestone: role="tablist"/"tab"/"tabpanel", aria-selected,
// roving tabindex, and Left/Right arrow-key navigation.
export function EtfPageTabs({
  overview,
  history,
}: {
  overview: ReactNode;
  history: ReactNode;
}) {
  const [active, setActive] = useState<TabKey>("overview");
  const overviewTabRef = useRef<HTMLButtonElement>(null);
  const historyTabRef = useRef<HTMLButtonElement>(null);

  function activate(tab: TabKey) {
    setActive(tab);
    (tab === "overview" ? overviewTabRef : historyTabRef).current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      activate(active === "overview" ? "history" : "overview");
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Fund page sections"
        className={styles.tablist}
        onKeyDown={handleKeyDown}
      >
        <button
          ref={overviewTabRef}
          type="button"
          role="tab"
          id="etf-tab-overview"
          aria-selected={active === "overview"}
          aria-controls="etf-panel-overview"
          tabIndex={active === "overview" ? 0 : -1}
          className={styles.tab}
          onClick={() => activate("overview")}
        >
          Overview
        </button>
        <button
          ref={historyTabRef}
          type="button"
          role="tab"
          id="etf-tab-history"
          aria-selected={active === "history"}
          aria-controls="etf-panel-history"
          tabIndex={active === "history" ? 0 : -1}
          className={styles.tab}
          onClick={() => activate("history")}
        >
          History
        </button>
      </div>

      <div
        role="tabpanel"
        id="etf-panel-overview"
        aria-labelledby="etf-tab-overview"
        hidden={active !== "overview"}
        tabIndex={0}
      >
        {overview}
      </div>
      <div
        role="tabpanel"
        id="etf-panel-history"
        aria-labelledby="etf-tab-history"
        hidden={active !== "history"}
        tabIndex={0}
      >
        {history}
      </div>
    </div>
  );
}
