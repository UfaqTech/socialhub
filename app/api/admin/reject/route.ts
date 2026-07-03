import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { linkId } = await request.json();
    const { error } = await (supabaseAdmin as any).from('links').delete().eq('id', linkId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to reject the item right now' }, { status: 500 });
  }
}
