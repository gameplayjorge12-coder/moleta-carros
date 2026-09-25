import { describe, it, expect } from 'vitest';
import { parsePrecoBR, buildExtractPrompt, extractVehicleFromText } from '@/lib/ingest/extract';

// Testa COMPORTAMENTO (não implementação): o cérebro da extração recebe o texto
// real que o Marcelo mandou no print e produz uma ficha usável, com LLM stubado.
describe('parsePrecoBR', () => {
  it('lê preço BR com milhar e "VALOR R$"', () => {
    expect(parsePrecoBR('VALOR R$ 42.900')).toBe(42900);
    expect(parsePrecoBR('R$ 42.900,00')).toBe(42900);
  });
  it('interpreta "mil"', () => {
    expect(parsePrecoBR('42 mil')).toBe(42000);
    expect(parsePrecoBR('42,5 mil')).toBe(42500);
  });
  it('sob consulta / vazio = 0', () => {
    expect(parsePrecoBR('sob consulta')).toBe(0);
    expect(parsePrecoBR('')).toBe(0);
    expect(parsePrecoBR(null)).toBe(0);
  });
  it('número puro passa direto', () => {
    expect(parsePrecoBR(38000)).toBe(38000);
  });
});

describe('buildExtractPrompt', () => {
  it('embute a mensagem e pede JSON', () => {
    const p = buildExtractPrompt('teste');
    expect(p).toContain('teste');
    expect(p).toContain('JSON');
    expect(p).toContain('faltando');
  });
});

describe('extractVehicleFromText', () => {
  // texto aproximado do print do WhatsApp do Marcelo
  const msgReal =
    'VW SAVEIRO 1.6, direção hidráulica, cabine marítima, som, alarme, ' +
    'carro revisado, cabine estendida lugar novo, fibra x dias novo, VALOR R$ 42.900';

  it('transforma o texto real do Marcelo numa ficha pronta', async () => {
    const stub = async () =>
      JSON.stringify({
        titulo: 'VW Saveiro 1.6',
        preco_texto: 'R$ 42.900',
        categoria: 'venda',
        descricao: 'Direção hidráulica, cabine estendida, som, alarme, revisado.',
        confianca: 0.9,
        faltando: ['ano'],
      });

    const draft = await extractVehicleFromText(msgReal, stub);
    expect(draft.titulo).toBe('VW Saveiro 1.6');
    expect(draft.preco).toBe(42900);
    expect(draft.categoria).toBe('venda');
    expect(draft.faltando).toContain('ano');
    expect(draft.confianca).toBeGreaterThan(0.8);
  });

  it('quando falta preço, marca em "faltando" pra pedir ao Marcelo', async () => {
    const stub = async () =>
      JSON.stringify({ titulo: 'Fiat Mobi', preco_texto: '', categoria: 'venda', confianca: 0.7 });
    const draft = await extractVehicleFromText('mobi prata', stub);
    expect(draft.preco).toBe(0);
    expect(draft.faltando.some((f) => /pre[cç]o/i.test(f))).toBe(true);
  });

  it('nunca deixa título vazio (default seguro)', async () => {
    const stub = async () => JSON.stringify({ preco_texto: '10 mil' });
    const draft = await extractVehicleFromText('???', stub);
    expect(draft.titulo.length).toBeGreaterThan(0);
    expect(draft.preco).toBe(10000);
  });

  it('lança se o LLM não devolver JSON', async () => {
    const stub = async () => 'desculpa, não entendi';
    await expect(extractVehicleFromText('x', stub)).rejects.toThrow();
  });
});
