import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./section-page.module.css";

export function SectionPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main id="contenu" tabIndex={-1} className="container">
      <header className={styles.intro}>
        <Link href="/" className={styles.back}>
          <ArrowLeft size={15} aria-hidden="true" /> Accueil
        </Link>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </header>
      <div className={styles.body}>{children}</div>
    </main>
  );
}

export { styles as sectionStyles };
