# InvestorHub

ETF research & decision tool for active beginner investors. See `/docs` for
the full product brief, PRD, design system, and technical architecture —
those documents are the source of truth for this build.

This repo is currently at **Milestone 3: ETF pages** — foundation,
homepage/trust pages, and individual ETF detail pages (real, sourced data
for a curated starter set of funds) are in place. Comparison and calculator
functionality are not implemented yet; see
`docs/InvestorHub-development-roadmap.md` for what ships in which week.

## Stack

Next.js (App Router) · TypeScript · PostgreSQL + Prisma · Auth.js (magic
link) · Vercel

## Getting started

```bash
npm install
cp .env.example .env    # then fill in DATABASE_URL, AUTH_SECRET, etc.
npx prisma migrate dev  # applies the schema to your database
npm run db:seed         # loads real performance figures for the curated funds
npm run dev
```

## Scripts

| Command                  | Does                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `npm run dev`            | Start the dev server                                                                                   |
| `npm run build`          | Production build (requires a reachable DB — ETF pages fetch performance data via Prisma at build time) |
| `npm run start`          | Run a production build                                                                                 |
| `npm run lint`           | ESLint                                                                                                 |
| `npm run format`         | Prettier — write                                                                                       |
| `npm run format:check`   | Prettier — check only                                                                                  |
| `npm run db:seed`        | Load `fund_performance` with the curated funds' real figures                                           |
| `npm run update-fund`    | Update one field on a fund (see below)                                                                 |
| `npx prisma migrate dev` | Apply schema changes locally                                                                           |
| `npx prisma studio`      | Browse the database                                                                                    |

### Updating fund data

```bash
npm run update-fund -- --ticker VWRP --field ocf --value 0.14 \
  --source "Vanguard Official Factsheet" --date 2026-07-28
```

Validates the result against `lib/fundSchema.ts` and appends to the fund's
`history` array before writing — see `docs/InvestorHub-data-strategy.md`
Section 4.

## Project structure

```
/app                 Next.js App Router routes (pages + /api route handlers)
/app/fund/[ticker]   ETF detail pages (SSG from /data/funds + Prisma)
/components/layout   Header, Footer, Container — shared page chrome
/components/etf      Fund-page-specific components (allocation tables,
                      confidence-badge source attribution, tabs, etc.)
/data/funds          Curated fund data as version-controlled JSON — real,
                      sourced data for a starter set; see
                      docs/InvestorHub-data-strategy.md
/lib                 Prisma client, auth config, fund data loader +
                      validation schema, confidence-badge logic
/prisma              Schema + migrations + seed script
/scripts             update-fund.ts — the documented fund-data CLI
/docs                Product documentation (source of truth)
```
