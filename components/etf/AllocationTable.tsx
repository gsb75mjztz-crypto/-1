import styles from "./AllocationTable.module.css";

// Design System Section 4.2 ("Tables"): hairline row dividers, no
// vertical borders, row height >= tap-target-min, tabular-nums on numeric
// columns. Used for Top 10 Holdings, Sector Allocation, and Country
// Allocation — three sections, identical shape (a label and a weight),
// per the ETF Page Build Spec template.
export function AllocationTable({
  caption,
  rows,
  expectFullCoverage = true,
}: {
  caption: string;
  rows: { label: string; weight: number }[];
  // False for a table that's a top-N list by definition (Top 10
  // Holdings) — summing to well under 100% there is normal, not a data
  // gap, so the partial-coverage note below would be misleading.
  expectFullCoverage?: boolean;
}) {
  const total = rows.reduce((sum, row) => sum + row.weight, 0);
  // Some sources only publish a top-N breakdown with no "Other" residual
  // row (confirmed against VWRP's real factsheet: its country table lists
  // 10 countries summing to 88.4%, not 100%). Rather than pad that with
  // an invented "Other" percentage, or silently show a table that looks
  // like it should sum to 100 and doesn't, say so.
  const isPartial = expectFullCoverage && total < 99;

  return (
    <div>
      <table className={styles.table}>
        <caption className={styles.caption}>{caption}</caption>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={styles.row}>
              <td>{row.label}</td>
              <td className={`${styles.weight} tabular-nums`}>
                {row.weight.toFixed(row.weight % 1 === 0 ? 0 : 2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isPartial && (
        <p className={styles.partialNote}>
          Largest {rows.length} shown as reported by the source (
          {total.toFixed(1)}% of the fund) — the remainder isn&apos;t itemised
          in the published factsheet.
        </p>
      )}
    </div>
  );
}
