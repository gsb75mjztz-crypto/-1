import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

// Design System Section 4.4. Three variants only — primary, secondary,
// ghost. The "exactly one primary button per screen" rule is a copy/UX
// discipline enforced by whoever composes a page with this component, not
// something the component itself can check.
export type ButtonVariant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "primary",
  type = "button",
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variantClass = {
    primary: styles.primary,
    secondary: styles.secondary,
    ghost: styles.ghost,
  }[variant];

  return (
    <button
      type={type}
      className={[styles.button, variantClass, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
