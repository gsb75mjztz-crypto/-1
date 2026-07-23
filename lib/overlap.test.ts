import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateOverlap } from "./overlap";
import { getFundByTicker } from "./funds";

describe("calculateOverlap", () => {
  test("returns 0 for completely disjoint holdings", () => {
    const a = [{ name: "Apple Inc", weight: 5 }];
    const b = [{ name: "Nestle SA", weight: 3 }];
    assert.equal(calculateOverlap(a, b), 0);
  });

  test("returns the full weight for identical holdings", () => {
    const holdings = [
      { name: "Apple Inc", weight: 5 },
      { name: "Microsoft Corp", weight: 4 },
    ];
    assert.equal(calculateOverlap(holdings, holdings), 9);
  });

  test("sums the minimum weight per shared holding, ignoring unshared ones", () => {
    const a = [
      { name: "Apple Inc", weight: 5 },
      { name: "Microsoft Corp", weight: 3 },
      { name: "Only In A", weight: 10 },
    ];
    const b = [
      { name: "Apple Inc", weight: 2 },
      { name: "Microsoft Corp", weight: 7 },
      { name: "Only In B", weight: 8 },
    ];
    // Apple: min(5,2)=2, Microsoft: min(3,7)=3 -> 5 total. "Only In A" and
    // "Only In B" don't contribute since they're not shared.
    assert.equal(calculateOverlap(a, b), 5);
  });

  test("is symmetric — order of arguments doesn't change the result", () => {
    const a = [
      { name: "Apple Inc", weight: 5 },
      { name: "Microsoft Corp", weight: 3 },
    ];
    const b = [
      { name: "Apple Inc", weight: 2 },
      { name: "Nestle SA", weight: 4 },
    ];
    assert.equal(calculateOverlap(a, b), calculateOverlap(b, a));
  });

  test("returns 0 when either list is empty", () => {
    const holdings = [{ name: "Apple Inc", weight: 5 }];
    assert.equal(calculateOverlap([], holdings), 0);
    assert.equal(calculateOverlap(holdings, []), 0);
    assert.equal(calculateOverlap([], []), 0);
  });

  test("matches a hand-computed result against real curated fund data (VWRP vs VUAG)", () => {
    const vwrp = getFundByTicker("VWRP");
    const vuag = getFundByTicker("VUAG");
    assert.ok(vwrp && vuag, "expected VWRP and VUAG to exist in /data/funds");

    // Hand-computed from data/funds/VWRP.json and VUAG.json's topHoldings
    // as of Milestone 4: 9 of the 10 names in each list are shared
    // (VWRP's Taiwan Semiconductor and VUAG's Eli Lilly are the two
    // non-shared entries). Sum of min(weightA, weightB) per shared name:
    // NVIDIA 4.5 + Apple 4 + Alphabet 3.6 + Microsoft 2.7 + Amazon 2.2 +
    // Broadcom 1.7 + Micron 1.2 + Meta 1.2 + Tesla 1.2 = 22.3.
    // If this assertion ever fails, it means the underlying holdings data
    // changed — re-verify the new figure by hand before updating this
    // constant, don't just paste in whatever the function now returns.
    const overlap = calculateOverlap(vwrp!.topHoldings, vuag!.topHoldings);
    assert.ok(
      Math.abs(overlap - 22.3) < 0.001,
      `expected ~22.3, got ${overlap}`,
    );
  });
});
