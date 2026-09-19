/**
 * MALHA — coletor do lado do browser (Camada 1→3).
 * Gera um device_fp estável (fingerprint leve + persistência local) e envia
 * sinais pro /api/track. Nunca toca no banco direto — só fala com a rota server.
 * Fire-and-forget com sendBeacon (sobrevive a clique que troca de página).
 */
import type { Signal } from './signal';

const FP_KEY = 'mesh_fp';

/** Componentes de fingerprint leves — estáveis por dispositivo/navegador. */
function collectComponents(): Record<string, unknown> {
  const nav = navigator;
  const scr = window.screen;
  let canvas = '';
  try {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('moleta-mesh', 2, 15);
      canvas = c.toDataURL().slice(-64);
    }
  } catch {
    /* canvas bloqueado (privacy) — segue sem ele */
  }
  return {
    ua: nav.userAgent,
    lang: nav.language,
    langs: (nav.languages || []).join(','),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${scr.width}x${scr.height}x${scr.colorDepth}`,
    hw: (nav as any).hardwareConcurrency ?? 0,
    mem: (nav as any).deviceMemory ?? 0,
    canvas,
  };
}

/** sha256 (16 hex) via SubtleCrypto — mesmo canon do fingerprint.ts (server). */
async function sha256Short(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

let cachedFp: string | null = null;

/** device_fp estável: cache em memória → localStorage → calcula e persiste. */
export async function getDeviceFp(): Promise<string> {
  if (cachedFp) return cachedFp;
  try {
    const stored = localStorage.getItem(FP_KEY);
    if (stored) return (cachedFp = stored);
  } catch {
    /* localStorage indisponível */
  }
  let fp: string;
  try {
    const c = collectComponents();
    const keys = Object.keys(c).sort();
    const canon = keys.map((k) => `${k}=${JSON.stringify(c[k])}`).join('|');
    fp = await sha256Short(canon);
  } catch {
    fp = Math.random().toString(36).slice(2, 18);
  }
  try {
    localStorage.setItem(FP_KEY, fp);
  } catch {
    /* ok — segue só em memória */
  }
  return (cachedFp = fp);
}

type TrackInput = Omit<Signal, 'site' | 'device_fp'> & { site?: string };

/** Envia um sinal. Best-effort — jamais lança nem trava a UI. */
export async function track(input: TrackInput): Promise<void> {
  try {
    const device_fp = await getDeviceFp();
    const body: Signal = {
      site: input.site || 'moleta',
      tipo: input.tipo,
      device_fp,
      veiculo_id: input.veiculo_id,
      referrer: document.referrer || undefined,
      utm: readUtm(),
      payload: input.payload,
    };
    const json = JSON.stringify(body);
    // sendBeacon sobrevive à navegação (clique no wa.me troca de aba/página)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([json], { type: 'application/json' }));
      return;
    }
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: json,
      keepalive: true,
    });
  } catch {
    /* rastreio nunca pode quebrar a experiência do usuário */
  }
}

/** Lê parâmetros utm, fbclid e gclid da URL (ROI por anúncio). */
function readUtm(): Record<string, string> | undefined {
  try {
    const p = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    for (const [k, v] of p.entries()) {
      if (/^utm_/.test(k) || k === 'fbclid' || k === 'gclid') out[k] = v;
    }
    return Object.keys(out).length ? out : undefined;
  } catch {
    return undefined;
  }
}
