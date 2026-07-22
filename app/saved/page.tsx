import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

// Auth-gating deliberately not implemented — accounts aren't built in this
// foundation milestone (see lib/auth.ts).
export default function SavedPage() {
  return (
    <PagePlaceholder
      title="Saved"
      note="Saved comparisons — Development Roadmap Week 5."
    />
  );
}
