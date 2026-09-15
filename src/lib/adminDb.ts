import { Client } from 'pg';

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
