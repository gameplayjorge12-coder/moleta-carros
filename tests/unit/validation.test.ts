import { describe, it, expect } from 'vitest';
import { VehicleSchema } from '@/lib/validation';

const base = {
  titulo: 'Toyota RAV4 Prata',
  preco: 0,
  categoria: 'venda' as const,
  descricao: 'SUV',
  fotos: ['https://x.supabase.co/storage/v1/object/public/veiculos/rav4-1.jpg'],
  status: 'disponivel' as const,
};

describe('VehicleSchema — validação do cadastro', () => {
  it('aceita preço 0 (sob consulta)', () => {
    expect(VehicleSchema.safeParse(base).success).toBe(true);
  });

  it('aceita preço real', () => {
    expect(VehicleSchema.safeParse({ ...base, preco: 52000 }).success).toBe(true);
  });

  it('rejeita título curto', () => {
    expect(VehicleSchema.safeParse({ ...base, titulo: 'RAV' }).success).toBe(false);
  });

  it('rejeita categoria inválida', () => {
    expect(VehicleSchema.safeParse({ ...base, categoria: 'troca' }).success).toBe(false);
  });

  it('rejeita foto que não é URL', () => {
    expect(VehicleSchema.safeParse({ ...base, fotos: ['nao-e-url'] }).success).toBe(false);
  });
});
