import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const expectedEmail = process.env.ADMIN_EMAIL;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedEmail || !expectedPassword) {
      return NextResponse.json({ error: 'Admin credentials are not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel.' }, { status: 503 });
    }

    if (email === expectedEmail && password === expectedPassword) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
