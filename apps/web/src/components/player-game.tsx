"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  CircleHelp,
  Gamepad2,
  RotateCcw,
  Trophy,
} from "lucide-react";
import players from "../../../../content/players.json";
import { normalizeGuess, scoreForRound } from "@/lib/game";
import styles from "./section-page.module.css";

const recordKey = "portfolio-football-record-v1";
const maximumAttempts = 3;
type Player = (typeof players)[number];

export function PlayerGame() {
  const [player, setPlayer] = useState<Player>();
  const [seen, setSeen] = useState<string[]>([]);
  const [hints, setHints] = useState(1);
  const [misses, setMisses] = useState<string[]>([]);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<"won" | "lost">();
  const [message, setMessage] = useState("");
  const [record, setRecord] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const value = Number(localStorage.getItem(recordKey));
      if (Number.isInteger(value) && value > 0 && value <= 100)
        setRecord(value);
    } catch {
      /* Storage is optional. */
    }
  }, []);

  function startRound() {
    const remaining = players.filter(({ id }) => !seen.includes(id));
    const pool =
      remaining.length > 0
        ? remaining
        : players.filter(({ id }) => id !== player?.id);
    const next = pool[Math.floor(Math.random() * pool.length)];
    setPlayer(next);
    setSeen(remaining.length > 0 ? [...seen, next.id] : [next.id]);
    setHints(1);
    setMisses([]);
    setGuess("");
    setResult(undefined);
    setMessage("Première piste révélée.");
  }

  const score = scoreForRound(hints, misses.length);

  function submitGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!player || result) return;
    const value = normalizeGuess(guess);
    if (!value) return;
    if (misses.includes(value)) {
      setMessage("Vous avez déjà essayé cette réponse.");
      return;
    }
    if (player.aliases.some((alias) => normalizeGuess(alias) === value)) {
      setResult("won");
      setMessage(`Bravo ! Vous marquez ${score} points.`);
      if (score > record) {
        setRecord(score);
        try {
          localStorage.setItem(recordKey, String(score));
        } catch {
          /* Storage is optional. */
        }
      }
      return;
    }
    const nextMisses = [...misses, value];
    setMisses(nextMisses);
    setGuess("");
    if (nextMisses.length >= maximumAttempts) {
      setResult("lost");
      setMessage("Les trois tentatives sont utilisées.");
    } else {
      setMessage(
        "Ce n’est pas le joueur recherché. Vous pouvez demander un indice.",
      );
      input.current?.focus();
    }
  }

  return (
    <section className={styles.card} aria-label="Partie de devinettes">
      <p>
        <Trophy size={17} aria-hidden="true" /> Record local : {record} points
      </p>
      {!player ? (
        <>
          <h2>Un joueur. Cinq indices.</h2>
          <p>
            Vous avez trois tentatives. Un indice supplémentaire coûte 15 points
            et une réponse incorrecte coûte 10 points.
          </p>
          <button
            className={`${styles.button} ${styles.primary}`}
            type="button"
            onClick={startRound}
          >
            <Gamepad2 size={18} aria-hidden="true" /> Lancer une partie
          </button>
        </>
      ) : (
        <>
          <h2>{result ? player.name : "Qui est ce joueur ?"}</h2>
          <p>
            Indices {hints}/{player.hints.length} · Tentatives restantes{" "}
            {maximumAttempts - misses.length} · {result === "lost" ? 0 : score}{" "}
            points
          </p>
          <ol>
            {player.hints
              .slice(0, result ? player.hints.length : hints)
              .map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
          </ol>
          {result ? (
            <div className={styles.actions}>
              <a
                href={player.source}
                className={styles.inlineLink}
                target="_blank"
                rel="noreferrer"
              >
                Source des indices
              </a>
              <button
                className={styles.button}
                type="button"
                onClick={startRound}
              >
                <RotateCcw size={17} aria-hidden="true" /> Joueur suivant
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={submitGuess} className={styles.actions}>
                <label htmlFor="guess" className="srOnly">
                  Nom du joueur
                </label>
                <input
                  id="guess"
                  className="textInput"
                  ref={input}
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  maxLength={100}
                  required
                  placeholder="Nom du joueur"
                  autoComplete="off"
                />
                <button
                  className={`${styles.button} ${styles.primary}`}
                  type="submit"
                >
                  Valider <ArrowRight size={15} aria-hidden="true" />
                </button>
              </form>
              <button
                className={styles.button}
                type="button"
                disabled={hints >= player.hints.length}
                onClick={() => setHints(hints + 1)}
              >
                <CircleHelp size={17} aria-hidden="true" /> Révéler un indice
              </button>
            </>
          )}
        </>
      )}
      <p role="status">{message}</p>
    </section>
  );
}
