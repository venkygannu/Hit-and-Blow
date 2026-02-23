import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const code = (await params).code?.trim()?.toUpperCase();
    const body = await req.json().catch(() => ({}));
    const role = body.role as string;
    if (!code || !role) return NextResponse.json({ error: 'code, role required' }, { status: 400 });
    if (role !== 'player1' && role !== 'player2') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: room } = await supabase.from('rooms').select('id').eq('code', code).single();
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    await supabase.from('room_players').update({ ready: true }).eq('room_id', room.id).eq('role', role);

    const { data: players } = await supabase.from('room_players').select('ready').eq('room_id', room.id);
    const bothReady = players?.length === 2 && players?.every((p) => p.ready);

    if (bothReady) {
      await supabase
        .from('rooms')
        .update({
          phase: 'playing',
          turn: 'player1',
          turn_started_at: new Date().toISOString(),
        })
        .eq('id', room.id);
    } else {
      await supabase.from('rooms').update({ phase: 'ready_check' }).eq('id', room.id);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
