import { describe, it, expect } from 'vitest';
import { hashFingerprint } from '@/lib/mesh/fingerprint';

describe('MALHA fingerprint [T3]', () => {
  const base = { ua: 'Mozilla/5.0', tela: '1080x2400', lang: 'pt-BR', tz: 'America/Sao_Paulo' };

  it('determinístico: mesmo input -> mesmo fp', () => {
    expect(hashFingerprint(base)).toBe(hashFingerprint({ ...base }));
  });

  it('independe da ordem das chaves', () => {
    const invertido = { tz: base.tz, lang: base.lang, tela: base.tela, ua: base.ua };
    expect(hashFingerprint(base)).toBe(hashFingerprint(invertido));
  });

  it('input diferente -> fp diferente', () => {
    expect(hashFingerprint(base)).not.toBe(hashFingerprint({ ...base, tela: '800x600' }));
  });

  it('fp é curto e estável (16 hex)', () => {
    expect(hashFingerprint(base)).toMatch(/^[0-9a-f]{16}$/);
  });
});
