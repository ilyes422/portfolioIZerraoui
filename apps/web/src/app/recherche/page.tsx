import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PortfolioSearch } from "@/components/portfolio-search";
import {
  SectionPage,
  sectionStyles as styles,
} from "@/components/section-page";
import { searchPages } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Recherche",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const raw = (await searchParams).q;
  const query = (typeof raw === "string" ? raw : (raw?.[0] ?? ""))
    .trim()
    .slice(0, 120);
  const matches = searchPages(query);
  return (
    <SectionPage eyebrow="Exploration" title="Rechercher dans le portfolio">
      <PortfolioSearch query={query} />
      <h2 className={styles.sectionTitle}>
        {query ? `Résultats pour « ${query} »` : "Toutes les rubriques"}
      </h2>
      {matches.length === 0 ? (
        <p>
          Aucune rubrique trouvée. Essayez « Laravel », « parcours » ou «
          football ».
        </p>
      ) : (
        <div className={styles.grid}>
          {matches.map((page) => (
            <article key={page.href} className={styles.card}>
              <h3>{page.title}</h3>
              <p>{page.description}</p>
              <Link className={styles.button} href={page.href}>
                Ouvrir <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </SectionPage>
  );
}
