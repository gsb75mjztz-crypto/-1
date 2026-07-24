import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

// noindex while this is stub "Coming soon" content, same reasoning as
// app/auth/sign-in/page.tsx.
export const metadata: Metadata = {
  title: "Contact",
  robots: { index: false, follow: true },
};

// Launch-prep pass: dropped the "Development Roadmap Week 6" note — an
// internal planning reference with no meaning to a visitor, and something
// a real first-time visitor could genuinely reach (this page is one click
// from the primary nav). "Coming soon." on its own is honest and
// sufficient; it doesn't claim anything the product doesn't yet do.
export default function ContactPage() {
  return <PagePlaceholder title="Contact" />;
}
