import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

// noindex while this is stub "Coming soon" content, same reasoning as
// app/auth/sign-in/page.tsx.
export const metadata: Metadata = {
  title: "Contact",
  robots: { index: false, follow: true },
};

export default function ContactPage() {
  return (
    <PagePlaceholder
      title="Contact"
      note="Includes the data-issue report path — Development Roadmap Week 6."
    />
  );
}
