import { test } from "node:test";
import assert from "node:assert/strict";
import { getAllFunds } from "./funds";
import { isValidIsinCheckDigit } from "./isin";

// Milestone 7 — "test data integrity." lib/fundSchema.test.ts already
// covers the Zod schema's own field-level rules against synthetic
// fixtures; this file instead loads the real, currently-curated
// data/funds/*.json files (via the same getAllFunds() the app itself
// uses) and checks cross-field and cross-fund invariants the schema
// doesn't and shouldn't encode — things that are only meaningful once you
// have the whole curated set in hand, not a single record in isolation.
test("data integrity — real curated fund data", async (t) => {
  const funds = getAllFunds();

  await t.test("at least one fund is loaded", () => {
    // A guard against a silently-empty result masking every other check
    // below as vacuously true.
    assert.ok(funds.length > 0);
  });

  await t.test("every ticker is unique", () => {
    const tickers = funds.map((f) => f.ticker);
    assert.equal(new Set(tickers).size, tickers.length);
  });

  await t.test("every ISIN is unique", () => {
    const isins = funds.map((f) => f.isin);
    assert.equal(new Set(isins).size, isins.length);
  });

  await t.test("every ISIN's check digit is genuinely valid", () => {
    // Belt-and-braces on top of the schema-level .refine() (lib/fundSchema
    // adds this same check at parse time, so a bad ISIN would already
    // throw when getAllFunds() ran above) — asserted again explicitly
    // here so a future change that loosens the schema doesn't silently
    // stop catching this.
    for (const fund of funds) {
      assert.equal(
        isValidIsinCheckDigit(fund.isin),
        true,
        `${fund.ticker}: ${fund.isin}`,
      );
    }
  });

  await t.test(
    "sector and region allocation never exceeds 100% (partial/top-N coverage below 100% is legitimate and expected — see components/etf/AllocationTable.tsx's isPartial handling; exceeding 100% is not)",
    () => {
      for (const fund of funds) {
        const sectorTotal = Object.values(fund.sectorAllocation).reduce(
          (sum, w) => sum + w,
          0,
        );
        const regionTotal = Object.values(fund.regionAllocation).reduce(
          (sum, w) => sum + w,
          0,
        );
        // 0.5-point tolerance for floating-point/rounding noise in the
        // source figures (observed: HMWO's real sector total is
        // 100.00000000000001).
        assert.ok(
          sectorTotal <= 100.5,
          `${fund.ticker}: sectorAllocation sums to ${sectorTotal}`,
        );
        assert.ok(
          regionTotal <= 100.5,
          `${fund.ticker}: regionAllocation sums to ${regionTotal}`,
        );
      }
    },
  );

  await t.test(
    "fees/holdings publish dates are never after the fund's last-reviewed date",
    () => {
      // A page can't have been reviewed before the data it's reviewing
      // was published — if this ever fails it's a real data-entry
      // ordering mistake, not a legitimate edge case.
      for (const fund of funds) {
        assert.ok(
          fund.feesPublished <= fund.lastReviewed,
          `${fund.ticker}: feesPublished (${fund.feesPublished}) is after lastReviewed (${fund.lastReviewed})`,
        );
        assert.ok(
          fund.holdingsPublished <= fund.lastReviewed,
          `${fund.ticker}: holdingsPublished (${fund.holdingsPublished}) is after lastReviewed (${fund.lastReviewed})`,
        );
      }
    },
  );

  await t.test(
    "every top holding's weight is a realistic single-position size (0-100%, and never the entire fund)",
    () => {
      for (const fund of funds) {
        for (const holding of fund.topHoldings) {
          assert.ok(
            holding.weight > 0,
            `${fund.ticker}: ${holding.name} has zero/negative weight`,
          );
          assert.ok(
            holding.weight < 100,
            `${fund.ticker}: ${holding.name} is ${holding.weight}% — a single holding can't be the entire fund`,
          );
        }
      }
    },
  );

  await t.test(
    "top holdings within a fund are listed in descending weight order",
    () => {
      // Not schema-enforced, and not strictly required for correctness, but
      // real factsheets always present holdings this way — a fund whose
      // list isn't sorted is a strong signal of a transcription error
      // (wrong weight copied against the wrong holding).
      for (const fund of funds) {
        const weights = fund.topHoldings.map((h) => h.weight);
        const sorted = [...weights].sort((a, b) => b - a);
        assert.deepEqual(
          weights,
          sorted,
          `${fund.ticker}: topHoldings is not sorted by descending weight`,
        );
      }
    },
  );
});
