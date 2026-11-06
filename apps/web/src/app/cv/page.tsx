import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import {
  SectionPage,
  sectionStyles as styles,
} from "@/components/section-page";
import { profile } from "@/lib/profile";
import { resume } from "@/lib/resume";

export const metadata: Metadata = {
  title: "CV et compétences",
  description: "CV public, compétences et langues d’Ilyes Zerraoui.",
};

export default function CvPage() {
  return (
    <SectionPage
      eyebrow="Mon CV"
      title={profile.headline}
      description={resume.summary}
    >
      <div className={styles.actions}>
        <a
          className={`${styles.button} ${styles.primary}`}
          href="/documents/cv-ilyes-zerraoui.pdf"
          target="_blank"
          rel="noreferrer"
        >
          <FileText size={17} aria-hidden="true" /> Consulter le CV (PDF)
        </a>
        <a
          className={styles.button}
          href="/documents/cv-ilyes-zerraoui.pdf"
          download
        >
          <Download size={17} aria-hidden="true" /> Télécharger le CV
        </a>
      </div>
      <h2 className={styles.sectionTitle}>Compétences</h2>
      <div className={styles.grid}>
        {resume.skills.map(({ category, items }) => (
          <section className={styles.card} key={category}>
            <h3>{category}</h3>
            <ul className={styles.badges}>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <h2 className={styles.sectionTitle}>Langues</h2>
      <ul className={styles.badges}>
        {resume.languages.map((language) => (
          <li key={language}>{language}</li>
        ))}
      </ul>
    </SectionPage>
  );
}
