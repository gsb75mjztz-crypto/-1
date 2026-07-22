import type { HTMLAttributes } from "react";
import styles from "./Card.module.css";

// Design System Section 4.1, copied exactly: surface background, hairline
// border, radius-card, space-4/space-5 padding. No box-shadow.
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[styles.card, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
