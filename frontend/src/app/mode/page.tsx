'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export default function ModePage() {
  const setMode = useGameStore((s) => s.setMode);

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <motion.h1
        className="text-3xl font-bold text-primary-700 dark:text-primary-300 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Choose Mode
      </motion.h1>
      <motion.div
        className="grid sm:grid-cols-2 gap-6 max-w-2xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/multiplayer" onClick={() => setMode('multiplayer')}>
          <motion.div
            className="glass p-8 rounded-card cursor-pointer hover:shadow-glow transition shadow-glass"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h2 className="text-xl font-semibold text-primary-600 dark:text-primary-400 mb-2">Online Multiplayer</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">1v1 real-time. Room code or Quick Match.</p>
          </motion.div>
        </Link>
        <Link href="/cpu" onClick={() => setMode('cpu')}>
          <motion.div
            className="glass p-8 rounded-card cursor-pointer hover:shadow-glow transition shadow-glass"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h2 className="text-xl font-semibold text-primary-600 dark:text-primary-400 mb-2">CPU Battle</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Easy, Medium, or Hard AI.</p>
          </motion.div>
        </Link>
      </motion.div>
      <Link href="/" className="mt-8 text-primary-600 dark:text-primary-400 hover:underline">
        Back
      </Link>
    </div>
  );
}
