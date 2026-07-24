import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

// Font decision per Design System Section 2: Inter (UI) + Fraunces
// (display/editorial only, never data/UI chrome). Both self-hosted via
// next/font — no runtime request to Google Fonts, no CLS from a late
// font swap, and it keeps the product on the £0 licensing cost NFR-10
// assumes.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

// Milestone 6 — SEO baseline. `metadataBase` comes from lib/siteUrl.ts,
// which correctly tracks Vercel's production/preview URLs (see that
// file's comment for the bug this replaces). `title.template` lets every
// page set just its own short title via `export const metadata` and get
// " | InvestorHub" appended automatically — the fix for every non-fund
// page previously sharing this exact same title/description, which is a
// real duplicate-title SEO problem, not just a cosmetic one.
const DEFAULT_DESCRIPTION =
  "Compare ETFs, understand the numbers, and see what a fee difference really costs — built for active beginner investors.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "InvestorHub",
    template: "%s | InvestorHub",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    siteName: "InvestorHub",
    title: "InvestorHub",
    description: DEFAULT_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "InvestorHub",
    description: DEFAULT_DESCRIPTION,
  },
};

// Site-wide structured data — Organization + WebSite only. Deliberately
// no Rating/Review/AggregateRating/Offer anywhere in this product's
// structured data, on fund pages or here: Legal Principles Section 3's
// "no verdict, ranking, or 'better choice' language, anywhere in the
// product's output" applies just as much to markup a crawler reads as to
// copy a person reads — a rich-result star rating would be exactly the
// kind of implied endorsement the whole product is built to avoid, even
// though nothing here currently emits one.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "InvestorHub",
      url: SITE_URL,
    },
    {
      "@type": "WebSite",
      name: "InvestorHub",
      url: SITE_URL,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        {/* JSON-LD requires a raw <script> body — the payload above is
            static, project-owned data, not user input. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        {/* Milestone 8 — Vercel Web Analytics: aggregate page-view counts
            only, cookie-less, no persistent per-visitor identifier, posts
            to a same-origin path in production (see next.config.ts's CSP
            comment). Consistent with Legal Principles Section 4's data
            minimisation stance and disclosed in app/privacy/page.tsx. */}
        <Analytics />
      </body>
    </html>
  );
}
