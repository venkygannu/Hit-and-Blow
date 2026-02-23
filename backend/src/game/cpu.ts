/**
 * CPU opponent logic for Hit and Blow.
 * Easy: random valid guesses.
 * Medium: remembers which digits are correct/wrong and avoids impossible combos.
 * Hard: logical elimination (candidate set + minimax-style pruning).
 */

import {
  DIGITS,
  generateSecret,
  validateGuess,
  evaluateGuess,
  type HitBlowResult,
} from './logic.js';

export type Difficulty = 'easy' | 'medium' | 'hard';

/** Generate array of all valid 4-digit combinations (unique digits). */
function getAllCandidates(): string[] {
  const out: string[] = [];
  function recurse(sofar: string) {
    if (sofar.length === DIGITS) {
      out.push(sofar);
      return;
    }
    for (let d = 0; d <= 9; d++) {
      if (sofar.includes(String(d))) continue;
      recurse(sofar + d);
    }
  }
  recurse('');
  return out;
}

const ALL_CANDIDATES = getAllCandidates();

/** Filter candidates that would produce the same (hits, blows) for a given guess. */
function filterCandidates(
  candidates: string[],
  guess: string,
  result: HitBlowResult
): string[] {
  return candidates.filter((secret) => {
    const r = evaluateGuess(secret, guess);
    return r.hits === result.hits && r.blows === result.blows;
  });
}

/** Pick a random element from an array. */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Easy: random valid guess from remaining candidates (or all). */
export function cpuGuessEasy(history: { guess: string; hits: number; blows: number }[]): string {
  let pool = ALL_CANDIDATES;
  for (const h of history) {
    pool = filterCandidates(pool, h.guess, { hits: h.hits, blows: h.blows });
    if (pool.length === 0) pool = ALL_CANDIDATES;
  }
  return randomChoice(pool);
}

/** Medium: same as easy but with a small chance to make a "bad" guess for variety. */
export function cpuGuessMedium(history: { guess: string; hits: number; blows: number }[]): string {
  if (Math.random() < 0.15 && history.length > 0) {
    return cpuGuessEasy([]);
  }
  return cpuGuessEasy(history);
}

/**
 * Hard: always pick from consistent candidates; optionally use minimax to pick
 * the guess that minimizes max remaining candidates (mastermind strategy).
 */
export function cpuGuessHard(history: { guess: string; hits: number; blows: number }[]): string {
  let pool = ALL_CANDIDATES;
  for (const h of history) {
    pool = filterCandidates(pool, h.guess, { hits: h.hits, blows: h.blows });
    if (pool.length === 0) pool = ALL_CANDIDATES;
  }
  if (pool.length <= 2) return randomChoice(pool);
  // Minimax: choose guess that minimizes the maximum size of remaining set
  let bestGuess = pool[0];
  let bestWorst = Infinity;
  const toTry = pool.length > 200 ? pool.filter((_, i) => i % 3 === 0) : pool;
  for (const g of toTry) {
    let worst = 0;
    for (const secret of pool) {
      const r = evaluateGuess(secret, g);
      const nextSize = filterCandidates(pool, g, r).length;
      if (nextSize > worst) worst = nextSize;
    }
    if (worst < bestWorst) {
      bestWorst = worst;
      bestGuess = g;
    }
  }
  return bestGuess;
}

export function cpuGuess(
  difficulty: Difficulty,
  history: { guess: string; hits: number; blows: number }[]
): string {
  switch (difficulty) {
    case 'easy':
      return cpuGuessEasy(history);
    case 'medium':
      return cpuGuessMedium(history);
    case 'hard':
      return cpuGuessHard(history);
    default:
      return cpuGuessEasy(history);
  }
}

/** CPU secret generation (same as player: unique 4 digits). */
export function cpuGenerateSecret(): string {
  return generateSecret();
}
