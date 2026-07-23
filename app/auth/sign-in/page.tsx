import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

// The API route (/api/auth/[...nextauth]) and provider config (lib/auth.ts)
// are real. This page is intentionally a placeholder — the working sign-in
// form is Week 5 per the Development Roadmap ("do not build user accounts
// yet" per this milestone's brief).
//
// noindex while this is stub "Coming soon" content — thin placeholder
// content is exactly what shouldn't be indexed. Remove once the real
// sign-in form ships.
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
};
export default function SignInPage() {
  return (
    <PagePlaceholder
      title="Sign in"
      note="Magic-link sign-in — Development Roadmap Week 5."
    />
  );
}
