'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { createCpuGame } from '@/lib/api';
import type { Difficulty } from '@/types/game';
import { Header } from '@/components/Layout/Header';

export default function CpuSetupPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setCpu = useGameStore((s) => s.setCpu);
  const resetCpu = useGameStore((s) => s.resetCpu);

  const start = async () => {
    setError('');
    setLoading(true);
    resetCpu();
    try {
      const { gameId } = await createCpuGame(difficulty);
      setCpu({ gameId, difficulty, playerTurn: true, guesses: [], winner: null, secret: null, thinking: false });
      window.location.href = `/cpu/play?gameId=${gameId}&difficulty=${difficulty}`;
    } catch (e: unknown) {
      const err = e as { message?: string; error?: string; detail?: string };
      const msg = err?.error ?? err?.message ?? 'Failed to start game';
      setError(msg + (err?.detail ? ` — ${err.detail}` : ''));
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-6">CPU Battle</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Choose difficulty. You set a secret; you and CPU take turns guessing.</p>
          <div className="space-y-2 mb-6">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <label key={d} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="diff"
                  checked={difficulty === d}
                  onChange={() => setDifficulty(d)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="capitalize">{d}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>}
          <button type="button" onClick={start} disabled={loading} className="btn-primary w-full">
            {loading ? 'Starting…' : 'Start Game'}
          </button>
          <p className="mt-6 text-center">
            <Link href="/mode" className="text-primary-600 dark:text-primary-400 hover:underline">Back</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
