import styles from "./PerformanceGrid.module.css";

// The six periods per ETF Page Build Spec / Methodology / PRD FR-1: 1
// Month, YTD, 1 Year, 3 Year, 5 Year, Since Launch. A period can
// genuinely be unavailable (e.g. a fund's source document reports 10-year
// annualised instead of a distinct "since launch" figure, or a fund is
// too new for a 5-year figure) — rendered honestly as "Not available",
// never a fabricated or copied-over number.
export function PerformanceGrid({
  oneMonth,
  ytd,
  oneYear,
  threeYear,
  fiveYear,
  sinceLaunch,
}: {
  oneMonth: number | null;
  ytd: number | null;
  oneYear: number | null;
  threeYear: number | null;
  fiveYear: number | null;
  sinceLaunch: number | null;
}) {
  const periods: { label: string; value: number | null }[] = [
    { label: "1 Month", value: oneMonth },
    { label: "YTD", value: ytd },
    { label: "1 Year", value: oneYear },
    { label: "3 Year", value: threeYear },
    { label: "5 Year", value: fiveYear },
    { label: "Since Launch", value: sinceLaunch },
  ];

  return (
    <div className={styles.grid}>
      {periods.map((period) => (
        <div key={period.label} className={styles.cell}>
          <span className={styles.label}>{period.label}</span>
          {period.value === null ? (
            <span className={`${styles.value} ${styles.unavailable}`}>
              Not available
            </span>
          ) : (
            <span className={`${styles.value} tabular-nums`}>
              {period.value > 0 ? "+" : ""}
              {period.value.toFixed(2)}%
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
