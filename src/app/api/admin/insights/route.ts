import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { pgClient } from '@/lib/adminDb';
import { computeInsights } from '@/lib/insights';

// Copiloto Moleta — inteligência do painel (Fase 1). Protegido por sessão admin.
// Lê sinais do MALHA (8 dias) + estoque e devolve os insights já computados.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  }

  const c = pgClient();
  try {
    await c.connect();
    const sinais = await c.query(
      `select tipo, veiculo_id, device_fp, criado_em
         from mesh_sinal
        where criado_em >= now() - interval '8 days'`
    );
    // preco::float8 → node-pg devolveria numeric como string; float8 vem number
    const veic = await c.query(
      `select id, titulo, preco::float8 as preco, categoria, status, fotos, created_at
         from veiculos`
    );
    const insights = computeInsights(sinais.rows as any, veic.rows as any, new Date());
    return NextResponse.json(insights);
  } catch {
    return NextResponse.json({ error: 'falha ao gerar inteligência' }, { status: 500 });
  } finally {
    try {
      await c.end();
    } catch {
      /* noop */
    }
  }
}
