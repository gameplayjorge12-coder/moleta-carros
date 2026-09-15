import { NextResponse } from 'next/server';
import { pgClient } from '@/lib/adminDb';

export const dynamic = 'force-dynamic';

/** TEMPORÁRIA — adiciona coluna video_url (rodar 1x, remover). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('token') !== 'moleta-vid-6p4z') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const client = pgClient();
  try {
    await client.connect();
    await client.query(
      `ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS video_url text`
    );
    const r = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name='veiculos' AND column_name='video_url'`
    );
    await client.end();
    return NextResponse.json({ ok: true, coluna: r.rows });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
