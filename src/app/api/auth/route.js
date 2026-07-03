import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'supersecretpassword';

export async function POST(req) {
  const url = new URL(req.url);
  if (url.pathname.endsWith('/login')) {
    const body = await req.json();
    const { password } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Logged in' });
  }

  if (url.pathname.endsWith('/logout')) {
    return NextResponse.json({ message: 'Logged out' });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
