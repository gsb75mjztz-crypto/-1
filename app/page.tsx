import { Container } from "@/components/layout/Container";

export default function Home() {
  return (
    <Container>
      <h1 style={{ fontFamily: "var(--font-display)" }}>InvestorHub</h1>
      <p style={{ color: "var(--color-text-secondary)" }}>
        Project foundation in progress — the comparison tool and calculator ship
        in later milestones.
      </p>
    </Container>
  );
}
