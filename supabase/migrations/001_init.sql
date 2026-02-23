-- Hit and Blow: rooms, players (no secret), secrets (server-only), guesses, cpu_games
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- Rooms (code = 6-char for share URL)
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  phase text not null default 'waiting' check (phase in ('waiting','ready_check','playing','finished')),
  turn text check (turn in ('player1','player2')),
  turn_started_at timestamptz,
  turn_duration_seconds int default 60,
  winner text check (winner in ('player1','player2')),
  created_at timestamptz default now()
);

-- Players per room (no secret here; use room_secrets for server-only)
create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  role text not null check (role in ('player1','player2')),
  nickname text not null,
  ready boolean default false,
  unique(room_id, role)
);

-- Secrets stored separately; only server (service_role) reads these
create table if not exists public.room_secrets (
  room_id uuid references public.rooms(id) on delete cascade not null,
  role text not null check (role in ('player1','player2')),
  secret text not null,
  primary key (room_id, role)
);

-- Guesses (hits/blows computed by server)
create table if not exists public.guesses (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  guess text not null,
  hits int not null,
  blows int not null,
  by_role text not null check (by_role in ('player1','player2')),
  created_at timestamptz default now()
);

-- CPU games (state for serverless)
create table if not exists public.cpu_games (
  game_id text primary key,
  secret text not null,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  history jsonb default '[]'::jsonb
);

-- Enable Realtime: In Supabase Dashboard → Database → Replication →
-- add tables public.rooms, public.room_players, public.guesses to supabase_realtime publication.

-- RLS: allow read for rooms, room_players, guesses (client needs for Realtime)
-- Service role bypasses RLS; anon can read so Realtime delivers to subscribers
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.room_secrets enable row level security;
alter table public.guesses enable row level security;
alter table public.cpu_games enable row level security;

-- Allow anon to read (for Realtime); writes go through API with service role
create policy "Allow read rooms" on public.rooms for select using (true);
create policy "Allow read room_players" on public.room_players for select using (true);
create policy "Allow read guesses" on public.guesses for select using (true);
-- No policy for room_secrets/cpu_games for anon; only service role
create policy "Allow read room_secrets" on public.room_secrets for select using (false);
create policy "Allow read cpu_games" on public.cpu_games for select using (false);
