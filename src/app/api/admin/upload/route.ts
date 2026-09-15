import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { supabaseSecret } from '@/lib/adminDb';

export const dynamic = 'force-dynamic';

// Upload de imagem p/ Supabase Storage (server-side, chave secreta)
export async function POST(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = supabaseSecret();
  if (!url || !secret) {
    return NextResponse.json({ error: 'config Supabase ausente' }, { status: 500 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    file = form.get('file') as File | null;
  } catch {
    return NextResponse.json({ error: 'form inválido' }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: 'arquivo ausente' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'apenas imagens' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'imagem máx 10MB' }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectName = `${Date.now()}-${safeName}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const up = await fetch(`${url}/storage/v1/object/veiculos/${objectName}`, {
    method: 'POST',
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      'Content-Type': file.type,
      'x-upsert': 'true',
    },
    body: bytes,
  });

  if (!up.ok) {
    return NextResponse.json(
      { error: 'falha no upload', detalhe: await up.text() },
      { status: 500 }
    );
  }

  const publicUrl = `${url}/storage/v1/object/public/veiculos/${objectName}`;
  return NextResponse.json({ ok: true, url: publicUrl });
}
