/**
 * Core Hit and Blow game logic (shared with API routes).
 */

export const DIGITS = 4;
const MIN_DIGIT = 0;
const MAX_DIGIT = 9;

export function generateSecret(): string {
  const digits: number[] = [];
  while (digits.length < DIGITS) {
    const d = Math.floor(Math.random() * (MAX_DIGIT - MIN_DIGIT + 1)) + MIN_DIGIT;
    if (!digits.includes(d)) digits.push(d);
  }
  return digits.join('');
}

export function validateGuess(guess: string): { valid: boolean; error?: string } {
  if (typeof guess !== 'string' || guess.length !== DIGITS) {
    return { valid: false, error: 'Guess must be exactly 4 digits' };
  }
  if (!/^\d+$/.test(guess)) {
    return { valid: false, error: 'Only numbers allowed' };
  }
  const set = new Set(guess.split(''));
  if (set.size !== DIGITS) {
    return { valid: false, error: 'All digits must be unique' };
  }
  return { valid: true };
}

export interface HitBlowResult {
  hits: number;
  blows: number;
}

export function evaluateGuess(secret: string, guess: string): HitBlowResult {
  if (secret.length !== DIGITS || guess.length !== DIGITS) {
    return { hits: 0, blows: 0 };
  }
  let hits = 0;
  let blows = 0;
  const secretArr = secret.split('');
  const guessArr = guess.split('');

  for (let i = 0; i < DIGITS; i++) {
    if (secretArr[i] === guessArr[i]) {
      hits++;
    } else if (secret.includes(guessArr[i])) {
      blows++;
    }
  }
  return { hits, blows };
}

export function isWin(result: HitBlowResult): boolean {
  return result.hits === DIGITS;
}
