import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateSignal } from '@/lib/mesh/signal';
import { supabaseSecret } from '@/lib/adminDb';

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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = supabaseSecret();
  if (!url || !secret) {
    // sem credencial server → não derruba a UI; só não grava
    return new NextResponse(null, { status: 204 });
  }

  const supabase = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ip = clientIp(req);
  const geo = geoFrom(req);
  const ua = req.headers.get('user-agent');

  try {
    await supabase.from('mesh_sinal').insert({
      device_fp: s.device_fp ?? null,
      site: s.site,
      tipo: s.tipo,
      veiculo_id: s.veiculo_id ?? null,
      ip,
      geo,
      referrer: s.referrer ?? null,
      utm: s.utm ?? null,
      payload: s.payload ?? {},
    });

    // atualiza/insere o dispositivo (primeiro_visto fica no default no insert novo)
    if (s.device_fp) {
      await supabase
        .from('mesh_device')
        .upsert(
          { device_fp: s.device_fp, ultimo_visto: new Date().toISOString(), ua },
          { onConflict: 'device_fp' }
        );
    }
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, { status: 204 });
}
