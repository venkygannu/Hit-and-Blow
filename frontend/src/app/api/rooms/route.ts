import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { validateGuess } from '@/lib/gameLogic';

function makeCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const nickname = (body.nickname as string) || 'Player';
    const supabase = getSupabaseAdmin();

    const code = makeCode();
    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .insert({ code, phase: 'waiting' })
      .select('id')
      .single();

    if (roomErr || !room) {
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    const { error: playerErr } = await supabase.from('room_players').insert({
      room_id: room.id,
      role: 'player1',
      nickname,
    });

    if (playerErr) {
      await supabase.from('rooms').delete().eq('id', room.id);
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    return NextResponse.json({
      code,
      roomId: code,
      roomUuid: room.id,
      role: 'player1',
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
