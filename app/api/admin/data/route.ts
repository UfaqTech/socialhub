import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const [{ data: links, error: linksError }, { data: profileRows, error: profilesError }] = await Promise.all([
      supabaseAdmin.from('links').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('user_profiles').select('*').order('created_at', { ascending: false }),
    ]);

    if (linksError) throw linksError;
    if (profilesError) throw profilesError;

    let profiles: any[] = Array.isArray(profileRows) ? profileRows : [];

    if (!profiles.length) {
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      if (!authError && authUsers?.users) {
        profiles = authUsers.users.map((user: any) => ({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          role: user.user_metadata?.role || 'user',
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: user.created_at,
        }));
      }
    }

    return NextResponse.json({ links: links || [], profiles: profiles || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch data from Supabase' }, { status: 500 });
  }
}
