import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

// noindex — a one-time confirmation destination reached only via an
// emailed link, not a page anyone should land on from search.
export const metadata: Metadata = {
  title: "Confirm your subscription",
  robots: { index: false, follow: false },
};

// Launch-prep pass: dropped the "Development Roadmap Week 5" note — see
// app/contact/page.tsx for the same reasoning. This one matters slightly
// more: it's reached only by clicking a real, already-sent email link, so
// a visitor here has just taken a real action and deserves a page that
// doesn't read like an internal planning doc leaked into their inbox.
export default function NewsletterConfirmPage() {
  return <PagePlaceholder title="Confirm your subscription" />;
}
