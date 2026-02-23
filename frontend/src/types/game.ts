export type GameMode = 'multiplayer' | 'cpu' | null;

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GuessEntry {
  guess: string;
  hits: number;
  blows: number;
  by?: 'player1' | 'player2' | 'player' | 'cpu';
  at?: number;
}

export interface RoomPlayer {
  socketId: string;
  nickname: string;
  avatar?: string;
  secret?: string;
  ready: boolean;
  disconnected?: boolean;
}

export interface RoomState {
  roomId: string;
  roomUuid?: string;
  player1: RoomPlayer | null;
  player2: RoomPlayer | null;
  turn: 'player1' | 'player2' | null;
  phase: 'waiting' | 'ready_check' | 'playing' | 'finished';
  guesses: GuessEntry[];
  winner: 'player1' | 'player2' | null;
  turnStartedAt: number | null;
  turnDurationSeconds: number;
}

export interface CpuGameState {
  gameId: string | null;
  difficulty: Difficulty;
  secret: string | null; // player's secret (set locally)
  guesses: GuessEntry[];
  playerTurn: boolean;
  thinking: boolean;
  winner: 'player' | 'cpu' | null;
}
