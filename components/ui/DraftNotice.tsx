import type { ReactNode } from "react";
import styles from "./DraftNotice.module.css";

// Not in the Design System doc's component list — added for Milestone 2's
// Terms/Privacy pages specifically. Legal Principles Section 8 is explicit
// that real Terms/Privacy content needs solicitor sign-off before it ships
// as final, and the Milestone 1 placeholders said so too. Rather than
// either (a) not writing real content because it isn't reviewed yet, or
// (b) publishing it silently as if it were final, this renders a visible,
// unmissable notice on the page itself — the honest middle path. Uses
// --color-accent-secondary, which the Design System reserves for sparing,
// non-CTA use — a caution notice is exactly that use case.
export function DraftNotice({ children }: { children: ReactNode }) {
  return (
    <div role="note" className={styles.notice}>
      {children}
    </div>
  );
}
