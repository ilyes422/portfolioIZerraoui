import type { Metadata } from "next";
import { Code2, Mail, MapPin, Phone } from "lucide-react";
import {
  SectionPage,
  sectionStyles as styles,
} from "@/components/section-page";
import { profile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter Ilyes Zerraoui par e-mail, téléphone ou GitHub.",
};

export default function ContactPage() {
  return (
    <SectionPage
      eyebrow="Contact"
      title="Échangeons."
      description="Un projet, une opportunité ou une question sur mon parcours ?"
    >
      <div className={styles.grid}>
        <section className={styles.card}>
          <Mail size={24} aria-hidden="true" />
          <h2>E-mail</h2>
          <a className={styles.inlineLink} href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </section>
        <section className={styles.card}>
          <Phone size={24} aria-hidden="true" />
          <h2>Téléphone</h2>
          <a className={styles.inlineLink} href={`tel:${profile.phone}`}>
            {profile.phoneLabel}
          </a>
        </section>
        <section className={styles.card}>
          <MapPin size={24} aria-hidden="true" />
          <h2>Ville</h2>
          <p>{profile.city}, France</p>
        </section>
        <section className={styles.card}>
          <Code2 size={24} aria-hidden="true" />
          <h2>GitHub</h2>
          <a
            className={styles.inlineLink}
            href="https://github.com/ilyes422"
            target="_blank"
            rel="noreferrer"
          >
            ilyes422
          </a>
        </section>
      </div>
    </SectionPage>
  );
}
