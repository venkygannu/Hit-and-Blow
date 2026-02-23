'use client';

import { useState, useEffect } from 'react';

const TURN_DURATION_DEFAULT = 60;

interface TurnTimerProps {
  turnStartedAt: number | null;
  durationSeconds?: number;
  isMyTurn: boolean;
}

export function TurnTimer({ turnStartedAt, durationSeconds = TURN_DURATION_DEFAULT, isMyTurn }: TurnTimerProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!isMyTurn || !turnStartedAt) {
      setRemaining(null);
      return;
    }
    const end = turnStartedAt + durationSeconds * 1000;
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemaining(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [turnStartedAt, durationSeconds, isMyTurn]);

  if (!isMyTurn || remaining === null) return null;
  return (
    <span className={`text-sm font-mono ${remaining <= 10 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
      {remaining}s
    </span>
  );
}
