/**
 * Ingestão via WhatsApp — orquestrador (Fase 1).
 *
 * Junta as peças: texto do Marcelo → ficha (extract) + fotos → tratadas (treat)
 * → sobe pro Storage → grava o veículo → devolve a MENSAGEM que o Marcelo recebe
 * de volta no WhatsApp (confirmação + o que faltou pra ele completar).
 *
 * Puro por injeção de dependências (`deps`) → 100% testável sem rede/banco.
 * A rota (route.ts) pluga as deps reais (LLM, Plate Recognizer, Supabase, PG).
 */
import { extractVehicleFromText, type Complete, type VehicleDraft } from './extract';
import type { PlateDetector } from './treat';
import { formatCurrency } from '../formatters';

export type IngestInput = {
  text: string;
  images: Buffer[]; // fotos cruas que o Marcelo mandou
};

export type IngestDeps = {
  complete: Complete;
  detect?: PlateDetector; // opcional — sem detector, só normaliza/comprime
  /** trata (borra placa/comprime) e sobe a foto; devolve a URL pública + se borrou */
  uploadImage: (raw: Buffer, index: number) => Promise<{ url: string; platesBlurred: number }>;
  /** grava o veículo e devolve o id */
  insertVehicle: (draft: VehicleDraft, fotos: string[]) => Promise<string>;
};

export type IngestResult = {
  id: string | null;
  draft: VehicleDraft;
  fotos: string[];
  platesBlurred: number;
  reply: string;
};

/** Monta a mensagem de volta pro Marcelo, na língua dele. */
export function buildReply(
  draft: VehicleDraft,
  fotos: string[],
  platesBlurred: number
): string {
  const preco = draft.preco > 0 ? formatCurrency(draft.preco) : 'sob consulta';
  const linhas: string[] = [];
  linhas.push(`✅ Cadastrei o *${draft.titulo}* (${preco}).`);
  linhas.push(`📸 ${fotos.length} foto(s) no ar${platesBlurred > 0 ? ` — borrei ${platesBlurred} placa(s) pra você` : ''}.`);

  if (draft.faltando.length) {
    linhas.push('');
    linhas.push('Só pra deixar redondo, me confirma:');
    for (const f of draft.faltando) linhas.push(`• ${f}`);
  }
  if (draft.confianca < 0.6) {
    linhas.push('');
    linhas.push('Não tenho certeza se peguei o modelo certo — se algo estiver errado, me manda o dado que eu ajusto.');
  }
  linhas.push('');
  linhas.push('Já dá pra ver no seu site. Quer que eu destaque ele?');
  return linhas.join('\n');
}

export async function ingestCarFromWhatsApp(
  input: IngestInput,
  deps: IngestDeps
): Promise<IngestResult> {
  const draft = await extractVehicleFromText(input.text, deps.complete);

  const fotos: string[] = [];
  let platesBlurred = 0;
  // trata + sobe as fotos em série (ordem = ordem que ele mandou; 1ª vira capa)
  for (let i = 0; i < input.images.length; i++) {
    try {
      const { url, platesBlurred: n } = await deps.uploadImage(input.images[i], i);
      fotos.push(url);
      platesBlurred += n;
    } catch {
      // uma foto ruim não pode perder o carro inteiro — segue com as demais
    }
  }

  let id: string | null = null;
  // só grava se tem pelo menos 1 foto (carro sem foto não entra na vitrine)
  if (fotos.length > 0) {
    id = await deps.insertVehicle(draft, fotos);
  }

  const reply =
    fotos.length === 0
      ? `Recebi a ficha do *${draft.titulo}*, mas não consegui processar nenhuma foto. Me reenvia as fotos que eu subo o carro. 📸`
      : buildReply(draft, fotos, platesBlurred);

  return { id, draft, fotos, platesBlurred, reply };
}
