import { Badge, type ConfidenceStatus } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatDate";
import styles from "./SourceAttribution.module.css";

// Renders the Source / date / confidence line that appears identically
// under Fees, Holdings, and Performance on the ETF Page Build Spec's
// template (Section 1) — three sections, same shape, one component. The
// date label differs ("Data published" for fees/holdings, "Market data
// last updated" for performance, per the spec) so it's a prop, not
// hardcoded.
export function SourceAttribution({
  source,
  dateLabel,
  dateIso,
  status,
}: {
  source: string;
  dateLabel: string;
  dateIso: string;
  status: ConfidenceStatus;
}) {
  return (
    <div className={styles.wrapper}>
      <p className="text-secondary">Source: {source}</p>
      <p className="text-secondary">
        {dateLabel}: {formatDate(dateIso)}
      </p>
      <div className={styles.badgeRow}>
        <span className="text-secondary">Confidence:</span>
        <Badge status={status} />
      </div>
    </div>
  );
}
