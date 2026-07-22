import { Container } from "@/components/layout/Container";
import styles from "./PagePlaceholder.module.css";

// Shared shape for the sitemap pages that still exist as routes without
// real content/business logic (ETF functionality — Comparison, Calculator,
// Fund pages, Saved, Sign-in — all remain out of scope through Milestone 2
// as well). Keeps every stub page visually consistent instead of
// hand-rolling the same wrapper markup.
export function PagePlaceholder({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <Container>
      <h1>{title}</h1>
      <p className="text-secondary">Coming soon.</p>
      {note && <p className={styles.note}>{note}</p>}
    </Container>
  );
}
