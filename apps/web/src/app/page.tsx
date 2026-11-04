import { profile } from "@/lib/profile";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label={`${profile.name}, accueil`}>
          <span className={styles.monogram} aria-hidden="true">IZ<span>.</span></span>
          <span>{profile.name}</span>
        </a>
        <span className={styles.location}>{profile.city}, France</span>
      </header>

      <main id="contenu" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="titre">
          <div className={styles.introduction}>
            <p className={styles.eyebrow}>Football · Sport · Technologie</p>
            <h1 id="titre">Ilyes<br /><span>Zerraoui</span><span className={styles.dot}>.</span></h1>
            <p className={styles.role}>{profile.headline}</p>
            <p className={styles.description}>
              La passion du terrain.<br />L’envie de construire, dans le code.
            </p>
            <a className={styles.contact} href={`mailto:${profile.email}`}>
              Me contacter <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className={styles.pitchVisual} aria-hidden="true">
            <div className={styles.pitch}>
              <span className={styles.halfway} />
              <span className={styles.centerCircle} />
              <span className={styles.centerSpot} />
              <span className={styles.penaltyLeft} />
              <span className={styles.penaltyRight} />
            </div>
            <span className={styles.visualCaption}>La prochaine passe commence ici.</span>
          </div>
        </section>

        <section id="univers" className={styles.about} aria-labelledby="univers-titre">
          <p className={styles.eyebrow}>Bienvenue dans mon univers</p>
          <h2 id="univers-titre">Entre passion et technologie.</h2>
          <p>
            Mon portfolio prend forme. Vous y découvrirez bientôt mon parcours,
            mes projets et des expériences interactives autour du football.
          </p>
          <span className={styles.status}>Portfolio en construction</span>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>{profile.name}</span>
        <div>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={`tel:${profile.phone}`}>{profile.phoneLabel}</a>
        </div>
      </footer>
    </div>
  );
}
