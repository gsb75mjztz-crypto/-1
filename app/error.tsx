"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import styles from "./error.module.css";

// Segment error boundary — Next.js requires this to be a Client Component.
// Catches errors thrown anywhere below the root layout (a page, a Server
// Component data fetch, a nested component) that would otherwise crash to
// a blank white screen or a raw stack trace in production. Deliberately
// generic, on-tone copy — no stack trace or error message shown to the
// user (could leak internal detail), matching not-found.tsx's plain,
// factual style rather than inventing a different voice for failure
// states.
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side visibility into what broke, without showing the user
    // anything they can't act on — console.error, not a UI element.
    console.error(error);
  }, [error]);

  return (
    <Container>
      <h1>Something went wrong</h1>
      <p className="text-secondary">
        This page hit an unexpected error. It&apos;s on our end, not something
        you did.
      </p>
      <div className={styles.actions}>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link href="/">Back to home</Link>
      </div>
    </Container>
  );
}
