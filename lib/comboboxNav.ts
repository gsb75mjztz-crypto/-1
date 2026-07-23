// Pure key-handling logic for the fund search combobox
// (components/compare/FundSearchField.tsx). Extracted specifically because
// the Milestone 4 completion audit found a real, live bug here (ArrowDown
// skipping past the pre-selected top result) that had zero automated
// regression coverage — every verification of the fix was an ad hoc
// Playwright script, run once, then discarded. This function is what makes
// that class of bug unit-testable the same way lib/confidence.ts and
// lib/overlap.ts already are, rather than relying on someone remembering
// to re-run a manual check by hand.
//
// activeIndex === -1 means "the top result is only implicitly highlighted"
// (the query just changed; the user hasn't explicitly navigated yet) —
// see comboboxNav.test.ts for why this distinction is what the ArrowDown
// fix actually depends on.

export type ComboboxKey = "ArrowDown" | "ArrowUp" | "Enter" | "Escape";

export interface ComboboxState {
  open: boolean;
  activeIndex: number;
}

export interface ComboboxKeyResult extends ComboboxState {
  // Set when Enter should confirm a result — the caller is responsible
  // for actually selecting results[selectIndex], this function has no
  // knowledge of the results themselves beyond their count.
  selectIndex?: number;
}

export function reduceComboboxKey(
  state: ComboboxState,
  key: ComboboxKey,
  resultsCount: number,
): ComboboxKeyResult {
  switch (key) {
    case "ArrowDown": {
      if (!state.open) {
        return { open: true, activeIndex: 0 };
      }
      return {
        open: true,
        activeIndex: Math.min(state.activeIndex + 1, resultsCount - 1),
      };
    }
    case "ArrowUp": {
      return {
        open: state.open,
        activeIndex: Math.max(state.activeIndex - 1, 0),
      };
    }
    case "Enter": {
      const effectiveIndex = state.activeIndex === -1 ? 0 : state.activeIndex;
      if (state.open && effectiveIndex >= 0 && effectiveIndex < resultsCount) {
        return { open: false, activeIndex: -1, selectIndex: effectiveIndex };
      }
      return state;
    }
    case "Escape": {
      return { open: false, activeIndex: -1 };
    }
  }
}

// -1 displays the same as 0 (the top result reads as highlighted even
// before the user has explicitly pressed an arrow key).
export function displayIndex(activeIndex: number): number {
  return activeIndex === -1 ? 0 : activeIndex;
}
