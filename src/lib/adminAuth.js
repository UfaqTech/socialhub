import jwt from 'jsonwebtoken';

const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

export function verifyAdminFromRequest(req) {
  if (!ADMIN_SESSION_SECRET) {
    throw new Error('Missing ADMIN_SESSION_SECRET env var');
  }

  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  if (!match) return null;
  const token = decodeURIComponent(match[1]);

  try {
    const payload = jwt.verify(token, ADMIN_SESSION_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

export function requireAdmin(req) {
  const payload = verifyAdminFromRequest(req);
  if (!payload) {
    const res = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    throw res;
  }
  return payload;
}
