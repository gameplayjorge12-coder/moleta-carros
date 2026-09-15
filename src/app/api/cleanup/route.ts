import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Rota TEMPORÁRIA de manutenção — limpa veículos de lixo (sem imagem do Storage).
 * Usa a SERVICE_ROLE (disponível no runtime do Vercel) para bypassar RLS.
 * Protegida por token. Remover após uso.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (token !== 'moleta-cleanup-9f3a') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      {
        error: 'env ausente',
        hasUrl: !!supabaseUrl,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasSecret: !!process.env.SUPABASE_SECRET_KEY,
      },
      { status: 500 }
    );
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Ler tudo
  const { data: rows, error: selErr } = await admin
    .from('veiculos')
    .select('id, titulo, fotos');

  if (selErr) {
    return NextResponse.json(
      { step: 'select', error: selErr.message }, { status: 500 }
    );
  }

  const isStorage = (v: any) =>
    (v.fotos?.[0] || '').includes('/storage/v1/object/public/');

  // IDs de lixo (sem imagem do Storage)
  const lixoIds = (rows || []).filter((v) => !isStorage(v)).map((v) => v.id);

  // Dedupe: entre os do Storage, manter só 1 por título
  const seen = new Set<string>();
  const dupIds: string[] = [];
  for (const v of (rows || []).filter(isStorage)) {
    if (seen.has(v.titulo)) dupIds.push(v.id);
    else seen.add(v.titulo);
  }

  const idsToDelete = [...lixoIds, ...dupIds];

  let deleted = 0;
  const errors: string[] = [];
  if (idsToDelete.length > 0) {
    const { error: delErr, count } = await admin
      .from('veiculos')
      .delete({ count: 'exact' })
      .in('id', idsToDelete);
    if (delErr) errors.push(delErr.message);
    else deleted = count ?? idsToDelete.length;
  }

  const { data: after } = await admin.from('veiculos').select('id, titulo');

  return NextResponse.json({
    antes: rows?.length ?? 0,
    lixo: lixoIds.length,
    duplicatas: dupIds.length,
    deletados: deleted,
    restantes: after?.length ?? 0,
    titulosRestantes: (after || []).map((v: any) => v.titulo),
    errors,
  });
}
