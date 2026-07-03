import { getSupabaseAdminClient } from '../../../lib/supabaseAdmin';

export async function GET(req) {
  const supabaseAdmin = getSupabaseAdminClient();
  const url = new URL(req.url);
  const status = url.searchParams.get('status');

  let query = supabaseAdmin.from('links').select('id,title,url,category,sub_type,platform,status,user_id,created_at').order('created_at', { ascending: false });

  if (status === 'pending') {
    query = query.in('status', ['pending', 'waiting_approval']);
  } else if (status === 'approved') {
    query = query.eq('status', 'approved');
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req) {
  const supabaseAdmin = getSupabaseAdminClient();
  const body = await req.json();
  const { id, action } = body;

  if (!id || !action) {
    return new Response(JSON.stringify({ error: 'Missing id or action' }), { status: 400 });
  }

  if (action === 'approve') {
    const { error } = await supabaseAdmin.from('links').update({ status: 'approved' }).eq('id', id);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ message: 'Link approved' }), { status: 200 });
  }

  if (action === 'delete') {
    const { error } = await supabaseAdmin.from('links').delete().eq('id', id);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ message: 'Link deleted' }), { status: 200 });
  }

  if (action === 'reject') {
    const { error } = await supabaseAdmin.from('links').update({ status: 'rejected' }).eq('id', id);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ message: 'Link rejected' }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
}
