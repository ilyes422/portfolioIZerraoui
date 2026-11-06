import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Braces,
  Code2,
  FileText,
  Gamepad2,
  GraduationCap,
  Trophy,
} from "lucide-react";
import { AskQuestion, AssistantPanel } from "@/components/assistant-panel";
import { ResultsPanel } from "@/components/results-panel";
import { profile } from "@/lib/profile";
import { siteUrl } from "@/lib/site";
import styles from "./page.module.css";

const shortcuts = [
  { href: "/cv", title: "Mon CV", icon: FileText },
  { href: "/projets", title: "Mes projets", icon: Code2 },
  { href: "/parcours", title: "Mon parcours", icon: GraduationCap },
  { href: "/resultats", title: "L’espace football", icon: Trophy },
  { href: "/jouer", title: "Devine le joueur", icon: Gamepad2 },
];
const skills = [
  ["PHP · Laravel · CakePHP", "Web"],
  ["Java · Spring", "Applications"],
  ["HTML · CSS · JavaScript", "Interfaces"],
  ["SQL", "Données"],
  ["Git · Méthode Agile", "Collaboration"],
];

export const metadata: Metadata = {
  alternates: siteUrl ? { canonical: "/" } : undefined,
};

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.headline,
  url: siteUrl?.href,
  sameAs: ["https://github.com/ilyes422"],
};

export default function HomePage() {
  return (
    <main id="contenu" tabIndex={-1}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(person).replace(/</g, "\\u003c"),
        }}
      />
      <section className={styles.hero} aria-labelledby="titre">
        <Image
          src="/images/stadium-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Portfolio</p>
          <h1 id="titre">
            Ilyes <span>Zerraoui</span>
          </h1>
          <p className={styles.intro}>
            Passionné de foot, de sport et de technologie,
            <br className={styles.desktopBreak} /> je développe des sites web et
            des applications
            <br className={styles.desktopBreak} /> pour donner vie aux idées.
          </p>
          <div className={styles.heroSearch}>
            <AskQuestion openAssistant />
          </div>
          <div className={styles.shortcuts}>
            {shortcuts.map(({ href, title, icon: Icon }) => (
              <Link key={href} href={href}>
                <Icon size={15} aria-hidden="true" />
                {title}
              </Link>
            ))}
          </div>
          <p className={styles.searchHint}>
            <Link href="/recherche">Rechercher par rubrique</Link>
          </p>
        </div>
      </section>

      <div className={`container ${styles.dashboard}`}>
        <div className={styles.topGrid}>
          <ResultsPanel />

          <section
            className={`${styles.panel} ${styles.gamePanel}`}
            aria-labelledby="jeu-titre"
          >
            <div className={styles.panelHeader}>
              <h2 id="jeu-titre">
                <Gamepad2 size={25} aria-hidden="true" />
                Jouer
              </h2>
              <Link href="/jouer">
                Découvrir <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.gamePoster}>
              <Image
                src="/images/player-mystery.webp"
                alt=""
                fill
                sizes="(max-width: 650px) 90vw, (max-width: 1100px) 45vw, 380px"
                className={styles.gameImage}
              />
              <span className={styles.questionOne} aria-hidden="true">
                ?
              </span>
              <span className={styles.questionTwo} aria-hidden="true">
                ?
              </span>
              <div className={styles.gameCopy}>
                <h3>
                  Saurez-vous deviner
                  <br />
                  <span>le joueur ?</span>
                </h3>
                <p>
                  Des indices, un joueur, un seul. Testez votre culture
                  football.
                </p>
                <Link className={styles.primaryButton} href="/jouer">
                  <Gamepad2 size={18} aria-hidden="true" />
                  Lancer le jeu
                </Link>
              </div>
            </div>
          </section>

          <AssistantPanel />
        </div>

        <div className={styles.bottomGrid}>
          <section
            className={`${styles.panel} ${styles.about}`}
            aria-labelledby="apropos-titre"
          >
            <div className={styles.aboutImage}>
              <Image
                src="/images/stadium-hero.webp"
                alt=""
                fill
                sizes="170px"
              />
              <span aria-hidden="true">
                IZ<span>.</span>
              </span>
            </div>
            <div className={styles.aboutCopy}>
              <p className={styles.eyebrow}>À propos de moi</p>
              <h2 id="apropos-titre">Entre passion et technologie</h2>
              <p>
                Le football et le sport font partie de mon univers. Dans le
                code, je construis des sites et des applications, avec une
                expérience en alternance chez XEFI.
              </p>
              <Link className={styles.outlineButton} href="/parcours">
                Découvrir mon parcours{" "}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </section>
          <section
            className={`${styles.panel} ${styles.skills}`}
            aria-labelledby="competences-titre"
          >
            <h2 id="competences-titre">
              <Braces size={22} aria-hidden="true" />
              Mes compétences
            </h2>
            <ul>
              {skills.map(([label, category]) => (
                <li key={label}>
                  <span>{label}</span>
                  <small>{category}</small>
                </li>
              ))}
            </ul>
            <Link href="/cv">
              Explorer mon profil <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </section>
          <section
            className={styles.motto}
            aria-label="Mon univers football et technologie"
          >
            <Image
              src="/images/stadium-hero.webp"
              alt=""
              fill
              sizes="(max-width: 650px) 90vw, 350px"
            />
            <div>
              <p>
                L’esprit d’équipe,
                <br />
                aussi dans le code.
              </p>
              <span>Passion · Sport · Technologie</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
