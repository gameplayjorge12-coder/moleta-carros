'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

/**
 * Galeria do carro:
 * - Foto grande com setas (◀ ▶) e botão de ampliar
 * - Miniaturas clicáveis
 * - Zoom em tela cheia (lightbox) com setas + teclado (Esc / ← →)
 */
export function CarGallery({ fotos, alt }: { fotos: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const total = fotos.length;

  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + total) % total),
    [total]
  );

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [zoom, go]);

  const main = fotos[active] ?? fotos[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Foto principal */}
      <div className="relative w-full aspect-[4/3] bg-neutral-100 rounded-xl overflow-hidden group">
        {main && (
          <Image
            src={main}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover cursor-zoom-in"
            onClick={() => setZoom(true)}
          />
        )}

        <button
          onClick={() => setZoom(true)}
          aria-label="Ampliar foto"
          className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {total > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
              {active + 1}/{total}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {total > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {fotos.map((f, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? 'border-primary' : 'border-transparent hover:border-neutral-300'
              }`}
            >
              <Image src={f} alt={`${alt} ${i + 1}`} fill className="object-cover" sizes="20vw" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / zoom em tela cheia */}
      {zoom && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={() => setZoom(false)}
        >
          <button
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            onClick={() => setZoom(false)}
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="relative w-[92vw] h-[82vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={main} alt={alt} fill className="object-contain" sizes="92vw" />
          </div>

          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Foto anterior"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Próxima foto"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-sm">
                {active + 1} / {total}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
