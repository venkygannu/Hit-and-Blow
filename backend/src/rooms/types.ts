/**
 * Shared types for multiplayer rooms and game state.
 */

export type PlayerRole = 'player1' | 'player2';

export interface RoomPlayer {
  socketId: string;
  nickname: string;
  avatar?: string;
  secret?: string;
  ready: boolean;
  disconnected?: boolean;
  reconnected?: boolean;
}

export interface GuessEntry {
  guess: string;
  hits: number;
  blows: number;
  by: PlayerRole;
  at: number;
}

export interface RoomState {
  roomId: string;
  player1: RoomPlayer | null;
  player2: RoomPlayer | null;
  turn: PlayerRole | null;
  phase: 'waiting' | 'ready_check' | 'playing' | 'finished';
  guesses: GuessEntry[];
  winner: PlayerRole | null;
  createdAt: number;
  turnStartedAt: number | null;
  turnDurationSeconds: number;
}

export const TURN_DURATION_DEFAULT = 60;
