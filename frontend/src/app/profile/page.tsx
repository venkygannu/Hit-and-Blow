'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Header } from '@/components/Layout/Header';

export default function ProfilePage() {
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);

  return (
    <div className="min-h-screen pt-16">
      <Header />
      <div className="max-w-md mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-card"
        >
          <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-6">Profile &amp; Stats</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2 rounded-button border-2 border-primary-200 dark:border-primary-600 bg-white/80 dark:bg-primary-900/50"
                maxLength={20}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Match history and Elo can be added when using a persistent backend.
            </p>
          </div>
          <p className="mt-6">
            <Link href="/" className="text-primary-600 dark:text-primary-400 hover:underline">Back to Home</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
