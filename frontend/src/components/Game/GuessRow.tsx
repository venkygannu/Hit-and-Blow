'use client';

import { motion } from 'framer-motion';

interface GuessRowProps {
  guess: string;
  hits: number;
  blows: number;
  by?: 'player1' | 'player2' | 'player' | 'cpu';
  index: number;
}

export function GuessRow({ guess, hits, blows, by, index }: GuessRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-primary-200/50 dark:border-primary-700/50"
    >
      <td className="py-3 px-2 font-mono text-lg">
        {guess.split('').map((d, i) => (
          <span key={i} className="inline-block w-8 text-center font-bold text-primary-700 dark:text-primary-300">
            {d}
          </span>
        ))}
      </td>
      <td className="py-3 px-2">
        <motion.span
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20 text-green-700 dark:text-green-300 font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.1 }}
        >
          {hits}
        </motion.span>
      </td>
      <td className="py-3 px-2">
        <motion.span
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.15 }}
        >
          {blows}
        </motion.span>
      </td>
      {by && (
        <td className="py-3 px-2 text-sm text-gray-500 dark:text-gray-400">
          {by === 'cpu' ? 'CPU' : by === 'player' ? 'You' : by === 'player1' ? 'P1' : 'P2'}
        </td>
      )}
    </motion.tr>
  );
}
