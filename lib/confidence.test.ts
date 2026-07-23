import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  feesHoldingsConfidence,
  performanceConfidence,
  worstConfidence,
} from "./confidence";

// Thresholds under test, per Design System Section 6 / Data Strategy
// Section 5 (both docs state the same table):
//   Fees & Holdings: High <=45 days, Medium 45-90, Needs review >90
//   Performance:     High <=7 days,  Medium 7-30,  Needs review >30
const NOW = new Date("2026-07-23T00:00:00Z");

function daysAgoIso(days: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

describe("feesHoldingsConfidence", () => {
  test("high at 0 days", () => {
    assert.equal(feesHoldingsConfidence(daysAgoIso(0), NOW), "high");
  });
  test("high at the 45-day boundary (inclusive)", () => {
    assert.equal(feesHoldingsConfidence(daysAgoIso(45), NOW), "high");
  });
  test("medium just past the 45-day boundary", () => {
    assert.equal(feesHoldingsConfidence(daysAgoIso(46), NOW), "medium");
  });
  test("medium at the 90-day boundary (inclusive)", () => {
    assert.equal(feesHoldingsConfidence(daysAgoIso(90), NOW), "medium");
  });
  test("low just past the 90-day boundary", () => {
    assert.equal(feesHoldingsConfidence(daysAgoIso(91), NOW), "low");
  });
});

describe("performanceConfidence", () => {
  test("high at 0 days", () => {
    assert.equal(performanceConfidence(daysAgoIso(0), NOW), "high");
  });
  test("high at the 7-day boundary (inclusive)", () => {
    assert.equal(performanceConfidence(daysAgoIso(7), NOW), "high");
  });
  test("medium just past the 7-day boundary", () => {
    assert.equal(performanceConfidence(daysAgoIso(8), NOW), "medium");
  });
  test("medium at the 30-day boundary (inclusive)", () => {
    assert.equal(performanceConfidence(daysAgoIso(30), NOW), "medium");
  });
  test("low just past the 30-day boundary", () => {
    assert.equal(performanceConfidence(daysAgoIso(31), NOW), "low");
  });
});

describe("worstConfidence", () => {
  test("returns high when every status is high", () => {
    assert.equal(worstConfidence(["high", "high"]), "high");
  });
  test("returns the single worst status, not an average (FR-4)", () => {
    assert.equal(worstConfidence(["high", "medium", "low"]), "low");
    assert.equal(worstConfidence(["high", "medium"]), "medium");
  });
  test("returns high for an empty list (vacuous default)", () => {
    assert.equal(worstConfidence([]), "high");
  });
});
