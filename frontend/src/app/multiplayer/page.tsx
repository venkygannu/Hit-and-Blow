'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useGameStore } from '@/store/gameStore';
import { Header } from '@/components/Layout/Header';

export default function MultiplayerLobbyPage() {
  const router = useRouter();
  const { createRoom, joinRoom, quickMatch } = useMultiplayer();
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const setRoom = useGameStore((s) => s.setRoom);
  const setMyRole = useGameStore((s) => s.setMyRole);

  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState<'create' | 'join' | 'quick' | null>(null);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    setLoading('create');
    try {
      const data = await createRoom(nickname || 'Player');
      setRoom(null);
      setMyRole(data.role);
      router.push(`/multiplayer/room?roomId=${data.code}&created=1`);
    } catch (e: unknown) {
      const err = e as { message?: string; error?: string; detail?: string };
      const msg = err?.error ?? err?.message ?? 'Failed to create room';
      setError(msg + (err?.detail ? ` (${err.detail})` : ''));
    } finally {
      setLoading(null);
    }
  };

  const handleJoin = async () => {
    setError('');
    if (!joinCode.trim()) {
      setError('Enter room code');
      return;
    }
    const code = joinCode.trim().toUpperCase();
    setLoading('join');
    try {
      const data = await joinRoom(code, nickname || 'Player');
      if (data) {
        setMyRole(data.role);
        router.push(`/multiplayer/room?roomId=${code}`);
      } else setError('Room not found or full');
    } catch {
      setError('Failed to join');
    } finally {
      setLoading(null);
    }
  };

  const handleQuickMatch = async () => {
    setError('');
    setLoading('quick');
    try {
      const data = await quickMatch(nickname || 'Player');
      if (data) {
        setMyRole(data.role);
        router.push(`/multiplayer/room?roomId=${data.roomId}&created=${data.isCreator ? '1' : '0'}`);
      } else setError('Quick match failed');
    } catch {
      setError('Quick match failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <Header />
      <div className="max-w-md mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-card"
        >
          <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-6">Multiplayer Lobby</h1>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 rounded-button border-2 border-primary-200 dark:border-primary-600 bg-white/80 dark:bg-primary-900/50"
              placeholder="Your name"
              maxLength={20}
            />
          </div>
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>
          )}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!!loading}
              className="btn-primary w-full"
            >
              {loading === 'create' ? 'Creating…' : 'Create Room'}
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Room code"
                className="flex-1 px-4 py-2 rounded-button border-2 border-primary-200 dark:border-primary-600 bg-white/80 dark:bg-primary-900/50"
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleJoin}
                disabled={!!loading}
                className="btn-secondary whitespace-nowrap"
              >
                {loading === 'join' ? '…' : 'Join'}
              </button>
            </div>
            <button
              type="button"
              onClick={handleQuickMatch}
              disabled={!!loading}
              className="btn-secondary w-full"
            >
              {loading === 'quick' ? 'Finding…' : 'Quick Match'}
            </button>
          </div>
          <p className="mt-6 text-center">
            <a href="/mode" className="text-primary-600 dark:text-primary-400 hover:underline">Back to modes</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
