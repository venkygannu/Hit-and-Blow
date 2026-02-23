'use client';

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  console.warn('Missing Supabase env vars; Realtime will be disabled.');
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
