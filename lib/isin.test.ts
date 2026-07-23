import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidIsinCheckDigit } from "./isin";

test("isValidIsinCheckDigit", async (t) => {
  await t.test("accepts every real curated fund's actual ISIN", () => {
    // VWRP, VUAG, HMWO — cross-checked independently against a from-scratch
    // Python implementation of the same algorithm before this was wired in,
    // specifically so a bug in this code couldn't silently fail the real
    // data it's meant to protect.
    assert.equal(isValidIsinCheckDigit("IE00BK5BQT80"), true);
    assert.equal(isValidIsinCheckDigit("IE00BFMXXD54"), true);
    assert.equal(isValidIsinCheckDigit("IE00B4X9L533"), true);
  });

  await t.test("rejects a mistyped check digit", () => {
    assert.equal(isValidIsinCheckDigit("IE00BK5BQT81"), false);
  });

  await t.test("rejects a transposed character in the body", () => {
    // The real ISIN has "BK5BQT80" — swap two characters, check digit no
    // longer matches. This is exactly the class of data-entry slip a
    // check digit exists to catch. (Confirmed independently in Python
    // before adding this assertion — not every transposition changes a
    // Luhn checksum, so this specific one is verified, not assumed.)
    assert.equal(isValidIsinCheckDigit("IE00B5KBQT80"), false);
  });

  await t.test("rejects a string that isn't ISIN-shaped at all", () => {
    assert.equal(isValidIsinCheckDigit("not-an-isin"), false);
    assert.equal(isValidIsinCheckDigit(""), false);
    assert.equal(isValidIsinCheckDigit("IE00BK5BQT8"), false); // 11 chars
  });

  await t.test("a lowercase ISIN is rejected (format, not just digit)", () => {
    assert.equal(isValidIsinCheckDigit("ie00bk5bqt80"), false);
  });
});
