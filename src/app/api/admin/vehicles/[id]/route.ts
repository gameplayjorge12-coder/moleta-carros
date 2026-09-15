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

  let status = '';
  try {
    const body = await req.json();
    status = body?.status ?? '';
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  if (status !== 'disponivel' && status !== 'vendido') {
    return NextResponse.json({ error: 'status inválido' }, { status: 400 });
  }

  const client = pgClient();
  try {
    await client.connect();
    const r = await client.query(
      `UPDATE public.veiculos SET status = $1, updated_at = now() WHERE id = $2`,
      [status, params.id]
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
