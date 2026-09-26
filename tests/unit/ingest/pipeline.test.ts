import { describe, it, expect } from 'vitest';
import { ingestCarFromWhatsApp, buildReply, type IngestDeps } from '@/lib/ingest/pipeline';
import type { VehicleDraft } from '@/lib/ingest/extract';

const draftBase: VehicleDraft = {
  titulo: 'VW Saveiro 1.6',
  preco: 42900,
  categoria: 'venda',
  descricao: 'Cabine estendida, revisado.',
  confianca: 0.9,
  faltando: ['ano'],
};

function deps(over: Partial<IngestDeps> = {}): IngestDeps {
  return {
    complete: async () => JSON.stringify({ ...draftBase, preco_texto: 'R$ 42.900' }),
    uploadImage: async (_raw, i) => ({ url: `https://cdn/foto-${i}.jpg`, platesBlurred: 1 }),
    insertVehicle: async () => 'veic-123',
    ...over,
  };
}

describe('buildReply', () => {
  it('confirma carro, fotos e placas borradas; pede o que faltou', () => {
    const msg = buildReply(draftBase, ['a.jpg', 'b.jpg'], 2);
    expect(msg).toContain('VW Saveiro 1.6');
    expect(msg).toContain('borrei 2 placa');
    expect(msg).toContain('ano'); // campo faltando
  });
  it('preço 0 vira "sob consulta"', () => {
    const msg = buildReply({ ...draftBase, preco: 0, faltando: [] }, ['a.jpg'], 0);
    expect(msg).toContain('sob consulta');
  });
});

describe('ingestCarFromWhatsApp', () => {
  it('fluxo feliz: extrai, sobe fotos, grava e confirma', async () => {
    const r = await ingestCarFromWhatsApp(
      { text: 'saveiro 42900', images: [Buffer.from('x'), Buffer.from('y')] },
      deps()
    );
    expect(r.id).toBe('veic-123');
    expect(r.fotos).toHaveLength(2);
    expect(r.platesBlurred).toBe(2);
    expect(r.reply).toContain('Cadastrei');
  });

  it('sem foto processável: NÃO grava e pede reenvio', async () => {
    const r = await ingestCarFromWhatsApp(
      { text: 'saveiro', images: [Buffer.from('x')] },
      deps({
        uploadImage: async () => {
          throw new Error('storage caiu');
        },
      })
    );
    expect(r.id).toBeNull();
    expect(r.fotos).toHaveLength(0);
    expect(r.reply).toMatch(/reenvia as fotos/i);
  });

  it('uma foto ruim não perde o carro (grava com as boas)', async () => {
    let call = 0;
    const r = await ingestCarFromWhatsApp(
      { text: 'saveiro', images: [Buffer.from('a'), Buffer.from('b')] },
      deps({
        uploadImage: async (_raw, i) => {
          call++;
          if (call === 1) throw new Error('foto 1 corrompida');
          return { url: `https://cdn/ok-${i}.jpg`, platesBlurred: 0 };
        },
      })
    );
    expect(r.fotos).toHaveLength(1);
    expect(r.id).toBe('veic-123');
  });
});
