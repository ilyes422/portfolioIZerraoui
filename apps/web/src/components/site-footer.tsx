import Link from "next/link";
import { Code2, Mail, ArrowUpRight } from "lucide-react";
import { profile } from "@/lib/profile";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>
          © {new Date().getFullYear()} {profile.name}. Tous droits réservés.
        </p>
        <div className={styles.links}>
          <a
            href="https://github.com/ilyes422"
            target="_blank"
            rel="noreferrer"
            aria-label="Profil GitHub d’Ilyes Zerraoui, nouvel onglet"
          >
            <Code2 size={17} aria-hidden="true" />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Envoyer un e-mail à Ilyes"
          >
            <Mail size={18} aria-hidden="true" />
          </a>
          <span className={styles.separator} />
          <Link href="/contact">
            Passion · Sport · Technologie{" "}
            <ArrowUpRight size={12} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
