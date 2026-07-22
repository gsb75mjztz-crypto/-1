import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires an explicit driver adapter at runtime (the built-in
// query engine binary is gone — see prisma.config.ts for the migration-time
// equivalent). `pg` speaks plain Postgres wire protocol, so this works
// unchanged against either of the docs' proposed hosts (Supabase or Neon).
//
// Standard Next.js singleton pattern: in dev, Next's hot-reload would
// otherwise create a new PrismaClient (and a new connection pool) on every
// file save.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Deliberately not a throw: this module is imported at build time by
    // any route that touches auth (lib/auth.ts -> PrismaAdapter), and
    // Next.js evaluates route modules during `next build`'s page-data
    // collection step even for routes with no static generation. A missing
    // DATABASE_URL should fail loudly the moment a query actually runs
    // (pg's own connection error does that clearly), not break the build
    // for anyone who hasn't provisioned a database yet — see
    // .env.example.
    console.warn(
      "DATABASE_URL is not set — database queries will fail at request time. Copy .env.example to .env and configure it.",
    );
  }

  const adapter = new PrismaPg({ connectionString: connectionString ?? "" });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
