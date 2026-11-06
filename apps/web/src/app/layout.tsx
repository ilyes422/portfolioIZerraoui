import type { Metadata } from "next";
import type { ReactNode } from "react";
import { profile } from "@/lib/profile";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { indexable, siteUrl } from "@/lib/site";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${profile.name} | ${profile.headline}`,
    template: `%s | ${profile.name}`,
  },
  description:
    "Le portfolio d'Ilyes Zerraoui, développeur web et applications à Saint-Étienne, passionné de football et de technologie.",
  metadataBase: siteUrl,
  robots: { index: indexable, follow: indexable },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: `Portfolio d’${profile.name}`,
    ...(siteUrl ? { images: ["/images/stadium-hero.webp"] } : {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <a className="skipLink" href="#contenu">
          Aller au contenu
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
