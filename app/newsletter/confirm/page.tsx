import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

// noindex — a one-time confirmation destination reached only via an
// emailed link, not a page anyone should land on from search.
export const metadata: Metadata = {
  title: "Confirm your subscription",
  robots: { index: false, follow: false },
};

export default function NewsletterConfirmPage() {
  return (
    <PagePlaceholder
      title="Newsletter confirmation"
      note="Double opt-in confirmation — Development Roadmap Week 5."
    />
  );
}
