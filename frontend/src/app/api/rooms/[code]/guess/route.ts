import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { validateGuess, evaluateGuess } from '@/lib/gameLogic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const code = (await params).code?.trim()?.toUpperCase();
    const body = await req.json().catch(() => ({}));
    const role = body.role as string;
    const guess = (body.guess as string)?.trim();
    if (!code || !role || !guess) {
      return NextResponse.json({ error: 'code, role, guess required' }, { status: 400 });
    }
    if (role !== 'player1' && role !== 'player2') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    const valid = validateGuess(guess);
    if (!valid.valid) return NextResponse.json({ error: valid.error }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: room } = await supabase.from('rooms').select('id, phase, turn').eq('code', code).single();
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    if (room.phase !== 'playing') return NextResponse.json({ error: 'Game not started' }, { status: 400 });
    if (room.turn !== role) return NextResponse.json({ error: 'Not your turn' }, { status: 400 });

    const opponentRole = role === 'player1' ? 'player2' : 'player1';
    const { data: secretRow } = await supabase
      .from('room_secrets')
      .select('secret')
      .eq('room_id', room.id)
      .eq('role', opponentRole)
      .single();

    if (!secretRow?.secret) return NextResponse.json({ error: 'Opponent secret not set' }, { status: 400 });

    const { hits, blows } = evaluateGuess(secretRow.secret, guess);

    await supabase.from('guesses').insert({
      room_id: room.id,
      guess,
      hits,
      blows,
      by_role: role,
    });

    const win = hits === 4;
    const nextTurn = opponentRole;
    const updates: Record<string, unknown> = {
      turn: nextTurn,
      turn_started_at: new Date().toISOString(),
    };
    if (win) {
      updates.phase = 'finished';
      updates.winner = role;
    }

    await supabase.from('rooms').update(updates).eq('id', room.id);

    return NextResponse.json({ ok: true, hits, blows, win });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
