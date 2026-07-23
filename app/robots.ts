import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

// Milestone 6 — production readiness. Only /api/ is disallowed here: API
// routes serve no purpose to a crawler and disallowing them saves crawl
// budget. Per-page noindex (Terms/Privacy while draft, the still-stub
// Contact/Sign-in/Saved/Newsletter-confirm pages) is handled via each
// page's own `robots` metadata instead of blocking them here — Google's
// own guidance is that robots.txt disallow prevents a crawler from ever
// seeing a page's noindex tag, which can be worse than just letting it
// crawl and correctly skip indexing.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
