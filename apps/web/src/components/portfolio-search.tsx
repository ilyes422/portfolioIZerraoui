import { ArrowUpRight, MessageCircle, Search } from "lucide-react";
import styles from "./portfolio-search.module.css";

export function PortfolioSearch({
  compact = false,
  query = "",
}: {
  compact?: boolean;
  query?: string;
}) {
  return (
    <form
      action="/recherche"
      method="get"
      role="search"
      aria-label={compact ? "Recherche rapide" : "Rechercher dans le portfolio"}
      className={`${styles.form} ${compact ? styles.compact : ""}`}
    >
      {compact ? (
        <Search size={16} aria-hidden="true" />
      ) : (
        <MessageCircle size={24} aria-hidden="true" />
      )}
      <label
        className="srOnly"
        htmlFor={compact ? "recherche-rapide" : "recherche-portfolio"}
      >
        Rechercher une page, un projet ou une compétence
      </label>
      <input
        id={compact ? "recherche-rapide" : "recherche-portfolio"}
        type="search"
        name="q"
        maxLength={120}
        defaultValue={query}
        placeholder={
          compact
            ? "Que souhaitez-vous découvrir ?"
            : "Mon parcours, mes projets, mes compétences…"
        }
        autoComplete="off"
      />
      <button type="submit" aria-label="Rechercher dans le portfolio">
        <ArrowUpRight size={compact ? 15 : 22} aria-hidden="true" />
      </button>
    </form>
  );
}
