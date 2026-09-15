import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { pgClient } from '@/lib/adminDb';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Atualizar status (ex: marcar vendido)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const sets: string[] = [];
  const vals: any[] = [];
  let i = 1;

  if (body?.status === 'disponivel' || body?.status === 'vendido') {
    sets.push(`status = $${i++}`);
    vals.push(body.status);
  }
  if (typeof body?.video_url === 'string') {
    sets.push(`video_url = $${i++}`);
    vals.push(body.video_url.trim() || null);
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: 'nada para atualizar' }, { status: 400 });
  }

  const client = pgClient();
  try {
    await client.connect();
    vals.push(params.id);
    const r = await client.query(
      `UPDATE public.veiculos SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i}`,
      vals
    );
    await client.end();
    return NextResponse.json({ ok: true, atualizados: r.rowCount });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Deletar veículo
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const client = pgClient();
  try {
    await client.connect();
    const r = await client.query(
      `DELETE FROM public.veiculos WHERE id = $1`,
      [params.id]
    );
    await client.end();
    return NextResponse.json({ ok: true, deletados: r.rowCount });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
