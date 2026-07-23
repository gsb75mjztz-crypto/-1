import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { reduceComboboxKey, displayIndex } from "./comboboxNav";

describe("reduceComboboxKey", () => {
  test("ArrowDown opens a closed combobox and lands on the first result", () => {
    const result = reduceComboboxKey(
      { open: false, activeIndex: -1 },
      "ArrowDown",
      3,
    );
    assert.deepEqual(result, { open: true, activeIndex: 0 });
  });

  test("regression: ArrowDown after typing confirms the pre-selected top result, does not skip it", () => {
    // This is the exact bug found in the Milestone 4 completion audit:
    // typing sets activeIndex to -1 (top result implicitly highlighted),
    // and the first ArrowDown press must land on index 0, not 1.
    const afterTyping = { open: true, activeIndex: -1 };
    const result = reduceComboboxKey(afterTyping, "ArrowDown", 2);
    assert.equal(
      result.activeIndex,
      0,
      "first ArrowDown must confirm the top result, not skip past it",
    );
  });

  test("a second ArrowDown advances past the confirmed top result", () => {
    const confirmedTop = { open: true, activeIndex: 0 };
    const result = reduceComboboxKey(confirmedTop, "ArrowDown", 3);
    assert.equal(result.activeIndex, 1);
  });

  test("ArrowDown clamps at the last result", () => {
    const atEnd = { open: true, activeIndex: 2 };
    const result = reduceComboboxKey(atEnd, "ArrowDown", 3);
    assert.equal(result.activeIndex, 2);
  });

  test("ArrowUp from the implicit top (-1) clamps at 0, not negative", () => {
    const result = reduceComboboxKey(
      { open: true, activeIndex: -1 },
      "ArrowUp",
      3,
    );
    assert.equal(result.activeIndex, 0);
  });

  test("ArrowUp decrements and clamps at 0", () => {
    assert.equal(
      reduceComboboxKey({ open: true, activeIndex: 2 }, "ArrowUp", 3)
        .activeIndex,
      1,
    );
    assert.equal(
      reduceComboboxKey({ open: true, activeIndex: 0 }, "ArrowUp", 3)
        .activeIndex,
      0,
    );
  });

  test("Enter with no explicit navigation (-1) still selects the top result", () => {
    const result = reduceComboboxKey(
      { open: true, activeIndex: -1 },
      "Enter",
      2,
    );
    assert.equal(result.selectIndex, 0);
    assert.equal(result.open, false);
  });

  test("Enter after explicit navigation selects the navigated-to result", () => {
    const result = reduceComboboxKey(
      { open: true, activeIndex: 1 },
      "Enter",
      2,
    );
    assert.equal(result.selectIndex, 1);
  });

  test("Enter does nothing when the combobox is closed", () => {
    const result = reduceComboboxKey(
      { open: false, activeIndex: -1 },
      "Enter",
      2,
    );
    assert.equal(result.selectIndex, undefined);
  });

  test("Enter does nothing when there are zero results", () => {
    const result = reduceComboboxKey(
      { open: true, activeIndex: -1 },
      "Enter",
      0,
    );
    assert.equal(result.selectIndex, undefined);
  });

  test("Escape closes and resets", () => {
    const result = reduceComboboxKey(
      { open: true, activeIndex: 1 },
      "Escape",
      3,
    );
    assert.deepEqual(result, { open: false, activeIndex: -1 });
  });
});

describe("displayIndex", () => {
  test("-1 displays as 0", () => {
    assert.equal(displayIndex(-1), 0);
  });
  test("any other index displays as itself", () => {
    assert.equal(displayIndex(0), 0);
    assert.equal(displayIndex(3), 3);
  });
});
