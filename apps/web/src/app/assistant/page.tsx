import type { Metadata } from "next";
import { AssistantPanel } from "@/components/assistant-panel";
import { SectionPage } from "@/components/section-page";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Assistant personnel",
  description:
    "Posez vos questions sur le CV, le parcours et les projets d’Ilyes Zerraoui.",
  alternates: siteUrl ? { canonical: "/assistant" } : undefined,
};

export default function AssistantPage() {
  return (
    <SectionPage
      eyebrow="Portfolio interactif"
      title="Assistant personnel"
      description="Posez une question sur mon parcours, mes compétences ou mes projets."
    >
      <AssistantPanel standalone />
    </SectionPage>
  );
}
