import { NextResponse } from 'next/server';
import { pgClient } from '@/lib/adminDb';

export const dynamic = 'force-dynamic';

/** TEMPORÁRIA — raio-x do contrato do banco (rodar 1x, remover). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('token') !== 'moleta-diag-5q8x') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const client = pgClient();
  try {
    await client.connect();

    const rls = await client.query(
      `SELECT relrowsecurity FROM pg_class WHERE relname='veiculos'`
    );
    const policies = await client.query(
      `SELECT policyname, cmd, roles::text, qual FROM pg_policies WHERE tablename='veiculos'`
    );
    const grants = await client.query(
      `SELECT grantee, privilege_type FROM information_schema.role_table_grants
       WHERE table_name='veiculos' AND grantee IN ('anon','authenticated','service_role')
       ORDER BY grantee, privilege_type`
    );
    const cols = await client.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns WHERE table_name='veiculos' ORDER BY ordinal_position`
    );
    const constraints = await client.query(
      `SELECT conname, pg_get_constraintdef(oid) AS def
       FROM pg_constraint WHERE conrelid='public.veiculos'::regclass`
    );
    const counts = await client.query(
      `SELECT status, categoria, count(*)::int AS n FROM public.veiculos GROUP BY status, categoria`
    );
    const orphanCheck = await client.query(
      `SELECT count(*)::int AS n FROM public.veiculos
       WHERE fotos IS NULL OR array_length(fotos,1) IS NULL
          OR fotos[1] NOT LIKE '%/storage/v1/object/public/%'`
    );

    await client.end();
    return NextResponse.json({
      rls_ativo: rls.rows[0]?.relrowsecurity,
      policies: policies.rows,
      grants: grants.rows,
      colunas: cols.rows,
      constraints: constraints.rows,
      contagem: counts.rows,
      linhas_sem_foto_storage: orphanCheck.rows[0]?.n,
    });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
