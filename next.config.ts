import type { NextConfig } from "next";

// Milestone 8 — production readiness.
//
// Content-Security-Policy: 'unsafe-inline' on script-src and style-src is
// a deliberate, verified-necessary choice for this stack, not a shortcut.
// The completion-audit fix pass actually tried to remove it and checked
// the real built output before settling here:
//
// - Nonce-based CSP (Next's own documented pattern: middleware sets a
//   per-request nonce, Next threads it through app-render.js's
//   getScriptNonceFromHeader) requires every route to read the request's
//   headers() — and in the App Router, calling headers() in a Server
//   Component forces that route out of static rendering. Applied at the
//   root layout (needed, since the layout owns the JSON-LD <script>),
//   that would force every route — including /fund/[ticker], which
//   Technical Architecture explicitly builds as SSG and whose
//   already-built-page-survives-a-DB-outage guarantee (Milestone 7's
//   e2e/failure-state.spec.ts) depends on it staying static — to dynamic
//   rendering. That's a severe, undocumented regression traded for a CSP
//   tightening, not an acceptable one.
// - Hash-based CSP (script-src 'sha256-...') was the next option, since
//   hashes — unlike nonces — don't require a live request. It works for
//   the exact static content of this app's own two JSON-LD scripts. It
//   does not work for Next's own inline scripts: inspecting the actual
//   built HTML (.next/server/app/fund/vwrp.html) shows ~15+ inline
//   `self.__next_f.push(...)` RSC-hydration scripts per page, each
//   carrying that page's own serialized render tree — content that's
//   different per page and would require literally re-deriving Next's
//   render output at config-eval time to hash correctly. Not feasible.
//
// So: 'unsafe-inline' on script-src stays, for Next's own hydration
// scripts, not carelessly. style-src 'unsafe-inline' stays for a
// different, simpler reason — CSP nonces and hashes only apply to
// <style> elements, never to the `style="..."` HTML attribute at all
// (per spec), and this codebase has real `style={{...}}` props (e.g.
// components/calculator/GrowthChart.tsx's per-series colours,
// app/global-error.tsx's necessarily-bare styling) with no CSP mechanism
// that could ever cover them short of removing every one. Every other
// directive below is tightened to 'self' (or narrower), including
// object-src 'none' — CSP has no legitimate use for plugin content here
// and default-src 'self' alone doesn't say so explicitly. This is
// "reasonably strict, verified against the real build," not "as strict
// as CSP can be," and DEPLOYMENT.md says so rather than overclaiming.
//
// connect-src includes /_vercel/insights implicitly via 'self' — Vercel
// Web Analytics (Milestone 8) posts to a same-origin path in production,
// not a third-party domain, confirmed by reading @vercel/analytics'
// source before relying on it (no va.vercel-scripts.com allowance
// needed; that domain is debug-mode-only, not used in production).
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  // Belt-and-braces alongside frame-ancestors above — older browsers that
  // don't support CSP frame-ancestors still get clickjacking protection.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // This product needs none of these browser capabilities anywhere —
  // denying them outright rather than leaving the default (permissive)
  // policy an embedded/compromised third-party script could exploit.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // HSTS: Vercel serves HTTPS-only and typically sets this itself, but
  // set it explicitly so the guarantee doesn't depend on host defaults —
  // 2 years, includeSubDomains, preload-eligible.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Removes the `X-Powered-By: Next.js` response header — no reason to
  // hand a potential attacker a free framework fingerprint.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        // Milestone 8 — caching. Static, content-hashed build assets are
        // safe to cache forever; Next.js/Vercel already do this by
        // default for the /_next/static path, but set explicitly so the
        // guarantee is part of this repo, not an assumed host default.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // The generated favicon/apple-touch-icon are static per build but
        // not content-hashed in the URL — a short, revalidating cache
        // rather than immutable, so a future icon change doesn't require
        // a cache-busting URL change to actually show up for returning
        // visitors.
        source: "/(icon.svg|apple-icon)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
