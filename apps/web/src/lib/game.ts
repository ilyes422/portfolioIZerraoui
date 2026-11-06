export function normalizeGuess(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function scoreForRound(hints: number, wrongGuesses: number): number {
  return Math.max(20, 100 - (hints - 1) * 15 - wrongGuesses * 10);
}
