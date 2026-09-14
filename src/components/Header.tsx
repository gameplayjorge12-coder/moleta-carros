'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppSimpleLink } from '@/lib/whatsapp';

/**
 * Header — Logo + Menu + WhatsApp CTA
 * Sticky ao scroll em mobile
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-secondary">Moleta</h1>
              <p className="text-xs text-neutral-500">Carros</p>
            </div>
          </Link>

          {/* CTA WhatsApp */}
          <a
            href={getWhatsAppSimpleLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2 text-sm md:text-base"
            aria-label="Falar com Marcelo no WhatsApp"
          >
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Falar com Marcelo</span>
            <span className="sm:hidden">Contato</span>
          </a>
        </div>
      </div>
    </header>
  );
}
