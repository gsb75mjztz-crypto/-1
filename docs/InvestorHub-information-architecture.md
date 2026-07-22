# Information Architecture

Pure structure — how pages relate, group, and connect. No implementation detail. This organizes the same 13 pages from the PRD by *relationship* rather than by build requirement, since those are two different questions: the PRD asks "what does each page need to do," this asks "how does a person understand where they are and where they can go."

---

## 1. Hierarchy

Three levels only. This is deliberate, not a placeholder for future depth — a beginner-facing product with a narrow MVP scope should never require a user to think "where am I in this site." Flat is a feature here, not a limitation to fix later.

**Level 0 — Entry**
Home

**Level 1 — Core Tools** *(the primary loop; equal-weight siblings, not sub-items of each other)*
Comparison Tool · Calculator

**Level 2 — Supporting / Detail Pages** *(reached from Level 1, not from global nav)*
Individual ETF Page (with Overview/History as a local sub-view, not a separate page) · Saved Comparisons

**Level 2 — Account & Retention** *(parallel branch to the above, not nested under it)*
Sign Up/Sign In · Newsletter Confirmation

**Level 2 — Trust & Legal** *(reached only from footer, never from primary nav — deliberately separated so they don't compete for attention with the tools, but remain equally reachable from every page)*
Methodology · Terms · Privacy · Contact

**Utility (not part of the hierarchy proper)**
404 · Data/Outage inline state

This shape is intentional: **two peers at Level 1** (Compare, Calculator), because the product philosophy treats them as equally-entry-worthy, not "Compare is the main thing and Calculator is a sub-feature of it" — a user should be able to land on either first and have it feel like the front door.

---

## 2. Navigation Systems

Four distinct systems, each with a single clear job. Mixing their responsibilities is the most common way information architecture degrades over time, so each is scoped tightly.

### Global / Primary Navigation
`Compare · Calculator · [Sign in / Saved]`

Present identically on every page. Job: always let the user jump straight to either core tool, from anywhere, in one click. Nothing else qualifies for this space — adding a fifth item here later should be treated as a real decision, not a default, because every item added dilutes the "there are exactly two things to do here" clarity that's doing real work for a beginner audience.

### Footer / Utility Navigation
`Methodology · Terms · Privacy · Contact`

Present identically on every page, visually de-emphasized relative to primary nav. Job: always-available trust and legal access, without competing for attention with the tools. A user who wants this content actively seeks it out (scrolls to footer); it should never need to interrupt someone using the comparison tool.

### Local / In-Page Navigation
The Overview/History tab toggle on the Individual ETF Page. Job: switch between two views of the *same* page's subject without leaving it — this is a sub-navigation, one level below the sitemap itself, and correctly modeled as a tab rather than a separate page (see Section 4, relationship rationale).

### Contextual / Bridge Navigation
The links that move a user *between* Level 1/2 pages based on what they just did, not based on a persistent menu: Comparison → Fund Page (via clicking a fund name), Fund Page → Calculator (via "see fee impact"), Comparison → Calculator (via "see what this costs over time"), Calculator → Account (via "save this"). Job: carry intent and context forward, so the next page a user lands on already knows why they're there. This is the architecture doing the work the "every click" flow document described — IA and flow are two views of the same connective tissue, this section is the structural map, that document was the sequence.

---

## 3. Sitemap Diagram

```
                              HOME
                     (Level 0 — entry point)
                               │
              ┌────────────────┴────────────────┐
              │                                   │
        COMPARISON TOOL                      CALCULATOR
        (Level 1 — peer)                   (Level 1 — peer)
              │                                   │
              │  (click a fund)     (pre-fill bridge, either direction)
              ▼                                   │
      INDIVIDUAL ETF PAGE ─────────────────────────
      (Level 2 — detail)
              │
       [Overview | History]
        (local tab, not a
         separate page)

   ┌─────────────────────────┐        ┌─────────────────────────┐
   │   ACCOUNT & RETENTION    │        │      TRUST & LEGAL       │
   │   (Level 2, parallel)    │        │  (Level 2, footer-only)  │
   │                          │        │                          │
   │  Sign Up/Sign In         │        │  Methodology             │
   │  Saved Comparisons       │        │  Terms                   │
   │  Newsletter Confirmation │        │  Privacy                 │
   │                          │        │  Contact                 │
   └─────────────────────────┘        └─────────────────────────┘
        reached via "Save"                reached via footer,
        action from Level 1                any page, always
```

Note what this diagram deliberately does *not* show: a rigid top-down tree where every page nests under one parent. Comparison and Calculator are peers, not parent/child. Account and Trust/Legal are both reachable from anywhere, not buried two clicks deep. The only genuinely nested relationship in the whole product is the History tab inside the Fund Page — everything else is a network of peers and bridges, which matches how the flow document showed people actually moving through it: sideways and forward, not up and down a hierarchy.

---

## 4. Page Relationships & Rationale

| Relationship | Type | Why it's structured this way |
|---|---|---|
| Comparison ↔ Calculator | Peer, bilateral bridge | Neither is subordinate to the other — a user can arrive at the fee-cost insight from either direction, matching the product's core "explain, then show the cost" loop. |
| Comparison → Fund Page | Parent-to-detail | A fund page is a zoom-in on one element of a comparison; it never appears in global nav because it's not a destination on its own — it's always arrived at *from* something. |
| Fund Page: Overview / History | Tab, not separate page | These are two views of one subject (the fund), not two different subjects — modeling History as its own page would wrongly imply it's a separate destination, when it's really "more detail about the thing you're already looking at." |
| Calculator → Account (Save) | Conditional bridge, not a nav item | Account is never in global nav as a first-class destination for a new visitor — it only becomes relevant once there's something to save. Putting "Sign Up" in the primary nav from the first visit would front-load a commitment ask before any value has been delivered. |
| Account → Newsletter | Parallel, not sequential-dependent | Structurally these are unrelated systems that happen to often co-occur — a user can subscribe without an account or vice versa. Keeping them architecturally independent (not "newsletter is a step inside account creation") is what allows the flexible entry points described in the flow document. |
| Any page → Trust/Legal (footer) | Universal, flat | Every page is equally one click from Methodology/Terms/Privacy/Contact, with no exceptions and no deeper burial for less-visited pages — trust content earns worse discoverability nowhere in this product. |
| Saved Comparisons → live Fund/Comparison data | Reference, not duplication | A saved item is architecturally a pointer to a live page, not a stored copy — this is why revisiting a saved comparison can surface "this has changed since you saved it" (per the flow document); the IA treats "saved" as a bookmark, not a snapshot. |

---

## 5. Labeling & Terminology Consistency

One label per concept, used identically everywhere it appears — inconsistent labeling is one of the more common quiet IA failures, where a user isn't lost structurally but is lost *linguistically* because "Compare," "Comparison Tool," and "ETF Comparison" all refer to the same nav item in different places.

Standard labels, locked across nav, buttons, and page titles:

- **"Compare"** (nav) → leads to the **Comparison Tool** — use "Compare," not "Comparison," in the primary nav specifically, since it reads as an action (matches the audience's task-oriented intent) rather than a noun-y section label.
- **"Calculator"** — consistent everywhere; do not alternate with "Fee Calculator" or "Growth Calculator" in different contexts, even though both are accurate — pick one and hold it.
- **"Saved"** (nav, when signed in) → leads to **Saved Comparisons** — nav label stays short; full page title can be the longer form.
- **"Sign in"** vs **"Sign up"** — shown contextually (sign up for new/anonymous users, sign in once a session exists) rather than a single ambiguous "Account" label that doesn't tell the user their current state.
- **"Last verified" / "Last reviewed"** — per the earlier terminology fix, used identically on every fund page, never substituted with "checked," "confirmed," or other synonyms that would read as a different thing to a returning user comparing pages.

---

## 6. Depth & Breadth Assessment

**Breadth at Level 1: 2 items.** Deliberately narrow. This is not under-built — it's the direct architectural expression of the MVP-cut decision made earlier in this project (one loop, not a suite). Adding a third Level-1 item should require the same bar as adding a new major feature to the PRD, not a casual nav edit.

**Maximum depth to reach any page: 2 clicks from Home**, except the History tab (3, since it's Home → Compare → Fund Page → History tab). No page in this architecture is more than two real navigational decisions away from the entry point — appropriate for an audience the product philosophy describes as wanting a fast, specific answer, not a browsing experience.

**Where this architecture is intentionally *not* future-proofed:** if Portfolio Builder, Screener, or Learning Centre are added in a later phase (per the long-term roadmap), they will each need their own Level 1 slot, and at that point the "2 peers at Level 1" breadth decision above will need deliberate revisiting — this document describes the MVP's IA, not a scalable skeleton pre-built to absorb future features invisibly. Re-flattening the nav as new sections are added is a decision to make consciously later, not something this structure tries to anticipate now.
