# Milestone 1 — Foundation

**Status:** Complete, approved, tagged `v1.0`.

## Objective

Foundation only: repo scaffold, database schema, magic-link auth wiring, and the base design-system components (Button, Card, Input, Badge) — matching Development Roadmap Week 1's scope, though not run as a literal "Week 1" against a calendar.

## What was built

- Next.js (App Router) + TypeScript + Prisma 7 project scaffold. Prisma 7's driver-adapter requirement meant the database connection URL lives in `prisma.config.ts`, not `schema.prisma` — a Prisma-version detail worth knowing before touching either file.
- Prisma schema: `User`, `SavedComparison`, `SavedComparisonFund` (product data) plus `Account`, `Session`, `VerificationToken` (Auth.js adapter requirement, not product data — documented inline in `schema.prisma`).
- Auth.js (`next-auth` v5 beta) wired with the Nodemailer magic-link provider and the Prisma adapter, JWT session strategy. The API route (`/api/auth/[...nextauth]`) and provider config (`lib/auth.ts`) are real; the sign-in *page* is a placeholder — building the actual sign-in form was explicitly deferred to Week 5 per the roadmap.
- Base design-system components: `Button`, `Card`, `Input`, `Badge` (`components/ui/`), built to `docs/InvestorHub-design-system.md`'s token/spec.
- `lib/cn.ts` — small classname-merge helper (added during the audit fix round, see below).

## Audit history

**First audit — NOT APPROVED.** Findings:
- `Session` model had no primary key, only a unique index on `sessionToken` — not a real PK.
- No index on the foreign-key columns (`userId`) on `SavedComparison`, `Account`, `Session` — every "this user's X" query would have been a sequential scan.
- Base UI components (Button/Card/Input/Badge) were missing entirely at the time of the first audit pass.

**Resolution:** added a real `id String @id @default(uuid()) @db.Uuid` to `Session` (matching the official Auth.js Prisma adapter reference schema), added `@@index([userId])` to all three FK columns, built the four missing components. Re-verified against a real local Postgres migration, not just a schema read.

**Second audit — APPROVED.** Tagged `v1.0`.

## Key decisions worth knowing

- Auth.js's Prisma adapter unconditionally references `Account`/`Session`/`VerificationToken` models even though this app uses JWT sessions (not database sessions) — those tables exist as required plumbing, not because the app populates them in normal operation. Don't be surprised the `Session` table stays empty in practice.
- The Nodemailer provider validates its config eagerly at module-import time. Without a fallback, `next build` would fail in any environment without real SMTP configured. `lib/auth.ts` falls back to an inert `smtp://localhost:25` config so builds stay green everywhere — **this fallback is silent** (no warning logged), which the Project Health Review flags as a real risk if `EMAIL_SERVER` is ever left unset in an actual production deploy: the app would build and deploy fine while silently never sending a single magic link.

## Open items carried forward

- Sign-in page, `/api/newsletter`, `/api/saved` are all real routes/pages but stub content (`501` responses, "Coming soon" placeholders) — intentionally, per the roadmap's own week sequencing. Not a defect at the time, but see `Milestone-3.md` and the Project Health Review for why this stayed stubbed for longer than the roadmap intended.
- No CI pipeline was set up in this milestone, despite Technical Architecture Section 6 specifying one. Still not built as of Milestone 3 — flagged as a High-severity gap in the Project Health Review.
