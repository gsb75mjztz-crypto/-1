import { Container } from "@/components/layout/Container";

// Shared shape for the sitemap pages that exist as routes in this
// foundation milestone but whose real content/business logic ships in a
// later Development Roadmap week (noted per page). Keeps every stub page
// visually consistent instead of hand-rolling the same wrapper markup.
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
      <p style={{ color: "var(--color-text-secondary)" }}>Coming soon.</p>
      {note && (
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--text-caption)",
          }}
        >
          {note}
        </p>
      )}
    </Container>
  );
}
