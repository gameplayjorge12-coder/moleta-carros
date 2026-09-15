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
  metadataBase: new URL('https://moleta-carros.vercel.app'),
  title: 'Moleta Carros | Venda e Aluguel de Veículos em Uraí',
  description: 'Encontre o seu próximo carro com a Moleta Carros. Venda e aluguel de veículos de qualidade em Uraí, PR.',
  keywords: ['carros', 'venda', 'aluguel', 'locadora', 'Uraí', 'PR', 'veículos'],
  openGraph: {
    title: 'Moleta Carros',
    description: 'Venda e aluguel de veículos de qualidade em Uraí, PR',
    url: 'https://moleta-carros.vercel.app',
    siteName: 'Moleta Carros',
    locale: 'pt_BR',
    type: 'website',
  },
  // favicon servido automaticamente por src/app/icon.svg
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://wa.me" />
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
