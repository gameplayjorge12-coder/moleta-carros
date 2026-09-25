/**
 * Ingestão via WhatsApp — cérebro da extração (Fase 1).
 *
 * O Marcelo já manda os carros por WhatsApp: um monte de foto + uma ficha
 * digitada em texto corrido ("VW Saveiro 1.6, direção hidráulica, cabine
 * estendida, VALOR R$ 42.900"). Este módulo transforma esse texto livre nos
 * campos que o Supabase espera (mesmo shape do VehicleSchema).
 *
 * Desenho:
 *  - Função PURA + LLM INJETADO (`complete`) → 100% testável offline, sem SDK
 *    amarrado. Quem chama decide o provedor (mesma chave do EIXO).
 *  - Parser tolerante: normaliza preço, categoria e título mesmo que o LLM
 *    devolva sujeira; nunca lança em cima de campo faltando (default seguro).
 *  - NÃO decide foto aqui — mídia é tratada noutra etapa (borrar placa etc).
 */

export type VehicleDraft = {
  titulo: string;
  preco: number; // 0 = "sob consulta"
  categoria: 'venda' | 'aluguel' | 'ambos';
  descricao: string;
  /** confiança do modelo em ter entendido (0-1); baixo → pedir confirmação */
  confianca: number;
  /** o que o modelo NÃO conseguiu inferir — vira pergunta pro Marcelo */
  faltando: string[];
};

/** Assinatura mínima de um cliente LLM — injetada pra manter o módulo puro. */
export type Complete = (prompt: string) => Promise<string>;

const CATEGORIAS = new Set(['venda', 'aluguel', 'ambos']);

/**
 * Normaliza preço em texto BR pra número.
 *  "VALOR R$ 42.900"      → 42900
 *  "R$ 42.900,00"          → 42900
 *  "42 mil"                → 42000
 *  "sob consulta" / vazio  → 0
 */
export function parsePrecoBR(input: string | number | null | undefined): number {
  if (typeof input === 'number' && Number.isFinite(input)) return Math.max(0, Math.round(input));
  if (!input) return 0;
  const txt = String(input).toLowerCase().trim();
  if (!txt || /sob\s*consulta|a\s*combinar|consultar/.test(txt)) return 0;

  // "42 mil" / "42,5 mil"
  const mil = txt.match(/(\d+(?:[.,]\d+)?)\s*mil/);
  if (mil) {
    const n = parseFloat(mil[1].replace('.', '').replace(',', '.'));
    return Number.isFinite(n) ? Math.round(n * 1000) : 0;
  }

  // pega o primeiro bloco numérico com separadores BR (ponto=milhar, vírgula=decimal)
  const m = txt.match(/\d[\d.]*(?:,\d{1,2})?/);
  if (!m) return 0;
  const limpo = m[0].replace(/\./g, '').replace(',', '.');
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function normalizaCategoria(v: unknown): 'venda' | 'aluguel' | 'ambos' {
  const s = String(v ?? '').toLowerCase().trim();
  if (CATEGORIAS.has(s)) return s as 'venda' | 'aluguel' | 'ambos';
  if (/aluguel|loca[cç]/.test(s)) return 'aluguel';
  return 'venda';
}

function limpaTitulo(v: unknown): string {
  return String(v ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

/** Monta o prompt de extração. Exportado pra poder ser auditado/testado. */
export function buildExtractPrompt(texto: string): string {
  return [
    'Você extrai a ficha de UM carro a partir de uma mensagem de WhatsApp de um',
    'dono de revenda. A mensagem é texto corrido, informal, com abreviações.',
    'Responda SOMENTE um JSON válido, sem comentários, com este formato exato:',
    '{',
    '  "titulo": "Marca Modelo Ano (ex: Fiat Strada 2019)",',
    '  "preco_texto": "o preço como aparece na mensagem, ou vazio se não houver",',
    '  "categoria": "venda | aluguel | ambos",',
    '  "descricao": "itens e detalhes citados (opcionais, estado, km), 1-2 frases",',
    '  "confianca": 0.0,',
    '  "faltando": ["campos essenciais que a mensagem NÃO trouxe: ex ano, preco"]',
    '}',
    'Regras: nunca invente dados que não estão na mensagem. Se o ano não foi dito,',
    'não chute — coloque "ano" em faltando e deixe o título sem ano. confianca é',
    'sua certeza (0 a 1) de ter entendido o carro certo.',
    '',
    'Mensagem do dono:',
    '"""',
    texto.trim(),
    '"""',
  ].join('\n');
}

function extraiJson(raw: string): Record<string, unknown> {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('LLM não devolveu JSON');
  }
  return JSON.parse(raw.slice(start, end + 1));
}

/**
 * Texto livre do Marcelo → rascunho de veículo pronto pro Supabase.
 * `complete` é injetado (cliente LLM). Lança apenas se o LLM não devolver JSON.
 */
export async function extractVehicleFromText(
  texto: string,
  complete: Complete
): Promise<VehicleDraft> {
  const raw = await complete(buildExtractPrompt(texto));
  const j = extraiJson(raw);

  const faltando = Array.isArray(j.faltando) ? j.faltando.map(String) : [];
  const preco = parsePrecoBR((j.preco_texto as string) ?? '');
  // preço ausente é essencial → garante que entra no "faltando" pra pedir depois
  if (preco === 0 && !faltando.some((f) => /pre[cç]o/i.test(f))) faltando.push('preço');

  const confRaw = typeof j.confianca === 'number' ? j.confianca : 0.5;
  const confianca = Math.min(1, Math.max(0, confRaw));

  return {
    titulo: limpaTitulo(j.titulo) || 'Veículo (confirmar modelo)',
    preco,
    categoria: normalizaCategoria(j.categoria),
    descricao: String(j.descricao ?? '').replace(/\s+/g, ' ').trim().slice(0, 500),
    confianca,
    faltando,
  };
}
