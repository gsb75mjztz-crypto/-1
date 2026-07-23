# Legal Principles — Engineering Handoff

## Status of this document (read first)

This is not legal advice, and I am not a solicitor. This document translates the regulatory discussion already had across this project into concrete engineering rules — it exists so that legal risk is enforced structurally, in code and schema, not left as something only a copywriter or a founder remembers to check. It does not replace the actual solicitor review flagged in Week 0 of the engineering roadmap, which must happen before public launch regardless of anything in this document. Where this document states a rule, treat it as the safe engineering default; where it says "confirm with a solicitor," treat that as a hard blocker on launch, not an optional nice-to-have.

If any instruction elsewhere (a feature request, a design mockup, a stakeholder ask) conflicts with a rule in this document, this document wins unless a solicitor has explicitly signed off on the exception in writing.

## 1. The Core Legal Boundary

UK law draws a line between giving information and giving a personal recommendation, and this product must stay clearly on the information side of that line at all times.

**Financial promotion (FSMA 2000, s21):** almost any communication that could be read as an invitation or inducement to engage in investment activity is a "financial promotion" and is tightly restricted for an unauthorised firm. This applies to the product's UI and to any external content (social posts, newsletter copy) associated with it.

**Personal recommendation (RAO, Article 53):** a recommendation becomes "personal," and therefore regulated advice, if it is presented as suitable for the person it's given to, or is based on that person's individual circumstances. A recommendation issued identically to the public, with no tailoring to an individual, is not a personal recommendation. This is the test that matters most for this product's day-to-day feature decisions.

The practical rule that follows from both: this product may display facts about funds, in the same form to everyone, with plain-language explanation of what those facts mean — and may never tailor that output to an individual's circumstances or frame any output as "right for you" or "better than the alternative." The moment either of those two things happens, the product has likely crossed from information into advice.

## 2. Structural Rules (schema and input-level — not just copy)

These are enforced by what the product is allowed to collect and compute, not by wording alone, because a well-designed feature can still cross the line even with a careful disclaimer attached.

- No input field, anywhere in the product, may collect: age, income, employment status, existing full portfolio holdings, risk tolerance, or investment goals/timeframe framed as personal planning. This applies to every form, onboarding flow, and future feature — including ones that seem harmless or "just for context." (Already reflected in the PRD as NFR-4 and in the database schema, which intentionally has no such columns on `users` or `saved_comparisons`.)
- No computed output may be a function of personal circumstances. The calculator's inputs (starting amount, monthly contribution, time horizon) are hypothetical scenario inputs the user types for a "what if" calculation, not a suitability assessment — this distinction matters and should be reflected in the copy around the calculator, not just its backend logic.
- Any future feature that would combine a user's actual holdings with a system-generated flag or suggestion (e.g. a future overlap checker or portfolio tool) must be re-reviewed against this section specifically before being built — this is exactly the kind of feature most likely to accidentally cross into personal recommendation territory, because it looks like "just showing data" while functionally being tailored analysis of one person's situation.

## 3. Content Rules (comparison tool, fund pages, calculator)

- No verdict, ranking, or "better choice" language, anywhere in the product's output. Not "Fund A is the smarter pick," not "we recommend," not a star rating, not a "top pick" badge. Data only, displayed identically regardless of which funds are being compared. (Already in the PRD as an explicit US-1 acceptance criterion and in the Design System's compliance-driven UI rules — this document restates it because it is the single most important content rule in the entire product.)
- The confidence badge (🟢/🟡/🔴) must never be described, styled, or positioned in a way that could read as a quality or risk rating of the fund itself. The locked tooltip copy (Design System Section 6) exists specifically to prevent this misreading, and its bolded "not a rating of the fund" clause must render as specified, not be cut for space or simplified.
- The required disclaimer (Design System Section 7) must render on every page displaying fund data, without exception, and must not be paraphrased. This is a template-level requirement (PRD FR-10) — a developer must not be able to build a new fund-data page without it appearing by default.
- No feature may ever imply the platform holds a view on which fund is objectively "best." This includes indirect signals — sort order defaulting to "most popular" in a way that reads as endorsement, visual emphasis (larger card, highlighted border) applied to one fund over another in a comparison, etc. If a design decision would make one fund look more favoured than another without the user having chosen that ordering themselves, treat it as a compliance issue, not just a design one.

## 4. UK GDPR / Data Protection

- **Data minimisation:** collect only what a feature functionally needs. The `users` table holds email and a newsletter-subscribed flag — nothing else, and any future field addition should be justified against actual feature need, not "might be useful later."
- **Consent:** newsletter sign-up requires double opt-in (confirmed via email click, not just form submission) — already specified in FR-9 and the User Flows document.
- **No third-party sale or unrelated commercial use of user data** — consistent with the Monetisation Principles' explicit "never" list. This should be enforced as an actual technical constraint (no data export pipeline to any external marketing/ad platform), not just a policy statement in the Privacy Policy.
- **Right to access/deletion:** users must be able to request export or deletion of their data. At MVP scale a manual, admin-triggered script satisfies this (per the Technical Architecture), but the Contact page must make this request path genuinely discoverable — not require a user to already know GDPR terminology to find it.
- **Privacy Policy accuracy:** the Privacy Policy page must describe actual data practices, not template boilerplate — if the engineering implementation changes what data is collected or how, the Privacy Policy page needs a corresponding update as part of that change, not as an afterthought.

## 5. Data Licensing and Intellectual Property

- Fee/holdings data is sourced from official issuer factsheets and KIDs (public regulatory disclosures) — cite the source and publish date on every figure (already implemented via the Fund Page template), and never blend or launder a figure's origin.
- Performance data requires a confirmed, written licence from its provider (Financial Modeling Prep or equivalent) that explicitly covers display to end users in a commercial product — not just "internal analysis" or "personal use." This confirmation must exist in writing before the integration ships (per NFR-5 and the Week 0 gate in the engineering roadmap) — do not proceed on an assumption from a pricing page.
- No scraping of any third-party compiled dataset (e.g. another comparison site's tables), regardless of whether the underlying facts are individually public — a compiled database can carry its own legal protection (UK database right) separate from the facts inside it, and this product's entire trust position depends on not needing to cut this corner.
- Fund static data lives in the repo as reviewed, version-controlled files (per the Technical Architecture v2) rather than being live-editable through an unreviewed pathway — this is a data-integrity control as much as a legal one, since an incorrect figure is both a trust failure and, depending on how it's framed, a potential misleading-statement risk.

## 6. External Content (X, newsletter, any founder-led communication)

This section exists because the product's go-to-market strategy runs through founder-led social content, which is subject to the same financial promotion rules as the product itself — and the UK regulator has been actively enforcing against individual social media creators in this space, not just platforms.

- Never name a specific fund as a good or bad choice in public content. Explaining a concept ("here's how OCF compounds over time") using a real fund as an illustrative example is different from telling people to buy or avoid it — keep firmly on the explaining side.
- Never attach an affiliate or referral link to a specific fund or product recommendation in content. Per the Monetisation Principles, affiliate links (when introduced, at Stage 3) are broker-signup links only, disclosed inline, and never inside content that also evaluates or favours a specific investment product.
- Any content that could be read as "you should do X with your money" needs a second look before publishing — the safer framing is always "here's the maths / here's what I'm personally weighing," not an instruction directed at the reader.

## 7. Monetisation-Adjacent Legal Rules

Restated from the Monetisation Principles document because these carry real legal weight, not just brand-reputation weight:

- Sponsored content must be labelled unambiguously before the user starts reading it — "Sponsored" or "Paid partnership," not vaguer industry phrasing.
- No payment may ever influence ranking, visibility, or inclusion in the comparison tool or any fund data view — this is both a trust principle and a guard against the output being read as a promotion dressed as neutral information.
- Affiliate presence must never change what data is shown about a fund or broker, or how it's framed — a factual display must stay factual regardless of any commercial relationship behind it.

## 8. What Requires Actual Solicitor Sign-Off Before Launch

Non-negotiable gate, restated from the engineering roadmap's Week 0 dependency — do not treat this document as satisfying it:

- [ ] The comparison tool's exact copy (metric labels, inline explanations, disclaimer placement) reviewed against UK financial promotion rules.
- [ ] The confidence badge tooltip and disclaimer copy reviewed for whether they could be read as advice framing, even unintentionally.
- [ ] The calculator's output copy reviewed to confirm it reads as arithmetic, not guidance.
- [ ] Terms of Use and Privacy Policy reviewed for accuracy and completeness against actual data practices and UK GDPR requirements.
- [ ] The FMP (or equivalent) data licence reviewed to confirm in writing it covers commercial end-user display.
- [ ] Founder-led content guidelines (Section 6 above) reviewed against current FCA finfluencer guidance, which has been an active enforcement area and may have moved since this document was written — check for current guidance, don't rely solely on this document's snapshot of it.
- [ ] Whether citing factual holdings data (top holdings, sector/region allocation) extracted from a fund factsheet marked "for professional investors only" is appropriate on a retail-facing page, given the source document's own distribution restriction — currently in use for VWRP and VUAG holdings (not fees, which cites the retail KIID instead) because no retail-tier document with that data granularity was found. See Data Strategy Section 8 for the full detail.

## 9. Engineering Enforcement Checklist

What Claude Code (or any engineer) should be able to verify is true of the shipped product, not just the spec:

- [ ] No form field anywhere collects age, income, risk tolerance, or full portfolio data (Section 2).
- [ ] No comparison, fund page, or calculator output contains verdict/ranking language — grep the codebase for words like "best," "recommend," "top pick," "should choose" in user-facing copy as a sanity check, not a substitute for human review.
- [ ] The disclaimer (Design System Section 7) renders on every fund-data page by default, at the template level, not per-page opt-in.
- [ ] The confidence badge tooltip renders the locked copy verbatim, including the bolded "not a rating of the fund" clause.
- [ ] No user data pipeline exports to third-party marketing/ad platforms.
- [ ] Newsletter sign-up requires double opt-in before a subscription is considered active.
- [ ] A data export/deletion request path exists and is reachable from the Contact page without GDPR-specific terminology being required to find it.
- [ ] The FMP integration's licence confirmation is on file (an email or contract, not a verbal or assumed confirmation) before the integration is enabled in production.
