import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, ArrowRight, Star, ChevronDown } from 'lucide-react';
import { getWhatsAppSimpleLink } from '@/lib/whatsapp';
import type { Database } from '@/types/database';

type Vehicle = Database['public']['Tables']['veiculos']['Row'];

/**
 * Hero cinematográfico — veículo em destaque de fundo (Ken Burns) + gradiente
 * escuro pra legibilidade + chamada e CTAs. Mobile-first.
 */
export function Hero({ featured }: { featured?: Vehicle | null }) {
  const img = featured?.fotos?.[0];

  return (
    <section className="relative h-[88vh] min-h-[540px] w-full overflow-hidden">
      {/* Fundo: veículo em destaque com zoom lento */}
      {img ? (
        <Image
          src={img}
          alt={featured?.titulo ?? 'Veículo em destaque'}
          fill
          priority
          sizes="100vw"
          className="object-cover ken-burns"
        />
      ) : (
        <div className="absolute inset-0 bg-secondary" />
      )}

      {/* Gradiente escuro (legibilidade + clima cinematográfico) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/25" />

      {/* Conteúdo */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-14 sm:pb-20">
        <span className="text-white/75 text-xs sm:text-sm font-semibold mb-4 uppercase tracking-[0.2em]">
          Moleta Veículos — Uraí, PR
        </span>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white max-w-3xl leading-[1.03] drop-shadow-lg">
          Encontre o carro que combina com você
        </h1>

        <p className="text-base sm:text-xl text-white/85 mt-4 max-w-xl">
          Seleção de veículos com procedência. Negociação direta com o Marcelo,
          sem burocracia.
        </p>

        {/* Chip do veículo em destaque */}
        {featured && (
          <Link
            href={`/carro/${featured.id}`}
            className="group mt-6 inline-flex items-center gap-3 w-fit bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full pl-2.5 pr-4 py-2 transition-all"
          >
            <span className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <Star className="w-3 h-3 fill-white" /> Destaque
            </span>
            <span className="text-white font-semibold text-sm sm:text-base">
              {featured.titulo}
            </span>
            <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 mt-8">
          <a href="#vitrine" className="btn-primary text-base px-6 py-3.5">
            Ver todos os veículos
          </a>
          <a
            href={getWhatsAppSimpleLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold px-6 py-3.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5" /> Falar no WhatsApp
          </a>
        </div>
      </div>

      {/* Seta pra rolar */}
      <a
        href="#vitrine"
        aria-label="Rolar para a vitrine"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 text-white/70 hover:text-white animate-bounce"
      >
        <ChevronDown className="w-7 h-7" />
      </a>
    </section>
  );
}
