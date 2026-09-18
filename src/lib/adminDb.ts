import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';

/**
 * Conexão direta ao Postgres (superusuário via POSTGRES_URL do runtime Vercel).
 * Usada só em rotas server-side de admin — nunca no cliente.
 * Ignora RLS/grants (o público segue travado em SELECT via anon).
 */
export function pgClient(): Client {
  const conn =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    '';
  // remove sslmode da string senão sobrepõe o ssl abaixo e exige cert válido
  const clean = conn.replace(/([?&])sslmode=[^&]+/g, '$1').replace(/[?&]$/, '');
  return new Client({
    connectionString: clean,
    ssl: { rejectUnauthorized: false },
  });
}

/** Chave secreta do Supabase (server-only) — funciona no Storage. */
export function supabaseSecret(): string {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

const STORAGE_MARKER = '/storage/v1/object/public/veiculos/';

/**
 * Extrai os caminhos DENTRO do bucket 'veiculos' a partir das URLs públicas.
 * Ignora URLs externas (ex: link de YouTube no video_url) — só volta o que é
 * objeto do nosso Storage, que é o único que dá pra (e faz sentido) apagar.
 */
export function storageObjectPaths(urls: (string | null | undefined)[]): string[] {
  const out: string[] = [];
  for (const u of urls) {
    if (!u) continue;
    const i = u.indexOf(STORAGE_MARKER);
    if (i === -1) continue; // externo (YouTube, etc) → não é nosso objeto
    const path = u.slice(i + STORAGE_MARKER.length).split('?')[0];
    if (path) out.push(decodeURIComponent(path));
  }
  return out;
}

/**
 * Remove objetos do Supabase Storage (best-effort). Nunca lança — a limpeza de
 * lixo não pode derrubar a operação principal (delete/edição do veículo).
 * Retorna quantos caminhos foram pedidos para remoção (0 se nada a fazer).
 */
export async function removeStorageObjects(paths: string[]): Promise<number> {
  if (!paths.length) return 0;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = supabaseSecret();
  if (!url || !secret) return 0;
  try {
    const supabase = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await supabase.storage.from('veiculos').remove(paths);
    return paths.length;
  } catch {
    return 0;
  }
}
