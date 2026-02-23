import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/** GET room state by code (for initial load and polling). Does not include secrets. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const code = (await params).code?.trim()?.toUpperCase();
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single();

    if (roomErr || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const { data: players } = await supabase
      .from('room_players')
      .select('role, nickname, ready')
      .eq('room_id', room.id);

    const { data: secrets } = await supabase
      .from('room_secrets')
      .select('role')
      .eq('room_id', room.id);

    const { data: guesses } = await supabase
      .from('guesses')
      .select('guess, hits, blows, by_role, created_at')
      .eq('room_id', room.id)
      .order('created_at', { ascending: true });

    const p1 = players?.find((p) => p.role === 'player1');
    const p2 = players?.find((p) => p.role === 'player2');
    const hasSecret1 = secrets?.some((s) => s.role === 'player1');
    const hasSecret2 = secrets?.some((s) => s.role === 'player2');

    const state = {
      roomId: room.code,
      roomUuid: room.id,
      player1: p1
        ? {
            socketId: '',
            nickname: p1.nickname,
            ready: p1.ready,
            secret: hasSecret1 ? true : undefined,
          }
        : null,
      player2: p2
        ? {
            socketId: '',
            nickname: p2.nickname,
            ready: p2.ready,
            secret: hasSecret2 ? true : undefined,
          }
        : null,
      turn: room.turn,
      phase: room.phase,
      guesses: (guesses || []).map((g) => ({
        guess: g.guess,
        hits: g.hits,
        blows: g.blows,
        by: g.by_role,
        at: new Date(g.created_at).getTime(),
      })),
      winner: room.winner,
      turnStartedAt: room.turn_started_at ? new Date(room.turn_started_at).getTime() : null,
      turnDurationSeconds: room.turn_duration_seconds ?? 60,
    };

    return NextResponse.json(state);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
