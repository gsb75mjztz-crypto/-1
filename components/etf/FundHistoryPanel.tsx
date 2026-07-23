import { formatDate } from "@/lib/formatDate";
import type { ProvenanceEntry } from "@/lib/provenance";
import styles from "./FundHistoryPanel.module.css";

// History tab content, ETF Page Build Spec Section 3. Part (c), the
// provenance log, ships now — it's a real, populated list from day one.
// Parts (a) fee-history chart and (b) holdings-drift view are correctly
// absent: the spec's own MVP scope note says they "depend on having
// accumulated at least one or two refresh cycles of historical snapshots
// first" — every fund here has exactly one snapshot (this milestone's
// initial import), so there's nothing to chart yet. The empty-state copy
// below is LOCKED verbatim, Design System Section 10.
export function FundHistoryPanel({
  provenance,
  trackingStartIso,
}: {
  provenance: ProvenanceEntry[];
  trackingStartIso: string;
}) {
  return (
    <div className={styles.wrapper}>
      <section>
        <h2>Data provenance log</h2>
        <ul className={styles.log}>
          {provenance.map((entry) => (
            <li
              key={`${entry.date}-${entry.description}`}
              className={styles.logEntry}
            >
              <span className="tabular-nums">{formatDate(entry.date)}</span>
              <span>{entry.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.emptyState}>
        <h2>Not enough history yet for this fund</h2>
        <p className="text-secondary">
          We started tracking this fund on {formatDate(trackingStartIso)} —
          check back as more data accumulates.
        </p>
      </section>
    </div>
  );
}
