import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { supabaseSecret } from '@/lib/adminDb';

export const dynamic = 'force-dynamic';

/**
 * Gera uma URL assinada pra o navegador subir o vídeo DIRETO pro Supabase
 * Storage (não passa pela Vercel → sem o limite de 4.5MB). Protegida por login.
 */
export async function POST(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = supabaseSecret();
  if (!url || !secret) {
    return NextResponse.json({ error: 'config ausente' }, { status: 500 });
  }

  let filename = 'video.mp4';
  try {
    const b = await req.json();
    if (b?.filename) filename = String(b.filename);
  } catch {}

  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `videos/${Date.now()}-${safe}`;

  const supabase = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.storage
    .from('veiculos')
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || 'falha ao assinar upload' },
      { status: 500 }
    );
  }

  const publicUrl = `${url}/storage/v1/object/public/veiculos/${path}`;
  return NextResponse.json({ ok: true, path: data.path, token: data.token, publicUrl });
}
