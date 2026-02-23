'use client';

import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';

export function Header() {
  const { darkMode, toggleDarkMode, soundEnabled, toggleSound } = useGameStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 dark:border-primary-500/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-primary-600 dark:text-primary-400">
          Hit & Blow
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-primary-500/20 transition"
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <motion.button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-primary-500/20 transition"
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '🌙' : '☀️'}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
