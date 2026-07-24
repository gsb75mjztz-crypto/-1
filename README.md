# InvestorHub

ETF research & decision tool for active beginner investors. See `/docs` for
the full product brief, PRD, design system, and technical architecture —
those documents are the source of truth for this build.

This repo is currently at **Milestone 8: production readiness** — ETF
pages, the Comparison Tool, the Growth & Fee-Drag Calculator, SEO/
accessibility/error-handling hardening, a committed unit + E2E test suite,
and now deployment configuration (security headers, caching, analytics)
are all in place. **Save/Account/Newsletter (Development Roadmap Week 5)
is the one piece of the original MVP loop not yet built** — Sign in and
Saved are still placeholder pages. See
`docs/InvestorHub-development-roadmap.md` for the full week-by-week plan,
and `handover/technical-debt-register.md` for what's knowingly deferred
and why.

See **`DEPLOYMENT.md`** for getting this running in production, and
**`MAINTENANCE.md`** for day-to-day operational reference once it's live.

## Stack

Next.js (App Router) · TypeScript · PostgreSQL + Prisma · Auth.js (magic
link) · Vercel · Playwright + axe-core

## Getting started

```bash
npm install
cp .env.example .env    # then fill in DATABASE_URL, AUTH_SECRET, etc.
npx prisma migrate dev  # applies the schema to your database
npm run db:seed         # loads real performance figures for the curated funds
npm run dev
```

## Scripts

| Command                  | Does                                                                                                                                                                                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`            | Start the dev server                                                                                                                                                                                                                                                                      |
| `npm run build`          | Production build (requires a reachable DB — ETF pages fetch performance data via Prisma at build time)                                                                                                                                                                                    |
| `npm run start`          | Run a production build                                                                                                                                                                                                                                                                    |
| `npm run lint`           | ESLint                                                                                                                                                                                                                                                                                    |
| `npm run format`         | Prettier — write                                                                                                                                                                                                                                                                          |
| `npm run format:check`   | Prettier — check only                                                                                                                                                                                                                                                                     |
| `npm test`               | Unit tests (`lib/**/*.test.ts`, `node:test`) — 111 tests                                                                                                                                                                                                                                  |
| `npm run test:e2e`       | Playwright E2E suite — 43 tests (critical flows, responsive, axe-core accessibility, performance, calculator/comparison accuracy, failure-state). Requires a built app running on `localhost:3000` (or lets Playwright start one itself — see `playwright.config.ts`) and a reachable DB. |
| `npm run db:seed`        | Load `fund_performance` with the curated funds' real figures                                                                                                                                                                                                                              |
| `npm run update-fund`    | Update one field on a fund (see below)                                                                                                                                                                                                                                                    |
| `npx prisma migrate dev` | Apply schema changes locally                                                                                                                                                                                                                                                              |
| `npx prisma studio`      | Browse the database                                                                                                                                                                                                                                                                       |

### Updating fund data

```bash
npm run update-fund -- --ticker VWRP --field ocf --value 0.14 \
  --source "Vanguard Official Factsheet" --date 2026-07-28
```

Validates the result against `lib/fundSchema.ts` and appends to the fund's
`history` array before writing — see `docs/InvestorHub-data-strategy.md`
Section 4.

### Known upcoming data changes

- **VWRP OCF: 0.19% → 0.14%, effective 2026-07-28.** Per Vanguard's
  shareholder notice dated 2026-07-21, not yet reflected in
  `data/funds/VWRP.json` — the current OCF is correct as of today, and
  changing it before the effective date would misstate the fund's current
  fees. On or after 2026-07-28, run:
  ```bash
  npm run update-fund -- --ticker VWRP --field ocf --value 0.14 \
    --source "Vanguard shareholder notice, 2026-07-21" --date 2026-07-28
  ```

## Project structure

```
/app                 Next.js App Router routes (pages + /api route handlers)
/app/fund/[ticker]   ETF detail pages (SSG from /data/funds + Prisma)
/app/compare         Comparison Tool
/app/calculator      Growth & Fee-Drag Calculator
/components/layout   Header, Footer, Container — shared page chrome
/components/etf      Fund-page-specific components (allocation tables,
                      confidence-badge source attribution, tabs, etc.)
/components/compare  Fund search/typeahead, comparison results
/components/calculator  Chart, results, methodology breakdown
/data/funds          Curated fund data as version-controlled JSON — real,
                      sourced data for a starter set; see
                      docs/InvestorHub-data-strategy.md
/lib                 Prisma client, auth config, fund data loader +
                      validation schema, confidence-badge logic, growth/
                      overlap calculations, ISIN validation, site-URL
                      resolution — pure functions, each with a co-located
                      *.test.ts
/e2e                 Playwright integration/accessibility/responsive/
                      performance suite (see MAINTENANCE.md)
/prisma              Schema + migrations + seed script
/scripts             update-fund.ts — the documented fund-data CLI
/docs                Product documentation (source of truth)
/handover            Milestone-by-milestone narrative history + the
                      technical debt register
```
