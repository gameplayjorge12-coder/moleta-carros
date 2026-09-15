import { describe, it, expect } from 'vitest';
import { priceLabel, formatCurrency, categoriaLabel } from '@/lib/formatters';

describe('Categoria — rótulos', () => {
  it('venda / aluguel / ambos', () => {
    expect(categoriaLabel('venda')).toContain('Venda');
    expect(categoriaLabel('aluguel')).toContain('Locadora');
    expect(categoriaLabel('ambos')).toContain('Venda e Aluguel');
  });
});

describe('Preço — vitrine é showcase (valor no WhatsApp)', () => {
  it('preço 0 vira "Sob consulta"', () => {
    expect(priceLabel(0)).toBe('Sob consulta');
  });

  it('preço negativo/ inválido também vira "Sob consulta"', () => {
    expect(priceLabel(-1)).toBe('Sob consulta');
  });

  it('preço real formata em R$', () => {
    const s = priceLabel(52000);
    expect(s).toContain('R$');
    expect(s).toContain('52');
    expect(s).not.toBe('Sob consulta');
  });

  it('formatCurrency é BRL sem centavos', () => {
    expect(formatCurrency(1000)).toContain('R$');
  });
});
