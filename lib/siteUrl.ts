// The one place this app decides "what's my own public URL" — every
// canonical/OG/JSON-LD/robots/sitemap URL reads from here, not from an
// inline env var read of its own.
//
// Milestone 6 completion audit found the previous version of this reused
// AUTH_URL, which per .env.example is explicitly "not required in most
// Vercel deployments" (NextAuth infers it automatically) and, being a
// single fixed value, can never track Vercel's per-PR preview URLs
// anyway. In the realistic case where AUTH_URL wasn't manually set,
// production and every preview deployment silently generated SEO
// metadata pointing at localhost. Worse, `new URL(process.env.AUTH_URL ??
// fallback)` throws if AUTH_URL is set to an empty string rather than
// left unset, since `??` only catches null/undefined — a real crash risk
// duplicated across four files.
//
// Fix: read from what Vercel actually provides for exactly this problem.
// VERCEL_PROJECT_PRODUCTION_URL is the stable production domain when one
// exists; VERCEL_URL is set on every deployment including previews, so a
// preview build correctly gets its own preview URL instead of a stale
// fixed value. Both are plain hostnames (no protocol), matching Vercel's
// documented shape. Never throws: this returns a string, and the one
// caller that needs a URL object (metadataBase) constructs it itself —
// there's no path here where an env var's contents can reach `new URL()`
// unvalidated.
export function resolveSiteUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  if (env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
