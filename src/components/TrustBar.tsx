import { ShieldCheck, MessageSquare, MapPin } from 'lucide-react';
import { getMapsLink, getWhatsAppSimpleLink } from '@/lib/whatsapp';

/**
 * Barra de confiança (Fase E) — reduz o medo de comprar usado.
 * Cada item é CLICÁVEL (a esposa do Marcelo clicou esperando ação e nada abria — 18/09):
 *  - Procedência -> rola pra vitrine
 *  - Atendimento -> abre WhatsApp
 *  - Localização -> abre o pátio no Google Maps
 * A dica ("· ver no mapa") deixa claro que dá pra tocar.
 */
export function TrustBar() {
  const items = [
    { icon: ShieldCheck, t: 'Procedência garantida', s: 'Veículos selecionados', href: '#vitrine', hint: 'ver vitrine' },
    { icon: MessageSquare, t: 'Atendimento direto', s: 'Fale com o Marcelo', href: getWhatsAppSimpleLink(), external: true, hint: 'abrir WhatsApp' },
    { icon: MapPin, t: 'Uraí, PR', s: 'Venha conhecer o pátio', href: getMapsLink(), external: true, hint: 'ver no mapa' },
  ];
  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200">
        {items.map((it, i) => (
          <a
            key={i}
            href={it.href}
            {...(it.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="group flex items-center gap-3 py-5 sm:justify-center hover:bg-neutral-50 transition-colors"
          >
            <it.icon className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="font-bold text-neutral-900 text-sm">{it.t}</p>
              <p className="text-xs text-neutral-500">
                {it.s}{' '}
                <span className="text-primary/70 group-hover:text-primary font-semibold">· {it.hint}</span>
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
