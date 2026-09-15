import { Client } from 'pg';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Rota TEMPORÁRIA de manutenção — limpa veículos de lixo (sem imagem do Storage)
 * + duplicatas. Conecta direto no Postgres como superusuário (POSTGRES_URL do
 * runtime Vercel), o que ignora RLS e grants. Protegida por token. Remover após uso.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('token') !== 'moleta-cleanup-9f3a') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const conn =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL;

  if (!conn) {
    return NextResponse.json(
      {
        error: 'sem connection string',
        vars: {
          POSTGRES_URL: !!process.env.POSTGRES_URL,
          POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
          POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
        },
      },
      { status: 500 }
    );
  }

  // Remove sslmode da string (senão sobrepõe o ssl abaixo e exige cert válido)
  const cleanConn = conn.replace(/([?&])sslmode=[^&]+/g, '$1').replace(/[?&]$/, '');

  const client = new Client({
    connectionString: cleanConn,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const before = await client.query('SELECT count(*)::int AS n FROM public.veiculos');

    // 1. Apaga lixo: sem foto ou foto que não é do Supabase Storage
    const delLixo = await client.query(
      `DELETE FROM public.veiculos
       WHERE fotos IS NULL
          OR array_length(fotos, 1) IS NULL
          OR fotos[1] NOT LIKE '%/storage/v1/object/public/%'`
    );

    // 2. Apaga duplicatas por título, mantendo a mais recente
    const delDup = await client.query(
      `DELETE FROM public.veiculos a
       USING public.veiculos b
       WHERE a.titulo = b.titulo
         AND a.created_at < b.created_at`
    );

    const after = await client.query(
      'SELECT titulo FROM public.veiculos ORDER BY created_at DESC'
    );

    await client.end();

    return NextResponse.json({
      ok: true,
      antes: before.rows[0].n,
      deletadosLixo: delLixo.rowCount,
      deletadosDuplicatas: delDup.rowCount,
      restantes: after.rowCount,
      titulos: after.rows.map((r: any) => r.titulo),
    });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
