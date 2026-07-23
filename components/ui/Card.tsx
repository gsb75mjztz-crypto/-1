import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./Card.module.css";

// Design System Section 4.1, copied exactly: surface background, hairline
// border, radius-card, space-4/space-5 padding. No box-shadow.
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.card, className)} {...rest} />;
}
