import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate } from "./formatDate";

test("formatDate", async (t) => {
  await t.test("formats an ISO date in the Build Spec's exact style", () => {
    assert.equal(formatDate("2026-07-01"), "1 July 2026");
  });

  await t.test("pads no leading zero on the day", () => {
    assert.equal(formatDate("2026-01-05"), "5 January 2026");
  });

  await t.test("handles the last day of a month/year correctly", () => {
    assert.equal(formatDate("2025-12-31"), "31 December 2025");
  });

  await t.test(
    "is not off-by-one across a UTC/local timezone boundary — the exact bug class this pins",
    () => {
      // Interpreting "2026-01-01" as local time in a negative-UTC-offset
      // timezone can silently roll it back to 31 December — this fixes
      // the time at UTC midnight and reads it back out in UTC
      // specifically so the calendar date never shifts.
      assert.equal(formatDate("2026-01-01"), "1 January 2026");
    },
  );
});
