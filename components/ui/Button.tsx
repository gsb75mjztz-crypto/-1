import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

// Design System Section 4.4. Three variants only — primary, secondary,
// ghost. The "exactly one primary button per screen" rule is a copy/UX
// discipline enforced by whoever composes a page with this component, not
// something the component itself can check.
export type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonAsButton = {
  variant?: ButtonVariant;
  className?: string;
  href?: never;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonAsLink = {
  variant?: ButtonVariant;
  className?: string;
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

// Renders as a real <button> by default, or as a Next.js <Link> (identical
// classes, identical visual result) when an `href` prop is supplied — a
// page CTA that navigates should be a link semantically, not a button
// wired to router.push.
export function Button({
  variant = "primary",
  className,
  href,
  ...rest
}: ButtonProps) {
  const variantClass = {
    primary: styles.primary,
    secondary: styles.secondary,
    ghost: styles.ghost,
  }[variant];
  const classes = [styles.button, variantClass, className]
    .filter(Boolean)
    .join(" ");

  if (href !== undefined) {
    return (
      <Link
        href={href}
        className={classes}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      />
    );
  }

  const { type = "button", ...buttonRest } =
    rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return <button type={type} className={classes} {...buttonRest} />;
}
