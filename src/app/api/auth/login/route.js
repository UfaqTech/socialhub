import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = jwt.sign({ email }, ADMIN_SESSION_SECRET, { expiresIn: '7d' });

  const isProd = process.env.NODE_ENV === 'production';
  const cookie = `token=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${isProd ? '; Secure' : ''}`;

  return NextResponse.json({ message: 'Logged in' }, { status: 200, headers: { 'Set-Cookie': cookie } });
}
