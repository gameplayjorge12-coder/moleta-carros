'use client';

import Image from 'next/image';
import { useState } from 'react';

/** Galeria de fotos do carro: foto grande + miniaturas clicáveis. */
export function CarGallery({ fotos, alt }: { fotos: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const main = fotos[active] ?? fotos[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-[4/3] bg-neutral-100 rounded-xl overflow-hidden">
        {main && (
          <Image
            src={main}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
          />
        )}
      </div>

      {fotos.length > 1 && (
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
    </div>
  );
}
