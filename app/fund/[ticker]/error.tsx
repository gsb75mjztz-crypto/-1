"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import styles from "../../error.module.css";

// Scoped error boundary for fund pages specifically — this route does a
// live Prisma query for performance data on every render (Technical
// Architecture Section 3), so a database outage surfaces here in a way
// most other pages (static/build-time data only) can't hit at request
// time. Falls back to the shared app/error.tsx copy pattern rather than
// inventing a third voice for failure states.
export default function FundError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container>
      <h1>Couldn&apos;t load this fund</h1>
      <p className="text-secondary">
        This page hit an unexpected error fetching current data. It&apos;s on
        our end, not something you did.
      </p>
      <div className={styles.actions}>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link href="/compare">Back to Compare</Link>
      </div>
    </Container>
  );
}
