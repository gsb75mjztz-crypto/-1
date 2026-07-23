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

  // Milestone 7 — "test comparison accuracy": the Comparison Tool computes
  // all pairs when three funds are selected, but only one pair (above)
  // had ever been hand-verified against real data. Extending to the
  // other two real pairs this dataset makes possible.
  test("matches a hand-computed result against real curated fund data (VWRP vs HMWO)", () => {
    const vwrp = getFundByTicker("VWRP");
    const hmwo = getFundByTicker("HMWO");
    assert.ok(vwrp && hmwo, "expected VWRP and HMWO to exist in /data/funds");

    // Independently computed in Python from the raw JSON before writing
    // this assertion (see the Milestone 7 testing report) — coincidentally
    // equal to the VWRP/VUAG figure above, because VWRP's per-holding
    // weight is the smaller of the pair in every single shared holding
    // against both other funds (it's the most diversified of the three),
    // not because the underlying data is the same.
    const overlap = calculateOverlap(vwrp!.topHoldings, hmwo!.topHoldings);
    assert.ok(
      Math.abs(overlap - 22.3) < 0.001,
      `expected ~22.3, got ${overlap}`,
    );
  });

  test("matches a hand-computed result against real curated fund data (VUAG vs HMWO)", () => {
    const vuag = getFundByTicker("VUAG");
    const hmwo = getFundByTicker("HMWO");
    assert.ok(vuag && hmwo, "expected VUAG and HMWO to exist in /data/funds");

    // Independently computed in Python from the raw JSON before writing
    // this assertion. All 10 of VUAG's and HMWO's holdings are shared
    // (both lists include Eli Lilly, neither includes Taiwan Semi) —
    // the only one of the three real pairs with full 10/10 name overlap.
    const overlap = calculateOverlap(vuag!.topHoldings, hmwo!.topHoldings);
    assert.ok(
      Math.abs(overlap - 26.73) < 0.001,
      `expected ~26.73, got ${overlap}`,
    );
  });

  test("matching is exact-string and case-sensitive, as documented in lib/overlap.ts — a near-miss name does not count as shared", () => {
    // Locks in the documented trade-off (no fuzzy/normalised matching)
    // so a future change can't silently start or stop matching
    // case/whitespace variants without a test noticing.
    const a = [{ name: "Apple Inc", weight: 5 }];
    const differentCase = [{ name: "apple inc", weight: 5 }];
    const trailingSpace = [{ name: "Apple Inc ", weight: 5 }];
    assert.equal(calculateOverlap(a, differentCase), 0);
    assert.equal(calculateOverlap(a, trailingSpace), 0);
  });

  test("a duplicate holding name within one list is not double-counted against the same name in the other list", () => {
    // Map-based lookup means only the last occurrence of a repeated name
    // in holdingsB survives — documenting the actual behaviour rather
    // than assuming duplicates can't happen in real data.
    const a = [{ name: "Apple Inc", weight: 5 }];
    const bWithDuplicate = [
      { name: "Apple Inc", weight: 2 },
      { name: "Apple Inc", weight: 3 },
    ];
    const result = calculateOverlap(a, bWithDuplicate);
    // min(5, 3) — the second occurrence's weight wins in the Map, not the
    // sum of both.
    assert.equal(result, 3);
  });
});
