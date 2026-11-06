import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import {
  SectionPage,
  sectionStyles as styles,
} from "@/components/section-page";
import { projects } from "@/lib/resume";

export const metadata: Metadata = {
  title: "Projets",
  description:
    "Portfolio, applications métier et API Spring Boot réalisés par Ilyes Zerraoui.",
};

export default function ProjectsPage() {
  return (
    <SectionPage
      eyebrow="Mes projets"
      title="Des idées aux applications."
      description="Une sélection de réalisations personnelles et professionnelles."
    >
      <div className={styles.grid}>
        {projects.map((project) => (
          <article className={styles.card} key={project.id} id={project.id}>
            <p>{project.kind}</p>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
            <ul className={styles.badges}>
              {project.technologies.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
            {project.repository && (
              <a
                href={project.repository}
                className={styles.button}
                target="_blank"
                rel="noreferrer"
              >
                Voir le dépôt <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            )}
          </article>
        ))}
      </div>
    </SectionPage>
  );
}
