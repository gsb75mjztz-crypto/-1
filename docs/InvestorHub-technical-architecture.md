# Technical Architecture (v2 — reviewed and simplified)

Supersedes the original architecture document. Every removal below is deliberate and explained — this is not a shortened version for brevity, it's a version with less to break.

## 1. Stack Overview

- **Frontend + API:** Next.js (App Router) — SSG for fund/comparison pages built from static data, minimal API routes for the genuinely dynamic parts only (auth, saved comparisons, newsletter).
- **Database:** PostgreSQL (Supabase or Neon) — now holds only what's actually dynamic: performance data, users, saved comparisons. No table for the curated fund list itself (see Section 2).
- **ORM:** Prisma.
- **Auth:** magic-link email only (unchanged from v1 — this was already appropriately minimal).
- **Hosting:** Vercel — production, plus per-PR preview deployments used as staging (no separate persistent staging environment).
- **Search:** Fuse.js, entirely client-side.
- **Caching:** none, beyond Next.js's built-in ISR at the page level. No Redis.

**Net change from v1:** one fewer database table category, one fewer vendor (Redis), one fewer authentication system (admin auth), one fewer pair of API endpoints, one fewer persistent environment.

## 2. Fund Data: Files, Not a Database Table

The curated 30–50 funds' static characteristics (fees, holdings, allocations) live as version-controlled JSON, one file per fund, committed to the repo:

```
/data/funds/VWRP.json
/data/funds/VUSA.json
...
```

```json
{
  "ticker": "VWRP",
  "isin": "IE00BK5BQT80",
  "name": "Vanguard FTSE All-World UCITS ETF",
  "ocf": 0.22,
  "fees_source": "Vanguard Official Factsheet",
  "holdings_source": "Vanguard Holdings Report",
  "top_holdings": [{"name": "Apple Inc", "weight": 3.8}],
  "region_allocation": {"US": 62.3, "UK": 4.1},
  "sector_allocation": {"Technology": 24.1},
  "history": [
    {"date": "2026-07-01", "field": "ocf", "value": 0.22, "source": "Vanguard Official Factsheet"}
  ]
}
```

**Why this is better than a database table + admin panel, not just simpler:**

- A monthly update is a pull request — reviewed the same way any code change is, through the existing staging→production process (Section 6), with no separate approval mechanism to build or maintain.
- Git history is the provenance log. Every change has an author, timestamp, and diff, for free — this is a more complete audit trail than the custom `data_events` table in v1, with none of the code needed to build it.
- The `history` array inside each file, appended on every edit, gives the History tab's provenance list directly — no join, no separate query.
- Removes the admin authentication system entirely — there is no live write path into fund data at all, which is the strongest possible security posture for the trust-critical part of the product: not "well-guarded," but nonexistent as an attack surface.

**The honest trade-off:** this relies on the habit of appending to `history` on every edit rather than just overwriting values. Mitigate with a small local script (`scripts/update-fund.ts --ticker VWRP --field ocf --value 0.22 --source "..."`) that appends automatically rather than hand-editing JSON — cheap to build, removes the human-error risk this trade-off otherwise carries.

At build time, Next.js reads all files in `/data/funds` to generate the comparison tool's fund list and each fund's static page content via SSG.

## 3. Database Schema (what's left)

Only genuinely dynamic, per-user, or automatically-refreshed data lives in Postgres now.

```sql
-- Performance: the one piece of fund data that changes without a deploy
CREATE TABLE fund_performance (
  ticker TEXT PRIMARY KEY,       -- keys against the JSON files by ticker, not a DB FK
  return_1m NUMERIC(6,3), return_ytd NUMERIC(6,3), return_1y NUMERIC(6,3),
  return_3y NUMERIC(6,3), return_5y NUMERIC(6,3), return_since_launch NUMERIC(6,3),
  source TEXT NOT NULL DEFAULT 'Financial Modeling Prep',
  market_data_updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  newsletter_subscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE saved_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  calculator_state JSONB,
  saved_at TIMESTAMPTZ DEFAULT now()
);

-- Fixes the v1 mistake: proper join table instead of a UUID[] column
CREATE TABLE saved_comparison_funds (
  saved_comparison_id UUID REFERENCES saved_comparisons(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  position SMALLINT NOT NULL,
  PRIMARY KEY (saved_comparison_id, ticker)
);
```

No `funds`, `data_events`, or `review_queue` tables. Confidence-badge status ("🟢/🟡/🔴") is computed at render time from each fund's `fees_source`/`holdings_source` dates (in the JSON) and `market_data_updated_at` (in Postgres) — never stored, so it can never drift out of sync with the data it's describing.

## 4. Folder Structure

```
/data
  /funds/*.json                  → source of truth, PR-reviewed
/scripts
  /update-fund.ts                → CLI helper, appends to history correctly
/app
  /page.tsx                      → Homepage
  /compare/page.tsx              → Comparison tool (client-side search/compare/overlap)
  /calculator/page.tsx
  /fund/[ticker]/page.tsx        → SSG from /data/funds, + live performance join
  /saved/page.tsx                → auth-gated
  /auth/sign-in/page.tsx
  /methodology, /terms, /privacy, /contact
  /api
    /saved/route.ts              → CRUD, auth-required
    /auth/[...nextauth]/route.ts
    /newsletter/route.ts
    /cron/refresh-performance/route.ts   → only scheduled job in the system
/lib
  /confidence.ts                 → pure function: (dates) → badge status. No storage.
  /overlap.ts                    → pure function, runs client-side
/components ...
/prisma/schema.prisma            → now three tables, not six
```

## 5. Authentication

Unchanged from v1 — magic-link only, no passwords. This was already right. The one change: there is no second auth system. v1's admin authentication is gone along with the admin API it protected (Section 2). One auth system for the whole product, not two.

## 6. Deployment

- **Environments:** Production + Vercel Preview Deployments per pull request (replacing v1's separate persistent staging environment). A fund-data PR, or a code PR, gets a real preview URL to check before merge — same safety property as staging, without a second environment to keep provisioned and in sync.
- **CI/CD:** GitHub Actions — lint/type-check/tests on every PR; merge to `main` deploys to production. Fund data changes go through this exact same pipeline, which is what makes "review before it goes live" a property of the process rather than a bolted-on manual step.
- **Migrations:** Prisma Migrate, run in CI — now a much smaller surface, three tables instead of six.

## 7. Security

- HTTPS by default (Vercel).
- Input validation (Zod) on the three remaining API routes (`saved`, `newsletter`, auth callback) — a much smaller validation surface than v1's five-plus endpoints.
- No admin write path into fund data exists (Section 2) — removes what v1 called "the single highest-consequence part of the system" by not building it at all, rather than hardening it.
- UK GDPR: data export/deletion via manual admin script at MVP scale (unchanged from v1 — this was already appropriately minimal).
- Regulatory-boundary enforcement at the schema level (unchanged principle from v1): `users` and `saved_comparisons` still deliberately hold no age/income/risk-tolerance/portfolio fields. Any future addition of such fields is a product decision, not a routine migration.
- No FMP API key exposure — the cron job is the only thing that calls it, server-side only.

## 8. Caching

Next.js ISR only, at the page level — fund pages revalidate on the same schedule as the performance-data cron job. No separate caching layer. If a specific performance bottleneck shows up under real traffic, that's a reason to add targeted caching then, backed by an actual metric — not a reason to build it now speculatively.

## 9. Search

Unchanged in scope from v1 (fund typeahead only, not site-wide — see the earlier scope clarification), but now genuinely simpler in implementation: Fuse.js runs client-side against the fund list, which is already present in the page as static build-time data. No `/api/funds` endpoint, no server round-trip per keystroke.

## What this version cost, honestly

Two things got harder, and it's worth naming them rather than pretending the simplification was free:

1. Fund static data is no longer queryable via SQL — if a future feature needs to filter/sort the curated list by fee or region at scale, that logic now lives in application code over JSON rather than a database query. Completely fine at 30–50 records; would need revisiting well before this dataset reaches the hundreds.
2. Updating fund data requires a deploy, not just a database write. This is the same trade already made deliberately for the security benefit in Section 2 — treated here as a feature (forces review) rather than a limitation, but it does mean fee updates can't happen faster than the CI pipeline runs, which is a real constraint if a same-day correction is ever needed. Mitigate with a documented fast-path (a tagged "hotfix" PR that skips the normal review queue but still deploys through the same pipeline) rather than a separate emergency admin write path that would reopen the exact risk this design removed.
