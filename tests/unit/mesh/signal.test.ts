import { describe, it, expect } from 'vitest';
import { validateSignal } from '@/lib/mesh/signal';

describe('MALHA contrato do sinal [T4]', () => {
  it('sinal válido passa', () => {
    const r = validateSignal({
      site: 'moleta',
      tipo: 'whatsapp_click',
      device_fp: 'a1b2c3d4',
      veiculo_id: '11111111-1111-4111-8111-111111111111',
      utm: { utm_source: 'ig', fbclid: 'abc' },
      payload: { preco: 45000 },
    });
    expect(r.success).toBe(true);
  });

  it('sinal mínimo (só site+tipo) passa', () => {
    expect(validateSignal({ site: 'moleta', tipo: 'page_view' }).success).toBe(true);
  });

  it('tipo inválido rejeita', () => {
    expect(validateSignal({ site: 'moleta', tipo: 'hackerman' }).success).toBe(false);
  });

  it('site ausente rejeita', () => {
    expect(validateSignal({ tipo: 'page_view' }).success).toBe(false);
  });

  it('veiculo_id não-uuid rejeita', () => {
    expect(validateSignal({ site: 'moleta', tipo: 'car_detail_view', veiculo_id: 'nao-uuid' }).success).toBe(false);
  });
});
