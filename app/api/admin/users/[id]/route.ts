import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();

    const userMetadata: Record<string, unknown> = {};
    if (body.fullName) userMetadata.full_name = body.fullName;
    if (body.role) userMetadata.role = body.role;

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(params.id, {
      email: body.email,
      password: body.password,
      user_metadata: Object.keys(userMetadata).length > 0 ? userMetadata : undefined,
    });

    if (error) throw error;

    const profileUpdates: Record<string, unknown> = {};
    if (body.fullName) profileUpdates.full_name = body.fullName;
    if (body.email) profileUpdates.email = body.email;
    if (body.role) profileUpdates.role = body.role;

    if (Object.keys(profileUpdates).length > 0) {
      await (supabaseAdmin as any).from('user_profiles').update(profileUpdates).eq('id', params.id);
    }

    return NextResponse.json({ ok: true, user: data.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to update the profile' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(params.id);
    if (authError && authError.message !== 'User not found') {
      throw authError;
    }

    const { error: profileError } = await (supabaseAdmin as any).from('user_profiles').delete().eq('id', params.id);
    if (profileError) throw profileError;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to delete the profile' }, { status: 500 });
  }
}
