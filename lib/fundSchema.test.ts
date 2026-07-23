import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseFund } from "./fundSchema";

function validFund(overrides: Record<string, unknown> = {}) {
  return {
    ticker: "TEST",
    isin: "IE00BK5BQT80",
    name: "Test Fund",
    issuer: "Test Issuer",
    ocf: 0.2,
    feesSource: "Test Factsheet",
    feesPublished: "2026-01-01",
    holdingsSource: "Test Factsheet",
    holdingsPublished: "2026-01-01",
    topHoldings: [{ name: "Apple Inc", weight: 5 }],
    sectorAllocation: { Technology: 50 },
    regionAllocation: { "United States": 100 },
    lastReviewed: "2026-01-01",
    history: [],
    ...overrides,
  };
}

describe("parseFund", () => {
  test("accepts a well-formed fund", () => {
    const result = parseFund(validFund(), "test");
    assert.equal(result.ticker, "TEST");
  });

  test("rejects a lowercase ticker", () => {
    assert.throws(() => parseFund(validFund({ ticker: "test" }), "test"));
  });

  test("rejects a malformed ISIN", () => {
    assert.throws(() => parseFund(validFund({ isin: "not-an-isin" }), "test"));
  });

  test("rejects a non-ISO date", () => {
    assert.throws(() =>
      parseFund(validFund({ feesPublished: "1 January 2026" }), "test"),
    );
  });

  test("rejects a future-dated feesPublished", () => {
    const farFuture = "2099-01-01";
    assert.throws(() =>
      parseFund(validFund({ feesPublished: farFuture }), "test"),
    );
  });

  test("rejects a future-dated lastReviewed", () => {
    assert.throws(() =>
      parseFund(validFund({ lastReviewed: "2099-01-01" }), "test"),
    );
  });

  test("rejects an out-of-range percent (sector allocation > 100)", () => {
    assert.throws(() =>
      parseFund(validFund({ sectorAllocation: { Technology: 150 } }), "test"),
    );
  });

  test("rejects an empty topHoldings array", () => {
    assert.throws(() => parseFund(validFund({ topHoldings: [] }), "test"));
  });

  test("rejects ocf above the sanity ceiling", () => {
    assert.throws(() => parseFund(validFund({ ocf: 12 }), "test"));
  });

  test("error message includes the source label for traceability", () => {
    try {
      parseFund(validFund({ ticker: "bad" }), "data/funds/BAD.json");
      assert.fail("expected parseFund to throw");
    } catch (err) {
      assert.ok(err instanceof Error);
      assert.match(err.message, /data\/funds\/BAD\.json/);
    }
  });
});
