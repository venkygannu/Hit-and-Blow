'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useGameStore } from '@/store/gameStore';
import { Header } from '@/components/Layout/Header';
import { GuessInput } from '@/components/Game/GuessInput';
import { GuessRow } from '@/components/Game/GuessRow';
import { Confetti } from '@/components/Game/Confetti';
import { TurnTimer } from '@/components/Game/TurnTimer';

export default function MultiplayerRoomPage() {
  const searchParams = useSearchParams();
  const roomIdParam = searchParams.get('roomId') || '';
  const created = searchParams.get('created') === '1';
  const router = useRouter();
  const { joinRoom, setSecret, setReady, submitGuess, subscribeToRoom, fetchRoomState } = useMultiplayer();
  const room = useGameStore((s) => s.room);
  const setRoom = useGameStore((s) => s.setRoom);
  const setMyRole = useGameStore((s) => s.setMyRole);
  const myRole = useGameStore((s) => s.myRole);
  const nickname = useGameStore((s) => s.nickname);

  const [secretInput, setSecretInput] = useState('');
  const [joined, setJoined] = useState(!!created);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!roomIdParam) {
      router.replace('/multiplayer');
      return;
    }
    setRoom(null);
    if (created) {
      setJoined(true);
    } else {
      joinRoom(roomIdParam, nickname || 'Player').then((data) => {
        if (data) {
          setMyRole(data.role);
          setJoined(true);
        }
      });
    }
  }, [roomIdParam, created]);

  useEffect(() => {
    if (!joined || !roomIdParam) return;
    let unsub: (() => void) | undefined;
    fetchRoomState(roomIdParam).then((state) => {
      if (state) {
        setRoom(state);
        if (state.roomUuid) unsub = subscribeToRoom(roomIdParam, state.roomUuid);
      }
    });
    return () => {
      unsub?.();
    };
  }, [joined, roomIdParam, subscribeToRoom, fetchRoomState, setRoom]);

  const state = room;
  const isPlayer1 = myRole === 'player1';
  const isPlayer2 = myRole === 'player2';
  const p1 = state?.player1;
  const p2 = state?.player2;
  const isMyTurn = state?.turn === myRole && state?.phase === 'playing';
  const needSecret = (isPlayer1 && !p1?.secret) || (isPlayer2 && !p2?.secret);
  const canReady = (isPlayer1 && p1?.secret && !p1?.ready) || (isPlayer2 && p2?.secret && !p2?.ready);
  const winner = state?.winner;
  const showResult = state?.phase === 'finished';

  useEffect(() => {
    if (winner && (winner === myRole)) setShowConfetti(true);
  }, [winner, myRole]);

  if (!joined && roomIdParam) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Header />
        <p className="text-gray-600 dark:text-gray-400">Joining room…</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Header />
        <p className="text-gray-600 dark:text-gray-400">Loading room…</p>
      </div>
    );
  }

  const handleSetSecret = () => {
    if (secretInput.length !== 4 || new Set(secretInput).size !== 4) return;
    setSecret(roomIdParam, secretInput).then(() => setSecretInput(''));
  };

  return (
    <div className="min-h-screen pt-16 pb-8">
      <Header />
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-6 rounded-card">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-primary-700 dark:text-primary-300">
              Room {state.roomId}
            </h1>
            <a href="/multiplayer" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Leave
            </a>
          </div>

          {state.phase === 'waiting' || state.phase === 'ready_check' ? (
            <>
              <div className="flex gap-4 mb-6">
                <div className={`flex-1 p-3 rounded-xl ${isPlayer1 ? 'ring-2 ring-primary-500' : 'bg-white/50 dark:bg-primary-900/30'}`}>
                  <span className="font-medium">Player 1</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{p1?.nickname || '—'}</p>
                  {p1?.secret ? '✓ Secret set' : '—'}
                  {p1?.ready && ' ✓ Ready'}
                </div>
                <div className={`flex-1 p-3 rounded-xl ${isPlayer2 ? 'ring-2 ring-primary-500' : 'bg-white/50 dark:bg-primary-900/30'}`}>
                  <span className="font-medium">Player 2</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{p2?.nickname || 'Waiting…'}</p>
                  {p2?.secret ? '✓ Secret set' : '—'}
                  {p2?.ready && ' ✓ Ready'}
                </div>
              </div>
              {needSecret && (
                <div className="mb-4">
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
                      Set
                    </button>
                  </div>
                </div>
              )}
              {canReady && (
                <button type="button" onClick={() => setReady(roomIdParam)} className="btn-primary">
                  I'm Ready
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex gap-4 mb-4 items-center">
                <div className={`flex-1 p-3 rounded-xl ${state.turn === 'player1' ? 'ring-2 ring-primary-500 shadow-glow' : 'bg-white/50 dark:bg-primary-900/30'}`}>
                  P1: {p1?.nickname}
                  {state.turn === 'player1' && <span className="ml-2 text-primary-600">(turn)</span>}
                </div>
                <div className={`flex-1 p-3 rounded-xl ${state.turn === 'player2' ? 'ring-2 ring-primary-500 shadow-glow' : 'bg-white/50 dark:bg-primary-900/30'}`}>
                  P2: {p2?.nickname}
                  {state.turn === 'player2' && <span className="ml-2 text-primary-600">(turn)</span>}
                </div>
                <TurnTimer turnStartedAt={state.turnStartedAt} durationSeconds={state.turnDurationSeconds} isMyTurn={isMyTurn} />
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
                    {state.guesses.map((g, i) => (
                      <GuessRow key={i} guess={g.guess} hits={g.hits} blows={g.blows} by={g.by} index={i} />
                    ))}
                  </tbody>
                </table>
              </div>
              {!showResult && (
                <div className="mt-6">
                  <GuessInput
                    onSubmit={(guess) => submitGuess(roomIdParam, guess)}
                    disabled={!isMyTurn}
                  />
                </div>
              )}
              {showResult && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="mt-6 p-6 rounded-card bg-primary-500/10 dark:bg-primary-500/20 text-center"
                >
                  <p className="text-xl font-bold">
                    {winner === myRole ? 'You win!' : 'You lost'}
                  </p>
                  <div className="flex gap-4 justify-center mt-4 flex-wrap">
                    <a href="/multiplayer" className="btn-primary inline-block">Rematch</a>
                    <a href="/mode" className="btn-secondary inline-block">Back to Modes</a>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
