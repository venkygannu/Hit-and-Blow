import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = (body.code as string)?.trim()?.toUpperCase();
    const nickname = (body.nickname as string) || 'Player';
    if (!code) return NextResponse.json({ error: 'Room code required' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .select('id')
      .eq('code', code)
      .single();

    if (roomErr || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from('room_players')
      .select('role')
      .eq('room_id', room.id);

    if (existing && existing.length >= 2) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    const role = existing?.some((r) => r.role === 'player1') ? 'player2' : 'player1';
    const { error: insertErr } = await supabase.from('room_players').insert({
      room_id: room.id,
      role,
      nickname,
    });

    if (insertErr) {
      return NextResponse.json({ error: 'Failed to join' }, { status: 500 });
    }

    return NextResponse.json({
      code,
      roomId: code,
      roomUuid: room.id,
      role,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
