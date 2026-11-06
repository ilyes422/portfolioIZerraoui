import type { Metadata } from "next";
import {
  SectionPage,
  sectionStyles as styles,
} from "@/components/section-page";
import { resume } from "@/lib/resume";

export const metadata: Metadata = {
  title: "Parcours",
  description:
    "Formations, alternance et stages en développement d’Ilyes Zerraoui.",
};

export default function ParcoursPage() {
  return (
    <SectionPage
      eyebrow="Mon parcours"
      title="Du premier projet aux applications métier."
      description="Les expériences et formations qui ont construit ma pratique du développement."
    >
      <div className={styles.grid}>
        <section>
          <h2 className={styles.sectionTitle}>Expériences</h2>
          <div className={styles.list}>
            {resume.experience.map((entry) => (
              <article className={styles.card} key={entry.period}>
                <p>
                  {entry.organization} · {entry.period}
                </p>
                <h3>{entry.role}</h3>
                <ul>
                  {entry.tasks.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h2 className={styles.sectionTitle}>Formations</h2>
          <div className={styles.list}>
            {resume.education.map((entry) => (
              <article className={styles.card} key={entry.period}>
                <p>{entry.period}</p>
                <h3>{entry.title}</h3>
                <p>{entry.school}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </SectionPage>
  );
}
