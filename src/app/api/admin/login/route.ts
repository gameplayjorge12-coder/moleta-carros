import { NextResponse } from 'next/server';
import { adminPassword, expectedToken, ADMIN_COOKIE } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let password = '';
  try {
    const body = await req.json();
    password = body?.password ?? '';
  } catch {
    return NextResponse.json({ error: 'requisição inválida' }, { status: 400 });
  }

  if (password !== adminPassword()) {
    return NextResponse.json({ error: 'senha incorreta' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, expectedToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8h
  });
  return res;
}
