import type { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moletaveiculos.com';

// Sitemap dinâmico: home + uma URL por carro disponível.
// É o mapa que o Google lê pra saber quais páginas existem. Sem isso,
// só descobre o que acha por link — lento e incompleto num site novo.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('veiculos')
      .select('id, updated_at, created_at')
      .eq('status', 'disponivel')
      .order('created_at', { ascending: false });

    const carRoutes: MetadataRoute.Sitemap = (data ?? []).map((v: any) => ({
      url: `${SITE_URL}/carro/${v.id}`,
      lastModified: new Date(v.updated_at ?? v.created_at ?? Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...carRoutes];
  } catch {
    // Se o Supabase falhar, ao menos a home entra no sitemap.
    return staticRoutes;
  }
}
