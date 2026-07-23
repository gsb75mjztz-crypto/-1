import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProvenanceLog } from "./provenance";
import type { FundData } from "./fundSchema";

function baseFund(overrides: Partial<FundData> = {}): FundData {
  return {
    ticker: "TEST",
    isin: "IE00TESTFUND1",
    name: "Test Fund",
    issuer: "Test Issuer",
    ocf: 0.2,
    feesSource: "KIID",
    feesPublished: "2026-06-01",
    holdingsSource: "KIID",
    holdingsPublished: "2026-06-01",
    topHoldings: [{ name: "Holding A", weight: 10 }],
    sectorAllocation: { Technology: 100 },
    regionAllocation: { "North America": 100 },
    lastReviewed: "2026-07-01",
    history: [],
    ...overrides,
  };
}

test("buildProvenanceLog", async (t) => {
  await t.test(
    "merges fees and holdings into one entry when same date and source",
    () => {
      const fund = baseFund();
      const log = buildProvenanceLog(fund, "FMP", "2026-06-15");
      const combined = log.filter((e) =>
        e.description.startsWith("Fees & Holdings"),
      );
      assert.equal(combined.length, 1);
      assert.equal(combined[0]?.date, "2026-06-01");
    },
  );

  await t.test(
    "splits fees and holdings into two entries when dates differ",
    () => {
      const fund = baseFund({ holdingsPublished: "2026-05-01" });
      const log = buildProvenanceLog(fund, "FMP", "2026-06-15");
      const feesEntry = log.find((e) => e.description.startsWith("Fees "));
      const holdingsEntry = log.find((e) =>
        e.description.startsWith("Holdings "),
      );
      assert.ok(feesEntry, "expected a separate Fees entry");
      assert.ok(holdingsEntry, "expected a separate Holdings entry");
      assert.equal(feesEntry?.date, "2026-06-01");
      assert.equal(holdingsEntry?.date, "2026-05-01");
    },
  );

  await t.test(
    "splits fees and holdings into two entries when sources differ, even with the same date",
    () => {
      const fund = baseFund({ holdingsSource: "Factsheet" });
      const log = buildProvenanceLog(fund, "FMP", "2026-06-15");
      const combined = log.filter((e) =>
        e.description.startsWith("Fees & Holdings"),
      );
      assert.equal(combined.length, 0);
    },
  );

  await t.test("always includes a performance and a review entry", () => {
    const fund = baseFund();
    const log = buildProvenanceLog(fund, "FMP", "2026-06-15");
    assert.ok(
      log.some((e) => e.description === "Performance data refreshed (FMP)"),
    );
    assert.ok(log.some((e) => e.description === "Page manually reviewed"));
  });

  await t.test("sorts entries newest-date-first", () => {
    const fund = baseFund({
      feesPublished: "2026-01-01",
      holdingsPublished: "2026-01-01",
      lastReviewed: "2026-07-01",
    });
    const log = buildProvenanceLog(fund, "FMP", "2026-04-01");
    const dates = log.map((e) => e.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    assert.deepEqual(dates, sorted);
  });
});
