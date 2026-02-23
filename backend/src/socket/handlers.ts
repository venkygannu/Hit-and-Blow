/**
 * Socket.io event handlers for multiplayer: rooms, turns, guesses, reconnect.
 */

import type { Server, Socket } from 'socket.io';
import * as roomManager from '../rooms/roomManager.js';
import { addToMatchmaking, popMatchmaking } from '../store/redis.js';

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    socket.on('create_room', (nickname: string, cb?: (roomId: string) => void) => {
      const state = roomManager.createRoom(socket.id, nickname || 'Player');
      socket.join(state.roomId);
      (socket as Socket & { roomId?: string }).roomId = state.roomId;
      socket.emit('room_state', state);
      cb?.(state.roomId);
    });

    socket.on('join_room', (data: { roomId: string; nickname: string }, cb?: (ok: boolean, err?: string) => void) => {
      const state = roomManager.joinRoom(data.roomId, socket.id, data.nickname || 'Player');
      if (!state) {
        cb?.(false, 'Room full or not found');
        return;
      }
      socket.join(state.roomId);
      (socket as Socket & { roomId?: string }).roomId = state.roomId;
      io.to(state.roomId).emit('room_state', state);
      cb?.(true);
    });

    socket.on('set_secret', (data: { roomId: string; secret: string }, cb?: (ok: boolean, err?: string) => void) => {
      const result = roomManager.setSecret(data.roomId, socket.id, data.secret);
      if (result.error) {
        cb?.(false, result.error);
        return;
      }
      const state = roomManager.getRoomState(data.roomId);
      if (state) io.to(data.roomId).emit('room_state', state);
      cb?.(true);
    });

    socket.on('set_ready', (roomId: string, cb?: (ok: boolean, err?: string) => void) => {
      const result = roomManager.setReady(roomId, socket.id);
      if (result.error) {
        cb?.(false, result.error);
        return;
      }
      const state = roomManager.getRoomState(roomId);
      if (state) io.to(roomId).emit('room_state', state);
      cb?.(true);
    });

    socket.on('submit_guess', (data: { roomId: string; guess: string }, cb?: (ok: boolean, err?: string) => void) => {
      const result = roomManager.submitGuess(data.roomId, socket.id, data.guess);
      if (result.error) {
        cb?.(false, result.error);
        return;
      }
      const state = roomManager.getRoomState(data.roomId);
      if (state) io.to(data.roomId).emit('room_state', state);
      if (result.win) io.to(data.roomId).emit('game_over', { winner: result.win, state });
      cb?.(true);
    });

    socket.on('quick_match', async (nickname: string, cb?: (data: { roomId: string; isCreator: boolean }) => void) => {
      const payload = await popMatchmaking();
      if (payload) {
        try {
          const { roomId } = JSON.parse(payload) as { roomId: string; socketId: string };
          const state = roomManager.joinRoom(roomId, socket.id, nickname || 'Player');
          if (state) {
            socket.join(state.roomId);
            (socket as Socket & { roomId?: string }).roomId = state.roomId;
            io.to(state.roomId).emit('room_state', state);
            cb?.({ roomId: state.roomId, isCreator: false });
            return;
          }
        } catch {
          // invalid payload, fall through to create
        }
      }
      const state = roomManager.createRoom(socket.id, nickname || 'Player');
      socket.join(state.roomId);
      (socket as Socket & { roomId?: string }).roomId = state.roomId;
      addToMatchmaking(socket.id, JSON.stringify({ roomId: state.roomId, socketId: socket.id })).catch(() => {});
      cb?.({ roomId: state.roomId, isCreator: true });
    });

    socket.on('leave_room', (roomId: string) => {
      roomManager.leaveRoom(roomId, socket.id);
      socket.leave(roomId);
      (socket as Socket & { roomId?: string }).roomId = undefined;
      const state = roomManager.getRoomState(roomId);
      if (state) io.to(roomId).emit('room_state', state);
    });

    socket.on('disconnect', () => {
      const roomId = (socket as Socket & { roomId?: string }).roomId ?? roomManager.getRoomIdBySocket(socket.id);
      if (roomId) {
        roomManager.markDisconnected(roomId, socket.id);
        const state = roomManager.getRoomState(roomId);
        if (state) io.to(roomId).emit('room_state', state);
      }
    });
  });
}
