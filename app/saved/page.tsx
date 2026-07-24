import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

// Auth-gating deliberately not implemented — accounts aren't built in this
// foundation milestone (see lib/auth.ts).
//
// noindex while this is stub "Coming soon" content, same reasoning as
// app/auth/sign-in/page.tsx.
export const metadata: Metadata = {
  title: "Saved",
  robots: { index: false, follow: true },
};
// Launch-prep pass: dropped the "Development Roadmap Week 5" note — see
// app/contact/page.tsx for the same reasoning.
export default function SavedPage() {
  return <PagePlaceholder title="Saved" />;
}
