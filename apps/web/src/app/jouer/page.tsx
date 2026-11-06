import type { Metadata } from "next";
import { PlayerGame } from "@/components/player-game";
import { SectionPage } from "@/components/section-page";

export const metadata: Metadata = {
  title: "Devine le joueur",
  description:
    "Un jeu de devinettes footballistiques avec des indices sourcés.",
};

export default function GamePage() {
  return (
    <SectionPage
      eyebrow="Jouer"
      title="Saurez-vous deviner le joueur ?"
      description="Des indices issus de sources officielles, un joueur à retrouver et votre record à battre."
    >
      <PlayerGame />
    </SectionPage>
  );
}
