/**
 * REST API for CPU battle: create game, submit guess, get CPU move.
 */

import type { Request, Response } from 'express';
import * as gameLogic from '../game/logic.js';
import * as cpu from '../game/cpu.js';
import type { Difficulty } from '../game/cpu.js';

// In-memory CPU games: gameId -> { secret, history, difficulty }
const cpuGames = new Map<string, { secret: string; history: { guess: string; hits: number; blows: number }[]; difficulty: Difficulty }>();

function generateGameId(): string {
  return Math.random().toString(36).slice(2, 12);
}

export function createCpuGame(req: Request, res: Response): void {
  const difficulty = (req.body?.difficulty as Difficulty) || 'medium';
  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    res.status(400).json({ error: 'Invalid difficulty' });
    return;
  }
  const gameId = generateGameId();
  const secret = cpu.cpuGenerateSecret();
  cpuGames.set(gameId, { secret, history: [], difficulty });
  res.json({ gameId, difficulty });
}

export function submitCpuGuess(req: Request, res: Response): void {
  const { gameId, guess } = req.body ?? {};
  if (!gameId || typeof guess !== 'string') {
    res.status(400).json({ error: 'gameId and guess required' });
    return;
  }
  const game = cpuGames.get(gameId);
  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }
  const validation = gameLogic.validateGuess(guess);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }
  const { hits, blows } = gameLogic.evaluateGuess(game.secret, guess);
  game.history.push({ guess, hits, blows });
  const win = hits === 4;
  if (win) cpuGames.delete(gameId);
  res.json({ hits, blows, win });
}

export function getCpuMove(req: Request, res: Response): void {
  const gameId = req.params.gameId;
  const game = cpuGames.get(gameId);
  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }
  const thinkingDelay = Math.min(2000, 400 + game.history.length * 150);
  setTimeout(() => {
    const cpuGuessResult = cpu.cpuGuess(game.difficulty, game.history);
    const { hits, blows } = gameLogic.evaluateGuess(game.secret, cpuGuessResult);
    game.history.push({ guess: cpuGuessResult, hits, blows });
    const cpuWin = hits === 4;
    if (cpuWin) cpuGames.delete(gameId);
    res.json({ guess: cpuGuessResult, hits, blows, win: cpuWin });
  }, thinkingDelay);
}
