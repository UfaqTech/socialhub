import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const [{ data: links, error: linksError }, { data: profiles, error: profilesError }] = await Promise.all([
      supabaseAdmin.from('links').select('*'),
      supabaseAdmin.from('user_profiles').select('*'),
    ]);

    if (linksError) throw linksError;
    if (profilesError) throw profilesError;

    return NextResponse.json({ links: links || [], profiles: profiles || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch data from Supabase' }, { status: 500 });
  }
}
