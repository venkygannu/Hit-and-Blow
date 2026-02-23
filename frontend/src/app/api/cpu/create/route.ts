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

    if (error) {
      console.error('[cpu/create] insert failed:', error.message);
      return NextResponse.json(
        { error: 'Failed to start game', detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ gameId, difficulty });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Server error';
    console.error('[cpu/create] error:', message);
    if (message.includes('Missing') && message.includes('SUPABASE')) {
      return NextResponse.json(
        { error: 'Server misconfigured: add Supabase URL and keys in Vercel Environment Variables.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to start game', detail: message }, { status: 500 });
  }
}
