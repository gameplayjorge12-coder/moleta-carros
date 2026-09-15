'use client';

import { MessageCircle } from 'lucide-react';
import { getWhatsAppSimpleLink } from '@/lib/whatsapp';

/** Botão de WhatsApp flutuante — sempre visível (conversão, Fase E). */
export function FloatingWhatsApp() {
  return (
    <a
      href={getWhatsAppSimpleLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#25D366] text-white font-bold pl-3.5 pr-5 py-3.5 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
