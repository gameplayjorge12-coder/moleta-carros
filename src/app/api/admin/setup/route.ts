import { NextResponse } from 'next/server';
import { pgClient } from '@/lib/adminDb';

export const dynamic = 'force-dynamic';

/**
 * TEMPORÁRIA — trava a segurança do banco (rodar 1x, depois remover).
 * - RLS ligado + policy de leitura pública
 * - anon perde INSERT/UPDATE/DELETE (fecha brecha de spam); mantém SELECT
 * Escrita passa a ser só pelas rotas server-side (superusuário via POSTGRES_URL).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('token') !== 'moleta-setup-7k2p') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const client = pgClient();
  const done: string[] = [];
  try {
    await client.connect();

    await client.query(`ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY`);
    done.push('RLS habilitado');

    await client.query(`DROP POLICY IF EXISTS "public_read" ON public.veiculos`);
    await client.query(
      `CREATE POLICY "public_read" ON public.veiculos FOR SELECT USING (true)`
    );
    done.push('policy leitura pública criada');

    await client.query(
      `REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.veiculos FROM anon`
    );
    await client.query(`GRANT SELECT ON public.veiculos TO anon`);
    done.push('anon travado em SELECT');

    // Confere privilégios atuais do anon
    const priv = await client.query(
      `SELECT privilege_type FROM information_schema.role_table_grants
       WHERE grantee='anon' AND table_name='veiculos'`
    );
    await client.end();

    return NextResponse.json({
      ok: true,
      feito: done,
      privilegiosAnon: priv.rows.map((r: any) => r.privilege_type),
    });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message, feito: done }, { status: 500 });
  }
}
