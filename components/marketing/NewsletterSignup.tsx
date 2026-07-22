"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import styles from "./NewsletterSignup.module.css";

type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Newsletter capture, per Product Brief Section 3/4 and PRD US-6: framed as
// a continuation of something specific, never a generic "join our
// newsletter" ask, and never an immediate pop-up. `heading`/`description`
// are props (not hardcoded) so a later, more specific framing — e.g.
// "get an email like the comparison you just ran" once that flow exists
// (Week 5) — can reuse this component instead of rebuilding it.
//
// POSTs to /api/newsletter, which is currently a Milestone 1 stub (501,
// see Development Roadmap Week 5) — this component's submit handling is
// complete and correct on its own terms; it just has nothing real to talk
// to yet. Double opt-in (PRD FR-9) means success here means "check your
// email," not "you're subscribed," which is what the copy below says.
//
// Wrapped in Card rather than a bespoke container — reuses the Design
// System's one surface/border/radius treatment instead of a second one.
export function NewsletterSignup({
  heading = "Get one specific breakdown like this, weekly",
  description = "No generic digest — one real comparison or fee-drag example in your inbox, the same way we post it.",
}: {
  heading?: string;
  description?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const headingId = useId();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(undefined);
    setStatus("submitting");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Card
        role="region"
        aria-labelledby={headingId}
        className={styles.wrapper}
      >
        <h2 id={headingId}>{heading}</h2>
        <p className={styles.confirm}>Check your email to confirm.</p>
      </Card>
    );
  }

  return (
    <Card role="region" aria-labelledby={headingId} className={styles.wrapper}>
      <h2 id={headingId}>{heading}</h2>
      <p className="text-secondary">{description}</p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <Input
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            disabled={status === "submitting"}
          />
        </div>
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Subscribing…" : "Subscribe"}
        </Button>
      </form>
      {status === "error" && (
        <p role="alert" className={styles.errorText}>
          Something went wrong on our end — please try again shortly.
        </p>
      )}
    </Card>
  );
}
