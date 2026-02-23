/**
 * In-memory room state manager. Persists to Redis for reconnect support.
 */

import { v4 as uuidV4 } from 'uuid';
import * as gameLogic from '../game/logic.js';
import { saveRoom, getRoom, deleteRoom } from '../store/redis.js';
import type { RoomState, RoomPlayer, PlayerRole, GuessEntry } from './types.js';
import { TURN_DURATION_DEFAULT } from './types.js';

const rooms = new Map<string, RoomState>();

function getRole(state: RoomState, socketId: string): PlayerRole | null {
  if (state.player1?.socketId === socketId) return 'player1';
  if (state.player2?.socketId === socketId) return 'player2';
  return null;
}

export function createRoom(hostSocketId: string, nickname: string): RoomState {
  const roomId = uuidV4().slice(0, 6).toUpperCase();
  const state: RoomState = {
    roomId,
    player1: {
      socketId: hostSocketId,
      nickname,
      ready: false,
    },
    player2: null,
    turn: null,
    phase: 'waiting',
    guesses: [],
    winner: null,
    createdAt: Date.now(),
    turnStartedAt: null,
    turnDurationSeconds: TURN_DURATION_DEFAULT,
  };
  rooms.set(roomId, state);
  saveRoom(roomId, state).catch(() => {});
  return state;
}

export function joinRoom(roomId: string, socketId: string, nickname: string): RoomState | null {
  const state = rooms.get(roomId.toUpperCase());
  if (!state || state.phase !== 'waiting') return null;
  if (state.player2) return null;
  state.player2 = {
    socketId,
    nickname,
    ready: false,
  };
  rooms.set(roomId, state);
  saveRoom(roomId, state).catch(() => {});
  return state;
}

export function getRoomState(roomId: string): RoomState | null {
  return rooms.get(roomId.toUpperCase()) ?? null;
}

export async function getOrRestoreRoom(roomId: string): Promise<RoomState | null> {
  let state = rooms.get(roomId.toUpperCase());
  if (!state) {
    const saved = await getRoom(roomId.toUpperCase());
    if (saved) {
      state = saved as RoomState;
      rooms.set(roomId.toUpperCase(), state);
    }
  }
  return state ?? null;
}

export function setSecret(roomId: string, socketId: string, secret: string): { error?: string } {
  const validation = gameLogic.validateGuess(secret);
  if (!validation.valid) return { error: validation.error };
  const state = rooms.get(roomId.toUpperCase());
  if (!state) return { error: 'Room not found' };
  const role = getRole(state, socketId);
  if (!role) return { error: 'Not in room' };
  if (role === 'player1') state.player1!.secret = secret;
  else state.player2!.secret = secret;
  saveRoom(roomId, state).catch(() => {});
  return {};
}

export function setReady(roomId: string, socketId: string): { error?: string } {
  const state = rooms.get(roomId.toUpperCase());
  if (!state) return { error: 'Room not found' };
  const role = getRole(state, socketId);
  if (!role) return { error: 'Not in room' };
  if (role === 'player1') state.player1!.ready = true;
  else state.player2!.ready = true;
  if (state.player1?.ready && state.player2?.ready) {
    state.phase = 'playing';
    state.turn = 'player1';
    state.turnStartedAt = Date.now();
  } else {
    state.phase = 'ready_check';
  }
  saveRoom(roomId, state).catch(() => {});
  return {};
}

export function submitGuess(
  roomId: string,
  socketId: string,
  guess: string
): { error?: string; hits?: number; blows?: number; win?: boolean } {
  const state = rooms.get(roomId.toUpperCase());
  if (!state || state.phase !== 'playing') return { error: 'Not in game' };
  const role = getRole(state, socketId);
  if (!role || state.turn !== role) return { error: 'Not your turn' };
  const validation = gameLogic.validateGuess(guess);
  if (!validation.valid) return { error: validation.error };
  const opponentRole: PlayerRole = role === 'player1' ? 'player2' : 'player1';
  const secret = (role === 'player1' ? state.player2?.secret : state.player1?.secret) ?? '';
  if (!secret) return { error: 'Opponent secret not set' };
  const { hits, blows } = gameLogic.evaluateGuess(secret, guess);
  const entry: GuessEntry = {
    guess,
    hits,
    blows,
    by: role,
    at: Date.now(),
  };
  state.guesses.push(entry);
  state.turn = opponentRole;
  state.turnStartedAt = Date.now();
  const win = hits === 4;
  if (win) {
    state.phase = 'finished';
    state.winner = role;
  }
  saveRoom(roomId, state).catch(() => {});
  return { hits, blows, win };
}

export function reconnectPlayer(roomId: string, socketId: string, newSocketId: string): RoomState | null {
  const state = rooms.get(roomId.toUpperCase());
  if (!state) return null;
  if (state.player1?.socketId === socketId) {
    state.player1.socketId = newSocketId;
    state.player1.disconnected = false;
    state.player1.reconnected = true;
  } else if (state.player2?.socketId === socketId) {
    state.player2.socketId = newSocketId;
    state.player2.disconnected = false;
    state.player2.reconnected = true;
  } else return null;
  saveRoom(roomId, state).catch(() => {});
  return state;
}

export function markDisconnected(roomId: string, socketId: string): void {
  const state = rooms.get(roomId.toUpperCase());
  if (!state) return;
  if (state.player1?.socketId === socketId) state.player1.disconnected = true;
  else if (state.player2?.socketId === socketId) state.player2.disconnected = true;
  saveRoom(roomId, state).catch(() => {});
}

export function leaveRoom(roomId: string, socketId: string): void {
  const state = rooms.get(roomId.toUpperCase());
  if (!state) return;
  const role = getRole(state, socketId);
  if (role === 'player1') state.player1 = null;
  else if (role === 'player2') state.player2 = null;
  if (!state.player1 && !state.player2) {
    rooms.delete(roomId.toUpperCase());
    deleteRoom(roomId).catch(() => {});
  } else {
    saveRoom(roomId, state).catch(() => {});
  }
}

export function getRoomIdBySocket(socketId: string): string | null {
  for (const [id, state] of rooms) {
    if (state.player1?.socketId === socketId || state.player2?.socketId === socketId) return id;
  }
  return null;
}
