/**
 * MALHA — Classificador de ruído/bot (Camada 3, salvaguarda anti-contaminação).
 * Marca datacenter/estrangeiro/crawler para NÃO poluir métrica e grafo.
 * Lição herdada do PostHog do EIXO (separar dono/bot/humano real).
 */
const DATACENTER = [
  'amazon', 'aws', 'google', 'gcp', 'ovh', 'digitalocean', 'hetzner',
  'microsoft', 'azure', 'cloudflare', 'linode', 'vultr', 'oracle', 'contabo',
];

export interface NoiseInput {
  asn?: string;
  lang?: string;
  tz?: string;
  ua?: string;
}

export function isBotNoise(sig: NoiseInput): { bot: boolean; reason?: string } {
  const asn = (sig.asn || '').toLowerCase();
  if (asn && DATACENTER.some((d) => asn.includes(d))) return { bot: true, reason: 'datacenter_asn' };
  if (sig.ua && /bot|crawl|spider|headless|puppeteer|playwright|python|curl|wget/i.test(sig.ua))
    return { bot: true, reason: 'ua_bot' };
  if (sig.lang && !/pt/i.test(sig.lang)) return { bot: true, reason: 'lang_nao_pt' };
  if (sig.tz && !/America\//i.test(sig.tz)) return { bot: true, reason: 'tz_fora_americas' };
  return { bot: false };
}
