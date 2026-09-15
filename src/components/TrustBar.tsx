import { ShieldCheck, MessageSquare, MapPin } from 'lucide-react';

/** Barra de confiança (Fase E) — reduz o medo de comprar usado. */
export function TrustBar() {
  const items = [
    { icon: ShieldCheck, t: 'Procedência garantida', s: 'Veículos selecionados' },
    { icon: MessageSquare, t: 'Atendimento direto', s: 'Fale com o Marcelo' },
    { icon: MapPin, t: 'Uraí, PR', s: 'Venha conhecer o pátio' },
  ];
  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 py-5 sm:justify-center">
            <it.icon className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="font-bold text-neutral-900 text-sm">{it.t}</p>
              <p className="text-xs text-neutral-500">{it.s}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
