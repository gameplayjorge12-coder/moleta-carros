import { NextRequest, NextResponse } from 'next/server';
import { validateSignal } from '@/lib/mesh/signal';
import { pgClient } from '@/lib/adminDb';

// Ingestão de sinais do MALHA. Server-only: usa a chave secreta (bypassa RLS).
// O browser nunca escreve no banco — só fala com esta rota. [append-only em mesh_sinal]
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip');
}

function geoFrom(req: NextRequest): Record<string, string> | null {
  const country = req.headers.get('x-vercel-ip-country');
  const region = req.headers.get('x-vercel-ip-country-region');
  const city = req.headers.get('x-vercel-ip-city');
  const geo: Record<string, string> = {};
  if (country) geo.country = country;
  if (region) geo.region = region;
  if (city) geo.city = decodeURIComponent(city);
  return Object.keys(geo).length ? geo : null;
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = validateSignal(raw);
  if (!parsed.success) {
    // payload ruim não contamina a fonte da verdade — descarta silenciosamente
    return new NextResponse(null, { status: 204 });
  }
  const s = parsed.data;

  const ip = clientIp(req);
  const geo = geoFrom(req);
  const ua = req.headers.get('user-agent');

  // Grava via POSTGRES_URL (mesmo caminho do admin, já comprovado em prod).
  // Superusuário → ignora RLS. INSERT é permitido pelo trigger append-only.
  const c = pgClient();
  try {
    await c.connect();
    await c.query(
      `insert into mesh_sinal (device_fp, site, tipo, veiculo_id, ip, geo, referrer, utm, payload)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        s.device_fp ?? null,
        s.site,
        s.tipo,
        s.veiculo_id ?? null,
        ip,
        geo ? JSON.stringify(geo) : null,
        s.referrer ?? null,
        s.utm ? JSON.stringify(s.utm) : null,
        JSON.stringify(s.payload ?? {}),
      ]
    );
    if (s.device_fp) {
      await c.query(
        `insert into mesh_device (device_fp, ua) values ($1,$2)
         on conflict (device_fp) do update set ultimo_visto = now(), ua = excluded.ua`,
        [s.device_fp, ua]
      );
    }
  } catch {
    // rastreio nunca derruba a UI; se o banco falhar, só não grava
  } finally {
    try {
      await c.end();
    } catch {
      /* noop */
    }
  }

  return new NextResponse(null, { status: 204 });
}
