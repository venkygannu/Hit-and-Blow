'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { RoomState } from '@/types/game';
import { supabase } from '@/lib/supabase/client';

const POLL_INTERVAL_MS = 2000;

function getBase(): string {
  if (typeof window === 'undefined') return '';
  return '';
}

async function fetchRoomState(code: string): Promise<RoomState | null> {
  const res = await fetch(`${getBase()}/api/rooms/${encodeURIComponent(code)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data as RoomState;
}

export function useMultiplayer() {
  const setRoom = useGameStore((s) => s.setRoom);
  const myRole = useGameStore((s) => s.myRole);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createRoom = useCallback(async (nickname: string) => {
    const res = await fetch(`${getBase()}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error((data?.error as string) || 'Failed to create room') as Error & { error?: string; detail?: string };
      err.error = data?.error;
      err.detail = data?.detail;
      throw err;
    }
    return { code: data.code as string, roomUuid: data.roomUuid as string, role: data.role as 'player1' | 'player2' };
  }, []);

  const joinRoom = useCallback(async (code: string, nickname: string) => {
    const res = await fetch(`${getBase()}/api/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, nickname }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { code: data.code as string, roomUuid: data.roomUuid as string, role: data.role as 'player1' | 'player2' };
  }, []);

  const setSecret = useCallback(async (code: string, secret: string) => {
    const res = await fetch(`${getBase()}/api/rooms/${encodeURIComponent(code)}/secret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: myRole, secret }),
    });
    return res.ok;
  }, [myRole]);

  const setReady = useCallback(async (code: string) => {
    const res = await fetch(`${getBase()}/api/rooms/${encodeURIComponent(code)}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: myRole }),
    });
    return res.ok;
  }, [myRole]);

  const submitGuess = useCallback(async (code: string, guess: string) => {
    const res = await fetch(`${getBase()}/api/rooms/${encodeURIComponent(code)}/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: myRole, guess }),
    });
    return res.ok;
  }, [myRole]);

  const quickMatch = useCallback(async (nickname: string) => {
    const res = await fetch(`${getBase()}/api/rooms/quick-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      roomId: data.roomId as string,
      roomUuid: data.roomUuid as string,
      isCreator: data.isCreator as boolean,
      role: data.role as 'player1' | 'player2',
    };
  }, []);

  const subscribeToRoom = useCallback(
    (code: string, roomUuid: string) => {
      const fetchAndSet = () => fetchRoomState(code).then((s) => s && setRoom(s));

      if (supabase) {
        const client = supabase;
        const channel = client
          .channel(`room:${roomUuid}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomUuid}` },
            () => fetchAndSet()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomUuid}` },
            () => fetchAndSet()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'guesses', filter: `room_id=eq.${roomUuid}` },
            () => fetchAndSet()
          )
          .subscribe();

        return () => {
          client.removeChannel(channel);
        };
      }

      pollRef.current = setInterval(fetchAndSet, POLL_INTERVAL_MS);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
      };
    },
    [setRoom]
  );

  return {
    createRoom,
    joinRoom,
    setSecret,
    setReady,
    submitGuess,
    quickMatch,
    subscribeToRoom,
    fetchRoomState,
  };
}
