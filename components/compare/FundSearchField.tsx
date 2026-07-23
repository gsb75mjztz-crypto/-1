"use client";

import { useId, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/Input";
import styles from "./FundSearchField.module.css";

export interface SearchableFund {
  ticker: string;
  name: string;
  isin: string;
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
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputId = useId();
  const listboxId = useId();

  const fuse = useMemo(
    () =>
      new Fuse(funds, {
        keys: ["name", "ticker"],
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

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActiveIndex(0);
        return;
      }
      // activeIndex is -1 whenever the top result is only *implicitly*
      // highlighted (query just changed, no explicit navigation yet — see
      // the onChange handler below). The first ArrowDown press should
      // confirm that implicit highlight (move to index 0), not skip past
      // it to index 1 — treating -1 as "one before index 0" here is what
      // fixes that.
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      // -1 means "the top result, implicitly" (see onChange) — Enter
      // without ever touching the arrow keys still confirms it.
      const effectiveIndex = activeIndex === -1 ? 0 : activeIndex;
      if (open && results[effectiveIndex]) {
        event.preventDefault();
        selectFund(results[effectiveIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
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

  // -1 displays the same as 0 (the top result reads as highlighted even
  // before the user has explicitly pressed an arrow key) — see the
  // onChange/ArrowDown comments above for why the underlying state still
  // distinguishes the two.
  const displayIndex = activeIndex === -1 ? 0 : activeIndex;
  const activeOptionId = results[displayIndex]
    ? `${listboxId}-option-${results[displayIndex].ticker}`
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
              We don&apos;t cover this fund yet
            </li>
          ) : (
            results.map((fund, index) => (
              <li
                key={fund.ticker}
                id={`${listboxId}-option-${fund.ticker}`}
                role="option"
                aria-selected={index === displayIndex}
                className={
                  index === displayIndex ? styles.optionActive : styles.option
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
