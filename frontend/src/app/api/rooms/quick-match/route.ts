import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/** Find a waiting room with one player and join, or create new room. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const nickname = (body.nickname as string) || 'Player';
    const supabase = getSupabaseAdmin();

    const { data: rooms } = await supabase
      .from('rooms')
      .select('id, code')
      .eq('phase', 'waiting');

    for (const room of rooms || []) {
      const { data: players } = await supabase
        .from('room_players')
        .select('role')
        .eq('room_id', room.id);
      if (players && players.length === 1) {
        const role = 'player2';
        const { error: insertErr } = await supabase.from('room_players').insert({
          room_id: room.id,
          role,
          nickname,
        });
        if (!insertErr) {
          return NextResponse.json({
            code: room.code,
            roomId: room.code,
            roomUuid: room.id,
            role,
            isCreator: false,
          });
        }
      }
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];

    const { data: newRoom, error: roomErr } = await supabase
      .from('rooms')
      .insert({ code, phase: 'waiting' })
      .select('id')
      .single();

    if (roomErr || !newRoom) {
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    const { error: playerErr } = await supabase.from('room_players').insert({
      room_id: newRoom.id,
      role: 'player1',
      nickname,
    });

    if (playerErr) {
      await supabase.from('rooms').delete().eq('id', newRoom.id);
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    return NextResponse.json({
      code,
      roomId: code,
      roomUuid: newRoom.id,
      role: 'player1',
      isCreator: true,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
