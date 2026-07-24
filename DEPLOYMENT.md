# Deployment

This covers getting InvestorHub running in production on Vercel — the
hosting choice Technical Architecture Section 11 commits to, with per-PR
preview deployments replacing a separate staging environment.

**Technical deployment readiness is not the same as launch readiness.**
Everything below gets the app correctly running in production. It does not
satisfy Legal Principles Section 8's solicitor sign-off gate (Terms,
Privacy, the comparison tool's copy, the confidence badge tooltip, and the
FMP data licence all still need real legal/licensing confirmation before
this is opened to the public) or the still-unrun validation sprint
(`docs/InvestorHub-validation-sprint.md`, `handover/technical-debt-register.md`
entry #2). Those are product/business decisions, not engineering ones —
this document doesn't make the call on either.

## Prerequisites

- A **Vercel** account with this repo connected (or forked/imported).
- A **Postgres** database. Technical Architecture names Supabase or Neon;
  any standard Postgres connection string works via the `pg` driver
  adapter (`lib/prisma.ts`) — no Vercel-specific database is required.
- An **SMTP provider** for magic-link email (Resend, Postmark, SES, or
  equivalent) — Auth.js's Nodemailer provider needs real credentials to
  actually send mail (see `lib/auth.ts`'s comment: the build stays green
  without one, but sign-in won't work until it's configured).
- **GitHub Actions** already runs on this repo (`.github/workflows/ci.yml`)
  — no separate CI setup needed, just don't disable required checks on
  `main` if branch protection is added later.

## Environment variables

Full reference with rationale: `.env.example`. Required for a working
production deploy:

| Variable             | Required              | Notes                                                                                                                                                                                                                                                                                                                |
| -------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Yes                   | Needed at **build** time, not just request time — `/fund/[ticker]` pages fetch performance data via Prisma during static generation. A build with no reachable database fails by design (Milestone 3).                                                                                                               |
| `AUTH_SECRET`        | Yes                   | `npx auth secret` to generate.                                                                                                                                                                                                                                                                                       |
| `EMAIL_SERVER`       | Yes, for real sign-in | Build succeeds without it; magic-link email won't send until it's set.                                                                                                                                                                                                                                               |
| `EMAIL_FROM`         | Yes, for real sign-in | Same as above.                                                                                                                                                                                                                                                                                                       |
| `CRON_SECRET`        | Yes                   | Any long random string — checked by `/api/cron/refresh-performance` to reject non-Vercel-Cron requests.                                                                                                                                                                                                              |
| `AUTH_URL`           | No                    | NextAuth infers this automatically on Vercel in most cases. Set explicitly only if sign-in redirects misbehave. **Not** used for SEO/canonical URLs (see `lib/siteUrl.ts` — that resolves from Vercel's own `VERCEL_URL`/`VERCEL_PROJECT_PRODUCTION_URL`, set automatically on every deployment including previews). |
| `FMP_API_KEY`        | No, not yet           | Commented out in `.env.example` — the FMP integration is still scaffolding (`app/api/cron/refresh-performance/route.ts` returns 501), blocked on the Week 0 licensing confirmation per Legal Principles Section 5. Do not set this until that confirmation exists in writing.                                        |
| `NEWSLETTER_API_KEY` | No, not yet           | Same status — Week 5, not built.                                                                                                                                                                                                                                                                                     |

Set these in Vercel's Project Settings → Environment Variables, scoped to
Production (and Preview, if you want preview deployments to fully work
rather than just build).

## First deploy

1. Import the repo into Vercel. Build settings are auto-detected (Next.js
   App Router) — no custom build/output command needed.
2. Set the environment variables above in Vercel's dashboard.
3. Provision the Postgres database and apply the schema:
   ```bash
   DATABASE_URL="<production-url>" npx prisma migrate deploy
   DATABASE_URL="<production-url>" npm run db:seed
   ```
   Run this from your own machine or CI against the production
   `DATABASE_URL` before the first deploy — the app's build step doesn't
   run migrations itself (Technical Architecture's deliberate separation
   of "review before it goes live" from the build/deploy mechanics).
4. Push to `main` (or trigger a deploy from Vercel's dashboard for the
   first one). CI (`.github/workflows/ci.yml`) runs lint/typecheck/unit
   tests/E2E suite/build on every PR; merging to `main` is what actually
   deploys, per Technical Architecture Section 6.
5. **Verify the deployment** (see checklist below) before treating it as
   live.

## Cron

`vercel.json` already declares the daily performance-refresh cron
(`0 6 * * *` UTC). Vercel registers this automatically on deploy — no
separate setup. Confirm it in Vercel's dashboard under Cron Jobs after the
first deploy, and confirm `CRON_SECRET` is set (the route rejects requests
without the matching `Authorization: Bearer <CRON_SECRET>` header — see
`app/api/cron/refresh-performance/route.ts`).

Note this endpoint is currently a 501 stub (FMP not wired yet) — the cron
will fire on schedule and get a 501 response, which is expected, not a
failure, until FMP is actually integrated.

## Custom domain

Add the domain in Vercel's Project Settings → Domains. `lib/siteUrl.ts`
picks up `VERCEL_PROJECT_PRODUCTION_URL` automatically once a custom
domain is the assigned production domain — no code or env var change
needed for canonical URLs, sitemap, robots.txt, or structured data to
follow correctly.

## Region

`vercel.json` pins `regions: ["lhr1"]` (London) — this product's stated
audience and regulatory framing (UK GDPR, FCA) are UK-specific throughout
every doc in `/docs`, so pinning Function execution there reduces latency
for the primary audience. Region pinning for Serverless Functions requires
a Vercel plan that supports it (Hobby auto-selects and may ignore this) —
confirm it actually took effect in the deployment's Function logs/region
indicator, not just by trusting the config.

## Post-deploy verification checklist

Things that can't be verified from this environment and need a real,
deployed URL:

- [ ] Security headers present (`curl -I https://<domain>/` — Content-
      Security-Policy, X-Frame-Options, Strict-Transport-Security, etc.;
      configured in `next.config.ts`, verified locally against a
      production build during Milestone 8, but Vercel's edge layer can
      still add/modify headers — confirm the deployed response matches).
- [ ] `/_vercel/insights/script.js` loads without a 404 (this route only
      exists on Vercel's actual platform — it 404s in any local/self-
      hosted `next start`, which is expected there, not a bug; it must
      resolve on the real deployment for Analytics to work at all).
- [ ] Magic-link sign-in actually sends and delivers an email.
- [ ] The daily cron job appears in Vercel's dashboard and its next-run
      time is correct.
- [ ] `robots.txt` and `sitemap.xml` resolve to the real production
      domain, not `localhost` (would indicate `lib/siteUrl.ts`'s
      resolution failed — see that file's comments for the exact bug this
      guards against).
- [ ] A real Lighthouse run against the live URL, network-throttled —
      NFR-1's actual "<2s on mobile" claim has never been measured (only
      a local, unthrottled gross-regression check exists —
      `e2e/performance.spec.ts`, `technical-debt-register.md` entry #4).

## Rollback

Vercel keeps every deployment. From the dashboard: Deployments → find the
last known-good one → "Promote to Production" (instant, no rebuild). From
the CLI: `vercel rollback`. No code revert or redeploy needed for a fast
rollback — that's the whole point of Vercel's immutable-deployment model.

Fund-data corrections specifically go through the same PR pipeline as code
(Technical Architecture Section 6's "review before it goes live" — see
`MAINTENANCE.md` for the documented same-day-correction fast path).
