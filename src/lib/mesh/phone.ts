/**
 * MALHA — Normalização de telefone BR + região por DDD (Camada 3/5).
 * Entrada em qualquer formato -> E.164 (+55DDDNUMERO). null se inválido.
 */

// Subconjunto de DDDs (foco na região do Moleta — Uraí/PR = 43). Expandir conforme rede cresce.
const DDD_REGIAO: Record<string, string> = {
  '43': 'PR — Londrina/Norte do Paraná',
  '41': 'PR — Curitiba/RMC',
  '44': 'PR — Maringá',
  '45': 'PR — Cascavel/Oeste',
  '11': 'SP — Capital',
  '21': 'RJ — Capital',
  '85': 'CE — Fortaleza',
};

/** Normaliza para E.164 BR. Aceita 10/11 dígitos (com/sem 9) e prefixo 55. */
export function normalizePhoneBR(input: string): string | null {
  let n = (input || '').replace(/\D/g, '');
  if (n.startsWith('55') && (n.length === 12 || n.length === 13)) n = n.slice(2);
  if (n.length !== 10 && n.length !== 11) return null;
  const ddd = Number(n.slice(0, 2));
  if (ddd < 11) return null; // DDD BR válido começa em 11
  return `+55${n}`;
}

/** Região a partir do E.164 (+55DD...). */
export function dddRegiao(phoneE164: string): string | null {
  const m = (phoneE164 || '').match(/^\+55(\d{2})/);
  if (!m) return null;
  return DDD_REGIAO[m[1]] ?? `DDD ${m[1]}`;
}
