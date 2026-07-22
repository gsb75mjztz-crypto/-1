# User Flows — Every Click

Maps the full MVP loop at click-level detail: Homepage → Comparison → Calculator → Account → Newsletter → Return Visit. Cross-references the PRD's page IDs and user stories (US-1 through US-7) so this stays traceable back to acceptance criteria rather than drifting into a separate spec.

Notation: **[Screen/State]** → user action → **[Next Screen/State]**. Branches marked explicitly. Every decision point states what happens on both paths, not just the happy path — the branches are as important as the main line, since they're where a flow usually breaks in practice.

---

## Stage 1: Homepage → Comparison

**[Homepage loads]**
Content visible without interaction: one-sentence value proposition, a visual example (likely a small live comparison snippet as a teaser), primary CTA button ("Compare two ETFs" or similar), secondary link to Calculator.

1. User clicks primary CTA (**"Compare ETFs"**)
   → **[Comparison Tool, empty state]** — two empty fund-select fields, no results yet.

   *Branch A — user instead clicks the secondary Calculator link on Homepage:*
   → skips directly to **Stage 3** (Calculator, standalone entry, no pre-fill). Documented in Stage 3.

   *Branch B — user clicks header nav "Compare" instead of the homepage CTA (returning visitor, or scrolled past the CTA):*
   → same destination as step 1, **[Comparison Tool, empty state]**. Nav and CTA are equivalent entry points; no difference in destination state.

2. User clicks into fund-select field 1, types a ticker or fund name
   → typeahead shows matches from the curated 30–50 fund list only (no "no results, try again" dead end for out-of-scope funds — instead: **"We don't cover this fund yet"** message, non-blocking, user can continue with a different fund).
3. User selects a fund from the typeahead
   → field 1 populated, field 2 auto-focused.
4. User repeats steps 2–3 for field 2 (and optionally field 3, up to 3 funds per US-1)
   → **"Compare" button becomes active** once at least 2 funds selected.
5. User clicks **"Compare"**
   → **[Comparison Results]** renders: OCF, 1Y/3Y/5Y performance, sector/region split, holdings-overlap %, each with inline `ⓘ` explanation icons (per US-1 acceptance criteria — no verdict language anywhere on this screen).

   *Branch — user clicks an `ⓘ` icon on any metric:*
   → tooltip/expandable opens inline, plain-language explanation, no page navigation. Closes on tap-away or a close icon. Does not interrupt the comparison state underneath.

   *Branch — user clicks a fund's name/ticker within the results:*
   → navigates to that fund's **[Individual ETF Page]** (PRD page #3), which is a related but separate flow — covered briefly below since it's a common detour, not the primary loop.

---

### Detour: Individual ETF Page (reached from Comparison results)

6. **[Individual ETF Page loads]** — Fees / Holdings / Performance sections, each with Source, Data published/updated date, Confidence badge (🟢/🟡/🔴 + text label per NFR-2).
7. User clicks `ⓘ` next to any Confidence badge
   → standard confidence-system tooltip opens (verbatim text per Build Spec, including "not a rating of the fund" line).
8. User clicks **Overview / History** tab toggle
   → switches to **[History Tab]**: provenance log (always present) and, if available, fee-history chart / holdings-drift view (fast-follow feature, may show "not enough history yet" state for newly added funds).
9. User clicks **"See fee impact over time"** (present on the Fees section)
   → routes to **Stage 3, pre-filled variant** (Calculator), carrying this fund's OCF as one input. This is the primary bridge from a fund page back into the core loop, not a dead end.

   *Branch — user instead clicks browser back / the header logo:*
   → returns to **[Comparison Results]** (if reached via Comparison) with prior state intact — selections should not be lost on back-navigation.

---

## Stage 2: Comparison → Calculator

10. From **[Comparison Results]**, user clicks **"See what this fee difference costs over time"** (primary bridge CTA, distinct from the per-fund "See fee impact" link in the detour above — this version compares *both* selected funds' fees, not just one)
    → **[Calculator, pre-filled variant]**: starting amount and monthly contribution show sensible defaults (editable), both funds' actual OCFs auto-populated, time horizon defaulted to a reasonable value (e.g. 20 years, editable).

    *Branch — user does not click through and instead leaves the Comparison Results page (closes tab, navigates elsewhere):*
    → session state is not persisted for anonymous users at this point (no account yet) — this is an accepted drop-off in the funnel, not a failure state; it's the reason the "save" prompt (Stage 4) is timed to appear only after a result exists, giving the user something worth saving before being asked to commit.

---

## Stage 3: Calculator

**[Calculator, either entry point — standalone from Homepage, or pre-filled from Comparison/Fund Page]**

11. User adjusts inputs if desired (starting amount, monthly contribution, time horizon) — live-updating output, no separate "submit" click required for a good mobile experience.
12. **[Result renders]**: growth comparison visual, plain-language summary sentence with the pound-figure difference at the chosen horizon (per US-4 acceptance criteria — no recommendation language).
13. User clicks **"Share this result"**
    → generates a shareable image/link (per US-4's shareability requirement); opens native share sheet on mobile or a copy-link modal on desktop. This does not require an account — sharing is intentionally frictionless and happens before any sign-up prompt.
14. User clicks **"Save this"**
    → this is the trigger point for Stage 4 (Account). Not shown as a blocking wall before the result — the result is fully visible and usable first, per the "soft prompt, not a wall" principle (US-5).

---

## Stage 4: Calculator → Account

15. User clicks **"Save this"** (from step 14, or equivalently from a Comparison Results "Save" action)
    → **[Sign Up / Sign In modal or page]** appears, with the context preserved (i.e. "Sign in to save this comparison" — not a generic sign-up form disconnected from what triggered it).
16. User chooses **"Continue with email"** (or magic link / social option if built)
    → enters email (+ password, or requests magic link per FR-8's minimal-fields requirement).

    *Branch — user closes the modal without completing sign-up:*
    → returns to **[Calculator Result]**, unchanged, nothing lost — the save action simply didn't complete. No punitive messaging, no repeated interruption on the same visit.

17. User submits sign-up form
    → account created; the specific comparison/calculation that triggered the flow is automatically saved (no separate "now click save again" step — the system should complete the original intent, not just log the user in and strand them).
18. **[Confirmation state]**: brief inline confirmation ("Saved — find this anytime in Saved Comparisons"), not a full page redirect that loses the result the user was just looking at.

---

## Stage 5: Account → Newsletter

19. Following successful sign-up (step 17–18), OR at a separate natural moment (e.g. after viewing a second comparison in the same session) — **contextual newsletter capture appears**, not on Homepage arrival (per US-6 acceptance criteria: never an immediate pop-up).
    → e.g. inline card: **"Get one email a week like the comparison you just ran"**.
20. User clicks **"Subscribe"**
    → email pre-filled if already signed in (no re-typing); single click submits.

    *Branch — user is not signed in when this prompt appears (e.g. reached via the standalone Calculator without saving):*
    → newsletter capture still offered independently of account creation — the two are related but not dependent; a user can subscribe without an account and vice versa (per US-6: "never gates any other feature").

21. **[Newsletter Confirmation state]** — inline confirmation or, if double opt-in is required (per NFR-3/UK GDPR), a brief message: **"Check your email to confirm."**
    → user clicks confirmation link in their email client (outside the product's own click flow)
    → **[Confirmation Page]** (PRD page #7) loads, confirms subscription, links back into the product (e.g. "Run another comparison" CTA) rather than dead-ending on a static thank-you page.

---

## Stage 6: Return Visit

22. User returns (via newsletter link, direct navigation, or bookmark) — signed-in state persists (assuming a standard session/cookie duration; does not require re-login every visit).
23. User clicks **"Saved"** in the header nav
    → **[Saved Comparisons page]**: list of previously saved comparisons/calculations, each showing the fund names and a preview of the result.
24. User clicks a saved item
    → re-opens that comparison **using current live data**, not a frozen snapshot (per PRD Section 4, US-5) — if a confidence badge has since changed (e.g. dropped to 🔴 since last viewed), this is visible to the user now, which is itself a small trust-reinforcing moment ("this site keeps its data current, even on things I saved a while ago").

    *Branch — underlying fund data has materially changed since saving (e.g. a fee change recorded in the History tab):*
    → a small inline note surfaces this ("This fund's fee has changed since you saved this — see History") rather than silently showing new numbers as if nothing changed. This is a natural, low-cost way to pull a returning user into the History tab feature (US-3) without a separate marketing push.

25. From here, the loop re-enters at **Stage 1, step 5 equivalent** — user is back in an active comparison/decision state, and the cycle (adjust → calculate → share/save) repeats. This is the intended steady-state usage pattern: not a daily habit loop, but a "next pending decision" trigger, consistent with the product's deliberate rejection of engagement-loop mechanics (streaks, notifications) established in the original product brief.

---

## Summary: the four points where a user can leave the loop, and what happens

| Exit point | What's lost | What's preserved |
|---|---|---|
| Leaves Comparison Results without clicking through | Nothing saved (no account yet) | Nothing — accepted drop-off, not a failure state |
| Closes Sign Up modal without completing | The specific save action | The calculator/comparison result itself, fully intact and usable |
| Doesn't confirm newsletter double opt-in | Newsletter subscription | Account and any saved items, unaffected |
| Doesn't return after saving | Nothing automatically | Saved items persist indefinitely, retrievable whenever they do return |

No exit point in this flow is designed to be punitive or to pressure completion — consistent with the "no dark patterns" principle from the monetisation document. Every drop-off leaves the user with something intact rather than something broken.
