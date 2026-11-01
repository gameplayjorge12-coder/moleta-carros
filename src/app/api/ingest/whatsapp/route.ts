import { NextResponse } from 'next/server';
import { pgClient, supabaseSecret } from '@/lib/adminDb';
import { llmFromEnv } from '@/lib/ingest/llm';
import { treatImage, createPlateRecognizerDetector, type PlateDetector } from '@/lib/ingest/treat';
import { ingestCarFromWhatsApp } from '@/lib/ingest/pipeline';
import type { VehicleDraft } from '@/lib/ingest/extract';
import { alertarDono } from '@/lib/alertar-dono';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Ingestão via WhatsApp — o bot do EIXO (após o gate por remetente) faz POST aqui
 * com o texto + as fotos do carro que o Marcelo mandou. Aqui a foto é tratada,
 * o carro é gravado no Supabase e a resposta ao Marcelo é devolvida pro EIXO enviar.
 *
 * Segurança: exige header x-ingest-secret == INGEST_SECRET (segredo compartilhado
 * com o bot). Nunca é chamada pelo público — só pela ponte EIXO→Moleta.
 */
export async function POST(req: Request) {
  const secret = process.env.INGEST_SECRET;
  if (!secret || req.headers.get('x-ingest-secret') !== secret) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  }

  let body: { text?: string; images?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const text = (body.text ?? '').trim();
  const imagesB64 = Array.isArray(body.images) ? body.images : [];
  if (!text && imagesB64.length === 0) {
    return NextResponse.json({ error: 'mensagem vazia' }, { status: 400 });
  }

  const complete = llmFromEnv();
  if (!complete) {
    return NextResponse.json({ error: 'LLM não configurado (ANTHROPIC_API_KEY/OPENAI_API_KEY)' }, { status: 500 });
  }

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaSecret = supabaseSecret();
  if (!supaUrl || !supaSecret) {
    return NextResponse.json({ error: 'config Supabase ausente' }, { status: 500 });
  }

  // Fail-closed de privacidade: sem detector de placa, NÃO ingerimos — publicar um
  // carro com a placa à mostra é vazamento. Melhor bloquear e avisar o dono do que
  // publicar sem borrar. Com o token, segue normal.
  const prToken = process.env.PLATE_RECOGNIZER_TOKEN;
  if (!prToken) {
    await alertarDono(
      'Moleta: ingestão BLOQUEADA (privacidade)',
      'Chegou carro pelo WhatsApp, mas PLATE_RECOGNIZER_TOKEN não está configurado — não publico foto sem borrar a placa. Configure o token pra ligar a ingestão.'
    ).catch(() => {});
    return NextResponse.json(
      { error: 'ingestão desabilitada: detector de placa não configurado (privacidade)' },
      { status: 503 }
    );
  }
  const detect: PlateDetector = createPlateRecognizerDetector(prToken);

  // decodifica as fotos (base64 → Buffer)
  const images: Buffer[] = [];
  for (const b64 of imagesB64) {
    try {
      images.push(Buffer.from(b64.replace(/^data:image\/\w+;base64,/, ''), 'base64'));
    } catch {
      /* ignora foto corrompida */
    }
  }

  const client = pgClient();
  await client.connect();
  try {
    const result = await ingestCarFromWhatsApp(
      { text, images },
      {
        complete,
        detect,
        uploadImage: async (raw, index) => {
          const treated = await treatImage(raw, detect);
          const objectName = `${Date.now()}-${index}.jpg`;
          const up = await fetch(`${supaUrl}/storage/v1/object/veiculos/${objectName}`, {
            method: 'POST',
            headers: {
              apikey: supaSecret,
              Authorization: `Bearer ${supaSecret}`,
              'Content-Type': 'image/jpeg',
              'x-upsert': 'true',
            },
            body: new Uint8Array(treated.buffer),
          });
          if (!up.ok) throw new Error(`storage ${up.status}`);
          return {
            url: `${supaUrl}/storage/v1/object/public/veiculos/${objectName}`,
            platesBlurred: treated.platesBlurred,
          };
        },
        insertVehicle: async (draft: VehicleDraft, fotos: string[]) => {
          const r = await client.query(
            `INSERT INTO public.veiculos (titulo, preco, categoria, descricao, fotos, status, video_url)
             VALUES ($1, $2, $3, $4, $5, 'disponivel', NULL) RETURNING id`,
            [draft.titulo, draft.preco, draft.categoria, draft.descricao, fotos]
          );
          return r.rows[0].id as string;
        },
      }
    );

    return NextResponse.json({
      ok: true,
      id: result.id,
      titulo: result.draft.titulo,
      fotos: result.fotos.length,
      platesBlurred: result.platesBlurred,
      reply: result.reply,
    });
  } catch (e: any) {
    const msg = e?.message ?? 'falha na ingestão';
    // Carro do Marcelo que não entra = lead perdido em silêncio. Avisa o dono (malha).
    await alertarDono('Moleta: ingestão de carro FALHOU', `Um carro enviado pelo WhatsApp não entrou no catálogo: ${msg}\n\nTexto: ${String(text).slice(0, 120)}`).catch(() => {});
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    try { await client.end(); } catch {}
  }
}
