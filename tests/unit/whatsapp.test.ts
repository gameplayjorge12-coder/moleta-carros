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

  it('mensagem é texto limpo, sem emoji (evita caractere quebrado no WhatsApp)', () => {
    const msg = decodeURIComponent(
      getWhatsAppLink('Toyota Corolla Preto', 'venda', 0).split('text=')[1]
    );
    expect(msg).toContain('(Venda)');
    // nenhum caractere fora do range ASCII/latino comum (sem emoji)
    expect(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(msg)).toBe(false);
  });

  it('não usa mais o número placeholder antigo (Ceará)', () => {
    expect(getWhatsAppSimpleLink()).not.toContain('5585987654321');
  });
});

describe('WhatsApp — a conversa que o brasileiro realmente tem (C)', () => {
  const texto = (url: string) => decodeURIComponent(url.split('text=')[1] ?? '');

  it('mensagem do carro traz as perguntas humanas: financiamento, troca, disponível', () => {
    const t = texto(getWhatsAppLink('Toyota Corolla 2019', 'venda', 80000)).toLowerCase();
    expect(t).toContain('financiamento');
    expect(t).toContain('troca');
    expect(t).toContain('disponível');
  });

  it('link geral também abre espaço pra financiamento/troca', () => {
    const t = texto(getWhatsAppSimpleLink()).toLowerCase();
    expect(t).toContain('financiamento');
    expect(t).toContain('troca');
  });
});
