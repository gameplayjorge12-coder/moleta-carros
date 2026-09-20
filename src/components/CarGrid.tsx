'use client';

import { MessageCircle } from 'lucide-react';
import { CarCard } from './CarCard';
import { getWhatsAppSimpleLink } from '@/lib/whatsapp';
import type { Database } from '@/types/database';

type Vehicle = Database['public']['Tables']['veiculos']['Row'];

interface CarGridProps {
  vehicles: Vehicle[];
  loading?: boolean;
}

/**
 * Grid responsivo de carros
 * - Mobile: 1 coluna
 * - Tablet: 2 colunas
 * - Desktop: 3 colunas
 */
export function CarGrid({ vehicles, loading = false }: CarGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-neutral-200 rounded-lg h-80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Beco sem saída vira ação: humano não gosta de tela morta (padrão H).
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 sm:py-20 bg-neutral-50 rounded-2xl border border-neutral-200">
        <p className="text-neutral-800 text-lg font-semibold">Não achou o carro aqui?</p>
        <p className="text-neutral-600 text-sm mt-2 max-w-md">
          O estoque gira rápido e o Marcelo consegue buscar o modelo certo pra você.
          Chama no WhatsApp que ele te ajuda.
        </p>
        <a
          href={getWhatsAppSimpleLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 mt-5"
        >
          <MessageCircle className="w-5 h-5" /> Falar com o Marcelo
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {vehicles.map((vehicle, idx) => (
        <CarCard key={vehicle.id} vehicle={vehicle} index={idx} />
      ))}
    </div>
  );
}
