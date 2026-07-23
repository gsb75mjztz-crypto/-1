"use client";

import { useId, useState } from "react";
import type { GrowthYearPoint } from "@/lib/growthCalculator";
import styles from "./GrowthChart.module.css";

export interface GrowthChartSeries {
  label: string;
  colorVar: "--color-accent" | "--color-accent-secondary";
  points: GrowthYearPoint[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

// Growth-over-time chart — PRD US-4's "clear visual growth comparison."
// Hand-rolled SVG rather than a charting library: nothing in Technical
// Architecture's stack names one, and a two-series line chart over a
// small, fixed year range is well within what plain SVG does cleanly, in
// keeping with the project's consistent bias against adding a dependency
// for something this contained (the same reasoning that kept Redis and a
// second auth system out of the architecture).
//
// "Interactive" means two real things, not decoration: pointer/touch
// scrubbing shows both series' exact values at any year, and the same
// interaction is available from the keyboard via role="slider" (arrow
// keys move the selected year, Home/End jump to the ends) — matching the
// project's established practice of building real interaction patterns
// (see EtfPageTabs.tsx, FundSearchField.tsx) rather than pointer-only
// affordances.
//
// The SVG itself conveys nothing to screen readers (line-drawing commands
// aren't meaningful content), so it's aria-hidden; a real <table> with
// every year's figures, visually hidden via .sr-only, gives screen reader
// users full parity — arguably better than sighted users get, since the
// visual chart only shows exact values for the currently-scrubbed year.
export function GrowthChart({
  seriesA,
  seriesB,
}: {
  seriesA: GrowthChartSeries;
  seriesB: GrowthChartSeries;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const tableId = useId();

  const years = seriesA.points.length - 1;
  const maxValue = Math.max(
    ...seriesA.points.map((p) => p.value),
    ...seriesB.points.map((p) => p.value),
  );

  const width = 600;
  const height = 280;
  const padding = { top: 16, right: 16, bottom: 32, left: 8 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  function xForYear(year: number): number {
    return years === 0
      ? padding.left
      : padding.left + (year / years) * plotWidth;
  }
  function yForValue(value: number): number {
    return maxValue === 0
      ? height - padding.bottom
      : height - padding.bottom - (value / maxValue) * plotHeight;
  }

  function pathFor(points: GrowthYearPoint[]): string {
    return points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${xForYear(p.year)},${yForValue(p.value)}`,
      )
      .join(" ");
  }

  function indexFromPointerX(clientX: number, svg: SVGSVGElement): number {
    const rect = svg.getBoundingClientRect();
    const relativeX = ((clientX - rect.left) / rect.width) * width;
    const fraction = Math.min(
      1,
      Math.max(0, (relativeX - padding.left) / plotWidth),
    );
    return Math.round(fraction * years);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    const current = activeIndex ?? years;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActiveIndex(Math.min(current + 1, years));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveIndex(Math.max(current - 1, 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(years);
    }
  }

  const displayIndex = activeIndex ?? years;
  const pointA = seriesA.points[displayIndex];
  const pointB = seriesB.points[displayIndex];

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.chartArea}
        role="slider"
        tabIndex={0}
        aria-label="Selected year"
        aria-valuemin={0}
        aria-valuemax={years}
        aria-valuenow={displayIndex}
        aria-valuetext={
          pointA && pointB
            ? `Year ${displayIndex}: ${seriesA.label} ${formatCurrency(pointA.value)}, ${seriesB.label} ${formatCurrency(pointB.value)}`
            : undefined
        }
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={styles.svg}
          aria-hidden="true"
          onMouseMove={(e) =>
            setActiveIndex(indexFromPointerX(e.clientX, e.currentTarget))
          }
          onTouchMove={(e) => {
            const touch = e.touches[0];
            if (touch) {
              setActiveIndex(indexFromPointerX(touch.clientX, e.currentTarget));
            }
          }}
        >
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            className={styles.axisLine}
          />
          <path
            d={pathFor(seriesA.points)}
            fill="none"
            stroke={`var(${seriesA.colorVar})`}
            strokeWidth={2}
          />
          <path
            d={pathFor(seriesB.points)}
            fill="none"
            stroke={`var(${seriesB.colorVar})`}
            strokeWidth={2}
          />
          {pointA && pointB && (
            <g>
              <line
                x1={xForYear(displayIndex)}
                y1={padding.top}
                x2={xForYear(displayIndex)}
                y2={height - padding.bottom}
                className={styles.guideline}
              />
              <circle
                cx={xForYear(displayIndex)}
                cy={yForValue(pointA.value)}
                r={4}
                fill={`var(${seriesA.colorVar})`}
              />
              <circle
                cx={xForYear(displayIndex)}
                cy={yForValue(pointB.value)}
                r={4}
                fill={`var(${seriesB.colorVar})`}
              />
            </g>
          )}
        </svg>

        {pointA && pointB && (
          <div className={styles.tooltip} aria-hidden="true">
            <p className={styles.tooltipYear}>Year {displayIndex}</p>
            {/* A colour swatch carries the series identity, not the text
                colour itself — --color-accent-secondary as literal text on
                --color-surface measures 3.87:1, below the 4.5:1 WCAG AA
                normal-text threshold (it was previously verified only as a
                border, a 3:1 graphical use, not as text). The swatch stays
                at the same colour because non-text UI elements only need
                3:1, which it passes comfortably. */}
            <p className={styles.tooltipLine}>
              <span
                className={styles.tooltipSwatch}
                style={{ background: `var(${seriesA.colorVar})` }}
              />
              {seriesA.label}:{" "}
              <span className="tabular-nums">
                {formatCurrency(pointA.value)}
              </span>
            </p>
            <p className={styles.tooltipLine}>
              <span
                className={styles.tooltipSwatch}
                style={{ background: `var(${seriesB.colorVar})` }}
              />
              {seriesB.label}:{" "}
              <span className="tabular-nums">
                {formatCurrency(pointB.value)}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span
            className={styles.legendSwatch}
            style={{ background: `var(${seriesA.colorVar})` }}
            aria-hidden="true"
          />
          {seriesA.label}
        </span>
        <span className={styles.legendItem}>
          <span
            className={styles.legendSwatch}
            style={{ background: `var(${seriesB.colorVar})` }}
            aria-hidden="true"
          />
          {seriesB.label}
        </span>
      </div>

      {/* .sr-only goes on this wrapping div, not the <table> directly —
          a table's own content-driven sizing algorithm doesn't fully
          respect width:1px the way a div does, so the un-clipped table
          box was contributing real (invisible but real) width to the
          page's horizontal scroll area at narrow viewports. Confirmed
          via getBoundingClientRect() at 360px before this fix. */}
      <div className="sr-only">
        <table id={tableId}>
          <caption>
            Portfolio value by year for {seriesA.label} and {seriesB.label}
          </caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">{seriesA.label}</th>
              <th scope="col">{seriesB.label}</th>
            </tr>
          </thead>
          <tbody>
            {seriesA.points.map((point, i) => (
              <tr key={point.year}>
                <td>{point.year}</td>
                <td>{formatCurrency(point.value)}</td>
                <td>{formatCurrency(seriesB.points[i]?.value ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
