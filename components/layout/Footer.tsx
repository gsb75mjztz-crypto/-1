import Link from "next/link";
import styles from "./Footer.module.css";

// Footer nav per IA doc Section 2: Methodology · Terms · Privacy · Contact.
// Disclaimer is a Milestone 2 addition beyond the IA doc's exact four-link
// spec — the LOCKED disclaimer copy warrants its own directly-linkable page
// (see app/disclaimer/page.tsx), and Trust & Legal content is footer-only
// by IA convention, so it belongs alongside these three rather than
// anywhere else. Flagged here as a deliberate, additive deviation.
const FOOTER_LINKS = [
  { href: "/methodology", label: "Methodology" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p className={styles.copyright}>© {year} InvestorHub</p>
      </div>
    </footer>
  );
}
