import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { normalizeGuess, scoreForRound } from "../apps/web/src/lib/game.ts";

const players = JSON.parse(await readFile(new URL("../content/players.json", import.meta.url), "utf8"));

test("le catalogue contient des identifiants uniques et des réponses jouables", () => {
  assert.equal(new Set(players.map(({ id }) => id)).size, players.length);
  for (const player of players) {
    assert.ok(player.aliases.some((alias) => normalizeGuess(alias) === normalizeGuess(player.name)));
    assert.equal(player.hints.length, 5);
    assert.match(player.source, /^https:\/\//);
  }
});

test("les accents sont tolérés et les pénalités respectent le barème", () => {
  assert.equal(normalizeGuess("  Zinédine   Zidane "), "zinedine zidane");
  assert.equal(scoreForRound(1, 0), 100);
  assert.equal(scoreForRound(2, 1), 75);
  assert.equal(scoreForRound(5, 2), 20);
});
