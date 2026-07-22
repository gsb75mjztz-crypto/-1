import Link from "next/link";
import styles from "./Footer.module.css";

// Footer nav per IA doc Section 2: Methodology · Terms · Privacy · Contact —
// present identically on every page, reachable with no exceptions.
const FOOTER_LINKS = [
  { href: "/methodology", label: "Methodology" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
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
