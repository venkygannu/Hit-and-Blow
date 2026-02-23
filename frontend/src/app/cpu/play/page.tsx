'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { submitCpuGuess, getCpuMove } from '@/lib/api';
import { Header } from '@/components/Layout/Header';
import { GuessInput } from '@/components/Game/GuessInput';
import { GuessRow } from '@/components/Game/GuessRow';
import { Confetti } from '@/components/Game/Confetti';

const THINKING_DELAY_MS = 800;

function CpuPlayContent() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'medium';
  const router = useRouter();
  const cpu = useGameStore((s) => s.cpu);
  const setCpu = useGameStore((s) => s.setCpu);
  const addCpuGuess = useGameStore((s) => s.addCpuGuess);
  const [secretInput, setSecretInput] = useState('');
  const [secretSet, setSecretSet] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!gameId) {
      router.replace('/cpu');
      return;
    }
    setCpu({ gameId, difficulty });
  }, [gameId, difficulty]);

  useEffect(() => {
    if (cpu.winner === 'player') setShowConfetti(true);
  }, [cpu.winner]);

  const handleSetSecret = () => {
    const v = secretInput.replace(/\D/g, '').slice(0, 4);
    if (v.length !== 4 || new Set(v).size !== 4) {
      setError('Enter 4 unique digits');
      return;
    }
    setCpu({ secret: v });
    setSecretSet(true);
    setError('');
  };

  const handlePlayerGuess = async (guess: string) => {
    if (!gameId || cpu.winner || !secretSet) return;
    setError('');
    try {
      const res = await submitCpuGuess(gameId, guess);
      addCpuGuess({ guess, hits: res.hits, blows: res.blows, by: 'player' });
      if (res.win) {
        setCpu({ winner: 'player' });
        return;
      }
      setCpu({ playerTurn: false, thinking: true });
      await new Promise((r) => setTimeout(r, THINKING_DELAY_MS));
      const move = await getCpuMove(gameId);
      addCpuGuess({ guess: move.guess, hits: move.hits, blows: move.blows, by: 'cpu' });
      if (move.win) {
        setCpu({ winner: 'cpu', thinking: false });
        return;
      }
      setCpu({ playerTurn: true, thinking: false });
    } catch (e) {
      setError((e as Error).message || 'Invalid guess');
      setCpu({ playerTurn: true, thinking: false });
    }
  };

  if (!gameId) return null;

  const winner = cpu.winner;
  const thinking = cpu.thinking;
  const playerTurn = cpu.playerTurn && !winner;
  const guesses = cpu.guesses;

  return (
    <div className="min-h-screen pt-16 pb-8">
      <Header />
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-6 rounded-card">
          <h1 className="text-xl font-bold text-primary-700 dark:text-primary-300 mb-4">
            CPU Battle — {difficulty}
          </h1>

          {!secretSet ? (
            <div>
              <label className="block text-sm font-medium mb-1">Your secret 4-digit number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="input-digit flex-1 max-w-[120px]"
                />
                <button type="button" onClick={handleSetSecret} className="btn-primary">
                  Start
                </button>
              </div>
              {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>}
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-4">
                <div className={`flex-1 p-3 rounded-xl ${playerTurn ? 'ring-2 ring-primary-500 shadow-glow' : 'bg-white/50 dark:bg-primary-900/30'}`}>
                  You {playerTurn && '(your turn)'}
                </div>
                <div className={`flex-1 p-3 rounded-xl ${thinking ? 'ring-2 ring-amber-500 animate-pulse-soft' : 'bg-white/50 dark:bg-primary-900/30'}`}>
                  CPU {thinking && 'thinking…'}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 dark:text-gray-400">
                      <th className="py-2">Guess</th>
                      <th className="py-2">Hits</th>
                      <th className="py-2">Blows</th>
                      <th className="py-2">By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guesses.map((g, i) => (
                      <GuessRow key={i} guess={g.guess} hits={g.hits} blows={g.blows} by={g.by} index={i} />
                    ))}
                  </tbody>
                </table>
              </div>
              {!winner && (
                <div className="mt-6">
                  {thinking ? (
                    <motion.div
                      className="flex gap-1 justify-center py-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary-500"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <GuessInput onSubmit={handlePlayerGuess} disabled={!playerTurn} />
                  )}
                  {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2 text-center">{error}</p>}
                </div>
              )}
              {winner && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="mt-6 p-6 rounded-card bg-primary-500/10 dark:bg-primary-500/20 text-center"
                >
                  <p className="text-xl font-bold">
                    {winner === 'player' ? 'You win!' : 'CPU wins!'}
                  </p>
                  <a href="/cpu" className="btn-primary mt-4 inline-block">Play Again</a>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function CpuPlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Header />
        <p className="text-gray-600 dark:text-gray-400">Loading…</p>
      </div>
    }>
      <CpuPlayContent />
    </Suspense>
  );
}
