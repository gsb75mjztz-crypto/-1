"use client";

import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./Input.module.css";

// Design System Section 4.3 ("Forms"). Label is a required prop, not an
// optional decoration — the spec is explicit that placeholder-as-label is
// not allowed, so this component has no way to render a labelless input.
// Error state renders as message text (not colour alone, per Section 8) plus
// a left-border accent on the field.
export function Input({
  label,
  error,
  id,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={cn(styles.input, error && styles.inputError, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...rest}
      />
      {error && (
        <p id={errorId} className={styles.errorText}>
          {error}
        </p>
      )}
    </div>
  );
}
