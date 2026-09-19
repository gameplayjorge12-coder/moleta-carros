import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moletaveiculos.com';

// robots.txt gerado pelo Next — libera o site todo pro Google, bloqueia só o
// painel admin e a API, e aponta o sitemap (chave pra descoberta das páginas).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
