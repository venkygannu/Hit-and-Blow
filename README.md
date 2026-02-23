# Hit & Blow — Number Duel

A modern full-stack web game inspired by the classic **Hit and Blow** (Bulls and Cows). Play **real-time multiplayer** or vs **CPU** with three difficulty levels. Built to run **100% free** on Vercel + Supabase.

## Features

- **Online Multiplayer**: Create room, join with code, or Quick Match. Real-time sync via Supabase Realtime (or polling fallback).
- **CPU Battle**: Easy, Medium, Hard AI. State stored in Supabase.
- **UI**: Light/dark theme, glassmorphism, Framer Motion, confetti on win.
- **Tech**: Next.js (App Router), TypeScript, Tailwind, Zustand, Supabase (DB + Realtime). No separate backend server.

## Deploy for free (Vercel + Supabase)

1. **Supabase** (free tier)
   - Create a project at [supabase.com](https://supabase.com).
   - In **SQL Editor**, run the migration: copy contents of `supabase/migrations/001_init.sql` and run it.
   - In **Database → Replication**, add tables `rooms`, `room_players`, `guesses` to the `supabase_realtime` publication.
   - In **Settings → API** copy: Project URL, anon key, service_role key.

2. **Vercel** (free tier)
   - Push this repo to GitHub and import the project in Vercel. Set **Root Directory** to `frontend`.
   - In Vercel **Settings → Environment Variables** add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Deploy. Multiplayer and CPU both work on the same deployment.

## Local development

1. Copy `frontend/.env.example` to `frontend/.env.local` and fill in your Supabase URL and keys.
2. Run the same SQL migration in your Supabase project and enable Realtime for the tables above.
3. From the `frontend` folder:
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3000. No separate backend needed.

## Game Rules

- **Secret**: 4-digit number, all different digits (0–9).
- **Guess**: 4-digit number, no repeated digits.
- **Hit**: correct digit in correct position.
- **Blow**: correct digit in wrong position.
- First to **4 Hits** wins.

## Project structure

```
frontend/           # Next.js (deploy this to Vercel)
├── src/
│   ├── app/        # pages + API routes (rooms, cpu)
│   ├── components/
│   ├── store/      # Zustand
│   ├── hooks/      # useMultiplayer (fetch + Realtime/polling)
│   └── lib/        # gameLogic, cpuLogic, supabase, api
supabase/
└── migrations/     # SQL for rooms, players, secrets, guesses, cpu_games
```

The optional `backend/` folder (Express + Socket.io) is no longer required for the free Vercel + Supabase setup. You can keep it for self-hosting if you prefer.

## License

MIT.
