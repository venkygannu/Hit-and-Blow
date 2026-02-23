import { create } from 'zustand';
import type { GameMode, Difficulty, RoomState, GuessEntry, CpuGameState } from '@/types/game';

interface GameStore {
  mode: GameMode;
  setMode: (m: GameMode) => void;

  // Multiplayer
  room: RoomState | null;
  myRole: 'player1' | 'player2' | null;
  nickname: string;
  setNickname: (n: string) => void;
  setRoom: (r: RoomState | null) => void;
  setMyRole: (r: 'player1' | 'player2' | null) => void;

  // CPU
  cpu: CpuGameState;
  setCpu: (s: Partial<CpuGameState>) => void;
  addCpuGuess: (g: GuessEntry) => void;
  resetCpu: () => void;

  // UI
  darkMode: boolean;
  toggleDarkMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  musicEnabled: boolean;
  toggleMusic: () => void;
}

const defaultCpu: CpuGameState = {
  gameId: null,
  difficulty: 'medium',
  secret: null,
  guesses: [],
  playerTurn: true,
  thinking: false,
  winner: null,
};

export const useGameStore = create<GameStore>((set) => ({
  mode: null,
  setMode: (mode) => set({ mode }),

  room: null,
  myRole: null,
  nickname: typeof window !== 'undefined' ? localStorage.getItem('hitblow_nickname') || '' : '',
  setNickname: (nickname) => {
    if (typeof window !== 'undefined') localStorage.setItem('hitblow_nickname', nickname);
    set({ nickname });
  },
  setRoom: (room) => set({ room }),
  setMyRole: (myRole) => set({ myRole }),

  cpu: defaultCpu,
  setCpu: (patch) => set((s) => ({ cpu: { ...s.cpu, ...patch } })),
  addCpuGuess: (g) => set((s) => ({ cpu: { ...s.cpu, guesses: [...s.cpu.guesses, g] } })),
  resetCpu: () => set({ cpu: defaultCpu }),

  darkMode: typeof window !== 'undefined' ? localStorage.getItem('hitblow_dark') === '1' : false,
  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('hitblow_dark', next ? '1' : '0');
        document.documentElement.classList.toggle('dark', next);
      }
      return { darkMode: next };
    }),
  soundEnabled: true,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  musicEnabled: false,
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
}));
