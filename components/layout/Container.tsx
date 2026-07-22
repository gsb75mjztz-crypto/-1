import type { ReactNode } from "react";
import styles from "./Container.module.css";

// Shared page-content wrapper — consistent max-width and side padding
// (single-column, mobile-first per Design System Section 5) so every page
// aligns under the header/footer without repeating the same wrapper markup.
export function Container({ children }: { children: ReactNode }) {
  return <div className={styles.container}>{children}</div>;
}
