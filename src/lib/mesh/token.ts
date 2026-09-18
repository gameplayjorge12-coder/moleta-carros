/**
 * MALHA — Token-ponte (Camada 2 do plano).
 * Liga a navegação anônima (device_fp) ao telefone no momento do envio ao bot.
 * O ref curto vai no texto pré-pronto do wa.me; o bot lê e casa fp<->telefone.
 * Assinado com HMAC: adulterar o ref => rejeitado (não corrompe o grafo).
 */
import { createHmac, timingSafeEqual } from 'crypto';

const DEFAULT_SECRET = process.env.MESH_TOKEN_SECRET || 'dev-only-mesh-secret-change-me';

const b64url = (s: string) => Buffer.from(s, 'utf8').toString('base64url');
const unb64url = (s: string) => Buffer.from(s, 'base64url').toString('utf8');
const sign = (fp: string, secret: string) =>
  createHmac('sha256', secret).update(fp).digest('base64url').slice(0, 10);

/** Gera o token-ponte curto (ex: "bW9sZQ.aB3xK9..."). */
export function makeRef(deviceFp: string, secret: string = DEFAULT_SECRET): string {
  if (!deviceFp) throw new Error('deviceFp vazio');
  return `${b64url(deviceFp)}.${sign(deviceFp, secret)}`;
}

/** Lê o ref. Retorna o device_fp, ou null se ausente/malformado/adulterado. */
export function readRef(ref: string | null | undefined, secret: string = DEFAULT_SECRET): string | null {
  if (!ref || typeof ref !== 'string' || !ref.includes('.')) return null;
  const [enc, sig] = ref.split('.');
  if (!enc || !sig) return null;
  let fp: string;
  try {
    fp = unb64url(enc);
  } catch {
    return null;
  }
  if (!fp) return null;
  const expected = sign(fp, secret);
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return fp;
}

/** Extrai o ref de um texto de mensagem tipo "Oi! [ref: XXXX]". */
export function extractRef(text: string): string | null {
  const m = (text || '').match(/\[ref:\s*([A-Za-z0-9_\-.]+)\]/);
  return m ? m[1] : null;
}
