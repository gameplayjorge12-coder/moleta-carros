import { NextResponse } from 'next/server';
import { pgClient } from '@/lib/adminDb';

export const dynamic = 'force-dynamic';

/** TEMPORÁRIA — raio-x + endurecimento do contrato do banco (rodar 1x, remover). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('token') !== 'moleta-diag-5q8x') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const harden = searchParams.get('harden') === '1';
  const client = pgClient();
  const acoes: string[] = [];
  try {
    await client.connect();

    if (harden) {
      // Deixa UMA política limpa de leitura pública; remove redundantes/perigosas
      for (const p of ['Leitura publica', 'Escrita Admin', 'Admin full access']) {
        await client.query(`DROP POLICY IF EXISTS "${p}" ON public.veiculos`);
        acoes.push(`drop policy "${p}"`);
      }
      await client.query(`DROP POLICY IF EXISTS "public_read" ON public.veiculos`);
      await client.query(
        `CREATE POLICY "public_read" ON public.veiculos FOR SELECT USING (true)`
      );
      acoes.push('policy única public_read (SELECT) garantida');
      // Garante grants mínimos do anon (só leitura)
      await client.query(
        `REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.veiculos FROM anon`
      );
      await client.query(`GRANT SELECT ON public.veiculos TO anon`);
      acoes.push('anon travado em SELECT');
    }

    const rls = await client.query(
      `SELECT relrowsecurity FROM pg_class WHERE relname='veiculos'`
    );
    const policies = await client.query(
      `SELECT policyname, cmd, qual FROM pg_policies WHERE tablename='veiculos' ORDER BY policyname`
    );
    const grants = await client.query(
      `SELECT grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privs
       FROM information_schema.role_table_grants
       WHERE table_name='veiculos' AND grantee IN ('anon','authenticated','service_role')
       GROUP BY grantee ORDER BY grantee`
    );

    await client.end();
    return NextResponse.json({
      acoes,
      rls_ativo: rls.rows[0]?.relrowsecurity,
      policies: policies.rows,
      grants: grants.rows,
    });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message, acoes }, { status: 500 });
  }
}
