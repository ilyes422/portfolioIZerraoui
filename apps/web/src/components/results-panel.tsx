"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Trophy } from "lucide-react";
import styles from "./results-panel.module.css";

const competitions = [
  { code: "all", name: "Toutes" },
  { code: "FL1", name: "Ligue 1" },
  { code: "PL", name: "Premier League" },
  { code: "PD", name: "Liga" },
  { code: "BL1", name: "Bundesliga" },
  { code: "SA", name: "Serie A" },
  { code: "CL", name: "Champions League" },
];

type Match = {
  id: number;
  kickoff: string;
  competition: string;
  code: string;
  home: string;
  away: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
};
type MatchDay = {
  state: "ready" | "stale" | "unconfigured" | "unavailable";
  updated_at: string | null;
  matches: Match[];
};

const parisTime = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  hour: "2-digit",
  minute: "2-digit",
});

function emptyMessage(data: MatchDay | undefined, failed: boolean) {
  if (failed || data?.state === "unavailable")
    return "Les résultats sont momentanément indisponibles.";
  if (!data) return "Chargement des matchs…";
  if (data.state === "unconfigured")
    return "Les résultats du jour ne sont pas encore disponibles.";
  return "Aucun match couvert pour cette sélection aujourd’hui.";
}

export function ResultsPanel({ detailed = false }: { detailed?: boolean }) {
  const [competition, setCompetition] = useState("all");
  const [data, setData] = useState<MatchDay>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    let active = true;
    async function loadMatches() {
      try {
        const response = await fetch("/api/matches", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Résultats indisponibles");
        const result: MatchDay = await response.json();
        if (!Array.isArray(result.matches))
          throw new Error("Données inattendues");
        if (active) setData(result);
      } catch {
        if (active) setFailed(true);
      } finally {
        clearTimeout(timeout);
      }
    }
    void loadMatches();
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [attempt]);

  const filtered =
    data?.matches.filter(
      (match) => competition === "all" || match.code === competition,
    ) ?? [];
  const matches = detailed ? filtered : filtered.slice(0, 5);
  return (
    <section className={styles.panel} aria-labelledby="resultats-titre">
      <div className={styles.heading}>
        <h2 id="resultats-titre">
          <CalendarDays size={21} aria-hidden="true" />
          Résultats du jour
        </h2>
        {!detailed && (
          <Link href="/resultats" aria-label="Voir l’espace résultats">
            Voir plus <ArrowRight size={13} aria-hidden="true" />
          </Link>
        )}
      </div>
      <div
        className={styles.tabs}
        role="group"
        aria-label="Choisir une compétition"
      >
        {competitions.map(({ code, name }) => (
          <button
            key={code}
            type="button"
            aria-pressed={code === competition}
            onClick={() => setCompetition(code)}
          >
            {name}
          </button>
        ))}
      </div>
      {matches.length > 0 ? (
        <ul className={styles.matchList} aria-label="Matchs filtrés">
          {matches.map((match) => (
            <li className={styles.match} key={match.id}>
              <div className={styles.score}>
                <span>{match.home}</span>
                <strong>
                  {match.home_score !== null && match.away_score !== null
                    ? `${match.home_score} – ${match.away_score}`
                    : "—"}
                </strong>
                <span>{match.away}</span>
              </div>
              <p>
                {match.competition} ·{" "}
                {parisTime.format(new Date(match.kickoff))} · {match.status}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <div className={styles.pitch} aria-hidden="true">
            <span />
            <i />
            <b />
          </div>
          <Trophy size={23} aria-hidden="true" />
          <h3>Le football, au jour le jour.</h3>
          <p role="status">{emptyMessage(data, failed)}</p>
          {(failed || data?.state === "unavailable") && (
            <button
              className={styles.retry}
              type="button"
              onClick={() => {
                setFailed(false);
                setData(undefined);
                setAttempt(attempt + 1);
              }}
            >
              Réessayer
            </button>
          )}
        </div>
      )}
      {data?.updated_at && (
        <p className={styles.updated}>
          {data.state === "stale" ? "Dernières données connues" : "Mise à jour"}{" "}
          à {parisTime.format(new Date(data.updated_at))} · Scores différés
        </p>
      )}
      <a
        className={styles.footerLink}
        href="https://www.football-data.org/"
        target="_blank"
        rel="noreferrer"
      >
        Football data provided by the Football-Data.org API{" "}
        <ArrowRight size={13} aria-hidden="true" />
      </a>
    </section>
  );
}
