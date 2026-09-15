import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { pgClient } from '@/lib/adminDb';
import { VehicleSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// Criar veículo (admin)
export async function POST(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
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

  const client = pgClient();
  try {
    await client.connect();
    const r = await client.query(
      `INSERT INTO public.veiculos (titulo, preco, categoria, descricao, fotos, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [v.titulo, v.preco, v.categoria, v.descricao, v.fotos, v.status]
    );
    await client.end();
    return NextResponse.json({ ok: true, id: r.rows[0].id });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
