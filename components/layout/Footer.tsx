import Link from "next/link";
import styles from "./Footer.module.css";

// Footer nav — verbatim per PRD Section 3: "Methodology | Terms | Privacy |
// Contact | © [Year]". Milestone 2's first pass added a fifth link
// (Disclaimer) here; the completion audit flagged that as an unrequested
// deviation from an explicit PRD spec, not just an under-specified area to
// extend. Reverted. The Disclaimer page still exists (app/disclaimer) and
// is still reachable — linked contextually from the Terms and Methodology
// pages' body content — it's just not in the global nav the PRD locked
// down.
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
