import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { validateGuess } from '@/lib/gameLogic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const code = (await params).code?.trim()?.toUpperCase();
    const body = await req.json().catch(() => ({}));
    const role = body.role as string;
    const secret = (body.secret as string)?.trim();
    if (!code || !role || !secret) {
      return NextResponse.json({ error: 'code, role, secret required' }, { status: 400 });
    }
    if (role !== 'player1' && role !== 'player2') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    const valid = validateGuess(secret);
    if (!valid.valid) return NextResponse.json({ error: valid.error }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: room } = await supabase.from('rooms').select('id').eq('code', code).single();
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    await supabase.from('room_secrets').upsert(
      { room_id: room.id, role, secret },
      { onConflict: 'room_id,role' }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
