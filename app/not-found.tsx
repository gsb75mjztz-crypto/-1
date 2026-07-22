import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function NotFound() {
  return (
    <Container>
      <h1>Page not found</h1>
      <p className="text-secondary">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/">Back to home</Link>
    </Container>
  );
}
