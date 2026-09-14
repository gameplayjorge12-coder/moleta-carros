'use client';

import Image from 'next/image';
import { Heart, MapPin, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/lib/formatters';
import { getWhatsAppLink } from '@/lib/whatsapp';
import type { Database } from '@/types/database';

type Vehicle = Database['public']['Tables']['veiculos']['Row'];

interface CarCardProps {
  vehicle: Vehicle;
  index?: number; // Para stagger animation
}

/**
 * Card de veículo com:
 * - Foto (otimizada)
 * - Badge categoria
 * - Título + Preço (em LARANJA)
 * - Botão WhatsApp
 * - Hover zoom
 * - Fade-in ao scroll
 */
export function CarCard({ vehicle, index = 0 }: CarCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const mainPhoto = vehicle.fotos?.[0];
  const isSoldOut = vehicle.status === 'vendido';
  const categoryLabel = vehicle.categoria === 'venda' ? '🚗 Venda' : '🔑 Locadora';
  const whatsappLink = getWhatsAppLink(vehicle.titulo, vehicle.categoria, vehicle.preco);

  return (
    <div
      className="card card-animate overflow-hidden flex flex-col"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Imagem com hover zoom */}
      <div className="relative h-48 sm:h-56 bg-neutral-100 overflow-hidden image-hover">
        {mainPhoto && !imageError ? (
          <Image
            src={mainPhoto}
            alt={vehicle.titulo}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400">
            <span className="text-sm">Sem imagem</span>
          </div>
        )}

        {/* Badge Categoria */}
        <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold">
          {categoryLabel}
        </div>

        {/* Badge Vendido (se aplicável) */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">VENDIDO</span>
          </div>
        )}

        {/* Favoritar */}
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full transition-all"
        >
          <Heart
            className={`w-5 h-5 ${isFavorited ? 'fill-danger text-danger' : 'text-neutral-400'}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        {/* Título */}
        <h3 className="font-bold text-lg line-clamp-2 text-neutral-900">
          {vehicle.titulo}
        </h3>

        {/* Descrição (truncada) */}
        {vehicle.descricao && (
          <p className="text-sm text-neutral-600 line-clamp-2">
            {vehicle.descricao}
          </p>
        )}

        {/* Preço (em LARANJA, destaque) */}
        <div className="text-2xl font-bold text-primary">
          {formatCurrency(vehicle.preco)}
        </div>

        {/* Localização */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <MapPin className="w-4 h-4" />
          <span>Uraí, PR</span>
        </div>

        {/* Botão WhatsApp (pronto no mobile, sticky em desktop) */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn-primary flex items-center justify-center gap-2 w-full mt-auto text-sm ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}`}
          aria-label={`Falar sobre ${vehicle.titulo}`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Quero mais info!</span>
        </a>
      </div>
    </div>
  );
}
