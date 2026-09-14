import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Moleta Carros | Venda e Aluguel de Veículos em Uraí',
  description: 'Encontre o seu próximo carro com a Moleta Carros. Venda e aluguel de veículos de qualidade em Uraí, PR.',
  keywords: ['carros', 'venda', 'aluguel', 'locadora', 'Uraí', 'PR', 'veículos'],
  openGraph: {
    title: 'Moleta Carros',
    description: 'Venda e aluguel de veículos de qualidade',
    url: 'https://moleta-carros.com.br',
    siteName: 'Moleta Carros',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preload Critical Resources */}
        <link rel="preload" as="image" href="/logo.svg" />
        <link rel="dns-prefetch" href="https://wa.me" />

        {/* Vercel Analytics (if needed) */}
        <script
          defer
          src="https://cdn.vercel-insights.com/v1/vitals.js"
        />
      </head>
      <body className="bg-neutral-50 text-neutral-900 antialiased">
        <Providers>
          {/* Skip to main content (accessibility) */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary focus:text-white"
          >
            Pular para conteúdo principal
          </a>

          {children}
        </Providers>
      </body>
    </html>
  );
}
