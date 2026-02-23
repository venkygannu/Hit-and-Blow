import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { cpuGenerateSecret } from '@/lib/cpuLogic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const difficulty = (body.difficulty as string) || 'medium';
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
    }

    const gameId = Math.random().toString(36).slice(2, 12);
    const secret = cpuGenerateSecret();

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('cpu_games').insert({
      game_id: gameId,
      secret,
      difficulty,
      history: [],
    });

    if (error) return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });

    return NextResponse.json({ gameId, difficulty });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
