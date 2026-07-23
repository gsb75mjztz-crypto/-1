import type { MetadataRoute } from "next";
import { getAllFunds } from "@/lib/funds";
import { SITE_URL } from "@/lib/siteUrl";

// Milestone 6 — production readiness. Lists only genuinely indexable
// pages: the four static pages with real, final content, plus every
// curated fund's page. Deliberately excludes Terms/Privacy (draft,
// noindex until solicitor sign-off) and the still-stub Contact/Sign-in/
// Saved/Newsletter-confirm pages (noindex "Coming soon" content) — a
// sitemap listing a page marked noindex sends a crawler a contradictory
// signal, so this stays in sync with each page's own `robots` metadata
// rather than just enumerating every route that exists.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE_URL}/compare`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/calculator`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/methodology`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const fundPages: MetadataRoute.Sitemap = getAllFunds().map((fund) => ({
    url: `${SITE_URL}/fund/${fund.ticker.toLowerCase()}`,
    lastModified: fund.lastReviewed,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticPages, ...fundPages];
}
