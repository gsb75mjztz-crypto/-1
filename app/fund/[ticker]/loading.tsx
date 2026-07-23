import { Container } from "@/components/layout/Container";

// Route-level loading fallback — mainly covers an ISR revalidation
// request that has to regenerate this page on demand (Technical
// Architecture Section 8's daily revalidate window) rather than serve a
// cached copy instantly. Plain text, not a skeleton layout: this page is
// still, at build time, a small handful of curated funds, so investing in
// a full skeleton for what's normally a sub-second wait isn't
// proportionate yet.
export default function FundLoading() {
  return (
    <Container>
      <p className="text-secondary" role="status">
        Loading fund data…
      </p>
    </Container>
  );
}
