# InvestorHub — Project Health Review

*Performed as a first-time reviewer (Senior Software Architect lens), cross-referencing the actual codebase against all documents in `/docs`, after Milestones 1–3. Review only — no code changes made as part of this document.*

Date: 2026-07-23 · Reviewed against branch `claude/information-review-gp1z17` (commit `67049a2`) / tag `v3.0`.

---

## 1. Product Vision

**Does the implementation match the Product Brief?** Partially, and in a way that matters. Product Brief v2 is explicit: the MVP is **one loop, four things** — Comparison Tool, Calculator, light Save, Newsletter — "ships in 6–8 weeks... nothing beyond this." After three "milestones," here is what actually works when you click through the live site:

- **Compare** → `PagePlaceholder`, "Coming soon."
- **Calculator** → `PagePlaceholder`, "Coming soon."
- **Sign in** → `PagePlaceholder`, "Coming soon."
- **Saved** → `PagePlaceholder`, "Coming soon."
- Newsletter signup form → real form, POSTs to a real endpoint, which returns `501` — the component then tells the user "Something went wrong on our end — please try again shortly," which is **false**; it will never succeed, because it isn't built.
- `/api/saved`, `/api/newsletter`, `/api/cron/refresh-performance` → all `501 Not implemented`.

What *is* real: foundation (auth plumbing, schema, design-system components), the homepage (marketing-only), draft trust/legal pages, and three funds' worth of fully-built, heavily-polished ETF detail pages.

**The critical finding:** per the Information Architecture doc, the Individual ETF Page "never appears in global nav because it's not a destination on its own — it's always arrived at *from*" the Comparison Tool. Comparison doesn't exist. **There is currently no discoverable path, anywhere in the built navigation, to the pages that took an entire milestone (plus two full audit cycles) to build.** They're reachable only by typing the exact URL. That's not a missing feature — it's a finished, polished feature with no door into it.

**Scope creep:** essentially none. The one deliberate addition (`/disclaimer` beyond the PRD's 13-page sitemap) is self-flagged in code comments and genuinely additive, not creep.

**What's been omitted, relative to the actual roadmap:** the Development Roadmap's Week 2 milestone was "**one** real, fully sourced fund renders correctly end-to-end" as a small proof-of-concept — deliberately the *smallest* complete slice, specifically so Comparison (Week 3, the actual named MVP core) could follow immediately. Instead, three fund pages were built to a very high, repeatedly-audited standard, and Comparison — the tool the Product Brief calls "the single MVP loop" — has 0% built. This is the definition of building the wrong 20% first.

| Finding | Severity |
|---|---|
| Core MVP loop (Compare → Calculator → Save → Newsletter) is 0% functional after 3 milestones | **Critical** |
| ETF detail pages have no discoverable entry point in the shipped navigation | **Critical** |
| Newsletter signup gives a real user a false "try again shortly" error for a feature that isn't built | **High** |
| Build sequence inverted relative to the roadmap's own explicit risk/dependency ordering | **High** |

---

## 2. Architecture

Technical Architecture v2 is genuinely good — simplified deliberately, every removal explained, no speculative infrastructure (no Redis, no admin panel, no live write-path into fund data). What's built is faithful to it: the Prisma schema documents its 3 deviations from the doc's literal table list (Account/Session/VerificationToken for Auth.js) with clear reasoning rather than silently drifting.

- **Would I redesign anything now?** No — the fund-data-as-JSON-files decision, the minimal API surface, and the single-auth-system choice are all still right at this scale.
- **Unnecessary abstractions?** None found — if anything the code is unusually lean (`cn.ts` is 4 lines, extracted only after 3 real duplications).
- **Future bottlenecks:** the docs already honestly flag the JSON-files-not-SQL tradeoff stops scaling "well before this dataset reaches the hundreds" — correctly self-identified, not something newly discovered here.
- **Real gap:** Technical Architecture Section 6 specifies "GitHub Actions — lint/type-check/tests on every PR." **There is no `.github/workflows` directory at all.** Every regression this session (contrast failures, a heading-hierarchy skip, a cache-bypass bug) was caught by a manually-invoked, one-off audit — not by anything that runs automatically. That's a process gap, not a code gap, but it's the exact gap CI exists to close.

| Finding | Severity |
|---|---|
| No CI/CD pipeline despite being explicitly specified | **High** |
| `lib/overlap.ts` (specified in the architecture's folder structure) doesn't exist yet — blocked on Comparison not being built | Low (expected, not a defect) |

---

## 3. Code Quality

Genuinely strong where it exists. Consistent CSS Modules usage, consistent design-token adherence, no copy-pasted logic (shared `PagePlaceholder`, `DraftNotice`, `cn()`), and unusually thorough in-code rationale comments tying every component back to a specific doc section.

**The one real gap, and it's significant: zero automated tests exist anywhere in this repo.** The Development Roadmap is explicit that `lib/confidence.ts` and the calculator's growth math are "cheap to test thoroughly and the most consequential code in the product to get numerically right," written "alongside each feature, not after." Every verification done all session — confidence-badge math, redirect behavior, contrast ratios — was a throwaway script run once during an audit and then deleted. There is no regression protection on any of it. The next person to touch `lib/confidence.ts`'s day thresholds has nothing stopping them from silently breaking it.

`app/fund/[ticker]/page.tsx` is starting to accumulate responsibility (data fetch + confidence computation + a large inline JSX tree) — not a problem at 3 funds, worth splitting before it grows further.

| Finding | Severity |
|---|---|
| No test suite at all, despite explicit roadmap requirement for unit tests on the most consequential pure functions | **High** |
| `app/fund/[ticker]/page.tsx` doing too much in one component (approaching 240 lines) | Low |
| Dense doc-referencing comments risk rotting as code diverges further from docs over time | Low |

---

## 4. Database

Sound. Matches the architecture doc's intent, deviations are documented, FK indexes present (fixed correctly in the Milestone 1 audit), join table used correctly instead of an array column. `calculatorState Json?` is an appropriately flexible MVP escape hatch, currently unused and unvalidated — fine today, needs a Zod shape once Calculator actually writes to it.

No scalability concerns at MVP scale. No migration hazards observed — 2 clean migrations, nothing destructive.

| Finding | Severity |
|---|---|
| `SavedComparison.calculatorState` has no schema validation yet | Low (currently dormant, unused) |

---

## 5. Performance

- **Current:** the one real measurement (504ms FCP on throttled 3G) is from Milestone 2, *before* the much heavier client-hydrated fund page (two client components: `EtfPageTabs`, `Badge`) existed — that number hasn't been re-verified since.
- **At 1,000 users:** a non-issue. SSG + ISR fund pages, one-row-per-ticker performance table, no hot paths yet.
- **At 100,000 users:** the real known gotcha is Postgres connection exhaustion under serverless fan-out (Vercel functions + Prisma) — the driver-adapter pattern doesn't solve this by itself; will need PgBouncer or the hosting provider's built-in pooler (Supabase/Neon both offer one) before this scale. Foreseeable, not urgent, not yet addressed anywhere.
- Most of this section is speculative because the features that would actually generate load (Compare, Calculator) don't exist yet.

| Finding | Severity |
|---|---|
| NFR-1 (2s load) not re-measured since the fund page got heavier | Medium |
| No connection-pooling strategy documented for serverless-scale Postgres access | Medium (future) |

---

## 6. Security

- **Auth:** correctly minimal, magic-link only, JWT sessions (no session-table writes). Solid.
- **Real gap:** the Nodemailer provider silently falls back to an inert `smtp://localhost:25` config if `EMAIL_SERVER` is unset — this keeps builds green everywhere, which is the right call for dev, but it means a misconfigured **production** deploy would build and deploy successfully while silently never sending a single magic link, with no loud warning anywhere (unlike `lib/prisma.ts`'s `console.warn` for a missing `DATABASE_URL`).
- **API protection:** the one real endpoint with something to protect (`cron/refresh-performance`) does a correct bearer-secret check before any work. Good.
- **Input validation:** thorough and well-tested on fund JSON data (Zod, including edge cases). Non-existent yet on API routes, but those routes are honest `501` stubs, not built-and-unvalidated — appropriate for current state.
- **Secrets:** `.env` correctly gitignored, `.env.example` has no real values. `CRON_SECRET` is compared with `!==` rather than a constant-time comparison — theoretically timing-attackable, practically irrelevant for a low-value internal secret.
- **OWASP:** no SQL injection surface (Prisma throughout), no XSS surface found (no `dangerouslySetInnerHTML` anywhere), no CSRF protection designed yet for the future cookie-based `/api/saved` mutation — worth deciding *now*, while it's still a stub, not after it's built and momentum makes it easy to skip.
- No security headers configured anywhere (`next.config.ts` is empty) — no CSP, no frame-options. Cheap to add, not yet done, worth doing for a finance-adjacent trust product even pre-launch.

| Finding | Severity |
|---|---|
| Silent magic-link failure mode if `EMAIL_SERVER` is misconfigured in production | Medium |
| No CSRF strategy decided before `/api/saved` gets built | Medium |
| No security headers (CSP etc.) configured | Low-Medium |
| Non-constant-time cron secret comparison | Low |

---

## 7. Accessibility

The strongest area of the project, genuinely. Real ARIA tabs pattern (not tab-shaped buttons), computed (not assumed) WCAG contrast on every color pairing actually shipped, colour-never-sole-carrier respected consistently, keyboard nav verified with a real browser each time. This is evidence-based work, not asserted.

**Caveat:** this level of rigor has only been applied to what's built. Compare/Calculator/Saved/Sign-in are placeholders with no real accessibility surface yet — "accessibility is strong" is currently a claim about a third of the sitemap, not the whole product. Also, every a11y check has been a manual, one-off script (same pattern as the testing gap in Section 3) — nothing durable or automated (e.g. axe-core in CI) despite the Design System's own checklist calling for automated-tool verification.

| Finding | Severity |
|---|---|
| Accessibility rigor unverified on the ~60% of the sitemap that's still placeholder pages | Medium (will become real once built) |
| No automated a11y tooling wired into any repeatable process | Medium |

---

## 8. SEO

Weak, but mostly appropriately so given this product's own stated strategy. Product Brief v2 explicitly rejects SEO-first distribution in favor of founder-led content — so a thin SEO surface isn't off-strategy. Concretely: only fund pages have real `generateMetadata` (added in the Milestone 3 fix round); homepage, methodology, terms, privacy, disclaimer all currently render the identical root `<title>InvestorHub</title>` with no per-page differentiation. No sitemap.xml, no robots.txt, no Open Graph tags anywhere.

The one SEO-adjacent gap that actually matters for *this* product's specific GTM plan: the Calculator's shareable-result output (explicitly called "the single most shareable asset in the product... the one most likely to travel on its own") doesn't exist, because Calculator doesn't exist. That's a distribution gap, not a technical SEO gap, and it's the one worth caring about here.

| Finding | Severity |
|---|---|
| No per-page metadata outside fund pages | Low-Medium |
| No OG/Twitter card metadata, no sitemap/robots.txt | Low |
| Calculator's shareable-output — the product's actual named distribution mechanism — doesn't exist | High (product priority, not technical) |

---

## 9. User Experience

Split assessment: what's built is well-crafted; what a real visitor experiences end-to-end today is broken in a specific, avoidable way. Walk the homepage's own two primary CTAs ("Compare two ETFs," "Try the fee-drag calculator") and both dead-end at "Coming soon." Try the newsletter form on the same homepage and it fails with a message implying transient server trouble rather than "not built yet." A stakeholder or soft-launch tester hitting this site today would reasonably conclude something is broken, not "on schedule."

| Finding | Severity |
|---|---|
| Homepage's own primary CTAs both dead-end | **Critical** (if shown to anyone outside the build team right now) |
| Newsletter form's error message misrepresents the actual cause | High |
| ETF pages themselves are well-executed UX, just unreachable (see Section 1) | — |

---

## 10. Compliance

The strongest area alongside accessibility, and consistently so under real pressure, not just on paper.

- **Legal Principles:** no verdict/ranking language anywhere (grepped, confirmed clean), the locked "not a rating of the fund" copy renders verbatim, the disclaimer is unconditional on fund pages, no personal-circumstance fields exist. Terms/Privacy are visibly, honestly marked draft-pending-solicitor-review, exactly matching what the Legal Principles doc requires of itself.
- **Monetisation Principles:** fully respected — trivially true right now since nothing monetization-adjacent is built, but that itself is correct (Stage 0 is "free core, no revenue").
- **ETF Page Specification:** respected field-for-field, verified twice this session against real rendered output, not just the diff.
- **Trust Philosophy:** the honest partial-coverage notes, the DraftNotice pattern, and the resolution of the VWRP/VUAG source-attribution issue (accepting a worse-looking 🔴 badge rather than a flattering fudge) are real evidence of the principle holding under actual pressure, not just being stated.
- **One open, correctly-flagged (not hidden) item:** NFR-7's graceful-degradation behavior has never actually been simulated, since the FMP integration doesn't exist yet — a design intention, not yet a verified property.

No findings here rise above Low — this area is in good shape.

---

## 11. Future Development

**Is Milestone 4 safe to begin?** Depends entirely on what it's defined as.

- If "Milestone 4" continues the pattern used for 1–3 (pick a doc-scoped chunk, build it in isolation, audit it, tag it) with no correction to sequencing — **no**, that repeats the exact mistake that produced a site with zero working core functionality after three rounds.
- If "Milestone 4" is explicitly redefined as **the Comparison Tool** — matching the roadmap's actual Week 3, unblocking the entire rest of the product, and finally giving the already-built fund pages a front door — **yes**, and the codebase is genuinely ready for it: the fund data model, the confidence system, and every design-system component Comparison needs already exist and are solid.

**What should happen before/alongside that:** stand up a minimal CI pipeline (lint + typecheck + build, on every PR — a few hours of work) and write real unit tests for `lib/confidence.ts` and `lib/fundSchema.ts` before `lib/overlap.ts` (Comparison's new consequential pure function) gets written next to them with the same no-test pattern a third time.

---

## Would I continue building from this codebase?

## YES.

Every Critical/High finding above is a **sequencing and process** problem, not a **code quality or architecture** problem. The Technical Architecture is sound and hasn't needed a single structural change across three milestones. The code that exists is consistent, well-documented, genuinely accessible, and compliance-rigorous under real pressure — that's not easy to fake and it isn't faked here. Nothing needs to be torn out or rewritten.

**The biggest risk going forward isn't in the code — it's the pattern that produced this state**: three rounds of "build a doc-scoped slice, audit it hard, ship it" without checking that slice against the roadmap's own dependency order, resulting in a polished, well-tested, completely inaccessible product. That pattern will repeat a fourth time unless the next milestone is explicitly anchored back to the roadmap's actual sequence (Comparison next, not another self-contained slice chosen for being easy to scope in isolation) — and unless CI/tests get built this time, not audited-around a fourth time.

**Concretely, before writing more feature code:**
1. Build the Comparison Tool next — nothing else, until it's real and the fund pages are reachable from it.
2. Stand up CI (lint/typecheck/build on every PR).
3. Write unit tests for `lib/confidence.ts` and `lib/fundSchema.ts` now, and for `lib/overlap.ts` as it's written, not after.
4. Fix the homepage's two dead-end CTAs and the newsletter's misleading error message before anyone outside the build team sees this environment.
