import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { pgClient, storageObjectPaths, removeStorageObjects } from '@/lib/adminDb';
import { VehicleSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Busca 1 veículo (estado fresco p/ o form de edição e verificação em testes)
export async function GET(
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
      `SELECT id, titulo, preco, categoria, descricao, fotos, status, video_url, created_at, updated_at
         FROM public.veiculos WHERE id = $1`,
      [params.id]
    );
    await client.end();
    if (r.rowCount === 0) {
      return NextResponse.json({ error: 'veículo não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, veiculo: r.rows[0] });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Edição COMPLETA do veículo (título, preço, categoria, descrição, fotos, status, vídeo)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = VehicleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validação', detalhes: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const v = parsed.data;
  const videoUrl = v.video_url && v.video_url.trim() ? v.video_url.trim() : null;

  const client = pgClient();
  try {
    await client.connect();

    // Guarda o estado antigo para saber quais objetos ficaram órfãos após a edição
    const before = await client.query(
      `SELECT fotos, video_url FROM public.veiculos WHERE id = $1`,
      [params.id]
    );
    if (before.rowCount === 0) {
      await client.end();
      return NextResponse.json({ error: 'veículo não encontrado' }, { status: 404 });
    }

    const r = await client.query(
      `UPDATE public.veiculos
         SET titulo = $1, preco = $2, categoria = $3, descricao = $4,
             fotos = $5, status = $6, video_url = $7, updated_at = now()
       WHERE id = $8`,
      [v.titulo, v.preco, v.categoria, v.descricao, v.fotos, v.status, videoUrl, params.id]
    );
    await client.end();

    // Limpa do Storage o que saiu (fotos removidas / vídeo trocado) — best-effort
    const old = before.rows[0];
    const oldPaths = storageObjectPaths([...(old.fotos || []), old.video_url]);
    const newPaths = new Set(storageObjectPaths([...v.fotos, videoUrl]));
    const orphaned = oldPaths.filter((p) => !newPaths.has(p));
    const removidos = await removeStorageObjects(orphaned);

    return NextResponse.json({ ok: true, atualizados: r.rowCount, storage_removidos: removidos });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Atualização parcial: status (marcar vendido) e/ou vídeo
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

// Deletar veículo (+ limpa fotos/vídeos do Storage para não deixar lixo)
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

    // Pega os objetos antes de apagar a linha
    const before = await client.query(
      `SELECT fotos, video_url FROM public.veiculos WHERE id = $1`,
      [params.id]
    );

    const r = await client.query(
      `DELETE FROM public.veiculos WHERE id = $1`,
      [params.id]
    );
    await client.end();

    let removidos = 0;
    if (before.rowCount && before.rows[0]) {
      const paths = storageObjectPaths([
        ...(before.rows[0].fotos || []),
        before.rows[0].video_url,
      ]);
      removidos = await removeStorageObjects(paths);
    }

    return NextResponse.json({ ok: true, deletados: r.rowCount, storage_removidos: removidos });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
