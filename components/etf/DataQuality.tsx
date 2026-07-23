import { formatDate } from "@/lib/formatDate";
import styles from "./DataQuality.module.css";

// ETF Page Build Spec Section 1, verbatim structure:
//   Data Quality
//   ✓ Last reviewed: 15 July 2026
//   ✓ All static fund information verified against official issuer
//     documentation
export function DataQuality({ lastReviewedIso }: { lastReviewedIso: string }) {
  return (
    <section className={styles.wrapper}>
      <h2>Data quality</h2>
      <ul className={styles.list}>
        <li>
          <span aria-hidden="true">✓</span> Last reviewed:{" "}
          {formatDate(lastReviewedIso)}
        </li>
        <li>
          <span aria-hidden="true">✓</span> All static fund information verified
          against official issuer documentation
        </li>
      </ul>
    </section>
  );
}
