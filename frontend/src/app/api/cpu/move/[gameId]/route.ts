import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { evaluateGuess } from '@/lib/gameLogic';
import { cpuGuess } from '@/lib/cpuLogic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const gameId = (await params).gameId;
    if (!gameId) return NextResponse.json({ error: 'gameId required' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: game, error: fetchErr } = await supabase
      .from('cpu_games')
      .select('secret, difficulty, history')
      .eq('game_id', gameId)
      .single();

    if (fetchErr || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const history = (game.history as { guess: string; hits: number; blows: number }[]) || [];
    const difficulty = game.difficulty as 'easy' | 'medium' | 'hard';
    const cpuGuessResult = cpuGuess(difficulty, history);
    const { hits, blows } = evaluateGuess(game.secret, cpuGuessResult);
    history.push({ guess: cpuGuessResult, hits, blows });

    if (hits === 4) {
      await supabase.from('cpu_games').delete().eq('game_id', gameId);
      return NextResponse.json({ guess: cpuGuessResult, hits, blows, win: true });
    }

    await supabase.from('cpu_games').update({ history }).eq('game_id', gameId);
    return NextResponse.json({ guess: cpuGuessResult, hits, blows, win: false });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
