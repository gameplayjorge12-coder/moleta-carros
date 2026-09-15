'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, MessageCircle, Camera, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { priceLabel, categoriaLabel } from '@/lib/formatters';
import { getWhatsAppLink } from '@/lib/whatsapp';
import type { Database } from '@/types/database';

type Vehicle = Database['public']['Tables']['veiculos']['Row'];

interface CarCardProps {
  vehicle: Vehicle;
  index?: number;
}

/**
 * Card premium (Fase B):
 * - Hover: card sobe + sombra + foto dá zoom
 * - Foto abre a galeria (/carro/[id])
 * - Badge categoria + contador de fotos
 * - Preço ou "Sob consulta"
 */
export function CarCard({ vehicle, index = 0 }: CarCardProps) {
  const [imageError, setImageError] = useState(false);

  const mainPhoto = vehicle.fotos?.[0];
  const photoCount = vehicle.fotos?.length ?? 0;
  const isSoldOut = vehicle.status === 'vendido';
  const categoryLabel = categoriaLabel(vehicle.categoria);
  const whatsappLink = getWhatsAppLink(vehicle.titulo, vehicle.categoria, vehicle.preco);
  const href = `/carro/${vehicle.id}`;

  return (
    <div
      className="group card-animate flex flex-col overflow-hidden rounded-2xl bg-white border border-neutral-200/80 shadow-md
                 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Foto -> galeria */}
      <Link href={href} className="relative block h-52 sm:h-56 overflow-hidden bg-neutral-100">
        {mainPhoto && !imageError ? (
          <Image
            src={mainPhoto}
            alt={vehicle.titulo}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400">
            <span className="text-sm">Sem imagem</span>
          </div>
        )}

        {/* Gradiente inferior sutil */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Badge categoria */}
        <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
          {categoryLabel}
        </div>

        {/* Contador de fotos */}
        {photoCount > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-sm">
            <Camera className="w-3.5 h-3.5" />
            {photoCount}
          </div>
        )}

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="text-white font-bold text-lg tracking-wide">VENDIDO</span>
          </div>
        )}
      </Link>

      {/* Conteúdo */}
      <div className="flex-1 p-5 flex flex-col gap-3">
        <Link href={href}>
          <h3 className="font-bold text-lg leading-snug line-clamp-2 text-neutral-900 group-hover:text-primary transition-colors">
            {vehicle.titulo}
          </h3>
        </Link>

        {vehicle.descricao && (
          <p className="text-sm text-neutral-600 line-clamp-2">{vehicle.descricao}</p>
        )}

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="text-2xl font-extrabold text-primary leading-none">
            {vehicle.preco > 0 ? priceLabel(vehicle.preco) : (
              <span className="text-lg font-bold">Sob consulta</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <MapPin className="w-3.5 h-3.5" />
            Uraí, PR
          </div>
        </div>

        {/* Ações */}
        <div className="mt-auto pt-2 flex flex-col gap-2">
          <Link
            href={href}
            className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-secondary
                       border border-neutral-200 rounded-lg py-2.5 hover:border-primary hover:text-primary transition-colors"
          >
            Ver fotos e detalhes
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn-primary flex items-center justify-center gap-2 w-full text-sm ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}`}
            aria-label={`Falar sobre ${vehicle.titulo}`}
          >
            <MessageCircle className="w-4 h-4" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
