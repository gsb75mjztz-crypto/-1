# Maintenance

Operational reference for running InvestorHub day to day, once deployed.
See `DEPLOYMENT.md` for getting it live in the first place, and
`handover/technical-debt-register.md` for known, deliberately-deferred
gaps — several of the "watch out for this" items below point back to
specific entries there rather than repeating the full reasoning.

## Fund data updates

Routine correction (README.md has the full command):

```bash
npm run update-fund -- --ticker VWRP --field ocf --value 0.14 \
  --source "Vanguard Official Factsheet" --date 2026-07-28
```

Validates against `lib/fundSchema.ts` (including the ISIN check-digit
validation added Milestone 7) and appends to the fund's `history` array
before writing. Goes through a normal PR — CI runs the full suite
(lint/typecheck/unit tests/E2E, including `lib/dataIntegrity.test.ts`,
which checks the real curated files, not just the schema in the
abstract) before it can merge.

### Same-day correction fast path

Technical Architecture Section 11 names a real operational constraint:
fund data changes require a deploy, not a database write, which is a
deliberate security/review trade-off (Section 2), but means a fee
correction can't ship faster than the CI pipeline runs. The doc calls for
"a documented fast-path (a tagged 'hotfix' PR that skips the normal review
queue but still deploys through the same pipeline)" — this is that
documentation, since it didn't exist anywhere until now:

1. Branch from `main`, make the single data change via `update-fund` (not
   a hand-edited JSON file — the CLI's validation and history-append are
   the point).
2. Open a PR titled `hotfix: <ticker> <field> correction`. CI still runs
   in full — this fast-path skips _discretionary human review time_, not
   the automated safety net.
3. A second person (not whoever entered the correction) approves and
   merges as soon as CI is green — same rule as the Development Roadmap's
   "Data accuracy audit" requirement (cross-checked by someone other than
   the original entry), just compressed to same-day instead of batched.
4. Merge deploys through the exact same pipeline as any other change —
   no separate emergency write path, which is precisely what this design
   was built to avoid needing.

## Dependency updates

`npm audit` currently reports pre-existing high/moderate findings, all
transitive from `next@16.2.11`'s own `postcss`/`sharp` dependencies (not
from anything added in Milestones 7-8 — confirmed via `npm ls` during the
Milestone 7 audit). `npm audit fix --force` would downgrade Next to
`9.3.3`, which is unacceptable — don't run it. The real fix is a normal
Next.js version bump when one's next planned, at which point re-run
`npm audit` to confirm it's actually resolved rather than assuming a
version bump fixed it.

Playwright's browser binaries (`e2e/`, CI's `npx playwright install`) are
pinned to whatever `@playwright/test`'s version resolves to in
`package-lock.json` — bump deliberately, not automatically, and re-run
the full E2E suite after, since a browser version bump can itself
surface new rendering differences.

## Database

- **Migrations:** `npx prisma migrate deploy` against production
  `DATABASE_URL` — not `migrate dev`, which is for local schema
  iteration only.
- **Backups:** depend on your Postgres provider (Supabase/Neon per
  Technical Architecture) — enable point-in-time recovery if the
  provider offers it; nothing in this codebase manages backups itself.
- **What actually depends on the database:** fund pages'
  `fund_performance` data (fetched via Prisma, both at build time for
  static generation and — once FMP is wired — via the daily cron), and
  the (not-yet-built) auth/saved-comparisons tables. The Comparison Tool
  and Calculator do **not** touch the database at all — their data is
  static JSON (`/data/funds`) and pure client-side math respectively.
- **Outage behaviour, actually verified, not assumed:** `/fund/[ticker]`
  pages are static (SSG + `revalidate: 86400`) — Milestone 7's
  `e2e/failure-state.spec.ts` confirmed directly that an already-built
  fund page keeps rendering correctly through a live database outage.
  `/compare` and `/calculator` are entirely unaffected regardless (no DB
  dependency). What _would_ break: any future request that needs a fresh
  Prisma query — a brand-new fund's first-ever page generation, or (once
  built) sign-in/saved-comparisons. `app/error.tsx` and
  `app/fund/[ticker]/error.tsx` exist as the boundary for that case, but
  — logged honestly in `technical-debt-register.md` entry #5 — the
  boundary's own render path has never been directly observed, only
  reasoned about; the SSG-survives-outage guarantee is what's actually
  confirmed.

## Monitoring — recommendations, not yet implemented

Nothing beyond Vercel's own platform-level logs and the Milestone 8
Analytics integration (aggregate page views only) currently exists. For
when this is worth investing in:

- **Error tracking** (e.g. Sentry, or Vercel's own log drains) — right
  now a production error is only visible if someone happens to check
  Vercel's function logs. Given the product's regulatory sensitivity
  (a silently-broken confidence badge or disclaimer is a compliance
  problem, not just a UX one), this is the single highest-value addition
  once there's real traffic to monitor.
- **Cron failure alerting** — the daily performance-refresh cron
  (currently a 501 stub) has no alerting if it starts failing once FMP is
  wired. Vercel's dashboard shows cron run history but doesn't push a
  notification on failure by default.
- **Uptime monitoring** — NFR-9 targets 99.5%+ availability "visible and
  honestly communicated" on outage, not just quietly tolerated. A basic
  external uptime check (even a free-tier one) is what makes an outage
  _visible_ in the first place, before a user has to report it.

## Legal / compliance — recurring, not one-time

- Terms and Privacy (`app/terms`, `app/privacy`) are still draft, marked
  `noindex`, pending solicitor sign-off (Legal Principles Section 8).
  Don't let this quietly become "the drafts are fine, they've been up for
  months" — it's a launch gate, not a soft target.
- Any change to what data is collected or how (the Milestone 8 Analytics
  addition already got this treatment — see `app/privacy/page.tsx`'s
  Cookies section) needs the Privacy Policy updated _as part of that
  change_, per Legal Principles Section 4 — not batched into a later
  cleanup pass.
- `handover/technical-debt-register.md` entry #2 (the validation sprint)
  is the standing, largest-risk item on the whole project. It isn't a
  maintenance task with a checklist — it's a product decision this
  document doesn't make on your behalf.

## Quick reference — what to run before trusting a deploy

```bash
npm run lint && npx tsc --noEmit && npm run format:check
npm test              # 111 unit tests
npm run build
npm run test:e2e      # 43 E2E tests — requires a running build + reachable DB
```

All four are what CI already runs on every PR (`.github/workflows/ci.yml`)
— this is the same checklist, for running it locally before you're
confident enough to open the PR in the first place.
