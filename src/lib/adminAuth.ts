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
  return (
    process.env.ADMIN_PASSWORD ||
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
    'admin123'
  );
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
