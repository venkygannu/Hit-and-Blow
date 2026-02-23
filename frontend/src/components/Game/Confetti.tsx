'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function Confetti({ show, onComplete }: { show: boolean; onComplete?: () => void }) {
  const [pieces] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.3,
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    }))
  );

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onComplete?.(), 2500);
    return () => clearTimeout(t);
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              className="absolute left-1/2 top-1/2 rounded-sm"
              style={{
                width: p.size,
                height: p.size * 0.6,
                backgroundColor: p.color,
              }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: p.x * 20,
                y: 400,
                opacity: 0,
                rotate: p.rotation + 720,
              }}
              transition={{
                duration: 2,
                delay: p.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
