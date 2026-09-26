import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { blurRegions, treatImage, type PlateDetector, type BBox } from '@/lib/ingest/treat';

// Gera uma foto sintética grande com uma "placa" (faixa ruidosa) numa posição
// conhecida — assim dá pra provar o pipeline sem baixar modelo nem rede.
async function fotoSintetica(width = 2400, height = 1600): Promise<Buffer> {
  const noise = Buffer.alloc(width * height * 3);
  for (let i = 0; i < noise.length; i++) noise[i] = Math.floor(Math.random() * 256);
  return sharp(noise, { raw: { width, height, channels: 3 } }).jpeg().toBuffer();
}

const boxPlaca: BBox = { x: 0.4, y: 0.75, w: 0.2, h: 0.08 };

describe('treatImage', () => {
  it('sem detector: orienta, redimensiona pra <=1920 e comprime em JPEG', async () => {
    const foto = await fotoSintetica();
    const r = await treatImage(foto, undefined, { maxDim: 1920 });
    expect(Math.max(r.width, r.height)).toBeLessThanOrEqual(1920);
    expect(r.platesBlurred).toBe(0);
    const meta = await sharp(r.buffer).metadata();
    expect(meta.format).toBe('jpeg');
    expect(r.buffer.length).toBeLessThan(foto.length); // ficou mais leve
  });

  it('com detector: borra a placa e reporta a contagem', async () => {
    const foto = await fotoSintetica();
    const detector: PlateDetector = async () => [boxPlaca];
    const r = await treatImage(foto, detector, { maxDim: 1920 });
    expect(r.platesBlurred).toBe(1);
    expect(Math.max(r.width, r.height)).toBeLessThanOrEqual(1920);
  });

  it('detector que falha NÃO derruba a ingestão (degrada sem borrar)', async () => {
    const foto = await fotoSintetica(800, 600);
    const detector: PlateDetector = async () => {
      throw new Error('api caiu');
    };
    const r = await treatImage(foto, detector);
    expect(r.platesBlurred).toBe(0);
    expect(r.buffer.length).toBeGreaterThan(0);
  });
});

describe('blurRegions', () => {
  it('pixeliza a região da placa (o conteúdo ali muda)', async () => {
    const foto = await fotoSintetica(1200, 800);
    const out = await blurRegions(foto, [boxPlaca]);

    // recorta a mesma região no original e no tratado; a pixelização reduz muito
    // a variação local → provamos que a área foi de fato alterada.
    const crop = (buf: Buffer) =>
      sharp(buf).extract({ left: 500, top: 610, width: 200, height: 60 }).raw().toBuffer();
    const antes = await crop(foto);
    const depois = await crop(out);
    expect(Buffer.compare(antes, depois)).not.toBe(0);

    // dimensões preservadas
    const m1 = await sharp(foto).metadata();
    const m2 = await sharp(out).metadata();
    expect(m2.width).toBe(m1.width);
    expect(m2.height).toBe(m1.height);
  });

  it('caixa fora do quadro é clampada/ignorada sem lançar', async () => {
    const foto = await fotoSintetica(600, 400);
    const forada: BBox = { x: 1.5, y: 1.5, w: 0.3, h: 0.3 };
    const out = await blurRegions(foto, [forada]);
    expect(out.length).toBeGreaterThan(0);
  });

  it('sem caixas devolve a imagem intacta', async () => {
    const foto = await fotoSintetica(400, 300);
    const out = await blurRegions(foto, []);
    expect(Buffer.compare(out, foto)).toBe(0);
  });
});
