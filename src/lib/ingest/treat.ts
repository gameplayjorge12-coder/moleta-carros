/**
 * Ingestão via WhatsApp — tratamento de imagem (Fase 1).
 *
 * O Marcelo manda a foto crua do carro (placa à mostra, girada, pesada). Aqui a
 * foto vira pronta pra vitrine: placa borrada, orientada, redimensionada e leve.
 *
 * Decisões (pesquisadas):
 *  - Modelos de visão (GPT-4o/Claude) LEEM placa bem mas erram o bounding box —
 *    ruins pra saber ONDE borrar. Por isso o detector é PLUGÁVEL e a impl de
 *    produção usa Plate Recognizer (robusto p/ placa BR/Mercosul, ângulo, borrão).
 *  - Placa é PIXELIZADA (resize down→up nearest), não blur gaussiano: fica
 *    ilegível de verdade e barato.
 *  - Fail-closed: sem token, a ROTA recusa a ingestão (não publica placa à mostra).
 *    Com detector, se a detecção FALHAR, a foto é descartada (nunca sobe sem tratar).
 *
 * Tudo via `sharp` (já dep do projeto) → roda no runtime Node da Vercel.
 */
import sharp, { type OverlayOptions } from 'sharp';

/** Caixa da placa em coordenadas NORMALIZADAS (0..1) relativas à imagem. */
export type BBox = { x: number; y: number; w: number; h: number };

/** Recebe a imagem (JPEG) e devolve as caixas das placas encontradas. */
export type PlateDetector = (jpeg: Buffer) => Promise<BBox[]>;

export type TreatOptions = {
  maxDim?: number; // maior lado após redimensionar
  quality?: number; // qualidade JPEG
  padding?: number; // folga em volta da placa (fração da imagem)
};

export type TreatResult = {
  buffer: Buffer;
  width: number;
  height: number;
  platesBlurred: number;
};

/** Pixeliza cada região (placa) e compõe de volta na imagem. Nunca lança por
 *  caixa fora do quadro — clampa e ignora as inválidas. */
export async function blurRegions(
  oriented: Buffer,
  boxes: BBox[],
  padding = 0.03
): Promise<Buffer> {
  if (!boxes.length) return oriented;
  const meta = await sharp(oriented).metadata();
  const W = meta.width ?? 0;
  const H = meta.height ?? 0;
  if (!W || !H) return oriented;

  const composites: OverlayOptions[] = [];
  for (const b of boxes) {
    let left = Math.floor((b.x - padding) * W);
    let top = Math.floor((b.y - padding) * H);
    let w = Math.ceil((b.w + padding * 2) * W);
    let h = Math.ceil((b.h + padding * 2) * H);
    // clampa dentro do quadro
    left = Math.min(Math.max(0, left), W - 1);
    top = Math.min(Math.max(0, top), H - 1);
    w = Math.min(W - left, w);
    h = Math.min(H - top, h);
    if (w <= 1 || h <= 1) continue;

    const small = { w: Math.max(3, Math.round(w / 12)), h: Math.max(3, Math.round(h / 12)) };
    const region = await sharp(oriented)
      .extract({ left, top, width: w, height: h })
      .resize(small.w, small.h, { fit: 'fill' })
      .resize(w, h, { kernel: 'nearest', fit: 'fill' })
      .toBuffer();
    composites.push({ input: region, left, top });
  }
  if (!composites.length) return oriented;
  return sharp(oriented).composite(composites).toBuffer();
}

/** Pipeline completo: orienta → borra placa → redimensiona → comprime. */
export async function treatImage(
  input: Buffer,
  detector?: PlateDetector,
  opts: TreatOptions = {}
): Promise<TreatResult> {
  const { maxDim = 1920, quality = 80, padding = 0.03 } = opts;

  // auto-orienta pela EXIF e materializa (dims passam a ser as visuais reais)
  const oriented = await sharp(input).rotate().toBuffer();

  let boxes: BBox[] = [];
  if (detector) {
    // fail-closed: detector configurado que FALHA propaga o erro — não publicamos
    // foto sem garantia de que a placa foi tratada (a rota/pipeline descarta a foto).
    boxes = await detector(oriented);
  }

  const blurred = await blurRegions(oriented, boxes, padding);
  const buffer = await sharp(blurred)
    .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  const outMeta = await sharp(buffer).metadata();
  return {
    buffer,
    width: outMeta.width ?? 0,
    height: outMeta.height ?? 0,
    platesBlurred: boxes.length,
  };
}

/**
 * Detector NOSSO (self-hosted): serviço de detecção de placa no VPS, exposto pelo bot
 * em `api.iafirst.trade/api/detect-placa` (modelo ONNX próprio, sem API externa, sem
 * custo por foto). Recebe o JPEG já orientado, devolve as caixas em pixel; aqui a gente
 * normaliza pra 0..1 (o que o blurRegions espera). Erro -> lança (fail-closed).
 */
export function createSelfHostedDetector(url: string, apiKey: string): PlateDetector {
  return async (jpeg: Buffer): Promise<BBox[]> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/octet-stream' },
      body: new Uint8Array(jpeg),
      signal: AbortSignal.timeout(40000),
    });
    if (!res.ok) throw new Error(`detector self-hosted ${res.status}`);
    const j = (await res.json()) as {
      w: number; h: number; boxes?: Array<{ x1: number; y1: number; x2: number; y2: number }>;
    };
    const W = j.w, H = j.h;
    if (!W || !H) return [];
    return (j.boxes ?? []).map((b) => ({
      x: b.x1 / W,
      y: b.y1 / H,
      w: (b.x2 - b.x1) / W,
      h: (b.y2 - b.y1) / H,
    }));
  };
}

/**
 * Detector de produção: Plate Recognizer (api.platerecognizer.com).
 * Precisa de PLATE_RECOGNIZER_TOKEN no runtime. Regiões default = Brasil.
 */
export function createPlateRecognizerDetector(
  token: string,
  regions: string[] = ['br']
): PlateDetector {
  return async (jpeg: Buffer): Promise<BBox[]> => {
    const meta = await sharp(jpeg).metadata();
    const W = meta.width ?? 0;
    const H = meta.height ?? 0;
    if (!W || !H) return [];

    const fd = new FormData();
    fd.append('upload', new Blob([new Uint8Array(jpeg)], { type: 'image/jpeg' }), 'car.jpg');
    for (const r of regions) fd.append('regions', r);

    const res = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
      method: 'POST',
      headers: { Authorization: `Token ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error(`plate-recognizer ${res.status}`);
    const j = (await res.json()) as { results?: Array<{ box?: Record<string, number> }> };

    return (j.results ?? [])
      .map((r) => r.box)
      .filter((b): b is Record<string, number> => !!b)
      .map((b) => ({
        x: b.xmin / W,
        y: b.ymin / H,
        w: (b.xmax - b.xmin) / W,
        h: (b.ymax - b.ymin) / H,
      }));
  };
}
