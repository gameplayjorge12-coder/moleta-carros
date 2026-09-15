import { describe, it, expect } from 'vitest';
import { MARCELO_PHONE } from '@/lib/constants';
import { getWhatsAppLink, getWhatsAppSimpleLink } from '@/lib/whatsapp';

describe('WhatsApp — número e links', () => {
  it('número do Marcelo está no padrão BR (13 dígitos, DDD 43)', () => {
    expect(MARCELO_PHONE).toBe('5543999784846');
    expect(MARCELO_PHONE).toMatch(/^55\d{11}$/);
  });

  it('link por carro aponta pro número certo e leva o modelo', () => {
    const link = getWhatsAppLink('Toyota RAV4 Prata', 'venda', 0);
    expect(link).toContain('wa.me/5543999784846');
    expect(decodeURIComponent(link)).toContain('Toyota RAV4 Prata');
  });

  it('link simples aponta pro número certo', () => {
    expect(getWhatsAppSimpleLink()).toContain('wa.me/5543999784846');
  });

  it('não usa mais o número placeholder antigo (Ceará)', () => {
    expect(getWhatsAppSimpleLink()).not.toContain('5585987654321');
  });
});
