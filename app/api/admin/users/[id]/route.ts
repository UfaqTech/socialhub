import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.fullName) updates.full_name = body.fullName;
    if (body.email) updates.email = body.email;
    if (body.password) updates.password = body.password;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(params.id, {
      email: body.email,
      password: body.password,
      user_metadata: body.fullName ? { full_name: body.fullName } : undefined,
    });

    if (error) throw error;

    if (body.fullName || body.email) {
      await (supabaseAdmin as any).from('profiles').update({ full_name: body.fullName, email: body.email }).eq('id', params.id);
    }

    return NextResponse.json({ ok: true, user: data.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to update the profile' }, { status: 500 });
  }
}
