"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Header.module.css";

// Global nav per docs/InvestorHub-information-architecture.md Section 2 and
// locked terminology in docs/InvestorHub-design-system.md Section 9:
// Compare · Calculator · Sign in/Saved — four items, deliberately minimal.
//
// "Sign in" is a static placeholder link for this milestone. Rendering it
// conditionally as "Saved" once a session exists is Week 5 work (accounts
// aren't built yet, per this milestone's brief) — see lib/auth.ts.
const NAV_LINKS = [
  { href: "/compare", label: "Compare" },
  { href: "/calculator", label: "Calculator" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          href="/"
          className={styles.logo}
          onClick={() => setMenuOpen(false)}
        >
          InvestorHub
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link href="/auth/sign-in">Sign in</Link>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Always rendered (not conditionally mounted) so aria-controls on the
          button above never references a missing element — the element is
          hidden via the native `hidden` attribute instead, which correctly
          removes it from the accessibility tree when closed. */}
      <nav
        id="mobile-nav"
        className={styles.mobileNav}
        aria-label="Primary"
        hidden={!menuOpen}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/auth/sign-in" onClick={() => setMenuOpen(false)}>
          Sign in
        </Link>
        {/* Footer links are reachable from the mobile menu too, per Design
            System Section 5 — not only by scrolling to page-bottom. */}
        <hr className={styles.divider} />
        <Link href="/methodology" onClick={() => setMenuOpen(false)}>
          Methodology
        </Link>
        <Link href="/terms" onClick={() => setMenuOpen(false)}>
          Terms
        </Link>
        <Link href="/privacy" onClick={() => setMenuOpen(false)}>
          Privacy
        </Link>
        <Link href="/contact" onClick={() => setMenuOpen(false)}>
          Contact
        </Link>
      </nav>
    </header>
  );
}
