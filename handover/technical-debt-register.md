# Technical Debt Register

Tracked, deliberate trade-offs — each one a conscious decision with reasoning on record, not an oversight. Add an entry whenever a finding is knowingly deferred rather than fixed; update or remove an entry when it's resolved or the trigger condition it names is met.

| #   | Item                                                                                                                                                                                                                                                                       | Severity | Origin                       | Trigger to revisit                                                                                                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Duplicated disclosure-toggle logic between `components/ui/Badge.tsx` (confidence-badge tooltip) and `components/compare/MetricExplain.tsx` (comparison-metric explanations) — both independently implement a button + `aria-expanded`/`aria-controls` + conditional panel. | Low      | Milestone 4 completion audit | A genuine third use case for the same disclosure interaction pattern (e.g. a Calculator explanation). At that point, extract a shared primitive from three real data points rather than two speculative ones. |

## Entry #1 detail — duplicated disclosure logic

**Why it exists:** `MetricExplain.tsx` was built as new, self-contained code for the Comparison Tool rather than by refactoring `Badge.tsx` to share a primitive, specifically to avoid touching existing, already-shipped, heavily-audited code as part of an unrelated milestone.

**Why it's deferred, not fixed, now (engineering reasoning, not scope):**

- The duplication is small — roughly 15–20 lines of toggle mechanics. This codebase's own established threshold for "duplication justifies an extraction" is three independent occurrences, not two (`lib/cn.ts` was extracted only after the same className-merge logic was hand-rolled identically three times — see `handover/Milestone-2.md`).
- `Badge.tsx` renders the confidence-badge tooltip, including the "not a rating of the fund" clause the Legal Principles doc calls non-negotiable. It is the single most regulatory-sensitive, most heavily re-verified component in the product. Refactoring it to share a primitive with `MetricExplain` means re-earning that verification (exact tooltip copy, contrast, focus, screen-reader behaviour) for a ~15-line saving — a poor risk/benefit trade regardless of which milestone is in progress.
- Two data points aren't enough to know the right shared shape. `MetricExplain`'s panel takes arbitrary children; `Badge`'s panel has fixed internal structure (a bolded clause plus a link to Methodology). Guessing at an abstraction now risks building one that fits neither well, requiring a second reshape once a real third use case defines the actual requirements.

**Resolution condition:** revisit when a third disclosure-pattern use case appears — most likely a Calculator result explanation, per the Development Roadmap's Week 4 scope. Extract from three real implementations at that point, not from two plus a guess.
