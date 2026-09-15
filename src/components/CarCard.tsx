'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, MessageCircle, Camera } from 'lucide-react';
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
 * Card de veículo:
 * - Foto (abre a página de detalhe com a galeria)
 * - Badge categoria + contador de fotos
 * - Título + Preço (ou "Consultar" quando valor é combinado no WhatsApp)
 * - Botões: Ver detalhes + WhatsApp
 */
export function CarCard({ vehicle, index = 0 }: CarCardProps) {
  const [imageError, setImageError] = useState(false);

  const mainPhoto = vehicle.fotos?.[0];
  const photoCount = vehicle.fotos?.length ?? 0;
  const isSoldOut = vehicle.status === 'vendido';
  const categoryLabel = vehicle.categoria === 'venda' ? '🚗 Venda' : '🔑 Locadora';
  const whatsappLink = getWhatsAppLink(vehicle.titulo, vehicle.categoria, vehicle.preco);
  const href = `/carro/${vehicle.id}`;

  return (
    <div
      className="card card-animate overflow-hidden flex flex-col"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Imagem -> abre detalhe/galeria */}
      <Link href={href} className="relative block h-48 sm:h-56 bg-neutral-100 overflow-hidden image-hover">
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

        {/* Contador de fotos */}
        {photoCount > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <Camera className="w-3.5 h-3.5" />
            {photoCount}
          </div>
        )}

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">VENDIDO</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        <Link href={href}>
          <h3 className="font-bold text-lg line-clamp-2 text-neutral-900 hover:text-primary transition-colors">
            {vehicle.titulo}
          </h3>
        </Link>

        {vehicle.descricao && (
          <p className="text-sm text-neutral-600 line-clamp-2">{vehicle.descricao}</p>
        )}

        {/* Preço ou "Consultar" (valor combinado no WhatsApp) */}
        <div className="text-2xl font-bold text-primary">
          {vehicle.preco > 0 ? (
            formatCurrency(vehicle.preco)
          ) : (
            <span className="text-lg">Consultar valor</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <MapPin className="w-4 h-4" />
          <span>Uraí, PR</span>
        </div>

        {/* Ações */}
        <div className="mt-auto flex flex-col gap-2">
          <Link
            href={href}
            className="btn-secondary flex items-center justify-center gap-2 w-full text-sm"
          >
            <Camera className="w-4 h-4" />
            <span>Ver fotos e detalhes</span>
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn-primary flex items-center justify-center gap-2 w-full text-sm ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}`}
            aria-label={`Falar sobre ${vehicle.titulo}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
