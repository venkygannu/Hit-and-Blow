'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const darkMode = useGameStore((s) => s.darkMode);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  useEffect(() => {
    const saved = localStorage.getItem('hitblow_dark') === '1';
    if (saved) document.documentElement.classList.add('dark');
  }, []);
  return <>{children}</>;
}
