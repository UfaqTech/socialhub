import { NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ufaqtech.global@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'UfaqTech@32303';

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  return NextResponse.json({ message: 'Logged in' });
}
