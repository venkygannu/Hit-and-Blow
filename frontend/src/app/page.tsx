'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass p-10 sm:p-14 max-w-lg w-full text-center"
      >
        <motion.h1
          className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          Hit & Blow
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Guess the 4-digit number. Hits = right digit, right place. Blows = right digit, wrong place.
        </p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/mode" className="btn-primary inline-block text-center">
            Play Now
          </Link>
          <Link href="/rules" className="btn-secondary inline-block text-center">
            How to Play
          </Link>
          <Link href="/profile" className="btn-secondary inline-block text-center">
            Profile
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
