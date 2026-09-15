import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// Confirma se a sessão (cookie httpOnly) ainda é válida — fonte da verdade
export async function GET() {
  return NextResponse.json({ authed: isAuthed() });
}
