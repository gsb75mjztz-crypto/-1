"use client";

import { useId, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/Input";
import {
  reduceComboboxKey,
  displayIndex as toDisplayIndex,
  type ComboboxKey,
} from "@/lib/comboboxNav";
import styles from "./FundSearchField.module.css";

export interface SearchableFund {
  ticker: string;
  name: string;
  isin: string;
  ocf: number;
}

// Fund search/typeahead for the Comparison Tool — Technical Architecture
// Section 9: "Fuse.js runs client-side against the fund list, which is
// already present in the page as static build-time data. No /api/funds
// endpoint, no server round-trip per keystroke." PRD US-1: "search
// by name/ticker within the tool itself; no site-wide search needed."
//
// Implements the WAI-ARIA combobox (list autocomplete) pattern for real —
// role="combobox" + a listbox of role="option" items + arrow-key/Enter/
// Escape handling — matching this project's established practice of using
// the real ARIA pattern rather than a div styled to look like a dropdown
// (see EtfPageTabs.tsx for the same standard applied to the tabs).
export function FundSearchField({
  label,
  funds,
  excludeTickers,
  selected,
  onSelect,
  onClear,
  autoFocus = false,
  emptyMessage = "We don't cover this fund yet",
}: {
  label: string;
  funds: SearchableFund[];
  // Funds already chosen in another slot — excluded from results so the
  // same fund can't be selected twice in one comparison.
  excludeTickers: string[];
  selected: SearchableFund | null;
  onSelect: (fund: SearchableFund) => void;
  onClear: () => void;
  // Set true only for a field that has just been newly revealed (e.g. the
  // optional third slot appearing after "Add a third fund") — a plain
  // native `autoFocus` fires once on mount, which is exactly "focus this
  // when it first appears," not "steal focus on every re-render." Never
  // set for fields 1/2, which are present from page load and shouldn't
  // grab focus away from wherever the user already is.
  autoFocus?: boolean;
  // Overridden by the parent when a fee filter is active and has trimmed
  // `funds` down — "we don't cover this fund yet" is the right message
  // for a genuine catalogue gap, but wrong (misleadingly implies the
  // catalogue lacks the fund) when a result is simply filtered out by the
  // fee cap the user set themselves.
  emptyMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputId = useId();
  const listboxId = useId();

  const fuse = useMemo(
    () =>
      new Fuse(funds, {
        keys: ["name", "ticker", "isin"],
        threshold: 0.3,
      }),
    [funds],
  );

  const results = useMemo(() => {
    const candidates = query.trim()
      ? fuse.search(query).map((r) => r.item)
      : funds;
    return candidates
      .filter((f) => !excludeTickers.includes(f.ticker))
      .slice(0, 8);
  }, [query, fuse, funds, excludeTickers]);

  function selectFund(fund: SearchableFund) {
    onSelect(fund);
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  }

  // Delegates the actual state-transition logic to lib/comboboxNav.ts, a
  // pure function with its own unit tests — the ArrowDown-skip bug found
  // in the Milestone 4 audit lived here, with no regression coverage at
  // the time. Keeping the transition logic in a pure function (rather
  // than inline setState calls) is what makes it testable without a
  // browser.
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const key = event.key;
    if (
      key !== "ArrowDown" &&
      key !== "ArrowUp" &&
      key !== "Enter" &&
      key !== "Escape"
    ) {
      return;
    }
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
    }
    const result = reduceComboboxKey(
      { open, activeIndex },
      key as ComboboxKey,
      results.length,
    );
    const toSelect =
      result.selectIndex !== undefined
        ? results[result.selectIndex]
        : undefined;
    if (toSelect) {
      event.preventDefault();
      selectFund(toSelect);
      return;
    }
    setOpen(result.open);
    setActiveIndex(result.activeIndex);
  }

  if (selected) {
    return (
      <div className={styles.selectedField}>
        <span className={styles.selectedLabel}>{label}</span>
        <div className={styles.selectedChip}>
          <span>
            {selected.name}{" "}
            <span className={styles.ticker}>{selected.ticker}</span>
          </span>
          <button
            type="button"
            className={styles.clearButton}
            onClick={onClear}
            aria-label={`Remove ${selected.name} from comparison`}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  const activeIndexForDisplay = toDisplayIndex(activeIndex);
  // Only meaningful — and only valid per the WAI-ARIA combobox pattern —
  // while the listbox is actually open and rendered. Milestone 7's
  // automated accessibility scan (axe-core) caught this: computing
  // activeOptionId regardless of `open` meant aria-activedescendant kept
  // pointing at an <li> id that doesn't exist in the DOM whenever the
  // listbox was closed, an "aria-valid-attr-value" violation on every
  // page load before either search field had been interacted with.
  const activeOptionId =
    open && results[activeIndexForDisplay]
      ? `${listboxId}-option-${results[activeIndexForDisplay].ticker}`
      : undefined;

  return (
    <div className={styles.field}>
      <Input
        id={inputId}
        label={label}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder="Search by name or ticker"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          // -1, not 0: the top result is shown as highlighted (see
          // displayIndex below) and Enter still confirms it, but a
          // subsequent ArrowDown should land ON that top result rather
          // than skip past it to the second one.
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay so a click on an option registers before the listbox
          // unmounts.
          setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className={styles.listbox}
          aria-label={`${label} results`}
        >
          {results.length === 0 ? (
            <li className={styles.noResults} role="presentation">
              {emptyMessage}
            </li>
          ) : (
            results.map((fund, index) => (
              <li
                key={fund.ticker}
                id={`${listboxId}-option-${fund.ticker}`}
                role="option"
                aria-selected={index === activeIndexForDisplay}
                className={
                  index === activeIndexForDisplay
                    ? styles.optionActive
                    : styles.option
                }
                onMouseDown={(e) => {
                  // onMouseDown (not onClick) fires before the input's
                  // onBlur closes the listbox.
                  e.preventDefault();
                  selectFund(fund);
                }}
              >
                {fund.name} <span className={styles.ticker}>{fund.ticker}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
