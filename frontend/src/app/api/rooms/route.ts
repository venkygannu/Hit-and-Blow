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
      console.error('[rooms POST] room insert failed:', roomErr?.message ?? roomErr);
      return NextResponse.json(
        { error: 'Failed to create room', detail: roomErr?.message },
        { status: 500 }
      );
    }

    const { error: playerErr } = await supabase.from('room_players').insert({
      room_id: room.id,
      role: 'player1',
      nickname,
    });

    if (playerErr) {
      console.error('[rooms POST] room_players insert failed:', playerErr?.message ?? playerErr);
      await supabase.from('rooms').delete().eq('id', room.id);
      return NextResponse.json(
        { error: 'Failed to create room', detail: playerErr?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code,
      roomId: code,
      roomUuid: room.id,
      role: 'player1',
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Server error';
    console.error('[rooms POST] error:', message);
    if (message.includes('Missing') && message.includes('SUPABASE')) {
      return NextResponse.json(
        { error: 'Server misconfigured: add Supabase URL and keys in Vercel Environment Variables.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Server error', detail: message }, { status: 500 });
  }
}
