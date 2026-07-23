import { test } from "node:test";
import assert from "node:assert/strict";
import { cn } from "./cn";

test("cn", async (t) => {
  await t.test("joins truthy class names with a space", () => {
    assert.equal(cn("a", "b", "c"), "a b c");
  });

  await t.test("drops undefined, null, and false values", () => {
    assert.equal(cn("a", undefined, "b", null, "c", false), "a b c");
  });

  await t.test("returns an empty string when nothing is truthy", () => {
    assert.equal(cn(undefined, null, false), "");
  });

  await t.test("returns a single class unchanged", () => {
    assert.equal(cn("solo"), "solo");
  });

  await t.test("does not collapse an empty-string class into nothing", () => {
    // "" is falsy, so Boolean-filtering correctly drops it — asserting
    // this explicitly since it's the one input type easy to mishandle
    // (e.g. by checking `!= null` instead of a general truthiness filter).
    assert.equal(cn("a", "", "b"), "a b");
  });
});
