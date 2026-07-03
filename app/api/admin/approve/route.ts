import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { linkId } = await request.json();
    const { data, error } = await (supabaseAdmin as any)
      .from('links')
      .update({ status: 'approved' })
      .eq('id', linkId)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, link: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to approve the item right now' }, { status: 500 });
  }
}
