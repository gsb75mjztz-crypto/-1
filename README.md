# InvestorHub

ETF research & decision tool for active beginner investors. See `/docs` for
the full product brief, PRD, design system, and technical architecture —
those documents are the source of truth for this build.

This repo is currently at **Milestone 1: Foundation** — project structure,
tooling, database schema, and auth architecture are in place. No business
features (comparison tool, calculator, accounts) are implemented yet; see
`docs/InvestorHub-development-roadmap.md` for what ships in which week.

## Stack

Next.js (App Router) · TypeScript · PostgreSQL + Prisma · Auth.js (magic
link) · Vercel

## Getting started

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL, AUTH_SECRET, etc.
npx prisma migrate dev # applies the schema to your database
npm run dev
```

## Scripts

| Command                  | Does                         |
| ------------------------ | ---------------------------- |
| `npm run dev`            | Start the dev server         |
| `npm run build`          | Production build             |
| `npm run start`          | Run a production build       |
| `npm run lint`           | ESLint                       |
| `npm run format`         | Prettier — write             |
| `npm run format:check`   | Prettier — check only        |
| `npx prisma migrate dev` | Apply schema changes locally |
| `npx prisma studio`      | Browse the database          |

## Project structure

```
/app                 Next.js App Router routes (pages + /api route handlers)
/components/layout   Header, Footer, Container — shared page chrome
/data/funds          Curated fund data as version-controlled JSON (empty
                      until Week 2's data curation track — see
                      docs/InvestorHub-data-strategy.md)
/lib                 Prisma client singleton, auth config
/prisma              Schema + migrations
/scripts             Data-ingestion tooling (empty until Week 2)
/docs                Product documentation (source of truth)
```
