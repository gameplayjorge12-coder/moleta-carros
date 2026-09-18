import { describe, it, expect } from 'vitest';
import { makeRef, readRef, extractRef } from '@/lib/mesh/token';

const S = 'segredo-de-teste';

describe('MALHA token-ponte [T1]', () => {
  it('roundtrip: fp -> ref -> fp idêntico', () => {
    const fp = 'a1b2c3d4e5f6a7b8';
    const ref = makeRef(fp, S);
    expect(readRef(ref, S)).toBe(fp);
  });

  it('ref adulterado é rejeitado (retorna null)', () => {
    const fp = 'a1b2c3d4e5f6a7b8';
    const ref = makeRef(fp, S);
    const [enc] = ref.split('.');
    const forjado = `${enc}.0000000000`;
    expect(readRef(forjado, S)).toBeNull();
  });

  it('segredo errado é rejeitado', () => {
    const ref = makeRef('deadbeef', S);
    expect(readRef(ref, 'outro-segredo')).toBeNull();
  });

  it('ref ausente/malformado -> null (não explode)', () => {
    expect(readRef(null, S)).toBeNull();
    expect(readRef('', S)).toBeNull();
    expect(readRef('sem-ponto', S)).toBeNull();
    expect(readRef('a.b.c.d', S)).toBeNull();
  });

  it('extractRef pega o ref de um texto de mensagem', () => {
    const ref = makeRef('xyz123', S);
    expect(extractRef(`Oi Marcelo! [ref: ${ref}] quero o carro`)).toBe(ref);
    expect(extractRef('sem ref aqui')).toBeNull();
  });

  it('fim-a-fim: mensagem do bot -> extrai -> lê fp', () => {
    const fp = 'ffeeddccbbaa9988';
    const msg = `Olá! [ref: ${makeRef(fp, S)}]`;
    expect(readRef(extractRef(msg), S)).toBe(fp);
  });
});
