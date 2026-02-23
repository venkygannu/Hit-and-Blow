import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { validateGuess, evaluateGuess } from '@/lib/gameLogic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const gameId = body.gameId as string;
    const guess = (body.guess as string)?.trim();
    if (!gameId || !guess) {
      return NextResponse.json({ error: 'gameId and guess required' }, { status: 400 });
    }

    const valid = validateGuess(guess);
    if (!valid.valid) return NextResponse.json({ error: valid.error }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: game, error: fetchErr } = await supabase
      .from('cpu_games')
      .select('secret, history')
      .eq('game_id', gameId)
      .single();

    if (fetchErr || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const history = (game.history as { guess: string; hits: number; blows: number }[]) || [];
    const { hits, blows } = evaluateGuess(game.secret, guess);
    history.push({ guess, hits, blows });

    if (hits === 4) {
      await supabase.from('cpu_games').delete().eq('game_id', gameId);
      return NextResponse.json({ hits, blows, win: true });
    }

    await supabase.from('cpu_games').update({ history }).eq('game_id', gameId);
    return NextResponse.json({ hits, blows, win: false });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
