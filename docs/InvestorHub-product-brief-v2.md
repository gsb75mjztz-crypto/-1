# InvestorHub — Product Brief v2 (Definitive)

*An ETF research & decision tool for active beginner investors, built distribution-first*

This version supersedes the original brief. Three changes drive everything below: the audience is narrowed to one cohort instead of three, the go-to-market is inverted (build the audience before the full platform, not after), and the MVP is cut to a single acute-pain loop rather than a suite. Anything that didn't survive that filter has been explicitly removed, not just deprioritized — see Section 8.

## 1. Target Audience (narrowed)

**Who it's for:** The Active Beginner — someone roughly 18–24, already putting real money into investing (typically £20–£300/month), already has a broker app installed, already owns one to five ETFs or stocks, but is making decisions on vibes, TikTok clips, or "what my mate does" rather than genuine understanding. They are not starting from zero — they've cleared the hardest step (opening an account, making a first trade) — but they don't yet trust their own judgement.

**Explicitly not the primary audience, and not designed for at launch:**

- Curious-but-frozen people who haven't started yet. They don't search for solutions to a problem they haven't framed as urgent, so they're nearly unreachable as a first channel. They'll arrive later, pulled in by active beginners talking about the product.
- Emerging intermediates with larger, more complex portfolios. Real segment, real future opportunity, but small, harder to reach, and already reasonably served by JustETF. Building for them first means building for an audience that isn't there yet.

**Why this cohort specifically:** They have the sharpest, most searchable, most acute pain of the three groups. They ask specific questions ("is VUAG or VWRP better for me," "am I overexposed by holding this ETF and these stocks") in the exact moment they're about to make a decision — that's a painkiller moment, not a vitamin moment. They're also the group most reachable through short-form content, because they already follow finance creators and already have money in the game, which makes them engage with specifics rather than generalities.

**Goal:** Make the next decision with confidence, not become a financial expert. That reframing matters — it changes the product from "teach someone everything" to "help someone decide this one thing well, right now."

**Core frustration:** Every existing tool assumes either total ignorance (Investopedia) or fluency they don't have (JustETF, Morningstar). Nothing meets them exactly where they are: informed enough to ask a specific question, not informed enough to interpret a raw answer.

## 2. Core Problem (unchanged, sharpened)

**The problem:** Active beginners can already act (the broker app made that trivial) but can't yet evaluate — so they default to copying, guessing, or freezing at the exact moment a real decision needs to be made. The gap isn't "investing knowledge" in the abstract; it's the absence of a fast, trustworthy answer to "is this the right call, for me, right now."

**Why every feature must answer this test:** Does this help someone resolve an actual pending decision faster and with more confidence, using their real numbers — not does this teach a general concept in the abstract. A feature that's educational but not decision-adjacent (a news feed, a glossary browsed for its own sake) fails this test even if it's well made. This is stricter than the original brief's test, deliberately — it's what keeps the MVP small.

## 3. Distribution Strategy (new — this did not exist in v1, and it now comes before the MVP)

The single biggest change from the original plan: the audience gets built before the full platform does, not after.

Rather than launching a content library and waiting on SEO (12+ months of near-zero traffic against Investopedia's domain authority), the founder documents real, specific investing decisions and reasoning in short-form content on the platforms this audience already uses — the actual comparison logic behind a real choice, the actual fee-drag math on a real portfolio, the actual overlap check on real holdings. This is not marketing bolted onto the product; it is the R&D process. It answers three problems the original SEO-first plan couldn't:

- **Speed:** distribution in weeks, not a year.
- **Validation:** real reactions to real explanations before a single line of platform code is overbuilt around the wrong framing.
- **Trust shape:** "a specific person doing this in public, with a track record" is a stronger trust signal for this audience than "an institutional-sounding neutral platform" — and it's not fakeable by a well-funded competitor overnight the way a comparison tool is.

The platform's job, then, is to be the natural destination for people who've been persuaded by that content and now want to run their own numbers — not the thing that has to do all the persuading itself from a cold start.

## 4. MVP (cut to one loop, not a suite)

**The single MVP loop:** person has a specific pending ETF decision → gets a clear, honest, explained answer using their real numbers → trusts it enough to come back for the next decision.

**Essential — the entire launch scope:**

- **ETF Comparison Tool**, capped at a curated 30–50 well-known ETFs (not 50–100 — narrower is more buildable and more maintainable, and this cohort is comparing well-known funds, not obscure ones). Core metrics only: fee, historical return, holdings overlap between the two funds, region/sector breakdown. Every metric has a plain-language "why this matters" explanation attached inline — not a separate glossary lookup.
- **Fee-drag / compounding calculator**, pre-filled from whatever comparison the user just ran, so the emotional payoff ("this 0.7% difference costs you £X over 20 years") lands immediately in context rather than as a separate disconnected tool. This is the single most shareable asset in the product and the one most likely to travel on its own.
- **A save/account layer** light enough to not be a wall — save a comparison, that's it. No learning-progress tracking, no gamification, nothing beyond "don't lose what you just built."
- **Newsletter capture**, framed as a continuation of the specific thing they just did ("get one email a week like the comparison you just ran"), not a generic sign-up ask.

That's the entire MVP. Four things, one loop, ships in 6–8 weeks by a small team without stretching.

**Explicitly cut from the original MVP list, not postponed but removed from this brief's core scope until the loop above proves itself:**

- Learning Centre / curriculum tracks — this served the curious-but-frozen audience we've deliberately deprioritized. Explanation still lives inline on the comparison tool itself; a standalone curriculum is a second product, not part of the wedge.
- Full ETF database as a standalone browsable section — the comparison tool needs data on 30–50 funds; a browsable reference database for its own sake is Investopedia/JustETF territory and doesn't serve an active, pending decision.
- Site-wide jargon-buster hover glossary as a separate system — folded directly into the comparison tool's inline explanations instead of being built as independent infrastructure. Same user value, much less to build.
- Search — with four things on the site, there's nothing to search yet.

**Postponed, revisit only once the core loop has real, retained users:**

- Portfolio Builder / Overlap Checker beyond two-fund comparison — genuinely strong differentiator, but it's a second acute-pain loop for a portfolio that already exists, which is closer to the intermediate cohort than the active-beginner entry point.
- Watchlists, dividend tools, screener — all real, all later.

**Removed entirely, not just postponed — these don't support the core mission and shouldn't reappear without a specific reason:**

- News & market summaries — undifferentiated, resource-heavy to maintain, and actively works against "help with one clear decision" by pulling attention toward daily noise.
- Open community/forum — high moderation cost, high regulatory sensitivity (unmoderated financial "advice" between users is a real liability), and not needed while the founder-led content channel is doing the trust-building work directly.
- Gamified learning progress / streaks — deliberately excluded on principle, not just deprioritized: this is a finance product, and mechanics that reward compulsive daily checking work against the "calm, considered decision" identity the whole product is trying to build.

## 5. Design Philosophy (retained, tightened)

Calm and specific, not broad and reassuring. Since the product is now one focused tool rather than a multi-section platform, the design's job is simpler: make one number and one explanation feel obviously trustworthy on a single screen. Warm neutral base, one confident accent colour, restrained data-state colours (no neon red/green alarm tones), a humanist sans-serif, generous whitespace around the comparison result itself so it reads as the answer rather than one data point among many. No dashboard-of-everything feel — there's nothing to have a dashboard of yet, and that's fine.

## 6. Core User Journey (revised for the narrowed loop)

1. Person sees a specific piece of founder-led content (short-form video/post) working through a real comparison or fee-drag example.
2. They click through to run the same kind of comparison on their own numbers.
3. They get a clear, explained answer, and the fee-drag calculator shows what it's worth over time, pre-filled from their comparison.
4. They save it (light account creation) and, ideally, share the fee-drag result — it's the most shareable output in the product.
5. Newsletter captures them for the next specific, concrete thing (not a generic digest).
6. They return when their next pending decision comes up — which, for someone contributing weekly or monthly, is a natural recurring trigger, not a manufactured engagement loop.

## 7. Competitive Landscape (unchanged in substance — see prior discussion)

JustETF wins on comparison mechanics but assumes fluency. Morningstar wins on analytical depth but is paywalled and built for advisors. Investopedia wins on reference authority but is static and disconnected from action. Trading 212 Learn is convenient but structurally conflicted. Simply Wall St is stock-first with thin ETF coverage. None of them pair explained comparison with a specific, personal decision moment, and none of them are being built by someone who is visibly the target user, in public, in real time.

## 8. Long-Term Vision (unchanged in direction, now reachable by a credible path)

The five-year shape is the same — go-to research tool for young investors, light portfolio tracking, education content, eventually community and subscription — but the path there now runs through proving the single comparison-and-calculator loop with a real, founder-built audience first, then expanding feature by feature only once each prior loop has real retained usage. Nothing gets added because it's a good idea in the abstract; it gets added because users of the current version are visibly asking for the next specific thing.

## Open questions this brief deliberately leaves unresolved (flag for next session, don't guess at answers)

- **Regulatory scope:** UK financial promotion rules need a real check on the comparison tool's language (even "this fund has a lower fee" framing needs care) before launch, not after.
- **Monetization boundary:** what, in writing, will never be monetized (e.g. no paid placement in comparison results) — decide before any revenue pressure exists.
- **Data source and cost:** where the 30–50 funds' data comes from, how it's kept accurate, and what that costs on a bootstrap budget.
