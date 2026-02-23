/**
 * CPU opponent logic (used by API routes).
 */

import {
  DIGITS,
  generateSecret,
  evaluateGuess,
  type HitBlowResult,
} from './gameLogic';

export type Difficulty = 'easy' | 'medium' | 'hard';

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

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function cpuGuessEasy(history: { guess: string; hits: number; blows: number }[]): string {
  let pool = ALL_CANDIDATES;
  for (const h of history) {
    pool = filterCandidates(pool, h.guess, { hits: h.hits, blows: h.blows });
    if (pool.length === 0) pool = ALL_CANDIDATES;
  }
  return randomChoice(pool);
}

export function cpuGuessMedium(history: { guess: string; hits: number; blows: number }[]): string {
  if (Math.random() < 0.15 && history.length > 0) {
    return cpuGuessEasy([]);
  }
  return cpuGuessEasy(history);
}

export function cpuGuessHard(history: { guess: string; hits: number; blows: number }[]): string {
  let pool = ALL_CANDIDATES;
  for (const h of history) {
    pool = filterCandidates(pool, h.guess, { hits: h.hits, blows: h.blows });
    if (pool.length === 0) pool = ALL_CANDIDATES;
  }
  if (pool.length <= 2) return randomChoice(pool);
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

export function cpuGenerateSecret(): string {
  return generateSecret();
}
