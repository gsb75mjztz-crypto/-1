import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

// Auth architecture only — per the Technical Architecture (Section 5) and
// Legal Principles doc: magic-link email, no passwords, one auth system for
// the whole product. This wires the provider and adapter so the schema and
// API route are real and correct; it does NOT build the account UI/flow
// (sign-in form, session-aware nav, saved comparisons) — that's Week 5 per
// the Development Roadmap, out of scope for this foundation milestone.
//
// Session strategy is JWT, not database sessions: consistent with the
// architecture's "no Redis, minimal footprint" stance — the Session table
// exists only because the Prisma adapter's generated code expects it,
// not because this app populates it in normal operation.
//
// The Nodemailer provider validates its config eagerly, at module-import
// time, not lazily on first sign-in — so a build (or CI run) with no real
// SMTP configured yet would otherwise fail outright. Falling back to an
// inert placeholder keeps `npm run build` and `next build` working in every
// environment; nothing in this milestone actually sends mail, and a real
// EMAIL_SERVER value in the deployment environment takes over automatically
// once it's configured (see .env.example).
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Nodemailer({
      server: process.env.EMAIL_SERVER ?? "smtp://localhost:25",
      from:
        process.env.EMAIL_FROM ?? "InvestorHub <noreply@investorhub.invalid>",
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
  },
});
