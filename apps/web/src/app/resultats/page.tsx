import type { Metadata } from "next";
import { ResultsPanel } from "@/components/results-panel";
import { SectionPage } from "@/components/section-page";

export const metadata: Metadata = {
  title: "Résultats de football",
  description:
    "Matchs et résultats du jour des grandes compétitions de football, heure de Paris.",
};

export default function ResultsPage() {
  return (
    <SectionPage
      eyebrow="Espace football"
      title="Les matchs du jour"
      description="Suivez les grandes compétitions européennes. Horaires en heure de Paris."
    >
      <ResultsPanel detailed />
    </SectionPage>
  );
}
