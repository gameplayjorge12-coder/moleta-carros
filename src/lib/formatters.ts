/**
 * Funções de formatação de dados
 */

/**
 * Formata número como moeda brasileira (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Rótulo de preço: "Sob consulta" quando 0 (valor combinado no WhatsApp),
 * senão o valor formatado em R$.
 */
export function priceLabel(value: number): string {
  return value > 0 ? formatCurrency(value) : 'Sob consulta';
}

/** Rótulo da categoria (venda / aluguel / ambos). */
export function categoriaLabel(categoria: string): string {
  if (categoria === 'venda') return '🚗 Venda';
  if (categoria === 'aluguel') return '🔑 Locadora';
  if (categoria === 'ambos') return '🚗🔑 Venda e Aluguel';
  return categoria;
}

/**
 * Formata data para pt-BR
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(d);
}

/**
 * Formata data e hora
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Slug para URL
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-');
}

/**
 * Trunca texto com reticências
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).concat('...');
}

/**
 * Formata número de quilômetros
 */
export function formatKilometers(km: number): string {
  return `${km.toLocaleString('pt-BR')} km`;
}

/**
 * Capitaliza primeira letra
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
