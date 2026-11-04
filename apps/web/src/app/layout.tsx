import type { Metadata } from "next";
import type { ReactNode } from "react";
import { profile } from "@/lib/profile";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${profile.name} | ${profile.headline}`,
    template: `%s | ${profile.name}`,
  },
  description: "Le portfolio d'Ilyes Zerraoui, développeur web et applications à Saint-Étienne, passionné de football et de technologie.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <a className="skipLink" href="#contenu">Aller au contenu</a>
        {children}
      </body>
    </html>
  );
}
