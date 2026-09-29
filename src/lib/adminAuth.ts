import crypto from 'crypto';
import { cookies } from 'next/headers';

/**
 * Autenticação admin — server-side.
 * Senha conferida contra ADMIN_PASSWORD (env server-only, nunca NEXT_PUBLIC).
 * Sessão = cookie httpOnly com token derivado da senha (cliente não lê nem forja).
 */

export const ADMIN_COOKIE = 'moleta_admin';
const SALT = 'moleta-admin-v1';

export function adminPassword(): string {
  // Server-only (este módulo usa next/headers). Preferir ADMIN_PASSWORD (env server).
  // NEXT_PUBLIC_ADMIN_PASSWORD é lido só por compat de deploy legado e está DEPRECADO —
  // o prefixo NEXT_PUBLIC_ sugere exposição ao browser; nunca referenciar em componente
  // client. Remover assim que confirmado que ADMIN_PASSWORD (server-only) está no Vercel.
  const pw = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  if (pw) return pw;
  // Dev local: conveniência. Produção: FAIL-CLOSED — sem senha configurada o login fica
  // desabilitado (senha impossível de adivinhar) em vez de cair num default fraco (admin123).
  if (process.env.NODE_ENV !== 'production') return 'admin123';
  return crypto.randomUUID() + crypto.randomUUID();
}

export function expectedToken(): string {
  return crypto
    .createHash('sha256')
    .update(adminPassword() + SALT)
    .digest('hex');
}

export function isAuthed(): boolean {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  return !!c && c === expectedToken();
}
