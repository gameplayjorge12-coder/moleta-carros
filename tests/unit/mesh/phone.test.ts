import { describe, it, expect } from 'vitest';
import { normalizePhoneBR, dddRegiao } from '@/lib/mesh/phone';

describe('MALHA normalização de telefone [T2]', () => {
  it('11 dígitos (celular com 9) -> E.164', () => {
    expect(normalizePhoneBR('43999784846')).toBe('+5543999784846');
  });

  it('formatado com máscara -> E.164', () => {
    expect(normalizePhoneBR('(43) 99978-4846')).toBe('+5543999784846');
  });

  it('com prefixo 55 -> remove e normaliza', () => {
    expect(normalizePhoneBR('5543999784846')).toBe('+5543999784846');
    expect(normalizePhoneBR('+55 43 99978-4846')).toBe('+5543999784846');
  });

  it('10 dígitos (fixo) -> E.164', () => {
    expect(normalizePhoneBR('4332345678')).toBe('+554332345678');
  });

  it('inválidos -> null', () => {
    expect(normalizePhoneBR('123')).toBeNull();
    expect(normalizePhoneBR('')).toBeNull();
    expect(normalizePhoneBR('00999784846')).toBeNull(); // DDD < 11
    expect(normalizePhoneBR('abcdef')).toBeNull();
  });

  it('região por DDD', () => {
    expect(dddRegiao('+5543999784846')).toContain('Paraná');
    expect(dddRegiao('+5511999999999')).toContain('SP');
    expect(dddRegiao('+5599123456789')).toBe('DDD 99'); // desconhecido -> genérico
    expect(dddRegiao('nao-e164')).toBeNull();
  });
});
