/**
 * MALHA — Hash de fingerprint (Camada 1).
 * Recebe os componentes coletados no browser e devolve um device_fp estável.
 * Função PURA e determinística: mesmos componentes => mesmo fp (ordem não importa).
 */
import { createHash } from 'crypto';

export function hashFingerprint(components: Record<string, unknown>): string {
  const keys = Object.keys(components).sort();
  const canon = keys.map((k) => `${k}=${JSON.stringify(components[k])}`).join('|');
  return createHash('sha256').update(canon).digest('hex').slice(0, 16);
}
