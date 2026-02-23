'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RulesPage() {
  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 max-w-xl w-full"
      >
        <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-6">How to Play</h1>
        <ul className="space-y-4 text-gray-700 dark:text-gray-300">
          <li><strong>Secret:</strong> A 4-digit number with all different digits (0–9).</li>
          <li><strong>Guess:</strong> Enter your own 4-digit number (no repeated digits).</li>
          <li><strong>Hit:</strong> Correct digit in the correct position.</li>
          <li><strong>Blow:</strong> Correct digit in the wrong position.</li>
          <li>First to get <strong>4 Hits</strong> wins.</li>
        </ul>
        <div className="mt-8">
          <Link href="/" className="btn-secondary">Back to Home</Link>
        </div>
      </motion.div>
    </div>
  );
}
