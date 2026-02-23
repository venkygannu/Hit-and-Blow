import { describe, it, expect } from 'vitest';
import { generateSecret, validateGuess, evaluateGuess, isWin, DIGITS } from './logic.js';

describe('generateSecret', () => {
  it('returns 4 characters', () => {
    expect(generateSecret()).toHaveLength(DIGITS);
  });
  it('returns only digits', () => {
    expect(generateSecret()).toMatch(/^\d+$/);
  });
  it('returns unique digits', () => {
    const s = generateSecret();
    expect(new Set(s.split('')).size).toBe(DIGITS);
  });
});

describe('validateGuess', () => {
  it('accepts valid 4-digit unique guess', () => {
    expect(validateGuess('0123').valid).toBe(true);
    expect(validateGuess('4567').valid).toBe(true);
  });
  it('rejects non-4 length', () => {
    expect(validateGuess('123').valid).toBe(false);
    expect(validateGuess('12345').valid).toBe(false);
  });
  it('rejects non-numeric', () => {
    expect(validateGuess('12a4').valid).toBe(false);
  });
  it('rejects repeated digits', () => {
    expect(validateGuess('1123').valid).toBe(false);
  });
});

describe('evaluateGuess', () => {
  it('4 hits when exact match', () => {
    const r = evaluateGuess('1234', '1234');
    expect(r.hits).toBe(4);
    expect(r.blows).toBe(0);
  });
  it('0 hits 0 blows when no digit matches', () => {
    const r = evaluateGuess('1234', '5678');
    expect(r.hits).toBe(0);
    expect(r.blows).toBe(0);
  });
  it('correct hits and blows for known case', () => {
    const r = evaluateGuess('1234', '1243');
    expect(r.hits).toBe(2); // 1 and 2 in place
    expect(r.blows).toBe(2); // 3 and 4 wrong place
  });
  it('all blows when digits permuted', () => {
    const r = evaluateGuess('1234', '4321');
    expect(r.hits).toBe(0);
    expect(r.blows).toBe(4);
  });
});

describe('isWin', () => {
  it('true when hits is 4', () => {
    expect(isWin({ hits: 4, blows: 0 })).toBe(true);
  });
  it('false otherwise', () => {
    expect(isWin({ hits: 3, blows: 1 })).toBe(false);
  });
});
