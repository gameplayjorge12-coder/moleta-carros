import { NextResponse } from 'next/server';
import { pgClient } from '@/lib/adminDb';

export const dynamic = 'force-dynamic';

/** TEMPORÁRIA — libera categoria 'ambos' na constraint (rodar 1x, remover). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('token') !== 'moleta-cat-8w2n') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const client = pgClient();
  try {
    await client.connect();
    // remove a constraint de categoria antiga (nome dinâmico)
    await client.query(`
      DO $$
      DECLARE c text;
      BEGIN
        SELECT conname INTO c FROM pg_constraint
        WHERE conrelid='public.veiculos'::regclass AND contype='c'
          AND pg_get_constraintdef(oid) LIKE '%categoria%';
        IF c IS NOT NULL THEN
          EXECUTE 'ALTER TABLE public.veiculos DROP CONSTRAINT '||quote_ident(c);
        END IF;
      END $$;
    `);
    await client.query(`
      ALTER TABLE public.veiculos
      ADD CONSTRAINT veiculos_categoria_check
      CHECK (categoria IN ('venda','aluguel','ambos'))
    `);
    const r = await client.query(`
      SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint
      WHERE conrelid='public.veiculos'::regclass AND contype='c'
        AND pg_get_constraintdef(oid) LIKE '%categoria%'
    `);
    await client.end();
    return NextResponse.json({ ok: true, constraint: r.rows });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
